import { Request, Response } from "express";

interface CustomerPaymentDetails {
  payId: string;
  sapBpId: string;
  sapCaId: string;
  customerId: string;
  customerName: string;
  payType: string;
  subscriptionPlan?: string;
  paymentChannel: string;
  paymentMethod: string;
  paymentType: string;
  payAmount: number;
  exciseDuty?: number;
  revenueAmount?: number;
  rooms?: number;
  totalAmount: number;
  status: string;
  transId: string;
  collectedBy: string;
  collectionCenter: string;
  description?: string;
  receiptNo?: string;
  createId: string;
  createDt: Date;
  createTs: Date;
  cmStatus: string;
  ficaStatus: string;
  traStatus?: string;
}

export class CustomerPaymentController {
  // Create customer subscription payment
  static async createSubscriptionPayment(req: Request, res: Response) {
    try {
      const paymentData = req.body;
      
      // Generate payment ID
      const payId = `CUST_SUB_${Date.now()}`;
      
      // Calculate total amount if not provided
      const payAmount = parseFloat(paymentData.payAmount);
      const exciseDuty = parseFloat(paymentData.exciseDuty || '0');
      const totalAmount = payAmount;
      
      const payment: CustomerPaymentDetails = {
        payId,
        sapBpId: paymentData.sapBpId,
        sapCaId: paymentData.sapCaId,
        customerId: paymentData.customerId,
        customerName: paymentData.customerName,
        payType: 'SUBSCRIPTION',
        subscriptionPlan: paymentData.subscriptionPlan,
        paymentChannel: paymentData.paymentChannel,
        paymentMethod: paymentData.paymentMethod,
        paymentType: paymentData.paymentType,
        payAmount,
        exciseDuty,
        revenueAmount: parseFloat(paymentData.revenueAmount || '0'),
        rooms: parseInt(paymentData.rooms || '1'),
        totalAmount,
        status: 'PENDING',
        transId: paymentData.transId || `TXN${Date.now()}`,
        collectedBy: paymentData.createId || 'CUSTOMER_PORTAL',
        collectionCenter: paymentData.collectionCenter,
        description: paymentData.description || `${paymentData.subscriptionPlan} subscription payment`,
        createId: paymentData.createId || 'customer_portal',
        createDt: new Date(),
        createTs: new Date(),
        cmStatus: 'PENDING',
        ficaStatus: 'PENDING',
        traStatus: paymentData.paymentType === 'PREPAID' ? 'PENDING' : 'SCHEDULED'
      };

      // Mock integration with Central Module (CM)
      await CustomerPaymentController.integrateCentralModule(payment);
      
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

  // Get customer payment history
  static async getCustomerPayments(req: Request, res: Response) {
    try {
      const { customerId, payType, status, startDate, endDate, limit = 50 } = req.query;
      
      // Mock payment data
      const mockPayments: CustomerPaymentDetails[] = [
        {
          payId: 'CUST_SUB_1754550001',
          sapBpId: 'BP_CUST_001',
          sapCaId: 'CA_CUST_001',
          customerId: 'CUST001',
          customerName: 'John Mwamba',
          payType: 'SUBSCRIPTION',
          subscriptionPlan: 'BASIC_PKG',
          paymentChannel: 'PORTAL',
          paymentMethod: 'MOBILE_MONEY',
          paymentType: 'PREPAID',
          payAmount: 12000,
          exciseDuty: 571.43,
          revenueAmount: 11428.57,
          rooms: 1,
          totalAmount: 12000,
          status: 'COMPLETED',
          transId: 'TXN1754550001',
          collectedBy: 'CUSTOMER_PORTAL',
          collectionCenter: 'ONLINE_PORTAL',
          description: 'Azam TV Basic subscription payment',
          receiptNo: 'RCP_CUST_001',
          createId: 'customer_portal',
          createDt: new Date('2025-01-07'),
          createTs: new Date('2025-01-07'),
          cmStatus: 'POSTED',
          ficaStatus: 'CLEARED',
          traStatus: 'POSTED'
        },
        {
          payId: 'CUST_SUB_1754550002',
          sapBpId: 'BP_CUST_002',
          sapCaId: 'CA_CUST_002',
          customerId: 'CUST002',
          customerName: 'Mary Kimaro',
          payType: 'SUBSCRIPTION',
          subscriptionPlan: 'PREMIUM_PKG',
          paymentChannel: 'OTC',
          paymentMethod: 'CASH',
          paymentType: 'PREPAID',
          payAmount: 25000,
          exciseDuty: 1190.48,
          revenueAmount: 23809.52,
          rooms: 1,
          totalAmount: 25000,
          status: 'PENDING',
          transId: 'TXN1754550002',
          collectedBy: 'OTC_AGENT_001',
          collectionCenter: 'OTC_DAR_01',
          description: 'Azam TV Premium subscription payment',
          createId: 'otc_agent',
          createDt: new Date('2025-01-07'),
          createTs: new Date('2025-01-07'),
          cmStatus: 'PENDING',
          ficaStatus: 'PENDING',
          traStatus: 'PENDING'
        }
      ];

      // Filter based on query parameters
      let filteredPayments = mockPayments;
      
      if (payType && payType !== 'subscription') {
        filteredPayments = filteredPayments.filter(p => p.payType === payType);
      }
      
      if (status) {
        filteredPayments = filteredPayments.filter(p => p.status === status);
      }
      
      if (customerId) {
        filteredPayments = filteredPayments.filter(p => p.customerId === customerId);
      }

      res.json({
        success: true,
        data: filteredPayments.slice(0, Number(limit)),
        total: filteredPayments.length
      });
      
    } catch (error) {
      console.error('Get customer payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve customer payments'
      });
    }
  }

  // Get payment statistics
  static async getPaymentStats(req: Request, res: Response) {
    try {
      // Mock statistics
      const stats = {
        totalPayments: 245,
        totalRevenue: 2847563.50,
        totalExcise: 124163.85,
        prepaidPayments: 198,
        postpaidPayments: 47,
        completedPayments: 189,
        pendingPayments: 56,
        averagePayment: 11612.50,
        topPaymentMethod: 'MOBILE_MONEY',
        monthlyGrowth: 12.5
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

  // Get subscription plans
  static async getSubscriptionPlans(req: Request, res: Response) {
    try {
      const plans = [
        {
          id: 'BASIC_PKG',
          name: 'Azam TV Basic',
          amount: 12000,
          channels: 45,
          description: 'Essential entertainment package with local and international channels',
          category: 'BASIC',
          validity: 30
        },
        {
          id: 'PREMIUM_PKG',
          name: 'Azam TV Premium',
          amount: 25000,
          channels: 80,
          description: 'Premium package with sports, movies, and exclusive content',
          category: 'PREMIUM',
          validity: 30
        },
        {
          id: 'SPORTS_PKG',
          name: 'Azam Sports Plus',
          amount: 18000,
          channels: 60,
          description: 'Sports-focused package with live matches and sports analysis',
          category: 'SPORTS',
          validity: 30
        },
        {
          id: 'FAMILY_PKG',
          name: 'Azam Family Package',
          amount: 30000,
          channels: 100,
          description: 'Complete family entertainment with kids, lifestyle, and education channels',
          category: 'FAMILY',
          validity: 30
        }
      ];

      res.json({
        success: true,
        data: plans
      });
      
    } catch (error) {
      console.error('Get subscription plans error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve subscription plans'
      });
    }
  }

  // Mock Central Module integration
  static async integrateCentralModule(payment: CustomerPaymentDetails) {
    // Simulate API call to Central Module
    console.log(`Integrating with Central Module for payment: ${payment.payId}`);
    
    // Mock processing delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Update payment status based on integration result
    if (payment.paymentType === 'PREPAID') {
      payment.cmStatus = 'POSTED';
      payment.ficaStatus = 'POSTED';
      payment.traStatus = 'POSTED';
      payment.status = 'COMPLETED';
    } else {
      payment.cmStatus = 'SCHEDULED';
      payment.ficaStatus = 'SCHEDULED';
      payment.traStatus = 'SCHEDULED';
    }
    
    console.log(`CM integration completed for payment: ${payment.payId}, Status: ${payment.cmStatus}`);
  }

  // Mock FICA integration status
  static async getFicaIntegrationStatus(req: Request, res: Response) {
    try {
      const status = {
        connectionStatus: 'ACTIVE',
        lastSync: new Date(),
        totalTransactions: 2847,
        successfulTransactions: 2731,
        failedTransactions: 116,
        averageProcessingTime: '2.3 seconds',
        systemLoad: 'NORMAL'
      };

      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      console.error('Get FICA integration status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve FICA integration status'
      });
    }
  }

  // Mock TRA integration status
  static async getTRAIntegrationStatus(req: Request, res: Response) {
    try {
      const status = {
        connectionStatus: 'ACTIVE',
        lastPosting: new Date(),
        totalPostings: 1247,
        successfulPostings: 1198,
        failedPostings: 49,
        complianceRate: '96.1%',
        nextScheduledPosting: new Date(Date.now() + 24 * 60 * 60 * 1000)
      };

      res.json({
        success: true,
        data: status
      });
      
    } catch (error) {
      console.error('Get TRA integration status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve TRA integration status'
      });
    }
  }
}