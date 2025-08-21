// === AGENT CONTROLLER ===
// Organized agent management logic

import { Request, Response } from 'express';
import { insertAgentSchema } from '@shared/schema';

export class AgentController {
  // Mock data for demonstration
  static mockAgents = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Mwangi',
      email: 'john.mwangi@azamtv.co.tz',
      phone: '+255712345678',
      mobile: '+255712345678',
      type: 'Individual',
      country: 'Tanzania',
      region: 'Dar es Salaam',
      city: 'Dar es Salaam',
      district: 'Kinondoni',
      ward: 'Msasani',
      address1: 'Plot 123, Msasani Road',
      tinNumber: '123456789',
      vrnNumber: '987654321',
      currency: 'TSH',
      role: 'Agent',
      status: 'approved',
      statusMessage: 'KYC approved - SAP Business Partner created',
      commission: 5.0,
      creditLimit: 1000000,
      sapBpId: 'BP001',
      sapCaId: 'CA001',
      onboardingRefNo: 'AZAM-2024-000001',
      kycApprovedBy: 'kyc@azamtv.co.tz',
      kycApprovedAt: new Date('2024-01-15'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Mhina',
      email: 'sarah.mhina@azamtv.co.tz',
      phone: '+255754321876',
      mobile: '+255754321876',
      type: 'Corporate',
      country: 'Tanzania',
      region: 'Mwanza',
      city: 'Mwanza',
      district: 'Nyamagana',
      ward: 'Kitangiri',
      address1: 'Block A, Industrial Area',
      tinNumber: '987654321',
      vrnNumber: '123456789',
      currency: 'TSH',
      role: 'Super Agent',
      status: 'approved',
      statusMessage: 'KYC approved - SAP Business Partner created',
      commission: 7.5,
      creditLimit: 2000000,
      sapBpId: 'BP002',
      sapCaId: 'CA002',
      onboardingRefNo: 'AZAM-2024-000002',
      kycApprovedBy: 'kyc@azamtv.co.tz',
      kycApprovedAt: new Date('2024-01-20'),
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: 3,
      firstName: 'Michael',
      lastName: 'Juma',
      email: 'michael.juma@azamtv.co.tz',
      phone: '+255765432109',
      mobile: '+255765432109',
      type: 'Individual',
      country: 'Tanzania',
      region: 'Mbeya',
      city: 'Mbeya',
      district: 'Mbeya Urban',
      ward: 'Nsoho',
      address1: 'House 789, Nsoho Ward',
      tinNumber: '456789123',
      vrnNumber: '321654987',
      currency: 'TSH',
      role: 'Agent',
      status: 'pending_kyc',
      statusMessage: 'Submitted for KYC verification',
      commission: 5.0,
      creditLimit: 500000,
      onboardingRefNo: 'AZAM-2025-000003',
      kycDocuments: {
        poa: ['address_proof.pdf'],
        poi: ['national_id.pdf']
      },
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-03')
    },
    {
      id: 4,
      firstName: 'Grace',
      lastName: 'Kipchumba',
      email: 'grace.kipchumba@azamtv.co.tz',
      phone: '+255776543210',
      mobile: '+255776543210',
      type: 'Corporate',
      country: 'Tanzania',
      region: 'Kilimanjaro',
      city: 'Moshi',
      district: 'Moshi Urban',
      ward: 'Kiboriloni',
      address1: 'Block C, Commercial Center',
      tinNumber: '654321987',
      vrnNumber: '789123456',
      currency: 'TSH',
      role: 'Super Agent',
      status: 'pending_kyc',
      statusMessage: 'Submitted for KYC verification',
      commission: 7.5,
      creditLimit: 1500000,
      onboardingRefNo: 'AZAM-2025-000004',
      kycDocuments: {
        poa: ['business_license.pdf'],
        poi: ['certificate_incorporation.pdf']
      },
      createdAt: new Date('2025-01-04'),
      updatedAt: new Date('2025-01-04')
    }
  ];

  static async getAgents(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, search, status, region } = req.query;
      
      let filteredAgents = [...AgentController.mockAgents];

      // Apply filters
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredAgents = filteredAgents.filter(agent =>
          agent.firstName.toLowerCase().includes(searchTerm) ||
          agent.lastName.toLowerCase().includes(searchTerm) ||
          agent.email.toLowerCase().includes(searchTerm)
        );
      }

      if (status && status !== 'all') {
        filteredAgents = filteredAgents.filter(agent => agent.status === status);
      }

      if (region && region !== 'all') {
        filteredAgents = filteredAgents.filter(agent => agent.region === region);
      }

      // Pagination
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedAgents = filteredAgents.slice(startIndex, endIndex);

      const response = {
        success: true,
        data: paginatedAgents,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: filteredAgents.length,
          totalPages: Math.ceil(filteredAgents.length / limitNum)
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get agents error:', error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  }

  static async getAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agent = AgentController.mockAgents.find(a => a.id === parseInt(id));

      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json({ success: true, data: agent });
    } catch (error) {
      console.error('Get agent error:', error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  }

  static async createAgent(req: Request, res: Response) {
    try {
      // Validate request body
      const validationResult = insertAgentSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors
        });
      }

      const agentData = validationResult.data;
      
      // Generate onboarding reference number
      const onboardingRefNo = `AZAM-${new Date().getFullYear()}-${(AgentController.mockAgents.length + 1).toString().padStart(6, '0')}`;
      
      // Create new agent
      const newAgent = {
        id: AgentController.mockAgents.length + 1,
        ...agentData,
        creditLimit: agentData.creditLimit || 0,
        commission: agentData.commission || 0,
        status: 'pending_kyc',
        statusMessage: 'Submitted for KYC verification',
        onboardingRefNo,
        createdAt: new Date(),
        updatedAt: new Date(),
        sapBpId: `BP${(AgentController.mockAgents.length + 1).toString().padStart(3, '0')}`,
        sapCaId: `CA${(AgentController.mockAgents.length + 1).toString().padStart(3, '0')}`
      };

      AgentController.mockAgents.push(newAgent);

      res.status(201).json({
        success: true,
        data: newAgent,
        message: "Agent created successfully"
      });
    } catch (error) {
      console.error('Create agent error:', error);
      res.status(500).json({ message: "Failed to create agent" });
    }
  }

  static async updateAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agentIndex = AgentController.mockAgents.findIndex(a => a.id === parseInt(id));

      if (agentIndex === -1) {
        return res.status(404).json({ message: "Agent not found" });
      }

      // Validate request body
      const validationResult = insertAgentSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors
        });
      }

      // Update agent  
      const updatedAgent = {
        ...AgentController.mockAgents[agentIndex],
        ...validationResult.data
      };
      AgentController.mockAgents[agentIndex] = updatedAgent;

      res.json({
        success: true,
        data: AgentController.mockAgents[agentIndex],
        message: "Agent updated successfully"
      });
    } catch (error) {
      console.error('Update agent error:', error);
      res.status(500).json({ message: "Failed to update agent" });
    }
  }

  static async deleteAgent(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const agentIndex = AgentController.mockAgents.findIndex(a => a.id === parseInt(id));

      if (agentIndex === -1) {
        return res.status(404).json({ message: "Agent not found" });
      }

      AgentController.mockAgents.splice(agentIndex, 1);

      res.json({
        success: true,
        message: "Agent deleted successfully"
      });
    } catch (error) {
      console.error('Delete agent error:', error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  }

  static async getAgentBalance(req: Request, res: Response) {
    try {
      const { agentId } = req.params;
      
      // Mock balance data
      const balance = {
        currentBalance: 45000,
        creditLimit: 100000,
        availableCredit: 55000,
        lastPayment: {
          amount: 25000,
          date: new Date(Date.now() - 86400000).toISOString()
        },
        transactions: [
          {
            id: 1,
            type: 'credit',
            amount: 25000,
            description: 'Hardware sale commission',
            date: new Date(Date.now() - 86400000).toISOString()
          },
          {
            id: 2,
            type: 'debit',
            amount: 15000,
            description: 'Equipment purchase',
            date: new Date(Date.now() - 172800000).toISOString()
          }
        ]
      };

      res.json({ success: true, data: balance });
    } catch (error) {
      console.error('Get agent balance error:', error);
      res.status(500).json({ message: "Failed to fetch agent balance" });
    }
  }

  static async updateAgentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, message } = req.body;

      const agentIndex = AgentController.mockAgents.findIndex(a => a.id === parseInt(id));

      if (agentIndex === -1) {
        return res.status(404).json({ message: "Agent not found" });
      }

      const updatedAgent = {
        ...AgentController.mockAgents[agentIndex],
        status
      };
      AgentController.mockAgents[agentIndex] = updatedAgent;

      res.json({
        success: true,
        data: AgentController.mockAgents[agentIndex],
        message: "Agent status updated successfully"
      });
    } catch (error) {
      console.error('Update agent status error:', error);
      res.status(500).json({ message: "Failed to update agent status" });
    }
  }
}