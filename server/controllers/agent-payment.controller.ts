// === AGENT PAYMENT SUBSCRIPTION CONTROLLER ===
// Handles agent payment collection for subscription services

import { Request, Response } from 'express';
import { AgentPaymentDetails } from '@shared/schema';

export class AgentPaymentController {
  
  // Create new subscription payment
  static async createSubscriptionPayment(req: Request, res: Response) {
    try {
      const paymentData = req.body as AgentPaymentDetails;
      
      // Generate payment ID
      const payId = `PAY${Date.now()}`;
      
      // Calculate VAT (18%)
      const vatRate = 0.18;
      const vatAmount = paymentData.payAmount * vatRate;
      const totalAmount = paymentData.payAmount + vatAmount;
      
      // Generate transaction ID
      const transId = `TXN${Date.now()}`;
      
      const payment: AgentPaymentDetails = {
        payId,
        sapBpId: paymentData.sapBpId,
        sapCaId: paymentData.sapCaId,
        customerId: paymentData.customerId,
        customerName: paymentData.customerName,
        payType: 'Subscription',
        payAmount: paymentData.payAmount,
        vatAmount,
        totalAmount,
        payMode: paymentData.payMode,
        status: 'PENDING',
        transId,
        collectedBy: paymentData.collectedBy,
        collectionCenter: paymentData.collectionCenter,
        description: paymentData.description,
        receiptNo: paymentData.receiptNo,
        chequeNo: paymentData.chequeNo,
        bankRef: paymentData.bankRef,
        mobileRef: paymentData.mobileRef,
        createId: paymentData.createId,
        createDt: new Date(),
        createTs: new Date(),
        cmStatus: 'PENDING',
        ficaStatus: 'PENDING'
      };

      // Mock integration with Central Module (CM)
      await AgentPaymentController.integrateCentralModule(payment);
      
      res.status(201).json({
        success: true,
        data: payment,
        message: 'Subscription payment created successfully'
      });
      
    } catch (error) {
      console.error('Create subscription payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription payment'
      });
    }
  }

  // Get agent payment history
  static async getAgentPayments(req: Request, res: Response) {
    try {
      const { agentId, payType, status, startDate, endDate, limit = 50 } = req.query;
      
      // Mock payment data
      const mockPayments: AgentPaymentDetails[] = [
        {
          payId: 'PAY1754550001',
          sapBpId: 'BP001',
          sapCaId: 'CA001',
          customerId: 'CUST001',
          customerName: 'John Mwamba',
          payType: 'Subscription',
          payAmount: 15000,
          vatAmount: 2700,
          totalAmount: 17700,
          payMode: 'CASH',
          status: 'COMPLETED',
          transId: 'TXN1754550001',
          collectedBy: 'AGENT001',
          collectionCenter: 'OTC_MWANZA',
          description: 'Monthly subscription payment',
          receiptNo: 'RCP001',
          createId: 'admin',
          createDt: new Date('2025-01-07'),
          createTs: new Date('2025-01-07'),
          cmStatus: 'POSTED',
          ficaStatus: 'CLEARED'
        },
        {
          payId: 'PAY1754550002',
          sapBpId: 'BP002',
          sapCaId: 'CA002',
          customerId: 'CUST002',
          customerName: 'Mary Kimaro',
          payType: 'Subscription',
          payAmount: 25000,
          vatAmount: 4500,
          totalAmount: 29500,
          payMode: 'MOBILE_MONEY',
          status: 'PENDING',
          transId: 'TXN1754550002',
          collectedBy: 'AGENT002',
          collectionCenter: 'OTC_DAR',
          description: 'Premium package subscription',
          mobileRef: 'MPESA123456',
          createId: 'admin',
          createDt: new Date(),
          createTs: new Date(),
          cmStatus: 'PENDING',
          ficaStatus: 'PENDING'
        }
      ];

      // Apply filters
      let filteredPayments = mockPayments;
      
      if (agentId) {
        filteredPayments = filteredPayments.filter(p => p.collectedBy === agentId);
      }
      
      if (payType) {
        filteredPayments = filteredPayments.filter(p => p.payType === payType);
      }
      
      if (status) {
        filteredPayments = filteredPayments.filter(p => p.status === status);
      }

      res.json({
        success: true,
        data: filteredPayments.slice(0, Number(limit)),
        total: filteredPayments.length
      });
      
    } catch (error) {
      console.error('Get agent payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve agent payments'
      });
    }
  }

  // Get payment details
  static async getPaymentDetails(req: Request, res: Response) {
    try {
      const { payId } = req.params;
      
      // Mock payment details
      const mockPayment: AgentPaymentDetails = {
        payId,
        sapBpId: 'BP001',
        sapCaId: 'CA001',
        customerId: 'CUST001',
        customerName: 'John Mwamba',
        payType: 'Subscription',
        payAmount: 15000,
        vatAmount: 2700,
        totalAmount: 17700,
        payMode: 'CASH',
        status: 'COMPLETED',
        transId: `TXN${payId}`,
        collectedBy: 'AGENT001',
        collectionCenter: 'OTC_MWANZA',
        description: 'Monthly subscription payment',
        receiptNo: 'RCP001',
        createId: 'admin',
        createDt: new Date('2025-01-07'),
        createTs: new Date('2025-01-07'),
        updateId: 'system',
        updateDt: new Date(),
        updateTs: new Date(),
        cmStatus: 'POSTED',
        cmStatusMsg: 'Successfully posted to SAP BRIM FICA',
        ficaStatus: 'CLEARED',
        ficaStatusMsg: 'Payment cleared and settlement completed'
      };

      res.json({
        success: true,
        data: mockPayment
      });
      
    } catch (error) {
      console.error('Get payment details error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment details'
      });
    }
  }

  // Process agent settlement
  static async processAgentSettlement(req: Request, res: Response) {
    try {
      const { agentId, paymentIds, settlementMode = 'BANK' } = req.body;
      
      // Mock settlement processing
      const settlementId = `STL${Date.now()}`;
      const totalAmount = 47200; // Sum of payments being settled
      
      const settlement = {
        settlementId,
        agentId,
        paymentIds,
        totalAmount,
        settlementMode,
        status: 'PROCESSED',
        processedDate: new Date(),
        accountingEntries: [
          {
            account: 'Bank',
            debitCredit: 'Dr',
            amount: totalAmount
          },
          {
            account: 'Agent/Aggregator',
            debitCredit: 'Cr', 
            amount: totalAmount
          }
        ],
        cmStatus: 'POSTED',
        ficaStatus: 'CLEARED'
      };

      res.json({
        success: true,
        data: settlement,
        message: 'Agent settlement processed successfully'
      });
      
    } catch (error) {
      console.error('Process agent settlement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process agent settlement'
      });
    }
  }

  // Get payment statistics
  static async getPaymentStats(req: Request, res: Response) {
    try {
      const { agentId, period = 'month' } = req.query;
      
      const stats = {
        totalCollected: 1250000,
        totalPending: 75000,
        totalSettled: 1175000,
        paymentCount: 47,
        avgPaymentAmount: 26595,
        paymentModeBreakdown: {
          CASH: 45,
          MOBILE_MONEY: 35,
          CHEQUE: 10,
          POS: 7,
          BANK_DEPOSIT: 3
        },
        monthlyTrend: [
          { month: 'Nov', amount: 980000 },
          { month: 'Dec', amount: 1100000 },
          { month: 'Jan', amount: 1250000 }
        ]
      };

      res.json({
        success: true,
        data: stats
      });
      
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve payment statistics'
      });
    }
  }

  // Private method to simulate Central Module integration
  private static async integrateCentralModule(payment: AgentPaymentDetails): Promise<void> {
    // Simulate REST API call to Central Module
    const cmRequest = {
      paymentId: payment.payId,
      bpId: payment.sapBpId,
      caId: payment.sapCaId,
      amount: payment.totalAmount,
      vatAmount: payment.vatAmount,
      paymentMode: payment.payMode,
      collectedBy: payment.collectedBy,
      timestamp: payment.createTs
    };

    // Mock CM processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate FICA posting
    payment.cmStatus = 'PROCESSING';
    payment.cmStatusMsg = 'Payment sent to SAP BRIM FICA via RFC';
    
    // Mock FICA response
    payment.ficaStatus = 'POSTED';
    payment.ficaStatusMsg = 'Payment posted successfully to FICA';
    
    console.log('CM Integration completed for payment:', payment.payId);
  }

  // Get collection centers
  static async getCollectionCenters(req: Request, res: Response) {
    try {
      const centers = [
        { id: 'OTC_DAR', name: 'OTC - Dar es Salaam', region: 'Dar es Salaam', type: 'OTC' },
        { id: 'OTC_MWANZA', name: 'OTC - Mwanza', region: 'Mwanza', type: 'OTC' },
        { id: 'OTC_ARUSHA', name: 'OTC - Arusha', region: 'Arusha', type: 'OTC' },
        { id: 'OTC_MBEYA', name: 'OTC - Mbeya', region: 'Mbeya', type: 'OTC' },
        { id: 'AGG_CENTER_01', name: 'Aggregator Center - Kariakoo', region: 'Dar es Salaam', type: 'AGGREGATOR' },
        { id: 'AGG_CENTER_02', name: 'Aggregator Center - Mwenge', region: 'Dar es Salaam', type: 'AGGREGATOR' }
      ];

      res.json({
        success: true,
        data: centers
      });
      
    } catch (error) {
      console.error('Get collection centers error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve collection centers'
      });
    }
  }
}