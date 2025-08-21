import type { Request, Response } from "express";
import { AgentController } from "./agent.controller";

export class KYCController {
  
  // Get all agents pending KYC verification
  static async getPendingAgents(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search } = req.query;
      
      // Filter agents with pending_kyc status
      let pendingAgents = AgentController.mockAgents.filter(agent => 
        agent.status === 'pending_kyc'
      );

      // Apply search filter
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        pendingAgents = pendingAgents.filter(agent =>
          agent.firstName.toLowerCase().includes(searchTerm) ||
          agent.lastName.toLowerCase().includes(searchTerm) ||
          agent.email.toLowerCase().includes(searchTerm) ||
          agent.onboardingRefNo?.toLowerCase().includes(searchTerm)
        );
      }

      // Sort by creation date (newest first)
      pendingAgents.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB.getTime() - dateA.getTime();
      });

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedAgents = pendingAgents.slice(startIndex, endIndex);

      const response = {
        success: true,
        data: paginatedAgents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: pendingAgents.length,
          totalPages: Math.ceil(pendingAgents.length / limitNum)
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get pending agents error:', error);
      res.status(500).json({ message: "Failed to fetch pending agents" });
    }
  }

  // Approve agent KYC
  static async approveAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { remarks, approvedBy } = req.body;
      
      const agentIndex = AgentController.mockAgents.findIndex(a => a.id === parseInt(id));

      if (agentIndex === -1) {
        return res.status(404).json({ message: "Agent not found" });
      }

      const agent = AgentController.mockAgents[agentIndex];

      if (agent.status !== 'pending_kyc') {
        return res.status(400).json({ message: "Agent is not pending KYC verification" });
      }

      // Update agent status to approved and generate SAP IDs
      AgentController.mockAgents[agentIndex] = {
        ...agent,
        status: 'approved',
        statusMessage: 'KYC approved - SAP Business Partner created',
        updatedAt: new Date(),
        sapBpId: `BP${Date.now().toString().slice(-6)}`,
        sapCaId: `CA${Date.now().toString().slice(-6)}`,
        kycApprovedBy: approvedBy || 'kyc@azamtv.co.tz',
        kycApprovedAt: new Date(),
        kycRemarks: remarks
      };

      res.json({
        success: true,
        data: AgentController.mockAgents[agentIndex],
        message: "Agent KYC approved successfully"
      });
    } catch (error) {
      console.error('Approve agent error:', error);
      res.status(500).json({ message: "Failed to approve agent" });
    }
  }

  // Reject agent KYC
  static async rejectAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { remarks, rejectedBy } = req.body;
      
      if (!remarks || remarks.trim() === '') {
        return res.status(400).json({ message: "Rejection remarks are required" });
      }

      const agentIndex = AgentController.mockAgents.findIndex(a => a.id === parseInt(id));

      if (agentIndex === -1) {
        return res.status(404).json({ message: "Agent not found" });
      }

      const agent = AgentController.mockAgents[agentIndex];

      if (agent.status !== 'pending_kyc') {
        return res.status(400).json({ message: "Agent is not pending KYC verification" });
      }

      // Update agent status to rejected
      AgentController.mockAgents[agentIndex] = {
        ...agent,
        status: 'rejected',
        statusMessage: 'KYC rejected - Please review and resubmit',
        updatedAt: new Date(),
        kycRejectedBy: rejectedBy || 'kyc@azamtv.co.tz',
        kycRejectedAt: new Date(),
        kycRemarks: remarks
      };

      res.json({
        success: true,
        data: AgentController.mockAgents[agentIndex],
        message: "Agent KYC rejected"
      });
    } catch (error) {
      console.error('Reject agent error:', error);
      res.status(500).json({ message: "Failed to reject agent" });
    }
  }

  // Get agent details for KYC review
  static async getAgentForReview(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agent = AgentController.mockAgents.find(a => a.id === parseInt(id));

      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json({ success: true, data: agent });
    } catch (error) {
      console.error('Get agent for review error:', error);
      res.status(500).json({ message: "Failed to fetch agent details" });
    }
  }
}