// === SUBSCRIPTION CONTROLLER ===
// Handles all subscription-related operations with mock responses

import { Request, Response } from 'express';

// Master data for subscription management
const subscriptionPlans = [
  { id: "AZAM_LITE_1M", name: "Azam Lite 1 Month", price: 12000, duration: "1 month", channels: 40, type: "Basic" },
  { id: "AZAM_PLAY_1M", name: "Azam Play 1 Month", price: 19000, duration: "1 month", channels: 80, type: "Standard" },
  { id: "AZAM_PREM_1M", name: "Azam Premium 1 Month", price: 35000, duration: "1 month", channels: 150, type: "Premium" },
  { id: "AZAM_PLUS_1M", name: "Azam Plus 1 Month", price: 28000, duration: "1 month", channels: 120, type: "Plus" },
];

const availableOffers = [
  { id: "PROMO001", name: "50% Off First Month", discount: 50, validity: "30 days", type: "discount" },
  { id: "PROMO002", name: "Free Premium Upgrade", discount: 0, validity: "60 days", type: "upgrade" },
  { id: "PROMO003", name: "Sports Package Free", discount: 100, validity: "30 days", type: "free_addon" },
];

const addOnPacks = [
  { id: "SPORT001", name: "Sports Pack", price: 8000, channels: 15, duration: "1 month" },
  { id: "MOVIE001", name: "Movie Pack", price: 6000, channels: 12, duration: "1 month" },
  { id: "KIDS001", name: "Kids Pack", price: 4000, channels: 8, duration: "1 month" },
  { id: "NEWS001", name: "News Pack", price: 3000, channels: 6, duration: "1 month" },
];

const serviceCenters = [
  { id: "SC001", name: "Dar es Salaam Service Center", location: "Kariakoo", stock: 45 },
  { id: "SC002", name: "Mwanza Service Center", location: "Nyamagana", stock: 23 },
  { id: "SC003", name: "Arusha Service Center", location: "Kaloleni", stock: 18 },
];

const suspensionReasons = [
  { id: "NON_PAYMENT", name: "Non-payment of dues" },
  { id: "CUSTOMER_REQUEST", name: "Customer request" },
  { id: "TECHNICAL_ISSUE", name: "Technical issues" },
  { id: "FRAUD_SUSPECTED", name: "Suspected fraud" },
  { id: "MAINTENANCE", name: "System maintenance" },
];

export class SubscriptionController {
  // Purchase subscription
  static async purchaseSubscription(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        planId,
        paymentMode,
        paymentAmount,
        installationAddress
      } = req.body;

      // Simulate workflow steps
      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Plan eligibility check" },
        { step: 3, name: "Payment processing" },
        { step: 4, name: "Creating subscription order" },
        { step: 5, name: "JSON request to CM (Content Management)" },
        { step: 6, name: "NAGRA activation" },
        { step: 7, name: "Contract creation" },
        { step: 8, name: "Customer notification" }
      ];

      // Simulate successful response
      const response = {
        success: true,
        contractId: `CON-${Date.now()}`,
        invoiceNumber: `INV-${Date.now()}`,
        workflowSteps,
        walletBalanceAfter: 850000 - paymentAmount,
        message: "Subscription created successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Purchase subscription error:', error);
      res.status(500).json({ message: "Failed to process subscription purchase" });
    }
  }

  // Renew subscription
  static async renewSubscription(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        planId,
        paymentMode,
        renewalMonths
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Current subscription check" },
        { step: 3, name: "Payment processing" },
        { step: 4, name: "Creating renewal order" },
        { step: 5, name: "JSON request to CM" },
        { step: 6, name: "NAGRA validity extension" },
        { step: 7, name: "Contract update" },
        { step: 8, name: "Customer notification" }
      ];

      const response = {
        success: true,
        contractId: `CON-${Date.now()}`,
        invoiceNumber: `INV-${Date.now()}`,
        workflowSteps,
        renewalPeriod: `${renewalMonths} month(s)`,
        message: "Subscription renewed successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Renew subscription error:', error);
      res.status(500).json({ message: "Failed to process subscription renewal" });
    }
  }

  // Change plan
  static async changePlan(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        currentPlanId,
        newPlanId,
        paymentRequired
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Plan change eligibility check" },
        { step: 3, name: "Proration calculation" },
        { step: 4, name: "Payment processing (if required)" },
        { step: 5, name: "Creating plan change order" },
        { step: 6, name: "JSON request to CM" },
        { step: 7, name: "NAGRA plan update" },
        { step: 8, name: "Contract modification" },
        { step: 9, name: "Customer notification" }
      ];

      const response = {
        success: true,
        contractId: `CON-${Date.now()}`,
        invoiceNumber: paymentRequired ? `INV-${Date.now()}` : null,
        workflowSteps,
        planChangeEffective: new Date().toISOString(),
        message: "Plan changed successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Change plan error:', error);
      res.status(500).json({ message: "Failed to process plan change" });
    }
  }

  // Add-on management
  static async manageAddOns(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        addOnPackId,
        operation // 'add' or 'remove'
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Add-on eligibility check" },
        { step: 3, name: "Payment processing" },
        { step: 4, name: "Creating add-on order" },
        { step: 5, name: "JSON request to CM" },
        { step: 6, name: "NAGRA add-on activation" },
        { step: 7, name: "Contract update" },
        { step: 8, name: "Customer notification" }
      ];

      const response = {
        success: true,
        contractId: `CON-${Date.now()}`,
        invoiceNumber: `INV-${Date.now()}`,
        workflowSteps,
        operation,
        message: `Add-on ${operation === 'add' ? 'added' : 'removed'} successfully`
      };

      res.json(response);
    } catch (error) {
      console.error('Manage add-ons error:', error);
      res.status(500).json({ message: "Failed to process add-on request" });
    }
  }

  // Suspend subscription
  static async suspendSubscription(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        suspensionReason,
        notes
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Suspension eligibility check" },
        { step: 3, name: "Reason validation and logging" },
        { step: 4, name: "Creating suspension request" },
        { step: 5, name: "JSON request to CM (Content Management)" },
        { step: 6, name: "NAGRA disconnection" },
        { step: 7, name: "Contract status update" },
        { step: 8, name: "Customer notification" }
      ];

      const response = {
        success: true,
        suspensionId: `SUS-${Date.now()}`,
        workflowSteps,
        suspensionDate: new Date().toISOString(),
        reason: suspensionReason,
        message: "Subscription suspended successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Suspend subscription error:', error);
      res.status(500).json({ message: "Failed to suspend subscription" });
    }
  }

  // Change offer
  static async changeOffer(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        currentOfferId,
        newOfferId,
        isWithinBufferPeriod
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation and current offer check" },
        { step: 2, name: "Buffer period validation" },
        { step: 3, name: "New offer validation" },
        { step: 4, name: "Creating offer change order" },
        { step: 5, name: "Updating customer offers" },
        { step: 6, name: "Contract modification" },
        { step: 7, name: "Customer notification" }
      ];

      const response = {
        success: true,
        contractId: `CON-${Date.now()}`,
        workflowSteps,
        offerChangeEffective: new Date().toISOString(),
        bufferPeriodUsed: !isWithinBufferPeriod,
        message: "Offer changed successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Change offer error:', error);
      res.status(500).json({ message: "Failed to process offer change" });
    }
  }

  // Extend validity
  static async extendValidity(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        extensionDays,
        extensionReason,
        paymentMode
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Validity extension eligibility check" },
        { step: 3, name: "Extension calculation" },
        { step: 4, name: "Payment processing" },
        { step: 5, name: "Creating validity extension order" },
        { step: 6, name: "JSON request to CM" },
        { step: 7, name: "NAGRA validity update" },
        { step: 8, name: "Contract update" },
        { step: 9, name: "Customer notification" }
      ];

      const response = {
        success: true,
        contractId: `CON-${Date.now()}`,
        invoiceNumber: `INV-${Date.now()}`,
        workflowSteps,
        extensionDays,
        newExpiryDate: new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000).toISOString(),
        message: "Validity extended successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Extend validity error:', error);
      res.status(500).json({ message: "Failed to extend validity" });
    }
  }

  // Hardware replacement
  static async replaceHardware(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        oldStbSerial,
        newStbSerial,
        replacementReason,
        replacementType
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Hardware replacement eligibility check" },
        { step: 3, name: "New hardware validation" },
        { step: 4, name: "Creating replacement order" },
        { step: 5, name: "JSON request to CM" },
        { step: 6, name: "NAGRA hardware update" },
        { step: 7, name: "Contract hardware modification" },
        { step: 8, name: "Customer notification" }
      ];

      const response = {
        success: true,
        replacementId: `REP-${Date.now()}`,
        contractId: `CON-${Date.now()}`,
        workflowSteps,
        oldStbSerial,
        newStbSerial,
        replacementDate: new Date().toISOString(),
        message: "Hardware replacement completed successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Replace hardware error:', error);
      res.status(500).json({ message: "Failed to process hardware replacement" });
    }
  }

  // Service action
  static async serviceAction(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        actionType,
        actionSubtype,
        notes
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Service action eligibility check" },
        { step: 3, name: "Action validation" },
        { step: 4, name: "Creating service action order" },
        { step: 5, name: "JSON request to CM" },
        { step: 6, name: "NAGRA service update" },
        { step: 7, name: "Contract status update" },
        { step: 8, name: "Customer notification" }
      ];

      const response = {
        success: true,
        actionId: `ACT-${Date.now()}`,
        workflowSteps,
        actionType,
        actionSubtype,
        actionDate: new Date().toISOString(),
        message: "Service action completed successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Service action error:', error);
      res.status(500).json({ message: "Failed to process service action" });
    }
  }

  // Payment top-up
  static async paymentTopUp(req: Request, res: Response) {
    try {
      const {
        customerId,
        smartCardNumber,
        topUpAmount,
        paymentMode
      } = req.body;

      const workflowSteps = [
        { step: 1, name: "Customer validation" },
        { step: 2, name: "Payment processing" },
        { step: 3, name: "Creating top-up order" },
        { step: 4, name: "JSON request to CM" },
        { step: 5, name: "Wallet balance update" },
        { step: 6, name: "Customer notification" }
      ];

      const response = {
        success: true,
        topUpId: `TOP-${Date.now()}`,
        transactionId: `TXN-${Date.now()}`,
        workflowSteps,
        topUpAmount,
        newWalletBalance: 1250000 + topUpAmount, // Mock balance
        message: "Payment top-up completed successfully"
      };

      res.json(response);
    } catch (error) {
      console.error('Payment top-up error:', error);
      res.status(500).json({ message: "Failed to process payment top-up" });
    }
  }

  // Master Data APIs for consolidated subscription management
  static async getSubscriptionPlans(req: Request, res: Response) {
    try {
      res.json(subscriptionPlans);
    } catch (error) {
      console.error('Get subscription plans error:', error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  }

  static async getAvailableOffers(req: Request, res: Response) {
    try {
      res.json(availableOffers);
    } catch (error) {
      console.error('Get available offers error:', error);
      res.status(500).json({ message: "Failed to fetch available offers" });
    }
  }

  static async getAddOnPacks(req: Request, res: Response) {
    try {
      res.json(addOnPacks);
    } catch (error) {
      console.error('Get add-on packs error:', error);
      res.status(500).json({ message: "Failed to fetch add-on packs" });
    }
  }

  static async getServiceCenters(req: Request, res: Response) {
    try {
      res.json(serviceCenters);
    } catch (error) {
      console.error('Get service centers error:', error);
      res.status(500).json({ message: "Failed to fetch service centers" });
    }
  }

  static async getSuspensionReasons(req: Request, res: Response) {
    try {
      res.json(suspensionReasons);
    } catch (error) {
      console.error('Get suspension reasons error:', error);
      res.status(500).json({ message: "Failed to fetch suspension reasons" });
    }
  }
}