import type { Express } from "express";
import { createServer, type Server } from "http";
import { AuthController } from "./controllers/auth.controller";
import { DashboardController } from "./controllers/dashboard.controller";
import { AgentController } from "./controllers/agent.controller";
import { KYCController } from "./controllers/kyc.controller";
import { CustomerController } from "./controllers/customer.controller";
import { InventoryController } from "./controllers/inventory.controller";
import { PaymentController } from "./controllers/payment.controller";
import { SubscriptionController } from "./controllers/subscription.controller";
import { IncidentController } from "./controllers/incident.controller";
import { AgentPaymentController } from "./controllers/agent-payment.controller";
import { CustomerPaymentController } from "./controllers/customer-payment.controller";
import { ReceiptCancellationController } from "./controllers/receipt-cancellation.controller";
import { customerTransferController } from "./controllers/customer-transfer.controller";
import { ReportController } from "./controllers/report.controller";
import { NotificationController } from "./controllers/notification.controller";
// Removed IncidentController import - using new service ticketing and incident management
import {
  insertAgentSchema,
  insertCustomerSchema,
  insertInventoryItemSchema,
  insertInventoryRequestSchema,
  insertPaymentSchema,
  insertPaymentDetailsSchema,
  insertSubscriptionSchema,
  insertAgentReplacementSchema,
  insertAgentFaultyRepairSchema,
  insertAgentHardwarePaymentSchema,
  insertAgentHardwareSaleSchema,
  insertCustomerHardwareSaleSchema,
  insertAddOnPackSchema,
  insertAddOnPurchaseSchema,
  insertAddOnRenewalSchema,
  insertAddOnRemovalSchema,
  type AddOnPack,
  type AddOnPackSAP,
  type AddOnPurchase,
  type AddOnRenewal,
  type AddOnRemoval,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // === AUTHENTICATION ROUTES ===
  app.post("/api/auth/demo-login", AuthController.demoLogin);
  app.post("/api/auth/login", AuthController.login);
  app.post("/api/auth/logout", AuthController.logout);
  app.post("/api/auth/forgot-password", AuthController.forgotPassword);
  app.post("/api/auth/reset-password", AuthController.resetPassword);
  app.get("/api/auth/me", AuthController.getCurrentUser);
  app.get("/api/auth/profile", AuthController.getProfile);
  app.put("/api/auth/profile", AuthController.updateProfile);
  app.get("/api/auth/preferences/:userId", AuthController.getPreferences);
  app.put("/api/auth/preferences", AuthController.updatePreferences);
  app.get("/api/auth/activities/:userId", AuthController.getActivities);

  // === DASHBOARD ROUTES ===
  app.get("/api/dashboard/stats", DashboardController.getStats);
  app.get("/api/dashboard/charts/:type", DashboardController.getChartData);
  app.get("/api/dashboard/activities", DashboardController.getActivities);
  app.get("/api/dashboard/system-status", DashboardController.getSystemStatus);

  // === AGENT ROUTES ===
  app.get("/api/agents", AgentController.getAgents);
  app.get("/api/agents/:id", AgentController.getAgent);
  app.post("/api/agents", AgentController.createAgent);
  app.put("/api/agents/:id", AgentController.updateAgent);
  app.delete("/api/agents/:id", AgentController.deleteAgent);
  app.get("/api/agents/:agentId/balance", AgentController.getAgentBalance);
  app.patch("/api/agents/:id/status", AgentController.updateAgentStatus);

  // === KYC ROUTES ===
  app.get("/api/kyc/pending", KYCController.getPendingAgents);
  app.get("/api/kyc/review/:id", KYCController.getAgentForReview);
  app.post("/api/kyc/approve/:id", KYCController.approveAgent);
  app.post("/api/kyc/reject/:id", KYCController.rejectAgent);

  // === CUSTOMER ROUTES ===
  app.get("/api/customers", CustomerController.getCustomers);
  app.get("/api/customers/search", CustomerController.searchCustomers);
  app.get("/api/customers/:id", CustomerController.getCustomer);
  app.post("/api/customers", CustomerController.createCustomer);
  app.put("/api/customers/:id", CustomerController.updateCustomer);
  app.delete("/api/customers/:id", CustomerController.deleteCustomer);

  // === INVENTORY ROUTES ===
  app.get("/api/inventory", InventoryController.getInventoryItems);
  app.get("/api/inventory/:id", InventoryController.getInventoryItem);
  app.post("/api/inventory", InventoryController.createInventoryItem);
  app.put("/api/inventory/:id", InventoryController.updateInventoryItem);
  app.delete("/api/inventory/:id", InventoryController.deleteInventoryItem);
  app.post("/api/inventory/serial-upload", InventoryController.uploadSerialNumbers);
  app.get("/api/inventory/serial/:serial/movements", InventoryController.getSerialMovements);
  
  // === INVENTORY REQUEST ROUTES ===
  app.get("/api/inventory-requests", InventoryController.getInventoryRequests);
  app.post("/api/inventory-requests", InventoryController.createInventoryRequest);
  app.post("/api/inventory-requests/:id/approve", InventoryController.approveInventoryRequest);
  
  // === STOCK AND STB ROUTES ===
  app.get("/api/stock-requests", InventoryController.getStockRequests);
  app.get("/api/stb-devices", InventoryController.getStbDevices);
  app.get("/api/stb-status/search", InventoryController.searchStbStatus);
  app.get("/api/center-stb-status/search", InventoryController.searchCenterStbStatus);
  app.post("/api/warehouse-transfers", InventoryController.processTransfer);

  // === PAYMENT ROUTES ===
  app.get("/api/payments", PaymentController.getPayments);
  app.get("/api/payments/:id", PaymentController.getPayment);
  app.post("/api/payments", PaymentController.createPayment);
  app.put("/api/payments/:id", PaymentController.updatePayment);
  app.delete("/api/payments/:id", PaymentController.deletePayment);

  // === AGENT PAYMENT SUBSCRIPTION ROUTES ===
  app.post("/api/agent-payments/subscription", AgentPaymentController.createSubscriptionPayment);
  app.get("/api/agent-payments", AgentPaymentController.getAgentPayments);
  app.get("/api/agent-payments/:payId", AgentPaymentController.getPaymentDetails);
  app.post("/api/agent-payments/settlement", AgentPaymentController.processAgentSettlement);
  app.get("/api/agent-payments/stats", AgentPaymentController.getPaymentStats);
  app.get("/api/agent-payments/collection-centers", AgentPaymentController.getCollectionCenters);

  // === AGENT HARDWARE PAYMENT ROUTES ===
  const { AgentHardwarePaymentController } = await import("./controllers/agent-hardware-payment.controller");
  app.get("/api/agent-hardware-payments/stats", AgentHardwarePaymentController.getPaymentStats);
  app.get("/api/hardware-items", AgentHardwarePaymentController.getHardwareItems);
  app.post("/api/agent-hardware-payments/:id/approve", AgentHardwarePaymentController.approvePayment);
  app.get("/api/agent-hardware-payments", AgentHardwarePaymentController.getPayments);
  app.get("/api/agent-hardware-payments/:id", AgentHardwarePaymentController.getPayment);
  app.post("/api/agent-hardware-payments", AgentHardwarePaymentController.createPayment);
  app.patch("/api/agent-hardware-payments/:id", AgentHardwarePaymentController.updatePayment);
  app.delete("/api/agent-hardware-payments/:id", AgentHardwarePaymentController.deletePayment);

  // === CUSTOMER PAYMENT SUBSCRIPTION ROUTES ===
  app.post("/api/customer-payments", CustomerPaymentController.createSubscriptionPayment);
  app.get("/api/customer-payments/:payType", CustomerPaymentController.getCustomerPayments);
  app.get("/api/customer-payments/stats", CustomerPaymentController.getPaymentStats);
  app.get("/api/subscription-plans", CustomerPaymentController.getSubscriptionPlans);
  app.get("/api/integration/fica-status", CustomerPaymentController.getFicaIntegrationStatus);
  app.get("/api/integration/tra-status", CustomerPaymentController.getTRAIntegrationStatus);

  // === SUBSCRIPTION ROUTES ===
  app.post("/api/subscriptions/purchase", SubscriptionController.purchaseSubscription);
  app.post("/api/subscriptions/renewal", SubscriptionController.renewSubscription);
  app.post("/api/subscriptions/plan-change", SubscriptionController.changePlan);
  app.post("/api/subscriptions/add-ons", SubscriptionController.manageAddOns);
  app.post("/api/subscriptions/suspension", SubscriptionController.suspendSubscription);
  app.post("/api/subscriptions/offer-change", SubscriptionController.changeOffer);
  app.post("/api/subscriptions/validity-extension", SubscriptionController.extendValidity);
  app.post("/api/subscriptions/hardware-replacement", SubscriptionController.replaceHardware);
  app.post("/api/subscriptions/service-action", SubscriptionController.serviceAction);
  app.post("/api/subscriptions/payment-topup", SubscriptionController.paymentTopUp);

  // Master data APIs for subscription management
  app.get("/api/subscriptions/plans", SubscriptionController.getSubscriptionPlans);
  app.get("/api/subscriptions/offers", SubscriptionController.getAvailableOffers);
  app.get("/api/subscriptions/addons", SubscriptionController.getAddOnPacks);
  app.get("/api/subscriptions/service-centers", SubscriptionController.getServiceCenters);
  app.get("/api/subscriptions/suspension-reasons", SubscriptionController.getSuspensionReasons);

  // === SERVICE DESK INCIDENT ROUTES ===
  app.post("/api/incidents", IncidentController.createIncident);
  app.get("/api/incidents", IncidentController.getIncidents);
  app.get("/api/incidents/:id", IncidentController.getIncident);
  app.get("/api/incident-form-data", IncidentController.getFormData);
  app.get("/api/incident-current-data", IncidentController.getCurrentIncidentData);
  app.get("/api/incident-sla-data", IncidentController.getSlaData);
  app.get("/api/users/search", IncidentController.searchUsers);
  app.get("/api/assets/search", IncidentController.searchAssets);

  // === RECEIPT CANCELLATION ROUTES ===
  app.get("/api/receipt-cancellation/eligible", ReceiptCancellationController.getEligibleReceipts);
  app.get("/api/receipt-cancellation/:payId", ReceiptCancellationController.getReceiptDetails);
  app.post("/api/receipt-cancellation/cancel", ReceiptCancellationController.cancelReceipt);
  app.get("/api/receipt-cancellation/:payId/audit", ReceiptCancellationController.getCancellationAudit);
  app.get("/api/receipt-cancellation/:payId/status", ReceiptCancellationController.getCancellationStatus);
  app.post("/api/receipt-cancellation/cm-webhook", ReceiptCancellationController.updateCMStatus);

  // === CUSTOMER TRANSFER ROUTES ===
  app.get("/api/customer-transfer", customerTransferController.getTransfers);
  app.get("/api/customer-transfer/:id", customerTransferController.getTransferById);
  app.post("/api/customer-transfer/validate", customerTransferController.validateTransfer);
  app.post("/api/customer-transfer", customerTransferController.createTransfer);
  app.patch("/api/customer-transfer/:id/status", customerTransferController.updateTransferStatus);
  app.get("/api/customer-transfer/:id/status", customerTransferController.getTransferStatus);
  app.get("/api/customer-transfer/customer/:customerId/eligibility", customerTransferController.checkCustomerEligibility);

  // === ADJUSTMENT ROUTES ===
  const { AdjustmentController } = await import("./controllers/adjustment.controller");
  app.get("/api/adjustments", AdjustmentController.getAdjustments);
  app.get("/api/adjustments/pending", AdjustmentController.getPendingAdjustments);
  app.get("/api/adjustments/processed", AdjustmentController.getProcessedAdjustments);
  app.get("/api/adjustments/stats", AdjustmentController.getAdjustmentStats);
  app.get("/api/adjustments/:id", AdjustmentController.getAdjustmentById);
  app.post("/api/adjustments", AdjustmentController.createAdjustment);
  app.patch("/api/adjustments/:id/approve", AdjustmentController.approveAdjustment);
  app.patch("/api/adjustments/:id/reject", AdjustmentController.rejectAdjustment);
  app.get("/api/customers/bp/:bpId", AdjustmentController.getCustomerDetails);
  app.get("/api/customers/sc/:scId", AdjustmentController.getCustomerDetailsByScId);

  // === NOTIFICATION ROUTES ===
  app.get("/api/notifications", NotificationController.getNotifications);
  app.get("/api/notifications/:id", NotificationController.getNotificationById);
  app.post("/api/notifications", NotificationController.createNotification);
  app.put("/api/notifications/:id", NotificationController.updateNotification);
  app.patch("/api/notifications/:id/read", NotificationController.markAsRead);
  app.patch("/api/notifications/user/:userId/read-all", NotificationController.markAllAsRead);
  app.delete("/api/notifications/:id", NotificationController.deleteNotification);
  app.get("/api/notifications/user/:userId/unread-count", NotificationController.getUnreadCount);

  // Keep existing routes for backward compatibility
  // TODO: Migrate remaining routes to controllers
  app.post("/api/auth/demo-login-legacy", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Fixed credentials for demo
      const validCredentials = {
        "admin": "admin123",
        "agent": "agent123", 
        "manager": "manager123",
        "demo": "demo123"
      };

      if (!validCredentials[username as keyof typeof validCredentials] || 
          validCredentials[username as keyof typeof validCredentials] !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Return fixed user data based on username
      let userData = {
        id: 1,
        username: username,
        firstName: "John",
        lastName: "Smith",
        email: "john.smith@azamtv.co.tz",
        role: "admin",
      };

      // Customize user data based on username
      switch (username) {
        case "admin":
          userData = {
            ...userData,
            firstName: "Admin",
            lastName: "User",
            email: "admin@azamtv.co.tz",
            role: "admin"
          };
          break;
        case "agent":
          userData = {
            ...userData,
            id: 2,
            firstName: "Field",
            lastName: "Agent",
            email: "agent@azamtv.co.tz",
            role: "agent"
          };
          break;
        case "manager":
          userData = {
            ...userData,
            id: 3,
            firstName: "Regional",
            lastName: "Manager",
            email: "manager@azamtv.co.tz",
            role: "manager"
          };
          break;
        case "demo":
          userData = {
            ...userData,
            id: 4,
            firstName: "Demo",
            lastName: "User",
            email: "demo@azamtv.co.tz",
            role: "user"
          };
          break;
      }

      res.json(userData);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Email-based authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Fixed test accounts
      const testAccounts = {
        "admin@azamtv.co.tz": { password: "admin123", role: "admin", name: "Admin User" },
        "agent@azamtv.co.tz": { password: "agent123", role: "agent", name: "Field Agent" },
        "manager@azamtv.co.tz": { password: "manager123", role: "manager", name: "Regional Manager" },
        "demo@azamtv.co.tz": { password: "demo123", role: "user", name: "Demo User" }
      };

      const account = testAccounts[email as keyof typeof testAccounts];
      
      if (!account || account.password !== password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Return user data
      const userData = {
        id: Object.keys(testAccounts).indexOf(email) + 1,
        username: email.split('@')[0],
        firstName: account.name.split(' ')[0],
        lastName: account.name.split(' ')[1] || "User",
        email: email,
        role: account.role,
      };

      res.json(userData);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Generate OTP for password reset
  function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Forgot password - Send OTP
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const testAccounts = {
        "admin@azamtv.co.tz": true,
        "agent@azamtv.co.tz": true,
        "manager@azamtv.co.tz": true,
        "demo@azamtv.co.tz": true
      };

      if (!testAccounts[email as keyof typeof testAccounts]) {
        return res.status(404).json({ message: "User not found" });
      }

      // Generate OTP (in real app, this would be sent via email)
      const otp = generateOtp();
      
      // In a real application, you would send this via email service
      console.log(`OTP for ${email}: ${otp}`);
      
      res.json({ message: "OTP sent to your email" });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Verify OTP
  app.post("/api/auth/verify-otp", async (req, res) => {
    try {
      const { email, otp } = req.body;
      
      if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
      }

      // For demo purposes, accept any 6-digit OTP
      if (otp.length === 6 && /^\d+$/.test(otp)) {
        res.json({ message: "OTP verified successfully" });
      } else {
        res.status(400).json({ message: "Invalid OTP" });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // For demo purposes, just return success
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard stats - Return mock data
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      // Mock dashboard statistics
      res.json({
        totalAgents: 245,
        activeSubscriptions: 12500,
        inventoryStatus: 3400,
        lowStockCount: 5,
        paymentsToday: 450000,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Agent routes
  app.get("/api/agents", async (req, res) => {
    try {
      // Return mock agent data with KYC status diversity
      res.json({
        success: true,
        data: [
          {
            id: 1,
            firstName: "John",
            lastName: "Doe",
            email: "john.doe@azamtv.co.tz",
            phone: "+255712345678",
            type: "Agent",
            status: "approved",
            region: "Dar es Salaam",
            city: "Kinondoni",
            country: "Tanzania",
            currency: "TSH",
            role: "agent",
            kycDocuments: [
              { name: "National ID", type: "pdf", url: "/docs/john_doe_id.pdf" },
              { name: "Business License", type: "pdf", url: "/docs/john_doe_license.pdf" }
            ],
            createdAt: new Date(),
          },
          {
            id: 2,
            firstName: "Jane",
            lastName: "Smith",
            email: "jane.smith@azamtv.co.tz",
            phone: "+255723456789",
            type: "Sub Agent",
            status: "kyc_review",
            region: "Mwanza",
            city: "Nyamagana",
            country: "Tanzania",
            currency: "TSH",
            role: "sub-agent",
            kycDocuments: [
              { name: "National ID", type: "pdf", url: "/docs/jane_smith_id.pdf" },
              { name: "TIN Certificate", type: "pdf", url: "/docs/jane_smith_tin.pdf" }
            ],
            createdAt: new Date(),
          },
          {
            id: 3,
            firstName: "Peter",
            lastName: "Mwanga",
            email: "peter.mwanga@azamtv.co.tz",
            phone: "+255734567890",
            type: "Agent",
            status: "draft",
            region: "Arusha",
            city: "Arusha",
            country: "Tanzania",
            currency: "TSH",
            role: "agent",
            kycDocuments: [
              { name: "National ID", type: "pdf", url: "/docs/peter_mwanga_id.pdf" }
            ],
            createdAt: new Date(),
          },
          {
            id: 4,
            firstName: "Mary",
            lastName: "Kilimo",
            email: "mary.kilimo@azamtv.co.tz",
            phone: "+255745678901",
            type: "Sub Agent",
            status: "rejected",
            statusMessage: "Incomplete documentation provided. Missing business registration certificate.",
            region: "Dodoma",
            city: "Dodoma",
            country: "Tanzania",
            currency: "TSH",
            role: "sub-agent",
            kycDocuments: [
              { name: "National ID", type: "pdf", url: "/docs/mary_kilimo_id.pdf" }
            ],
            createdAt: new Date(),
          },
        ]
      });
    } catch (error) {
      console.error("Get agents error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update agent
  app.put("/api/agents/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const agentData = req.body;
      
      // In a real app, this would update the database
      console.log(`Updating agent ${id} with data:`, agentData);
      
      // Return updated agent data
      res.json({
        id: parseInt(id),
        ...agentData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Update agent error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Agent KYC Approval
  app.post("/api/agents/:id/kyc-approval", async (req, res) => {
    try {
      const { id } = req.params;
      const { action, remarks } = req.body;
      
      if (!action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "Valid action (approve/reject) is required" });
      }

      if (action === "reject" && !remarks?.trim()) {
        return res.status(400).json({ message: "Remarks are required for rejection" });
      }

      // In a real app, this would update the agent status in the database
      console.log(`Agent ${id} KYC ${action}d with remarks:`, remarks);
      
      res.json({
        id: parseInt(id),
        status: action === "approve" ? "approved" : "rejected",
        statusMessage: action === "reject" ? remarks : null,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Agent KYC approval error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const agentData = insertAgentSchema.parse(req.body);
      
      // Mock agent creation
      const newAgent = {
        id: Date.now(),
        ...agentData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      res.status(201).json(newAgent);
    } catch (error) {
      console.error("Create agent error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      // Return mock customer data with KYC status diversity
      res.json([
        {
          id: 1,
          firstName: "Michael",
          lastName: "Johnson",
          email: "michael.johnson@gmail.com",
          phone: "+255734567890",
          mobile: "+255734567890",
          type: "Individual",
          serviceType: "DTH",
          accountClass: "Residential",
          connectionType: "New Installation",
          city: "Dar es Salaam",
          region: "Dar es Salaam",
          country: "Tanzania",
          currency: "TSH",
          status: "approved",
          address1: "123 Kisutu Street",
          kycDocuments: [
            { name: "National ID", type: "pdf", url: "/docs/michael_johnson_id.pdf" },
            { name: "Utility Bill", type: "pdf", url: "/docs/michael_johnson_utility.pdf" }
          ],
          createdAt: new Date(),
        },
        {
          id: 2,
          firstName: "Sarah",
          lastName: "Wilson",
          email: "sarah.wilson@gmail.com",
          phone: "+255745678901",
          mobile: "+255745678901",
          type: "Individual",
          serviceType: "DTT",
          accountClass: "VIP",
          connectionType: "Upgrade",
          city: "Mwanza",
          region: "Mwanza",
          country: "Tanzania",
          currency: "TSH",
          status: "kyc_review",
          address1: "456 Nyerere Road",
          kycDocuments: [
            { name: "National ID", type: "pdf", url: "/docs/sarah_wilson_id.pdf" }
          ],
          createdAt: new Date(),
        },
        {
          id: 3,
          firstName: "Robert",
          lastName: "Mwalimu",
          email: "robert.mwalimu@gmail.com",
          phone: "+255756789012",
          mobile: "+255756789012",
          type: "Individual",
          serviceType: "DTH",
          accountClass: "Standard",
          connectionType: "New Installation",
          city: "Dodoma",
          region: "Dodoma",
          country: "Tanzania",
          currency: "TSH",
          status: "draft",
          address1: "789 Uhuru Avenue",
          kycDocuments: [
            { name: "National ID", type: "pdf", url: "/docs/robert_mwalimu_id.pdf" },
            { name: "Proof of Income", type: "pdf", url: "/docs/robert_mwalimu_income.pdf" }
          ],
          createdAt: new Date(),
        },
        {
          id: 4,
          firstName: "Grace",
          lastName: "Mtema",
          email: "grace.mtema@gmail.com",
          phone: "+255767890123",
          mobile: "+255767890123",
          type: "Corporate",
          serviceType: "DTH",
          accountClass: "Business",
          connectionType: "New Installation",
          city: "Arusha",
          region: "Arusha",
          country: "Tanzania",
          currency: "TSH",
          status: "rejected",
          statusMessage: "Corporate registration documents are incomplete. Missing VAT certificate.",
          address1: "321 Business Park",
          kycDocuments: [
            { name: "Company Registration", type: "pdf", url: "/docs/grace_mtema_company.pdf" }
          ],
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update customer
  app.put("/api/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const customerData = req.body;
      
      // In a real app, this would update the database
      console.log(`Updating customer ${id} with data:`, customerData);
      
      // Return updated customer data
      res.json({
        id: parseInt(id),
        ...customerData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Update customer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer KYC Approval
  app.post("/api/customers/:id/kyc-approval", async (req, res) => {
    try {
      const { id } = req.params;
      const { action, remarks } = req.body;
      
      if (!action || !["approve", "reject"].includes(action)) {
        return res.status(400).json({ message: "Valid action (approve/reject) is required" });
      }

      if (action === "reject" && !remarks?.trim()) {
        return res.status(400).json({ message: "Remarks are required for rejection" });
      }

      // In a real app, this would update the customer status in the database
      console.log(`Customer ${id} KYC ${action}d with remarks:`, remarks);
      
      res.json({
        id: parseInt(id),
        status: action === "approve" ? "approved" : "rejected",
        statusMessage: action === "reject" ? remarks : null,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Customer KYC approval error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      
      // Mock customer creation
      const newCustomer = {
        id: Date.now(),
        ...customerData,
        createdAt: new Date(),
      };

      res.status(201).json(newCustomer);
    } catch (error) {
      console.error("Create customer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Inventory routes
  app.get("/api/inventory", async (req, res) => {
    try {
      // Return mock inventory data
      res.json([
        {
          id: 1,
          materialCode: "STB001",
          materialName: "Set Top Box HD",
          serialNumber: "STB001234567",
          status: "AVAILABLE",
          state: "FRESH",
          owner: "Warehouse_DAR",
          createId: "system",
          createDt: new Date(),
        },
        {
          id: 2,
          materialCode: "SC001",
          materialName: "Smart Card",
          serialNumber: "SC001234567",
          status: "ALLOCATED",
          state: "FRESH",
          owner: "Agent_001",
          createId: "system",
          createDt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Get inventory error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    try {
      const inventoryData = insertInventoryItemSchema.parse(req.body);
      
      // Mock inventory creation
      const newItem = {
        id: Date.now(),
        ...inventoryData,
        createDt: new Date(),
        createTs: new Date(),
      };

      res.status(201).json(newItem);
    } catch (error) {
      console.error("Create inventory error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Inventory request routes
  app.get("/api/inventory-requests", async (req, res) => {
    try {
      // Return mock inventory request data with enhanced audit fields and special approval types
      res.json([
        {
          id: 1,
          requestId: "REQ001",
          module: "OTC",
          requestType: "STOCK_REQUEST",
          itemType: "NORMAL",
          itemQty: "5",
          transferTo: "OTC_MWANZA",
          status: "PENDING",
          priority: "high",
          createId: "otc_user",
          createDt: "2025-01-31T08:30:00Z",
          updateDt: null,
          updateId: null,
        },
        {
          id: 2,
          requestId: "TRF002",
          module: "WAREHOUSE",
          requestType: "TRANSFER",
          itemType: "DAMAGED",
          itemQty: "10",
          transferFrom: "WH_DAR",
          transferTo: "AGENT_001",
          status: "PENDING",
          priority: "medium",
          createId: "warehouse_user",
          createDt: "2025-01-31T07:45:00Z",
          updateDt: null,
          updateId: null,
          requiresSpecialApproval: true,
        },
        {
          id: 3,
          requestId: "REQ003",
          module: "AGENT",
          requestType: "EMERGENCY_REQUEST",
          itemType: "REPAIR",
          itemQty: "2",
          transferTo: "AGENT_002",
          status: "PENDING",
          priority: "high",
          createId: "agent_user",
          createDt: "2025-01-31T06:15:00Z",
          updateDt: null,
          updateId: null,
          requiresSpecialApproval: true,
        },
        {
          id: 4,
          requestId: "REQ004",
          module: "OTC",
          requestType: "STOCK_REQUEST",
          itemType: "NORMAL",
          itemQty: "15",
          transferTo: "OTC_ARUSHA",
          status: "APPROVED",
          priority: "medium",
          createId: "otc_user",
          createDt: "2025-01-30T14:20:00Z",
          updateDt: "2025-01-31T08:00:00Z",
          updateId: "admin_user",
        },
      ]);
    } catch (error) {
      console.error("Get inventory requests error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/inventory-requests", async (req, res) => {
    try {
      const requestData = insertInventoryRequestSchema.parse(req.body);
      
      // Mock request creation
      const newRequest = {
        id: Date.now(),
        ...requestData,
        createDt: new Date(),
        createTs: new Date(),
      };

      res.status(201).json(newRequest);
    } catch (error) {
      console.error("Create inventory request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/inventory-requests/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, updateId } = req.body;

      // Mock request update
      const updatedRequest = {
        id: parseInt(id),
        status,
        updateId,
        updateDt: new Date(),
        updateTs: new Date(),
      };

      res.json(updatedRequest);
    } catch (error) {
      console.error("Update inventory request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Additional inventory endpoints
  app.patch("/api/inventory/:serialNo/cas-id", async (req, res) => {
    try {
      const { serialNo } = req.params;
      const { casId } = req.body;

      // Mock CAS ID update
      res.json({
        serialNo,
        casId,
        message: "CAS ID updated successfully",
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Update CAS ID error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/inventory/pairing", async (req, res) => {
    try {
      const { stbSerial, smartCardNo } = req.body;

      // Mock pairing operation
      res.json({
        stbSerial,
        smartCardNo,
        message: "Devices paired successfully",
        pairedAt: new Date(),
      });
    } catch (error) {
      console.error("Device pairing error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/inventory/unpair", async (req, res) => {
    try {
      const { stbSerial, smartCardNo } = req.body;

      // Mock unpairing operation
      res.json({
        stbSerial,
        smartCardNo,
        message: "Devices unpaired successfully",
        unpairedAt: new Date(),
      });
    } catch (error) {
      console.error("Device unpairing error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Serial number upload endpoint for warehouse allocation
  app.post("/api/inventory/serial-upload", async (req, res) => {
    try {
      const { serialNumbers, materialCode, location, uploadedBy } = req.body;

      // Mock serial number processing
      const processedSerials = serialNumbers.map((serialNumber: string, index: number) => ({
        id: Date.now() + index,
        serialNumber: serialNumber.trim(),
        materialCode: materialCode || "STB001",
        location: location || "WH_DAR",
        status: "ALLOCATED",
        uploadedBy: uploadedBy || "system",
        uploadedAt: new Date(),
        createId: uploadedBy || "system",
        createDt: new Date(),
      }));

      res.json({
        message: "Serial numbers uploaded successfully",
        processedCount: processedSerials.length,
        serialNumbers: processedSerials,
        uploadedAt: new Date(),
      });
    } catch (error) {
      console.error("Serial upload error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced approval endpoint with role-based access
  app.post("/api/inventory-requests/:id/approve", async (req, res) => {
    try {
      const { id } = req.params;
      const { action, notes, approvedBy, userRole } = req.body;

      // Check if request requires special approval (for DAMAGED/REPAIR items)
      const mockRequest = {
        id: parseInt(id),
        requestId: `REQ00${id}`,
        itemType: id === "2" ? "DAMAGED" : id === "3" ? "REPAIR" : "NORMAL",
      };

      const requiresSpecialApproval = mockRequest.itemType === "DAMAGED" || mockRequest.itemType === "REPAIR";
      
      if (requiresSpecialApproval && action === "APPROVE" && userRole !== "admin") {
        return res.status(403).json({
          message: "Special approval required for damaged/repair items",
          requiresRole: "admin",
          currentRole: userRole,
        });
      }

      // Mock approval processing
      const approvalResponse = {
        requestId: mockRequest.requestId,
        action,
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        approvedBy,
        approvedAt: new Date(),
        notes,
        requiresSpecialApproval,
        processedBy: userRole,
      };

      res.json(approvalResponse);
    } catch (error) {
      console.error("Approval error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Warehouse Transfer routes
  app.get("/api/warehouse-transfers", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          transferId: "WT001",
          fromLocation: "WH_DAR",
          toLocation: "WH_MWANZA",
          materialType: "STB001",
          quantity: 50,
          serialNumbers: ["STB001234567", "STB001234568"],
          reason: "Stock redistribution",
          status: "PENDING",
          requestedBy: "warehouse_user",
          requestDate: new Date(),
        },
        {
          id: 2,
          transferId: "WT002",
          fromLocation: "WH_MWANZA",
          toLocation: "OTC_ARUSHA",
          materialType: "SC001",
          quantity: 100,
          serialNumbers: ["SC001234567", "SC001234568"],
          reason: "OTC stock requirement",
          status: "IN_TRANSIT",
          requestedBy: "otc_user",
          requestDate: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Get warehouse transfers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/warehouse-transfers", async (req, res) => {
    try {
      const newTransfer = {
        id: Date.now(),
        ...req.body,
        requestDate: new Date(),
      };
      res.status(201).json(newTransfer);
    } catch (error) {
      console.error("Create warehouse transfer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/warehouse-transfers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      res.json({
        id: parseInt(id),
        status,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Update warehouse transfer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // STB Status Search routes
  app.get("/api/stb-status/search", async (req, res) => {
    try {
      const { serialNumber } = req.query;
      
      // Mock serial number search
      if (serialNumber === "STB001234567") {
        res.json({
          serialNumber: "STB001234567",
          materialCode: "STB001",
          status: "ACTIVE",
          location: "AGENT_001",
          owner: "Agent John Doe",
          casId: "CAS001234567",
          createDt: "2025-01-15T10:30:00Z",
          updateDt: "2025-01-31T08:15:00Z",
        });
      } else {
        res.status(404).json({ message: "Serial number not found" });
      }
    } catch (error) {
      console.error("STB status search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/center-stb-status/search", async (req, res) => {
    try {
      const { serialNumber } = req.query;
      
      // Mock center STB status search
      if (serialNumber === "STB001234568") {
        res.json({
          serialNumber: "STB001234568",
          materialCode: "STB001",
          status: "IN_WAREHOUSE",
          location: "WH_DAR",
          owner: "Warehouse - Dar es Salaam",
          createDt: "2025-01-20T14:45:00Z",
          updateDt: null,
        });
      } else {
        res.status(404).json({ message: "Serial number not found in center system" });
      }
    } catch (error) {
      console.error("Center STB status search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // STB Status routes (Agent)
  app.get("/api/stb-status", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          serialNumber: "STB001234567",
          agentId: "AGENT_001",
          agentName: "John Doe",
          customerName: "Mary Johnson",
          customerPhone: "+255712345678",
          status: "ACTIVE",
          lastActivity: new Date(),
          model: "HD Set Top Box",
          casId: "CAS001234567",
        },
        {
          id: 2,
          serialNumber: "STB001234568",
          agentId: "AGENT_002",
          agentName: "Jane Smith",
          status: "BLOCKED",
          blockReason: "Suspected fraud",
          blockedBy: "admin_user",
          blockDate: new Date(),
          lastActivity: new Date(),
          model: "4K Set Top Box",
          casId: "CAS001234568",
        },
      ]);
    } catch (error) {
      console.error("Get STB status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stb-status/search", async (req, res) => {
    try {
      const { serial } = req.query;
      if (serial === "STB001234567") {
        res.json({
          id: 1,
          serialNumber: "STB001234567",
          agentId: "AGENT_001",
          agentName: "John Doe",
          customerName: "Mary Johnson",
          customerPhone: "+255712345678",
          status: "ACTIVE",
          lastActivity: new Date(),
          model: "HD Set Top Box",
          casId: "CAS001234567",
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Search STB status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/stb-status/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      res.json({
        id: parseInt(id),
        status,
        reason,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Update STB status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Center STB Status routes
  app.get("/api/center-stb-status", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          serialNumber: "STB001234567",
          centerId: "WH_DAR",
          centerName: "Warehouse Dar es Salaam",
          centerType: "WAREHOUSE",
          location: "Dar es Salaam",
          status: "ACTIVE",
          lastActivity: new Date(),
          model: "HD Set Top Box",
          casId: "CAS001234567",
          assignedTo: "warehouse_staff",
        },
        {
          id: 2,
          serialNumber: "STB001234568",
          centerId: "OTC_MWANZA",
          centerName: "OTC Mwanza",
          centerType: "OTC",
          location: "Mwanza",
          status: "BLOCKED",
          blockReason: "Maintenance required",
          blockedBy: "center_manager",
          blockDate: new Date(),
          lastActivity: new Date(),
          model: "4K Set Top Box",
          casId: "CAS001234568",
        },
      ]);
    } catch (error) {
      console.error("Get center STB status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/center-stb-status/search", async (req, res) => {
    try {
      const { serial } = req.query;
      if (serial === "STB001234567") {
        res.json({
          id: 1,
          serialNumber: "STB001234567",
          centerId: "WH_DAR",
          centerName: "Warehouse Dar es Salaam",
          centerType: "WAREHOUSE",
          location: "Dar es Salaam",
          status: "ACTIVE",
          lastActivity: new Date(),
          model: "HD Set Top Box",
          casId: "CAS001234567",
          assignedTo: "warehouse_staff",
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Search center STB status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/center-stb-status/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      res.json({
        id: parseInt(id),
        status,
        reason,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Update center STB status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Purchase Order routes
  app.get("/api/purchase-orders", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          poNumber: "PO001",
          vendorName: "AZAM Tech Solutions",
          vendorCode: "VND001",
          vendorAddress: "123 Tech Street, Dar es Salaam",
          vendorContact: "+255712345678",
          orderDate: new Date(),
          expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalAmount: 500000,
          currency: "TSH",
          status: "PENDING",
          createdBy: "procurement_user",
          items: [
            {
              id: 1,
              materialCode: "STB001",
              materialName: "Set Top Box HD",
              description: "High Definition Set Top Box",
              orderedQty: 10,
              receivedQty: 5,
              unitPrice: 50000,
              totalPrice: 500000,
              deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              grnStatus: "PARTIAL",
            },
          ],
          terms: "Payment within 30 days\nDelivery within 7 days\nWarranty: 12 months",
        },
      ]);
    } catch (error) {
      console.error("Get purchase orders error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/purchase-orders/search", async (req, res) => {
    try {
      const { po } = req.query;
      if (po === "PO001") {
        res.json({
          id: 1,
          poNumber: "PO001",
          vendorName: "AZAM Tech Solutions",
          vendorCode: "VND001",
          orderDate: new Date(),
          expectedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          totalAmount: 500000,
          currency: "TSH",
          status: "PENDING",
          items: [
            {
              id: 1,
              materialCode: "STB001",
              materialName: "Set Top Box HD",
              orderedQty: 10,
              receivedQty: 5,
              unitPrice: 50000,
              totalPrice: 500000,
              grnStatus: "PARTIAL",
            },
          ],
        });
      } else {
        res.json(null);
      }
    } catch (error) {
      console.error("Search purchase order error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // GRN routes
  app.get("/api/grn-entries", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          grnNumber: "GRN001",
          poNumber: "PO001",
          receivedDate: new Date(),
          receivedBy: "warehouse_user",
          status: "APPROVED",
          items: [
            {
              materialCode: "STB001",
              materialName: "Set Top Box HD",
              receivedQty: 5,
              serialNumbers: ["STB001234567", "STB001234568"],
              condition: "GOOD",
            },
          ],
        },
      ]);
    } catch (error) {
      console.error("Get GRN entries error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/grn-entries", async (req, res) => {
    try {
      const newGRN = {
        id: Date.now(),
        ...req.body,
        receivedDate: new Date(),
      };
      res.status(201).json(newGRN);
    } catch (error) {
      console.error("Create GRN entry error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Hardware Return routes
  app.get("/api/hardware-returns", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          returnId: "HR001",
          customerId: "CUST001",
          customerName: "John Doe",
          customerPhone: "+255712345678",
          agentId: "AGENT001",
          agentName: "Jane Smith",
          returnDate: new Date(),
          expectedRefund: 50000,
          status: "PENDING",
          items: [
            {
              id: 1,
              materialCode: "STB001",
              materialName: "Set Top Box HD",
              serialNumber: "STB001234567",
              condition: "FAULTY",
              purchaseDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              warrantyStatus: "ACTIVE",
              returnReason: "Device not working",
              refundAmount: 50000,
              approved: false,
            },
          ],
          reason: "DEFECTIVE",
        },
      ]);
    } catch (error) {
      console.error("Get hardware returns error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/hardware-returns", async (req, res) => {
    try {
      const newReturn = {
        id: Date.now(),
        ...req.body,
        returnDate: new Date(),
      };
      res.status(201).json(newReturn);
    } catch (error) {
      console.error("Create hardware return error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/hardware-returns/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      res.json({
        id: parseInt(id),
        status,
        notes,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Update hardware return error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Agent Replacement routes
  app.get("/api/agent-replacements", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          sapBpId: "BP001",
          sapCaId: "CA001",
          requestType: "AGENT_REPLACEMENT",
          requestId: "REP001",
          itemType: "STB001",
          itemQty: "1",
          itemSerialNo: "STB001234567",
          itemAmount: 50000,
          totalAmount: 59000,
          vatAmount: 0,
          transferFrom: "REPAIR_CENTER",
          transferTo: "AGENT_001",
          status: "PENDING",
          createId: "agent_001",
          createDt: new Date(),
          createTs: new Date(),
          cmStatus: "PENDING",
          cmStatusMsg: "Awaiting center approval",
          agentName: "John Mwamba",
          replacementCenter: "REPAIR_CENTER_DAR",
          faultyReason: "Device not powering on",
          replacementNotes: "Hardware fault detected during diagnostics",
        },
        {
          id: 2,
          sapBpId: "BP002",
          sapCaId: "CA002",
          requestType: "AGENT_REPLACEMENT",
          requestId: "REP002",
          itemType: "STB002",
          itemQty: "1",
          itemSerialNo: "STB002345678",
          itemAmount: 75000,
          totalAmount: 88500,
          vatAmount: 0,
          transferFrom: "REPAIR_CENTER",
          transferTo: "AGENT_002",
          status: "APPROVED",
          createId: "agent_002",
          createDt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createTs: new Date(Date.now() - 24 * 60 * 60 * 1000),
          cmStatus: "APPROVED",
          cmStatusMsg: "Approved by center executive",
          agentName: "Mary Kimaro",
          replacementCenter: "REPAIR_CENTER_MWANZA",
          faultyReason: "Remote control not responding",
          replacementNotes: "Replacement approved after validation",
          centerExecutive: "Peter Mgaya",
          approvedBy: "center_exec_001",
          approvedDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
          id: 3,
          sapBpId: "BP003",
          sapCaId: "CA003",
          requestType: "AGENT_REPLACEMENT",
          requestId: "REP003",
          itemType: "SC001",
          itemQty: "1",
          itemSerialNo: "SC001234569",
          itemAmount: 25000,
          totalAmount: 29500,
          vatAmount: 0,
          transferFrom: "REPAIR_CENTER",
          transferTo: "AGENT_003",
          status: "COMPLETED",
          createId: "agent_003",
          createDt: new Date(Date.now() - 72 * 60 * 60 * 1000),
          createTs: new Date(Date.now() - 72 * 60 * 60 * 1000),
          cmStatus: "COMPLETED",
          cmStatusMsg: "Replacement completed successfully",
          agentName: "James Mushi",
          replacementCenter: "REPAIR_CENTER_ARUSHA",
          faultyReason: "Smart card corrupted",
          replacementNotes: "New smart card issued and paired",
          centerExecutive: "Sarah Mtui",
          approvedBy: "center_exec_002",
          approvedDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
          completedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ]);
    } catch (error) {
      console.error("Get agent replacements error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/agent-replacements", async (req, res) => {
    try {
      const replacementData = insertAgentReplacementSchema.parse(req.body);
      
      const newReplacement = {
        id: Date.now(),
        ...replacementData,
        createDt: new Date(),
        createTs: new Date(),
      };

      res.status(201).json(newReplacement);
    } catch (error) {
      console.error("Create agent replacement error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/agent-replacements/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, cmStatus, cmStatusMsg, centerExecutive, approvedBy, replacementNotes } = req.body;
      
      const updateData: any = {
        id: parseInt(id),
        status,
        cmStatus,
        cmStatusMsg,
        centerExecutive,
        approvedBy,
        replacementNotes,
        updateDt: new Date(),
        updateTs: new Date(),
      };

      if (status === "APPROVED") {
        updateData.approvedDate = new Date();
      }
      
      if (status === "COMPLETED") {
        updateData.completedDate = new Date();
      }

      res.json(updateData);
    } catch (error) {
      console.error("Update agent replacement error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Agent Faulty Repair routes
  app.get("/api/agent-faulty-repairs", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          itemId: 1,
          materialCode: "STB001",
          materialName: "HD Set-Top Box",
          materialType: "STB",
          serialNumber: "STB001234567",
          casId: "CAS001234567",
          agentId: "AGENT_001",
          agentName: "John Mwamba",
          agentBpId: "BP001",
          currentStatus: "FAULTY",
          newStatus: "REPAIR",
          faultyReason: "Device not powering on, suspected power supply issue",
          repairNotes: "Transferred to repair center for diagnosis",
          transferDate: new Date(),
          repairCenter: "REPAIR_CENTER_DAR",
          processedBy: "center_user_001",
          processedDate: new Date(),
          createId: "center_user_001",
          createDt: new Date(),
          createTs: new Date(),
        },
        {
          id: 2,
          itemId: 2,
          materialCode: "STB002",
          materialName: "4K Set-Top Box",
          materialType: "STB",
          serialNumber: "STB002345678",
          casId: "CAS002345678",
          agentId: "AGENT_002",
          agentName: "Mary Kimaro",
          agentBpId: "BP002",
          currentStatus: "FAULTY",
          newStatus: "REPAIR",
          faultyReason: "Remote control not responding, signal issues",
          repairNotes: "Remote control replacement needed",
          transferDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          repairCenter: "REPAIR_CENTER_MWANZA",
          processedBy: "center_user_002",
          processedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createId: "center_user_002",
          createDt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createTs: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: 3,
          itemId: 3,
          materialCode: "SC001",
          materialName: "Smart Card Basic",
          materialType: "SMART_CARD",
          serialNumber: "SC001234569",
          casId: "CAS001234569",
          agentId: "AGENT_003",
          agentName: "James Mushi",
          agentBpId: "BP003",
          currentStatus: "FAULTY",
          newStatus: "REPAIR",
          faultyReason: "Smart card corrupted, unable to decode channels",
          repairNotes: "Card reprogramming required",
          transferDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
          repairCenter: "REPAIR_CENTER_ARUSHA",
          processedBy: "center_user_003",
          processedDate: new Date(Date.now() - 48 * 60 * 60 * 1000),
          createId: "center_user_003",
          createDt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          createTs: new Date(Date.now() - 48 * 60 * 60 * 1000),
        },
      ]);
    } catch (error) {
      console.error("Get agent faulty repairs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get agent faulty inventory items
  app.get("/api/agent-faulty-inventory", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          materialCode: "STB001",
          materialName: "HD Set-Top Box",
          materialType: "STB",
          serialNumber: "STB001234567",
          casId: "CAS001234567",
          state: "FAULTY",
          status: "AGENT_STOCK",
          owner: "AGENT_001",
          agentName: "John Mwamba",
          agentBpId: "BP001",
          createId: "agent_001",
          createDt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          faultyReason: "Device not powering on",
        },
        {
          id: 2,
          materialCode: "STB002",
          materialName: "4K Set-Top Box",
          materialType: "STB",
          serialNumber: "STB002345678",
          casId: "CAS002345678",
          state: "FAULTY",
          status: "AGENT_STOCK",
          owner: "AGENT_002",
          agentName: "Mary Kimaro",
          agentBpId: "BP002",
          createId: "agent_002",
          createDt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          faultyReason: "Remote control not responding",
        },
        {
          id: 3,
          materialCode: "SC001",
          materialName: "Smart Card Basic",
          materialType: "SMART_CARD",
          serialNumber: "SC001234569",
          casId: "CAS001234569",
          state: "FAULTY",
          status: "AGENT_STOCK",
          owner: "AGENT_003",
          agentName: "James Mushi",
          agentBpId: "BP003",
          createId: "agent_003",
          createDt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          faultyReason: "Smart card corrupted",
        },
        {
          id: 4,
          materialCode: "RMT001",
          materialName: "Remote Control",
          materialType: "REMOTE",
          serialNumber: "RMT001234570",
          state: "FAULTY",
          status: "AGENT_STOCK",
          owner: "AGENT_004",
          agentName: "Peter Mbeki",
          agentBpId: "BP004",
          createId: "agent_004",
          createDt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          faultyReason: "Buttons not responding",
        },
        {
          id: 5,
          materialCode: "CBL001",
          materialName: "HDMI Cable",
          materialType: "CABLE",
          serialNumber: "CBL001234571",
          state: "FAULTY",
          status: "AGENT_STOCK",
          owner: "AGENT_005",
          agentName: "Sarah Kileo",
          agentBpId: "BP005",
          createId: "agent_005",
          createDt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          faultyReason: "Cable damaged, no signal",
        },
      ]);
    } catch (error) {
      console.error("Get agent faulty inventory error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/agent-faulty-repairs", async (req, res) => {
    try {
      const repairData = insertAgentFaultyRepairSchema.parse(req.body);
      
      const newRepair = {
        id: Date.now(),
        ...repairData,
        createDt: new Date(),
        createTs: new Date(),
        processedDate: new Date(),
        transferDate: new Date(),
      };

      res.status(201).json(newRepair);
    } catch (error) {
      console.error("Create agent faulty repair error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/agent-faulty-repairs/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { newStatus, repairNotes, repairCenter } = req.body;
      
      const updateData = {
        id: parseInt(id),
        newStatus,
        repairNotes,
        repairCenter,
        updateDt: new Date(),
        updateTs: new Date(),
        processedDate: new Date(),
      };

      res.json(updateData);
    } catch (error) {
      console.error("Update agent faulty repair error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Agent Hardware Payment routes
  app.get("/api/agent-hardware-payments", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          payId: "PAY_HW_001",
          sapBpId: "BP001",
          sapCaId: "CA001",
          module: "Agent",
          payType: "Hardware",
          payAmount: 150000,
          vatAmount: 0,
          payMode: "CASH",
          currency: "TSH",
          transId: "TXN_001_2025",
          status: "COMPLETED",
          description: "Hardware purchase payment for STB and accessories",
          name: "John Mwamba",
          salesOrg: "1000",
          division: "10",
          cmStatus: "SUCCESS",
          cmStatusMsg: "Payment processed successfully",
          collectedBy: "Finance Team",
          collectionCenter: "Main Warehouse - Dar es Salaam",
          receiptNumber: "RCP_001_2025",
          createId: "admin",
          createDt: new Date(),
          createTs: new Date(),
          hardwareItems: [
            {
              materialCode: "STB001",
              materialName: "HD Set-Top Box",
              quantity: 5,
              unitPrice: 25000,
              totalPrice: 125000
            },
            {
              materialCode: "SC001",
              materialName: "Smart Card Basic",
              quantity: 5,
              unitPrice: 5000,
              totalPrice: 25000
            }
          ]
        },
        {
          id: 2,
          payId: "PAY_HW_002",
          sapBpId: "BP002",
          sapCaId: "CA002",
          module: "Agent",
          payType: "Hardware",
          payAmount: 75000,
          vatAmount: 0,
          payMode: "BANK_DEPOSIT",
          bankName: "CRDB Bank",
          currency: "TSH",
          transId: "TXN_002_2025",
          status: "INPROGRESS",
          description: "Hardware purchase payment for remote controls",
          name: "Mary Kimaro",
          salesOrg: "1000",
          division: "10",
          cmStatus: "PENDING",
          cmStatusMsg: "Awaiting finance approval",
          collectedBy: "Finance Team",
          collectionCenter: "Main Warehouse - Mwanza",
          receiptNumber: "RCP_002_2025",
          createId: "agent_002",
          createDt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createTs: new Date(Date.now() - 24 * 60 * 60 * 1000),
          hardwareItems: [
            {
              materialCode: "RMT001",
              materialName: "Remote Control",
              quantity: 15,
              unitPrice: 5000,
              totalPrice: 75000
            }
          ]
        },
        {
          id: 3,
          payId: "PAY_HW_003",
          sapBpId: "BP003",
          sapCaId: "CA003",
          module: "Agent",
          payType: "Hardware",
          payAmount: 200000,
          vatAmount: 0,
          payMode: "MOBILE_MONEY",
          currency: "TSH",
          transId: "TXN_003_2025",
          status: "REJECTED",
          description: "Hardware purchase payment for 4K STB units",
          name: "James Mushi",
          salesOrg: "1000",
          division: "10",
          cmStatus: "FAILED",
          cmStatusMsg: "Payment verification failed",
          collectedBy: "Finance Team",
          collectionCenter: "Main Warehouse - Arusha",
          receiptNumber: "RCP_003_2025",
          createId: "agent_003",
          createDt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          createTs: new Date(Date.now() - 48 * 60 * 60 * 1000),
          hardwareItems: [
            {
              materialCode: "STB002",
              materialName: "4K Set-Top Box",
              quantity: 8,
              unitPrice: 25000,
              totalPrice: 200000
            }
          ]
        }
      ]);
    } catch (error) {
      console.error("Get agent hardware payments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/agent-hardware-payments", async (req, res) => {
    try {
      const paymentData = insertAgentHardwarePaymentSchema.parse(req.body);
      
      const transId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const payId = `PAY_HW_${Date.now()}`;
      const receiptNumber = `RCP_${Date.now()}`;
      
      // Determine payment status based on payment mode
      let status = "COMPLETED";
      let cmStatus = "SUCCESS";
      let cmStatusMsg = "Payment processed successfully";
      
      // CHEQUE and BANK_DEPOSIT require finance approval
      if (paymentData.payMode === "CHEQUE" || paymentData.payMode === "BANK_DEPOSIT") {
        status = "INPROGRESS";
        cmStatus = "PENDING";
        cmStatusMsg = "Payment submitted for finance approval";
      }
      
      const newPayment = {
        id: Date.now(),
        payId,
        transId,
        receiptNumber,
        ...paymentData,
        status,
        cmStatus,
        cmStatusMsg,
        createDt: new Date(),
        createTs: new Date(),
      };

      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Create agent hardware payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/agent-hardware-payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, approvedBy, cmStatus, cmStatusMsg } = req.body;
      
      const updateData = {
        id: parseInt(id),
        status,
        approvedBy,
        cmStatus,
        cmStatusMsg,
        updateDt: new Date(),
        updateTs: new Date(),
      };

      res.json(updateData);
    } catch (error) {
      console.error("Update agent hardware payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/agent-hardware-payments/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { reason, userRole = "agent" } = req.body;
      
      // Mock payment data for validation (in production, fetch from database)
      const paymentId = parseInt(id);
      const mockPayments = [
        { id: 2, createDt: new Date(Date.now() - 24 * 60 * 60 * 1000), status: "INPROGRESS", payMode: "BANK_DEPOSIT" },
        { id: 3, createDt: new Date(Date.now() - 48 * 60 * 60 * 1000), status: "REJECTED", payMode: "MOBILE_MONEY" }
      ];
      
      const payment = mockPayments.find(p => p.id === paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Check if payment can be cancelled
      if (payment.status === "COMPLETED") {
        return res.status(400).json({ message: "Cannot cancel completed payments" });
      }
      
      if (payment.status === "CANCELLED") {
        return res.status(400).json({ message: "Payment is already cancelled" });
      }
      
      // Role-based and time-based restrictions
      const paymentAge = Date.now() - payment.createDt.getTime();
      const maxCancelTimeMs = 72 * 60 * 60 * 1000; // 72 hours
      
      // Only finance role can cancel after 72 hours or specific payment modes
      if (paymentAge > maxCancelTimeMs && userRole !== "finance") {
        return res.status(403).json({ 
          message: "Payment cancellation period expired. Contact finance team for assistance." 
        });
      }
      
      // Finance approval required for CHEQUE/BANK_DEPOSIT cancellations
      if ((payment.payMode === "CHEQUE" || payment.payMode === "BANK_DEPOSIT") && userRole !== "finance") {
        return res.status(403).json({ 
          message: "Finance approval required to cancel this payment type." 
        });
      }
      
      const cancelData = {
        id: paymentId,
        status: "CANCELLED",
        cmStatus: "CANCELLED",
        cmStatusMsg: reason || "Payment cancelled by user",
        updateDt: new Date(),
        updateTs: new Date(),
        cancelledBy: userRole,
      };

      res.json(cancelData);
    } catch (error) {
      console.error("Cancel agent hardware payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Agent Hardware Sale routes
  app.get("/api/agent-hardware-sales", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          sapBpId: "BP001",
          sapCaId: "CA001",
          module: "AGENT",
          salesOrg: "1000",
          division: "10",
          requestType: "AGENT_SALE",
          requestId: "AHS_001_2025",
          plantId: "PL_DAR_01",
          agentName: "John Mwamba",
          agentBalance: 500000,
          priceType: "KIT",
          items: [
            {
              id: 1,
              materialCode: "STB001",
              materialName: "HD Set-Top Box",
              materialType: "HARDWARE",
              quantity: 10,
              unitPrice: 25000,
              totalPrice: 250000,
              kitPrice: 25000,
              individualPrice: 30000,
              isKitItem: true,
            },
            {
              id: 2,
              materialCode: "SC001",
              materialName: "Smart Card Basic",
              materialType: "HARDWARE",
              quantity: 10,
              unitPrice: 5000,
              totalPrice: 50000,
              kitPrice: 5000,
              individualPrice: 7000,
              isKitItem: true,
            }
          ],
          totalAmount: 300000,
          vatAmount: 0,
          transferFrom: "Main_Warehouse_DAR",
          transferTo: "Agent_BP001",
          status: "APPROVED",
          approvedBy: "sales_manager",
          serialNumbersAssigned: false,
          currency: "TSH",
          createId: "agent_001",
          createDt: new Date(),
          createTs: new Date(),
          cmStatus: "SUCCESS",
          cmStatusMsg: "Request approved and sales order created",
          sapSoId: "SO_1000001",
        },
        {
          id: 2,
          sapBpId: "BP002",
          sapCaId: "CA002",
          module: "AGENT",
          salesOrg: "1000",
          division: "10",
          requestType: "AGENT_SALE",
          requestId: "AHS_002_2025",
          plantId: "PL_MWZ_01",
          agentName: "Mary Kimaro",
          agentBalance: 300000,
          priceType: "INDIVIDUAL",
          items: [
            {
              id: 3,
              materialCode: "RMT001",
              materialName: "Remote Control",
              materialType: "ACCESSORY",
              quantity: 20,
              unitPrice: 7000,
              totalPrice: 140000,
              individualPrice: 7000,
              isKitItem: false,
            }
          ],
          totalAmount: 140000,
          vatAmount: 0,
          transferFrom: "Main_Warehouse_MWZ",
          transferTo: "Agent_BP002",
          status: "PENDING",
          serialNumbersAssigned: false,
          currency: "TSH",
          createId: "agent_002",
          createDt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          createTs: new Date(Date.now() - 24 * 60 * 60 * 1000),
          cmStatus: "PENDING",
          cmStatusMsg: "Awaiting sales manager approval",
        },
        {
          id: 3,
          sapBpId: "BP003",
          sapCaId: "CA003",
          module: "AGENT",
          salesOrg: "1000",
          division: "10",
          requestType: "AGENT_SALE",
          requestId: "AHS_003_2025",
          plantId: "PL_DAR_01",
          agentName: "James Mushi",
          agentBalance: 1000000,
          priceType: "KIT",
          overridePrice: 450000,
          items: [
            {
              id: 4,
              materialCode: "STB002",
              materialName: "4K Set-Top Box",
              materialType: "HARDWARE",
              quantity: 15,
              unitPrice: 30000,
              totalPrice: 450000,
              kitPrice: 30000,
              individualPrice: 35000,
              isKitItem: true,
            }
          ],
          totalAmount: 450000,
          vatAmount: 0,
          transferFrom: "Main_Warehouse_DAR",
          transferTo: "Agent_BP003",
          status: "COMPLETED",
          approvedBy: "finance_manager",
          deliveryNoteId: "DN_001_2025",
          invoiceId: "INV_001_2025",
          serialNumbersAssigned: true,
          assignedSerialNumbers: ["4KSTB001001", "4KSTB001002", "4KSTB001003"],
          currency: "TSH",
          createId: "agent_003",
          createDt: new Date(Date.now() - 72 * 60 * 60 * 1000),
          createTs: new Date(Date.now() - 72 * 60 * 60 * 1000),
          updateDt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updateTs: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updateId: "warehouse_manager",
          cmStatus: "COMPLETED",
          cmStatusMsg: "Hardware delivered and serial numbers assigned",
          sapSoId: "SO_1000003",
        }
      ]);
    } catch (error) {
      console.error("Get agent hardware sales error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/agent-hardware-sales", async (req, res) => {
    try {
      const saleData = insertAgentHardwareSaleSchema.parse(req.body);
      
      // Generate request ID
      const requestId = `AHS_${Date.now().toString().slice(-6)}_2025`;
      
      const newSale = {
        id: Date.now(),
        ...saleData,
        requestId,
        status: "PENDING",
        serialNumbersAssigned: false,
        createDt: new Date(),
        createTs: new Date(),
        cmStatus: "PENDING",
        cmStatusMsg: "Hardware sale request submitted for approval",
      };

      res.status(201).json(newSale);
    } catch (error) {
      console.error("Create agent hardware sale error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/agent-hardware-sales/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updated = {
        id: parseInt(id),
        ...updateData,
        updateDt: new Date(),
        updateTs: new Date(),
      };

      res.json(updated);
    } catch (error) {
      console.error("Update agent hardware sale error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/agent-hardware-sales/:id/assign-serials", async (req, res) => {
    try {
      const { id } = req.params;
      const { serialNumbers } = req.body;
      
      const updated = {
        id: parseInt(id),
        serialNumbersAssigned: true,
        assignedSerialNumbers: serialNumbers,
        status: "COMPLETED",
        updateDt: new Date(),
        updateTs: new Date(),
        cmStatus: "COMPLETED",
        cmStatusMsg: "Serial numbers assigned successfully",
      };

      res.json(updated);
    } catch (error) {
      console.error("Assign serial numbers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get available hardware items for agent sales
  app.get("/api/hardware-items", async (req, res) => {
    try {
      res.json([
        {
          materialCode: "STB001",
          materialName: "HD Set-Top Box",
          materialType: "HARDWARE",
          kitPrice: 25000,
          individualPrice: 30000,
          availableStock: 150,
          isKitItem: true,
        },
        {
          materialCode: "STB002",
          materialName: "4K Set-Top Box",
          materialType: "HARDWARE",
          kitPrice: 30000,
          individualPrice: 35000,
          availableStock: 75,
          isKitItem: true,
        },
        {
          materialCode: "SC001",
          materialName: "Smart Card Basic",
          materialType: "HARDWARE",
          kitPrice: 5000,
          individualPrice: 7000,
          availableStock: 200,
          isKitItem: true,
        },
        {
          materialCode: "SC002",
          materialName: "Smart Card Premium",
          materialType: "HARDWARE",
          kitPrice: 8000,
          individualPrice: 10000,
          availableStock: 100,
          isKitItem: true,
        },
        {
          materialCode: "RMT001",
          materialName: "Remote Control",
          materialType: "ACCESSORY",
          individualPrice: 7000,
          availableStock: 300,
          isKitItem: false,
        },
        {
          materialCode: "CBL001",
          materialName: "HDMI Cable",
          materialType: "ACCESSORY",
          individualPrice: 3000,
          availableStock: 500,
          isKitItem: false,
        },
        {
          materialCode: "ANT001",
          materialName: "Dish Antenna",
          materialType: "HARDWARE",
          individualPrice: 25000,
          availableStock: 50,
          isKitItem: false,
        }
      ]);
    } catch (error) {
      console.error("Get hardware items error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer Hardware Sale routes
  app.get("/api/customer-hardware-sales", async (req, res) => {
    try {
      res.json([
        {
          id: 1,
          sapBpId: "BP_CUST_001",
          sapCaId: "CA_CUST_001",
          module: "CUSTOMER",
          salesOrg: "1000",
          division: "10",
          requestType: "CUSTOMER_SALE",
          requestId: "CHS_001_2025",
          itemType: "STB001",
          itemQty: 1,
          itemSerialNo: "STB001_12345",
          itemAmount: 30000,
          totalAmount: 35400,
          vatAmount: 0,
          transferFrom: "OTC_DAR_01",
          transferTo: "Customer_Walk_In",
          status: "COMPLETED",
          customerName: "John Doe",
          customerPhone: "+255712345678",
          customerEmail: "john.doe@email.com",
          planSelected: "Basic Package",
          paymentStatus: "COMPLETED",
          invoiceGenerated: true,
          traRequestPosted: true,
          currency: "TSH",
          items: [
            {
              id: 1,
              materialCode: "STB001",
              materialName: "HD Set-Top Box",
              materialType: "HARDWARE",
              quantity: 1,
              unitPrice: 30000,
              totalPrice: 30000,
              make: "Technicolor",
              modelNo: "TG582n",
              casId: "CAS_001_STB001",
            }
          ],
          createId: "otc_user_001",
          createDt: new Date("2025-01-15T09:00:00Z"),
          createTs: new Date("2025-01-15T09:00:00Z"),
          updateDt: new Date("2025-01-15T09:15:00Z"),
          updateTs: new Date("2025-01-15T09:15:00Z"),
          updateId: "otc_user_001",
          cmStatus: "COMPLETED",
          cmStatusMsg: "Hardware sale completed with invoice generated",
          sapSoId: "SO_2000001",
        },
        {
          id: 2,
          sapBpId: "BP_CUST_002",
          sapCaId: "CA_CUST_002",
          module: "CUSTOMER",
          salesOrg: "1000",
          division: "10",
          requestType: "CUSTOMER_SALE",
          requestId: "CHS_002_2025",
          itemType: "STB002",
          itemQty: 1,
          itemSerialNo: "STB002_67890",
          itemAmount: 35000,
          totalAmount: 41300,
          vatAmount: 0,
          transferFrom: "OTC_DAR_01",
          transferTo: "Customer_Walk_In",
          status: "INPROGRESS",
          customerName: "Jane Smith",
          customerPhone: "+255723456789",
          customerEmail: "jane.smith@email.com",
          planSelected: "Premium Package",
          paymentStatus: "PENDING",
          invoiceGenerated: false,
          traRequestPosted: false,
          currency: "TSH",
          items: [
            {
              id: 1,
              materialCode: "STB002",
              materialName: "4K Set-Top Box",
              materialType: "HARDWARE",
              quantity: 1,
              unitPrice: 35000,
              totalPrice: 35000,
              make: "Samsung",
              modelNo: "SM-4K-100",
              casId: "CAS_002_STB002",
            }
          ],
          createId: "otc_user_002",
          createDt: new Date("2025-01-16T10:30:00Z"),
          createTs: new Date("2025-01-16T10:30:00Z"),
          updateDt: new Date("2025-01-16T10:45:00Z"),
          updateTs: new Date("2025-01-16T10:45:00Z"),
          updateId: "otc_user_002",
          cmStatus: "INPROGRESS",
          cmStatusMsg: "Awaiting payment confirmation",
          sapSoId: "SO_2000002",
        }
      ]);
    } catch (error) {
      console.error("Get customer hardware sales error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/customer-hardware-sales", async (req, res) => {
    try {
      const saleData = insertCustomerHardwareSaleSchema.parse(req.body);
      
      // Generate request ID
      const requestId = `CHS_${Date.now().toString().slice(-6)}_2025`;
      
      const newSale = {
        id: Date.now(),
        ...saleData,
        requestId,
        status: "INPROGRESS",
        createDt: new Date(),
        createTs: new Date(),
        cmStatus: "INPROGRESS",
        cmStatusMsg: "Customer hardware sale request submitted",
      };

      res.status(201).json(newSale);
    } catch (error) {
      console.error("Create customer hardware sale error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/customer-hardware-sales/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const updated = {
        id: parseInt(id),
        ...updateData,
        updateDt: new Date(),
        updateTs: new Date(),
      };

      res.json(updated);
    } catch (error) {
      console.error("Update customer hardware sale error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/customer-hardware-sales/:id/payment", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentStatus } = req.body;
      
      const updated = {
        id: parseInt(id),
        paymentStatus,
        status: paymentStatus === "COMPLETED" ? "APPROVED" : "INPROGRESS",
        updateDt: new Date(),
        updateTs: new Date(),
        cmStatus: paymentStatus === "COMPLETED" ? "APPROVED" : "INPROGRESS",
        cmStatusMsg: paymentStatus === "COMPLETED" ? "Payment confirmed, processing delivery" : "Payment pending",
      };

      res.json(updated);
    } catch (error) {
      console.error("Update payment status error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/customer-hardware-sales/:id/invoice", async (req, res) => {
    try {
      const { id } = req.params;
      
      const updated = {
        id: parseInt(id),
        invoiceGenerated: true,
        traRequestPosted: true,
        status: "COMPLETED",
        updateDt: new Date(),
        updateTs: new Date(),
        cmStatus: "COMPLETED",
        cmStatusMsg: "Invoice generated and TRA request posted",
      };

      res.json(updated);
    } catch (error) {
      console.error("Generate invoice error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get available customers for search
  app.get("/api/customers", async (req, res) => {
    try {
      res.json({
        success: true,
        data: [
          {
            id: 1,
            sapBpId: "BP_CUST_001",
            sapCaId: "CA_CUST_001",
            firstName: "John",
            lastName: "Doe",
            phone: "+255712345678",
            email: "john.doe@email.com",
            status: "ACTIVE"
          },
          {
            id: 2,
            sapBpId: "BP_CUST_002", 
            sapCaId: "CA_CUST_002",
            firstName: "Jane",
            lastName: "Smith",
            phone: "+255723456789",
            email: "jane.smith@email.com",
            status: "ACTIVE"
          },
          {
            id: 3,
            sapBpId: "BP_CUST_003",
            sapCaId: "CA_CUST_003", 
            firstName: "Mohammed",
            lastName: "Hassan",
            phone: "+255734567890",
            email: "mohammed.hassan@email.com",
            status: "ACTIVE"
          },
          {
            id: 4,
            sapBpId: "BP_CUST_004",
            sapCaId: "CA_CUST_004",
            firstName: "Mary",
            lastName: "Johnson",
            phone: "+255745678901",
            email: "mary.johnson@email.com",
            status: "ACTIVE"
          },
          {
            id: 5,
            sapBpId: "BP_CUST_005",
            sapCaId: "CA_CUST_005",
            firstName: "Ahmed",
            lastName: "Ali",
            phone: "+255756789012",
            email: "ahmed.ali@email.com",
            status: "ACTIVE"
          },
          {
            id: 6,
            sapBpId: "BP_CUST_006",
            sapCaId: "CA_CUST_006",
            firstName: "Grace",
            lastName: "Mwamba",
            phone: "+255767890123",
            email: "grace.mwamba@email.com",
            status: "ACTIVE"
          }
        ]
      });
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get available pricing plans for customer hardware sales
  app.get("/api/pricing-plans", async (req, res) => {
    try {
      res.json([
        {
          planId: "BASIC_PLAN",
          planName: "Basic Package",
          description: "Basic HD channels with standard hardware",
          discountPercent: 0,
          validFor: "STB001,SC001"
        },
        {
          planId: "PREMIUM_PLAN",
          planName: "Premium Package",
          description: "Premium HD + 4K channels with advanced hardware",
          discountPercent: 5,
          validFor: "STB002,SC002"
        },
        {
          planId: "FAMILY_PLAN",
          planName: "Family Package",
          description: "Family-friendly content with multiple devices",
          discountPercent: 10,
          validFor: "STB001,STB002,SC001,SC002"
        }
      ]);
    } catch (error) {
      console.error("Get pricing plans error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get plants/warehouses for agent selection
  app.get("/api/plants", async (req, res) => {
    try {
      res.json([
        {
          plantId: "PL_DAR_01",
          plantName: "Main Warehouse - Dar es Salaam",
          country: "Tanzania",
          region: "Dar es Salaam",
          isActive: true,
        },
        {
          plantId: "PL_MWZ_01",
          plantName: "Main Warehouse - Mwanza",
          country: "Tanzania",
          region: "Mwanza",
          isActive: true,
        },
        {
          plantId: "PL_ARU_01",
          plantName: "Main Warehouse - Arusha",
          country: "Tanzania",
          region: "Arusha",
          isActive: true,
        },
        {
          plantId: "PL_ZNZ_01",
          plantName: "Main Warehouse - Zanzibar",
          country: "Tanzania",
          region: "Zanzibar",
          isActive: true,
        }
      ]);
    } catch (error) {
      console.error("Get plants error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Offer Change API endpoints
  app.get("/api/offer-plans", async (req, res) => {
    try {
      res.json([
        {
          id: "AZAM_LITE_1M",
          name: "Azam Lite 1 Month",
          type: "monthly",
          amount: 12000,
          vatAmount: 0,
          totalAmount: 14160,
          description: "Basic package with essential channels",
          duration: 1,
          channels: 80,
          features: ["HD Quality", "Basic Sports", "Local Content"]
        },
        {
          id: "AZAM_PURE_1M",
          name: "Azam Pure 1 Month",
          type: "monthly",
          amount: 19000,
          vatAmount: 0,
          totalAmount: 22420,
          description: "Premium package with sports and movies",
          duration: 1,
          channels: 120,
          features: ["HD Quality", "Premium Sports", "Movies", "International Content"]
        },
        {
          id: "AZAM_LITE_3M",
          name: "Azam Lite 3+1 Month",
          type: "quarterly",
          amount: 36000,
          vatAmount: 0,
          totalAmount: 42480,
          description: "3+1 month basic package deal",
          duration: 4,
          channels: 80,
          features: ["HD Quality", "Basic Sports", "Local Content", "1 Month Free"]
        },
        {
          id: "AZAM_PURE_3M",
          name: "Azam Pure 3+1 Month",
          type: "quarterly",
          amount: 57000,
          vatAmount: 0,
          totalAmount: 67260,
          description: "3+1 month premium package deal",
          duration: 4,
          channels: 120,
          features: ["HD Quality", "Premium Sports", "Movies", "International Content", "1 Month Free"]
        },
        {
          id: "AZAM_ULTRA_1M",
          name: "Azam Ultra 1 Month",
          type: "monthly",
          amount: 35000,
          vatAmount: 0,
          totalAmount: 41300,
          description: "Ultra premium with 4K and exclusive content",
          duration: 1,
          channels: 180,
          features: ["4K Quality", "Premium Sports", "Exclusive Movies", "International Content", "Live Events"]
        }
      ]);
    } catch (error) {
      console.error("Get offer plans error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/customer-search", async (req, res) => {
    try {
      const { q } = req.query;
      const searchTerm = q as string;
      
      // Mock customer search results - in production this would search by name, phone, email, SAP BP ID, Smart Card, etc.
      const allCustomers = [
        { id: "1", name: "John Doe", phone: "+255701234567", email: "john.doe@example.com", sapBpId: "BP00001234", smartCardNo: "SC0012345678" },
        { id: "2", name: "Jane Smith", phone: "+255701234568", email: "jane.smith@example.com", sapBpId: "BP00001235", smartCardNo: "SC0012345679" },
        { id: "3", name: "Michael Johnson", phone: "+255701234569", email: "michael.johnson@example.com", sapBpId: "BP00001236", smartCardNo: "SC0012345680" },
        { id: "4", name: "Sarah Williams", phone: "+255701234570", email: "sarah.williams@example.com", sapBpId: "BP00001237", smartCardNo: "SC0012345681" },
        { id: "5", name: "David Brown", phone: "+255701234571", email: "david.brown@example.com", sapBpId: "BP00001238", smartCardNo: "SC0012345682" },
        { id: "6", name: "Emily Davis", phone: "+255701234572", email: "emily.davis@example.com", sapBpId: "BP00001239", smartCardNo: "SC0012345683" },
        { id: "7", name: "James Wilson", phone: "+255701234573", email: "james.wilson@example.com", sapBpId: "BP00001240", smartCardNo: "SC0012345684" },
        { id: "8", name: "Lisa Anderson", phone: "+255701234574", email: "lisa.anderson@example.com", sapBpId: "BP00001241", smartCardNo: "SC0012345685" },
        { id: "9", name: "Robert Taylor", phone: "+255701234575", email: "robert.taylor@example.com", sapBpId: "BP00001242", smartCardNo: "SC0012345686" },
        { id: "10", name: "Jennifer Martinez", phone: "+255701234576", email: "jennifer.martinez@example.com", sapBpId: "BP00001243", smartCardNo: "SC0012345687" },
        { id: "11", name: "William Garcia", phone: "+255701234577", email: "william.garcia@example.com", sapBpId: "BP00001244", smartCardNo: "SC0012345688" },
        { id: "12", name: "Mary Rodriguez", phone: "+255701234578", email: "mary.rodriguez@example.com", sapBpId: "BP00001245", smartCardNo: "SC0012345689" },
        { id: "13", name: "Christopher Lee", phone: "+255701234579", email: "christopher.lee@example.com", sapBpId: "BP00001246", smartCardNo: "SC0012345690" },
        { id: "14", name: "Patricia Thomas", phone: "+255701234580", email: "patricia.thomas@example.com", sapBpId: "BP00001247", smartCardNo: "SC0012345691" },
        { id: "15", name: "Daniel Jackson", phone: "+255701234581", email: "daniel.jackson@example.com", sapBpId: "BP00001248", smartCardNo: "SC0012345692" }
      ];

      // Filter customers based on search term
      const filteredCustomers = allCustomers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.sapBpId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.smartCardNo.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Limit results to 10 for performance
      const limitedResults = filteredCustomers.slice(0, 10);

      res.json(limitedResults);
    } catch (error) {
      console.error("Customer search error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/customer-details/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock customer data with current subscription - vary data based on ID
      const customerVariations = {
        "1": { name: "John Doe", email: "john.doe@example.com", phone: "+255701234567", walletBalance: 25000, currentPlan: "AZAM_LITE_1M", planAmount: 12000 },
        "2": { name: "Jane Smith", email: "jane.smith@example.com", phone: "+255701234568", walletBalance: 45000, currentPlan: "AZAM_PURE_1M", planAmount: 19000 },
        "3": { name: "Michael Johnson", email: "michael.johnson@example.com", phone: "+255701234569", walletBalance: 15000, currentPlan: "AZAM_LITE_1M", planAmount: 12000 },
        "4": { name: "Sarah Williams", email: "sarah.williams@example.com", phone: "+255701234570", walletBalance: 65000, currentPlan: "AZAM_ULTRA_1M", planAmount: 35000 },
        "5": { name: "David Brown", email: "david.brown@example.com", phone: "+255701234571", walletBalance: 30000, currentPlan: "AZAM_PURE_1M", planAmount: 19000 }
      };

      const customerInfo = customerVariations[id as keyof typeof customerVariations] || customerVariations["1"];
      
      const customerData = {
        id: id,
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        sapBpId: `BP0000${id.padStart(4, '0')}`,
        sapCaId: `CA0000${id.padStart(4, '0')}`,
        sapContractId: `CON0000${id.padStart(4, '0')}`,
        smartCardNo: `SC00${id.padStart(8, '0')}`,
        currentPlan: {
          id: customerInfo.currentPlan,
          name: customerInfo.currentPlan === "AZAM_LITE_1M" ? "Azam Lite 1 Month" :
                customerInfo.currentPlan === "AZAM_PURE_1M" ? "Azam Pure 1 Month" :
                "Azam Ultra 1 Month",
          type: "monthly",
          amount: customerInfo.planAmount,
          startDate: "2025-01-15T00:00:00Z",
          endDate: "2025-02-14T23:59:59Z",
          status: "ACTIVE"
        },
        walletBalance: customerInfo.walletBalance,
        bufferPeriod: 2, // 2 days
        lastPlanChangeDate: "2025-01-15T00:00:00Z",
        suspensionStatus: id === "3" || id === "6" ? "SUSPENDED" : "ACTIVE", // Mock some suspended customers
        lastSuspensionDate: id === "3" ? "2025-01-16T08:30:00Z" : id === "6" ? "2025-01-17T14:20:00Z" : null,
        suspensionReason: id === "3" ? "Hardware Damage" : id === "6" ? "Signal Reception Issues" : null,
        connectionStatus: id === "7" || id === "11" ? "DISCONNECTED" : id === "3" || id === "6" ? "SUSPENDED" : "CONNECTED", // Mock some disconnected customers
        lastRenewalAttempt: id === "7" ? "2025-01-18T22:00:00Z" : id === "8" ? "2025-01-19T19:00:00Z" : null,
        autoRenewalStatus: id === "7" ? "FAILED" : id === "8" ? "RETRY_PENDING" : "ACTIVE",
        ftaDisconnectionDate: id === "7" ? "2025-02-02T00:00:00Z" : id === "11" ? "2025-01-25T00:00:00Z" : null,
        scheduledPlanChange: id === "8" ? {
          planId: "AZAM_ULTRA_1M",
          planName: "Azam Ultra 1 Month",
          scheduledDate: "2025-01-20T00:00:00Z",
          status: "PENDING"
        } : null
      };

      res.json(customerData);
    } catch (error) {
      console.error("Get customer details error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/offer-change", async (req, res) => {
    try {
      const { customerId, planId, changeType, scheduledDate, bufferPeriod, paymentAmount } = req.body;
      
      // Simulate SAP CM workflow
      const requestId = `OCR${Date.now()}`;
      
      // Mock offer change processing
      const offerChangeData = {
        id: requestId,
        customerId,
        planId,
        changeType,
        scheduledDate,
        bufferPeriod,
        paymentAmount,
        status: changeType === 'immediate' ? 'COMPLETED' : 'SCHEDULED',
        requestDate: new Date(),
        processedDate: changeType === 'immediate' ? new Date() : null,
        cmStatus: changeType === 'immediate' ? 'COMPLETED' : 'SCHEDULED',
        cmStatusMsg: changeType === 'immediate' ? 'Offer change processed successfully' : 'Offer change scheduled successfully'
      };

      res.json(offerChangeData);
    } catch (error) {
      console.error("Offer change error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/scheduled-offer-changes", async (req, res) => {
    try {
      // Mock scheduled offer changes
      res.json([
        {
          id: "OCR1752838001",
          customerId: "CUST001",
          customerName: "John Doe",
          currentPlan: "Azam Lite 1 Month",
          newPlan: "Azam Pure 1 Month",
          scheduledDate: "2025-02-15T00:00:00Z",
          status: "SCHEDULED",
          requestDate: "2025-01-18T10:30:00Z"
        },
        {
          id: "OCR1752838002",
          customerId: "CUST002",
          customerName: "Jane Smith",
          currentPlan: "Azam Pure 1 Month",
          newPlan: "Azam Ultra 1 Month",
          scheduledDate: "2025-02-20T00:00:00Z",
          status: "SCHEDULED",
          requestDate: "2025-01-17T14:15:00Z"
        }
      ]);
    } catch (error) {
      console.error("Get scheduled offer changes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/cancel-scheduled-offer-change/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock cancellation
      const cancelledRequest = {
        id: id,
        status: "CANCELLED",
        cancelledDate: new Date(),
        cancelledBy: "admin",
        cmStatus: "CANCELLED",
        cmStatusMsg: "Scheduled offer change cancelled successfully"
      };

      res.json(cancelledRequest);
    } catch (error) {
      console.error("Cancel scheduled offer change error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/offer-change-history", async (req, res) => {
    try {
      // Mock offer change history
      res.json([
        {
          id: "OCR1752837001",
          customerId: "CUST001",
          customerName: "John Doe",
          previousPlan: "Azam Lite 1 Month",
          newPlan: "Azam Pure 1 Month",
          changeType: "immediate",
          changeDate: "2025-01-15T10:30:00Z",
          status: "COMPLETED",
          bufferPeriod: true,
          amount: 19000,
          refundAmount: 12000
        },
        {
          id: "OCR1752837002",
          customerId: "CUST002",
          customerName: "Jane Smith",
          previousPlan: "Azam Pure 1 Month",
          newPlan: "Azam Ultra 1 Month",
          changeType: "scheduled",
          changeDate: "2025-01-10T00:00:00Z",
          status: "COMPLETED",
          bufferPeriod: false,
          amount: 35000,
          refundAmount: 0
        },
        {
          id: "OCR1752837003",
          customerId: "CUST003",
          customerName: "Michael Johnson",
          previousPlan: "Azam Lite 1 Month",
          newPlan: "Azam Lite 3+1 Month",
          changeType: "immediate",
          changeDate: "2025-01-08T14:20:00Z",
          status: "FAILED",
          bufferPeriod: false,
          amount: 36000,
          refundAmount: 0,
          failureReason: "Insufficient wallet balance"
        }
      ]);
    } catch (error) {
      console.error("Get offer change history error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/wallet-topup", async (req, res) => {
    try {
      const { customerId, amount } = req.body;
      
      // Mock wallet top-up
      const topUpData = {
        id: `TU${Date.now()}`,
        customerId,
        amount,
        transactionDate: new Date(),
        paymentMethod: "mobile_money",
        status: "COMPLETED",
        newBalance: 25000 + amount // Mock new balance
      };

      res.json(topUpData);
    } catch (error) {
      console.error("Wallet top-up error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer Suspension API endpoints
  app.get("/api/suspension-reasons", async (req, res) => {
    try {
      res.json([
        {
          id: "HARDWARE_DAMAGE",
          name: "Hardware Damage",
          description: "Customer STB or Smart Card is damaged and needs replacement",
          category: "TECHNICAL"
        },
        {
          id: "SIGNAL_ISSUES",
          name: "Signal Reception Issues",
          description: "Poor signal reception due to weather or infrastructure problems",
          category: "TECHNICAL"
        },
        {
          id: "CUSTOMER_REQUEST",
          name: "Customer Request",
          description: "Customer requested temporary suspension of service",
          category: "CUSTOMER"
        },
        {
          id: "PAYMENT_DISPUTE",
          name: "Payment Dispute",
          description: "Suspension due to payment related disputes",
          category: "BILLING"
        },
        {
          id: "MAINTENANCE",
          name: "Maintenance Work",
          description: "Suspension for scheduled maintenance or upgrades",
          category: "TECHNICAL"
        },
        {
          id: "RELOCATION",
          name: "Customer Relocation",
          description: "Customer is relocating and needs temporary suspension",
          category: "CUSTOMER"
        },
        {
          id: "FRAUD_PREVENTION",
          name: "Fraud Prevention",
          description: "Suspension due to suspected fraudulent activities",
          category: "SECURITY"
        },
        {
          id: "SYSTEM_UPGRADE",
          name: "System Upgrade",
          description: "Service suspension for system upgrades or migrations",
          category: "TECHNICAL"
        }
      ]);
    } catch (error) {
      console.error("Get suspension reasons error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/customer-suspension", async (req, res) => {
    try {
      const { customerId, reasonId, notes, suspensionType, actionType, actionSubtype } = req.body;
      
      // Generate request ID
      const requestId = `SUS${Date.now()}`;
      
      // Mock suspension processing following SAP workflow
      const suspensionData = {
        id: requestId,
        customerId,
        reasonId,
        notes,
        suspensionType,
        actionType,
        actionSubtype,
        status: "INPROGRESS",
        requestDate: new Date(),
        cmStatus: "PROCESSING",
        cmStatusMsg: "Suspension request initiated, processing through SOM and Nagra systems",
        somLockStatus: "PENDING",
        nagraStatus: "PENDING",
        ccStatus: "PENDING"
      };

      // Simulate SAP workflow processing
      setTimeout(() => {
        // This would normally update the database with completion status
        suspensionData.status = "COMPLETED";
        suspensionData.cmStatus = "COMPLETED";
        suspensionData.cmStatusMsg = "Customer successfully suspended across all systems";
        suspensionData.somLockStatus = "COMPLETED";
        suspensionData.nagraStatus = "SUSPENDED";
        suspensionData.ccStatus = "CHARGING_STOPPED";
      }, 2000);

      res.json(suspensionData);
    } catch (error) {
      console.error("Customer suspension error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/active-suspensions", async (req, res) => {
    try {
      // Mock active suspensions
      res.json([
        {
          id: "SUS1752839001",
          customerId: "3",
          customerName: "Michael Johnson",
          planName: "Azam Lite 1 Month",
          reason: "Hardware Damage",
          suspensionType: "TEMPORARY",
          suspensionDate: "2025-01-16T08:30:00Z",
          sapBpId: "BP00001236",
          smartCardNo: "SC0012345680",
          status: "SUSPENDED"
        },
        {
          id: "SUS1752839002",
          customerId: "6",
          customerName: "Emily Davis",
          planName: "Azam Pure 1 Month",
          reason: "Signal Reception Issues",
          suspensionType: "TEMPORARY",
          suspensionDate: "2025-01-17T14:20:00Z",
          sapBpId: "BP00001239",
          smartCardNo: "SC0012345683",
          status: "SUSPENDED"
        }
      ]);
    } catch (error) {
      console.error("Get active suspensions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/customer-reactivation/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock reactivation process
      const reactivationData = {
        id: `REACT${Date.now()}`,
        customerId: id,
        actionType: "REACTIVATION",
        status: "COMPLETED",
        reactivationDate: new Date(),
        cmStatus: "COMPLETED",
        cmStatusMsg: "Customer successfully reactivated across all systems",
        somStatus: "UNLOCKED",
        nagraStatus: "ACTIVE",
        ccStatus: "CHARGING_RESUMED"
      };

      res.json(reactivationData);
    } catch (error) {
      console.error("Customer reactivation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/suspension-history", async (req, res) => {
    try {
      // Mock suspension history
      res.json([
        {
          id: "SUS1752838001",
          customerId: "1",
          customerName: "John Doe",
          action: "SUSPENSION",
          reason: "Customer Request",
          type: "TEMPORARY",
          actionDate: "2025-01-15T10:30:00Z",
          status: "COMPLETED",
          notes: "Customer requested temporary suspension due to travel",
          requestId: "SUS1752838001",
          cmStatus: "COMPLETED",
          reactivationDate: "2025-01-18T09:00:00Z"
        },
        {
          id: "SUS1752838002",
          customerId: "2",
          customerName: "Jane Smith",
          action: "SUSPENSION",
          reason: "Hardware Damage",
          type: "TEMPORARY",
          actionDate: "2025-01-12T14:20:00Z",
          status: "COMPLETED",
          notes: "STB damaged during storm, replacement required",
          requestId: "SUS1752838002",
          cmStatus: "COMPLETED",
          reactivationDate: "2025-01-14T11:30:00Z"
        },
        {
          id: "SUS1752838003",
          customerId: "4",
          customerName: "Sarah Williams",
          action: "SUSPENSION",
          reason: "Signal Reception Issues",
          type: "TEMPORARY",
          actionDate: "2025-01-08T16:45:00Z",
          status: "FAILED",
          notes: "Automatic suspension due to poor signal quality",
          requestId: "SUS1752838003",
          cmStatus: "FAILED",
          failureReason: "Nagra system communication timeout"
        }
      ]);
    } catch (error) {
      console.error("Get suspension history error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment routes
  app.get("/api/payments", async (req, res) => {
    try {
      // Return mock payment data
      res.json([
        {
          id: 1,
          customerId: 1,
          amount: 50000,
          currency: "TSH",
          paymentMode: "mobile_money",
          type: "hardware",
          status: "completed",
          createdAt: new Date(),
        },
        {
          id: 2,
          customerId: 2,
          amount: 25000,
          currency: "TSH",
          paymentMode: "cash",
          type: "subscription",
          status: "pending",
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      
      // Mock payment creation
      const newPayment = {
        id: Date.now(),
        ...paymentData,
        createdAt: new Date(),
      };

      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Create payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Subscription routes
  app.get("/api/subscriptions", async (req, res) => {
    try {
      // Return mock subscription data
      res.json([
        {
          id: 1,
          customerId: 1,
          smartCardNumber: "SC001234567",
          plan: "Premium",
          amount: 25000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "active",
          createdAt: new Date(),
        },
        {
          id: 2,
          customerId: 2,
          smartCardNumber: "SC001234568",
          plan: "Basic",
          amount: 15000,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "active",
          createdAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Get subscriptions error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/subscriptions", async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      
      // Mock subscription creation
      const newSubscription = {
        id: Date.now(),
        ...subscriptionData,
        createdAt: new Date(),
      };

      res.status(201).json(newSubscription);
    } catch (error) {
      console.error("Create subscription error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Plan Change routes
  app.get("/api/plan-changes", async (req, res) => {
    try {
      // Return mock plan change data
      res.json([
        {
          id: 1,
          sapBpId: "BP12345",
          sapCaId: "CA67890",
          sapContractId: "CON123456789",
          smartCardNumber: "SC123456789",
          actionType: "PLAN_CHANGE",
          actionSubtype: "IMMEDIATE",
          requestId: "PC001_" + Date.now(),
          planType: "PREPAID",
          planId: "AZ004",
          planName: "Azam Plus 1 Month",
          bundleName: "Plus Bundle",
          division: "DIGITAL_TV",
          planRate: 28000,
          planAmount: 28000,
          vatAmount: 0,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: "COMPLETED",
          createId: "admin",
          createDt: new Date(),
          createTs: new Date(),
          changeType: "immediate",
          oldPlanId: "AZ001",
          oldPlanName: "Azam Lite 1 Month",
          oldPlanAmount: 12000,
          walletBalance: 15000,
          refundAmount: 12000,
          paymentRequired: 13000,
          cmStatus: "PROCESSED",
          cmStatusMsg: "Plan change completed successfully",
        }
      ]);
    } catch (error) {
      console.error("Get plan changes error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/plan-changes", async (req, res) => {
    try {
      const planChangeData = req.body;
      
      // Mock plan change creation
      const newPlanChange = {
        id: Date.now(),
        ...planChangeData,
        requestId: "PC_" + Date.now(),
        createDt: new Date(),
        createTs: new Date(),
        status: "INPROGRESS",
        cmStatus: "PENDING",
      };

      res.status(201).json(newPlanChange);
    } catch (error) {
      console.error("Create plan change error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Search customer by smart card for plan change
  app.get("/api/customers/search/:smartCard", async (req, res) => {
    try {
      const { smartCard } = req.params;
      
      // Mock customer search by smart card
      if (smartCard === "SC123456789") {
        res.json({
          customerId: "CUST001",
          smartCardNumber: "SC123456789",
          sapBpId: "BP12345",
          sapCaId: "CA67890",
          sapContractId: "CON123456789",
          currentPlan: {
            id: "AZ001",
            name: "Azam Lite 1 Month",
            price: 12000,
            startDate: "2025-04-24 14:00:00",
            endDate: "2025-05-23 23:59:59",
            status: "Active"
          },
          walletBalance: 15000,
          bufferPeriodDays: 2,
          lastPlanChangeDate: "2025-04-24 14:00:00",
          autoRenewalEnabled: true,
        });
      } else {
        res.status(404).json({ message: "Customer not found" });
      }
    } catch (error) {
      console.error("Search customer error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get plan change history
  app.get("/api/plan-changes/history/:smartCard", async (req, res) => {
    try {
      const { smartCard } = req.params;
      
      // Mock plan change history
      res.json([
        {
          id: 1,
          customerId: "CUST001",
          smartCardNumber: smartCard,
          eventDate: new Date("2025-05-25 10:12:00"),
          eventName: "Plan change - Immediate",
          planName: "Azam Plus 1 Month",
          planStartDate: new Date("2025-05-25 10:12:00"),
          planEndDate: new Date("2025-06-24 23:59:59"),
          amount: -28000,
          walletBalance: 0,
          changeType: "immediate",
          status: "success",
        },
        {
          id: 2,
          customerId: "CUST001",
          smartCardNumber: smartCard,
          eventDate: new Date("2025-05-25 10:12:00"),
          eventName: "Previous Invoice Cancellation",
          planName: "",
          amount: 12000,
          walletBalance: 19500,
          changeType: "cancellation",
          status: "success",
        }
      ]);
    } catch (error) {
      console.error("Get plan change history error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment Details API endpoints following comprehensive workflow
  app.get("/api/payment-details", async (req, res) => {
    try {
      const { module, payType, status, sapBpId } = req.query;
      
      // Mock payment details data following PAYMENT_DETAILS schema
      let paymentDetails = [
        {
          payId: 1,
          sapBpId: "BP_CUST_001",
          sapCaId: "CA_CUST_001",
          module: "Customer",
          payType: "Hardware",
          payAmount: 120000,
          vatAmount: 0,
          payMode: "CASH",
          chequeNo: null,
          bankName: null,
          currency: "TSH",
          onlPgId: null,
          onlTransId: null,
          transId: "TXN_001_" + Date.now(),
          status: "COMPLETED",
          description: "Hardware sale payment for STB and decoder",
          createId: "admin",
          createDt: new Date(),
          createTs: new Date(),
          updateId: "admin",
          updateDt: new Date(),
          updateTs: new Date(),
          approvedBy: "manager",
          name: "Michael Johnson",
          salesOrg: "1000",
          division: "10",
          cmStatus: "PROCESSED",
          cmStatusMsg: "Payment processed successfully",
          collectedBy: "OTC_Cashier_001",
          collectionCenter: "OTC_DAR_01"
        },
        {
          payId: 2,
          sapBpId: "BP_CUST_002",
          sapCaId: "CA_CUST_002",
          module: "Customer",
          payType: "Subscription",
          payAmount: 25000,
          vatAmount: 0,
          payMode: "AZAM PAY",
          chequeNo: null,
          bankName: null,
          currency: "TSH",
          onlPgId: "AZAM_PAY_001",
          onlTransId: "AZAM_TXN_001",
          transId: "TXN_002_" + Date.now(),
          status: "PENDING",
          description: "Monthly subscription payment",
          createId: "agent",
          createDt: new Date(),
          createTs: new Date(),
          updateId: null,
          updateDt: null,
          updateTs: null,
          approvedBy: null,
          name: "Sarah Williams",
          salesOrg: "1000",
          division: "10",
          cmStatus: "PENDING",
          cmStatusMsg: "Awaiting CM processing",
          collectedBy: "Agent_002",
          collectionCenter: "AGENT_KIN_001"
        },
        {
          payId: 3,
          sapBpId: "BP_AGENT_001",
          sapCaId: "CA_AGENT_001",
          module: "Agent",
          payType: "Hardware",
          payAmount: 850000,
          vatAmount: 0,
          payMode: "CHEQUE",
          chequeNo: "CHQ_001234",
          bankName: "CRDB Bank",
          currency: "TSH",
          onlPgId: null,
          onlTransId: null,
          transId: "TXN_003_" + Date.now(),
          status: "APPROVED",
          description: "Bulk hardware purchase payment",
          createId: "manager",
          createDt: new Date(),
          createTs: new Date(),
          updateId: "manager",
          updateDt: new Date(),
          updateTs: new Date(),
          approvedBy: "finance_manager",
          name: "John Doe",
          salesOrg: "1000",
          division: "10",
          cmStatus: "APPROVED",
          cmStatusMsg: "Payment approved for processing",
          collectedBy: "Finance_Team",
          collectionCenter: "HEAD_OFFICE"
        }
      ];

      // Apply filters
      if (module) {
        paymentDetails = paymentDetails.filter(p => p.module.toLowerCase() === module.toString().toLowerCase());
      }
      if (payType) {
        paymentDetails = paymentDetails.filter(p => p.payType.toLowerCase() === payType.toString().toLowerCase());
      }
      if (status) {
        paymentDetails = paymentDetails.filter(p => p.status.toLowerCase() === status.toString().toLowerCase());
      }
      if (sapBpId) {
        paymentDetails = paymentDetails.filter(p => p.sapBpId === sapBpId);
      }

      res.json(paymentDetails);
    } catch (error) {
      console.error("Get payment details error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/payment-details", async (req, res) => {
    try {
      const paymentData = insertPaymentDetailsSchema.parse(req.body);
      
      // Generate unique transaction ID
      const transId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Mock payment creation following CM workflow
      const newPayment = {
        payId: Date.now(),
        ...paymentData,
        transId: transId,
        createDt: new Date(),
        createTs: new Date(),
        cmStatus: "PENDING",
        cmStatusMsg: "Payment submitted for CM processing",
        status: "PENDING"
      };

      res.status(201).json(newPayment);
    } catch (error) {
      console.error("Create payment details error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/payment-details/:id", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Mock payment update with proper CM workflow status
      const updatedPayment = {
        payId: paymentId,
        ...updateData,
        updateDt: new Date(),
        updateTs: new Date(),
        updateId: updateData.updateId || "system"
      };

      res.json(updatedPayment);
    } catch (error) {
      console.error("Update payment details error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment approval workflow endpoint
  app.post("/api/payment-details/:id/approve", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { approvedBy, cmStatus, cmStatusMsg } = req.body;
      
      // Mock payment approval following CM workflow
      const approvedPayment = {
        payId: paymentId,
        status: "APPROVED",
        cmStatus: cmStatus || "APPROVED",
        cmStatusMsg: cmStatusMsg || "Payment approved for processing",
        approvedBy: approvedBy,
        updateDt: new Date(),
        updateTs: new Date(),
        updateId: approvedBy
      };

      res.json(approvedPayment);
    } catch (error) {
      console.error("Approve payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Payment cancellation endpoint
  app.post("/api/payment-details/:id/cancel", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { cancelReason, cancelledBy } = req.body;
      
      // Mock payment cancellation following CM workflow
      const cancelledPayment = {
        payId: paymentId,
        status: "CANCELLED",
        cmStatus: "CANCELLED",
        cmStatusMsg: `Payment cancelled: ${cancelReason}`,
        description: cancelReason,
        updateDt: new Date(),
        updateTs: new Date(),
        updateId: cancelledBy
      };

      res.json(cancelledPayment);
    } catch (error) {
      console.error("Cancel payment error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // TRA integration endpoint for tax posting
  app.post("/api/payment-details/:id/tra-post", async (req, res) => {
    try {
      const paymentId = parseInt(req.params.id);
      const { vatAmount, payType } = req.body;
      
      // Mock TRA integration for tax posting
      const traResponse = {
        payId: paymentId,
        traStatus: "POSTED",
        traReference: `TRA_REF_${Date.now()}`,
        vatAmount: 0,
        payType: payType,
        postedDate: new Date(),
        cmStatus: "TRA_POSTED",
        cmStatusMsg: "VAT posted to TRA successfully"
      };

      res.json(traResponse);
    } catch (error) {
      console.error("TRA post error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Customer Disconnection API endpoints
  app.get("/api/disconnection-reasons", async (req, res) => {
    try {
      res.json([
        {
          id: "AUTO_RENEWAL_FAILURE",
          name: "Auto Renewal Failure",
          description: "Customer disconnected due to insufficient balance for auto renewal (3 failed attempts)",
          category: "AUTOMATIC",
          isAutomatic: true
        },
        {
          id: "SCHEDULED_PLAN_FAILURE",
          name: "Scheduled Plan/Offer Change Failure",
          description: "Scheduled plan change failed due to insufficient balance, auto renewal also failed",
          category: "AUTOMATIC",
          isAutomatic: true
        },
        {
          id: "SUSPENDED_RECONNECTION_FAILURE",
          name: "Suspended Customer Reconnection Failure",
          description: "Suspended customer attempted reconnection but has no active plan",
          category: "AUTOMATIC",
          isAutomatic: true
        },
        {
          id: "MANUAL_DISCONNECTION",
          name: "Manual Disconnection",
          description: "Customer service or agent initiated disconnection",
          category: "MANUAL",
          isAutomatic: false
        },
        {
          id: "POLICY_VIOLATION",
          name: "Policy Violation",
          description: "Customer disconnected due to terms of service violation",
          category: "COMPLIANCE",
          isAutomatic: false
        },
        {
          id: "PAYMENT_FRAUD",
          name: "Payment Fraud",
          description: "Disconnection due to fraudulent payment activities",
          category: "SECURITY",
          isAutomatic: false
        },
        {
          id: "CUSTOMER_REQUEST",
          name: "Customer Request",
          description: "Customer requested service disconnection",
          category: "CUSTOMER",
          isAutomatic: false
        },
        {
          id: "TECHNICAL_ISSUES",
          name: "Technical Issues",
          description: "Service disconnection due to unresolved technical problems",
          category: "TECHNICAL",
          isAutomatic: false
        }
      ]);
    } catch (error) {
      console.error("Get disconnection reasons error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/customer-disconnection", async (req, res) => {
    try {
      const { customerId, reasonId, notes, disconnectionType, scheduledDate, actionType, actionSubtype } = req.body;
      
      // Generate request ID
      const requestId = `DIS${Date.now()}`;
      
      // Mock disconnection processing following CM workflow
      const disconnectionData = {
        id: requestId,
        customerId,
        reasonId,
        notes,
        disconnectionType,
        scheduledDate,
        actionType,
        actionSubtype,
        status: "INPROGRESS",
        requestDate: new Date(),
        cmStatus: "PROCESSING",
        cmStatusMsg: "Disconnection request initiated, updating customer status and stopping services",
        expectedDisconnectionDate: disconnectionType === 'IMMEDIATE' ? new Date() : new Date(scheduledDate),
        ftaDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) // 15 days from now
      };

      // Simulate CM workflow processing
      setTimeout(() => {
        disconnectionData.status = "COMPLETED";
        disconnectionData.cmStatus = "COMPLETED";
        disconnectionData.cmStatusMsg = "Customer successfully disconnected, FTA timeline activated";
      }, 1500);

      res.json(disconnectionData);
    } catch (error) {
      console.error("Customer disconnection error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auto-disconnection-queue", async (req, res) => {
    try {
      // Mock auto disconnection queue
      res.json([
        {
          id: "ADQ1752840001",
          customerId: "7",
          customerName: "James Wilson",
          planName: "Azam Lite 1 Month",
          planEndDate: "2025-01-19T23:59:59Z",
          walletBalance: 5000,
          failedRenewalAttempts: 3,
          lastRenewalAttempt: "2025-01-18T22:00:00Z",
          nextAttemptScheduled: null,
          status: "PENDING_DISCONNECTION"
        },
        {
          id: "ADQ1752840002",
          customerId: "8",
          customerName: "Lisa Anderson",
          planName: "Azam Pure 1 Month",
          planEndDate: "2025-01-20T23:59:59Z",
          walletBalance: 8000,
          failedRenewalAttempts: 2,
          lastRenewalAttempt: "2025-01-19T19:00:00Z",
          nextAttemptScheduled: "2025-01-19T22:00:00Z",
          status: "RETRY_PENDING"
        },
        {
          id: "ADQ1752840003",
          customerId: "9",
          customerName: "Robert Taylor",
          planName: "Azam Play 1 Month",
          planEndDate: "2025-01-21T23:59:59Z",
          walletBalance: 0,
          failedRenewalAttempts: 1,
          lastRenewalAttempt: "2025-01-20T17:00:00Z",
          nextAttemptScheduled: "2025-01-20T19:00:00Z",
          status: "RETRY_PENDING"
        }
      ]);
    } catch (error) {
      console.error("Get auto disconnection queue error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/fta-disconnection-schedule", async (req, res) => {
    try {
      // Mock FTA disconnection schedule
      res.json([
        {
          id: "FTA1752840001",
          customerId: "3",
          customerName: "Michael Johnson",
          smartCardNo: "SC0012345680",
          sapBpId: "BP00001236",
          disconnectionDate: "2025-01-16T08:30:00Z",
          ftaDate: "2025-01-31T00:00:00Z",
          ftaType: "FTA1",
          daysRemaining: 13,
          status: "SCHEDULED"
        },
        {
          id: "FTA1752840002",
          customerId: "11",
          customerName: "William Garcia",
          smartCardNo: "SC0012345688",
          sapBpId: "BP00001244",
          disconnectionDate: "2025-01-10T12:00:00Z",
          ftaDate: "2025-01-25T00:00:00Z",
          ftaType: "FTA1",
          daysRemaining: 7,
          status: "SCHEDULED"
        },
        {
          id: "FTA1752840003",
          customerId: "12",
          customerName: "Mary Rodriguez",
          smartCardNo: "SC0012345689",
          sapBpId: "BP00001245",
          disconnectionDate: "2025-01-05T15:20:00Z",
          ftaDate: "2025-01-20T00:00:00Z",
          ftaType: "FTA2",
          daysRemaining: 2,
          status: "CRITICAL"
        }
      ]);
    } catch (error) {
      console.error("Get FTA disconnection schedule error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/force-disconnection/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      // Mock force disconnection
      const forceDisconnectionData = {
        id: `FORCE${Date.now()}`,
        customerId: id,
        actionType: "FORCE_DISCONNECTION",
        status: "COMPLETED",
        disconnectionDate: new Date(),
        cmStatus: "COMPLETED",
        cmStatusMsg: "Customer forcefully disconnected, FTA timeline activated",
        ftaDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      };

      res.json(forceDisconnectionData);
    } catch (error) {
      console.error("Force disconnection error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/disconnection-history", async (req, res) => {
    try {
      // Mock disconnection history
      res.json([
        {
          id: "DIS1752840001",
          customerId: "7",
          customerName: "James Wilson",
          reason: "Auto Renewal Failure",
          type: "AUTOMATIC",
          method: "AUTO_DISCONNECTION",
          disconnectionDate: "2025-01-18T00:00:00Z",
          status: "COMPLETED",
          notes: "Customer failed 3 auto renewal attempts due to insufficient balance",
          requestId: "DIS1752840001",
          cmStatus: "COMPLETED",
          ftaDate: "2025-02-02T00:00:00Z"
        },
        {
          id: "DIS1752840002",
          customerId: "11",
          customerName: "William Garcia",
          reason: "Scheduled Plan Change Failure",
          type: "AUTOMATIC",
          method: "AUTO_DISCONNECTION",
          disconnectionDate: "2025-01-10T00:00:00Z",
          status: "COMPLETED",
          notes: "Scheduled plan change failed, auto renewal also failed",
          requestId: "DIS1752840002",
          cmStatus: "COMPLETED",
          ftaDate: "2025-01-25T00:00:00Z"
        },
        {
          id: "DIS1752840003",
          customerId: "13",
          customerName: "Christopher Lee",
          reason: "Customer Request",
          type: "MANUAL",
          method: "MANUAL_DISCONNECTION",
          disconnectionDate: "2025-01-08T14:30:00Z",
          status: "COMPLETED",
          notes: "Customer requested service disconnection due to relocation",
          requestId: "DIS1752840003",
          cmStatus: "COMPLETED",
          ftaDate: "2025-01-23T00:00:00Z"
        },
        {
          id: "DIS1752840004",
          customerId: "14",
          customerName: "Patricia Thomas",
          reason: "Technical Issues",
          type: "MANUAL",
          method: "MANUAL_DISCONNECTION",
          disconnectionDate: "2025-01-05T11:15:00Z",
          status: "FAILED",
          notes: "Disconnection failed due to system timeout",
          requestId: "DIS1752840004",
          cmStatus: "FAILED",
          failureReason: "CM system communication timeout"
        }
      ]);
    } catch (error) {
      console.error("Get disconnection history error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Plan Validity Extension API endpoints
  app.post("/api/subscriptions/validity-extension", async (req, res) => {
    try {
      const { smartCardNumber, extensionDays, extensionDate, reason, approvalRequired } = req.body;
      
      const validityExtensionResult = {
        id: Date.now(),
        extensionId: `VE${Date.now()}`,
        smartCardNumber,
        extensionDays,
        newEndDate: extensionDate,
        reason,
        approvalRequired,
        status: approvalRequired ? "PENDING_APPROVAL" : "COMPLETED",
        approvalWorkflowId: approvalRequired ? `AWF${Date.now()}` : null,
        extensionDate: new Date().toISOString(),
        cmRequestId: `CM${Date.now()}`,
        workflowSteps: [
          { step: 1, name: "Validity Extension Request", status: "COMPLETED" },
          { step: 2, name: "Approval Workflow", status: approvalRequired ? "PENDING" : "SKIPPED" },
          { step: 3, name: "Contract Update", status: approvalRequired ? "PENDING" : "COMPLETED" },
          { step: 4, name: "Customer Notification", status: approvalRequired ? "PENDING" : "COMPLETED" }
        ]
      };
      
      res.json(validityExtensionResult);
    } catch (error) {
      console.error("Validity extension error:", error);
      res.status(500).json({ message: "Failed to process validity extension" });
    }
  });

  // Hardware Replacement API endpoints
  app.post("/api/subscriptions/hardware-replacement", async (req, res) => {
    try {
      const { smartCardNumber, newSerialNumber, replacementType, centerId, reason, warrantyDetails } = req.body;
      
      const replacementResult = {
        id: Date.now(),
        replacementId: `HR${Date.now()}`,
        smartCardNumber,
        oldSerialNumber: "STB123456789", // Mock old serial
        newSerialNumber,
        replacementType,
        centerId,
        reason,
        warrantyDetails,
        warrantyStatus: replacementType === "warranty" ? "IN_WARRANTY" : "OUT_OF_WARRANTY",
        replacementCharges: replacementType === "warranty" ? 0 : 30000,
        status: "COMPLETED",
        replacementDate: new Date().toISOString(),
        workflowSteps: [
          { step: 1, name: "Warranty Validation", status: "COMPLETED" },
          { step: 2, name: "Stock Validation", status: "COMPLETED" },
          { step: 3, name: "Old Hardware Return", status: "COMPLETED" },
          { step: 4, name: "New Hardware Assignment", status: "COMPLETED" },
          { step: 5, name: "Contract Update", status: "COMPLETED" }
        ]
      };
      
      res.json(replacementResult);
    } catch (error) {
      console.error("Hardware replacement error:", error);
      res.status(500).json({ message: "Failed to process hardware replacement" });
    }
  });

  // Payment/Top-up API endpoints
  app.post("/api/subscriptions/payment-topup", async (req, res) => {
    try {
      const { smartCardNumber, topupAmount, paymentMethod, notes } = req.body;
      
      const topupResult = {
        id: Date.now(),
        topupId: `TU${Date.now()}`,
        smartCardNumber,
        topupAmount,
        paymentMethod,
        notes,
        status: "COMPLETED",
        topupDate: new Date().toISOString(),
        transactionId: `TXN${Date.now()}`,
        paymentGatewayId: paymentMethod === "online" ? `PG${Date.now()}` : null,
        newWalletBalance: 25000 + topupAmount, // Mock calculation
        workflowSteps: [
          { step: 1, name: "Payment Validation", status: "COMPLETED" },
          { step: 2, name: "Payment Gateway Processing", status: "COMPLETED" },
          { step: 3, name: "Wallet Credit", status: "COMPLETED" },
          { step: 4, name: "Transaction Confirmation", status: "COMPLETED" }
        ]
      };
      
      res.json(topupResult);
    } catch (error) {
      console.error("Payment top-up error:", error);
      res.status(500).json({ message: "Failed to process payment top-up" });
    }
  });

  // Service Actions (Disconnection, Reconnection, Termination) API endpoints
  app.post("/api/subscriptions/service-action", async (req, res) => {
    try {
      const { smartCardNumber, actionType, reason, effectiveDate, notes } = req.body;
      
      const serviceActionResult = {
        id: Date.now(),
        actionId: `SA${Date.now()}`,
        smartCardNumber,
        actionType,
        reason,
        effectiveDate: effectiveDate || new Date().toISOString(),
        notes,
        status: "COMPLETED",
        actionDate: new Date().toISOString(),
        cmRequestId: `CM${Date.now()}`,
        nagraActionId: `NAG${Date.now()}`,
        workflowSteps: getServiceActionSteps(actionType)
      };
      
      res.json(serviceActionResult);
    } catch (error) {
      console.error("Service action error:", error);
      res.status(500).json({ message: "Failed to process service action" });
    }
  });

  function getServiceActionSteps(actionType: string) {
    switch (actionType) {
      case "disconnect":
        return [
          { step: 1, name: "Disconnection Validation", status: "COMPLETED" },
          { step: 2, name: "CM Request Processing", status: "COMPLETED" },
          { step: 3, name: "NAGRA Disconnection", status: "COMPLETED" },
          { step: 4, name: "Contract Status Update", status: "COMPLETED" }
        ];
      case "reconnect":
        return [
          { step: 1, name: "Reconnection Eligibility Check", status: "COMPLETED" },
          { step: 2, name: "Plan Validation", status: "COMPLETED" },
          { step: 3, name: "NAGRA Reconnection", status: "COMPLETED" },
          { step: 4, name: "Service Activation", status: "COMPLETED" }
        ];
      case "terminate":
        return [
          { step: 1, name: "Termination Request Validation", status: "COMPLETED" },
          { step: 2, name: "Final Billing Generation", status: "COMPLETED" },
          { step: 3, name: "Service Permanent Disconnection", status: "COMPLETED" },
          { step: 4, name: "Contract Termination", status: "COMPLETED" },
          { step: 5, name: "Customer Data Archival", status: "COMPLETED" }
        ];
      default:
        return [{ step: 1, name: "Action Processing", status: "COMPLETED" }];
    }
  }

  // Add-on management API endpoints
  app.post("/api/subscriptions/add-ons", async (req, res) => {
    try {
      const { smartCardNumber, addOnIds, prorationEnabled } = req.body;
      
      const addOnResult = {
        id: Date.now(),
        addOnOrderId: `AO${Date.now()}`,
        smartCardNumber,
        addOnIds,
        prorationEnabled,
        prorationAmount: prorationEnabled ? 8000 : 12000, // Mock calculation
        totalAmount: prorationEnabled ? 8000 : 12000,
        status: "COMPLETED",
        activationDate: new Date().toISOString(),
        walletBalanceAfter: 25000 - (prorationEnabled ? 8000 : 12000),
        workflowSteps: [
          { step: 1, name: "Add-on Validation", status: "COMPLETED" },
          { step: 2, name: "Proration Calculation", status: prorationEnabled ? "COMPLETED" : "SKIPPED" },
          { step: 3, name: "Payment Processing", status: "COMPLETED" },
          { step: 4, name: "Add-on Activation", status: "COMPLETED" }
        ]
      };
      
      res.json(addOnResult);
    } catch (error) {
      console.error("Add-on processing error:", error);
      res.status(500).json({ message: "Failed to process add-ons" });
    }
  });

  // Reconnection API endpoints
  app.get("/api/reconnection/customers", async (req, res) => {
    try {
      const { customerId, smartCardNumber } = req.query;
      
      // Mock customer search for reconnection
      const mockCustomers: Record<string, any> = {
        "CUST001": {
          customerId: "CUST001",
          firstName: "John",
          lastName: "Doe",
          smartCardNumber: "SC123456789",
          status: "Suspended",
          suspensionDate: "2025-05-13 11:00:00",
          suspensionReason: "Hardware Issues",
          currentPlan: "Azam Lite 1 Month",
          planStartDate: "2025-04-24 14:00:00",
          planEndDate: "2025-05-23 23:59:59",
          walletBalance: 0,
          planAmount: 12000,
          isActive: true,
          suspensionDays: 5,
          planStatus: "Active"
        },
        "CUST002": {
          customerId: "CUST002",
          firstName: "Sarah",
          lastName: "Johnson",
          smartCardNumber: "SC987654321",
          status: "Disconnected",
          disconnectionDate: "2025-05-24 00:00:00",
          disconnectionReason: "Insufficient Balance",
          lastPlan: "Azam Play 1 Month",
          lastPlanEndDate: "2025-05-23 23:59:59",
          walletBalance: 28000,
          lastPlanAmount: 19000,
          isActive: false,
          autoReconnectionEligible: true
        }
      };

      if (customerId && typeof customerId === 'string' && mockCustomers[customerId]) {
        res.json(mockCustomers[customerId]);
      } else {
        res.status(404).json({ message: "Customer not found" });
      }
    } catch (error) {
      console.error("Customer search for reconnection error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/reconnection/process", async (req, res) => {
    try {
      const { customerId, reconnectionReason, extensionDays, customerStatus } = req.body;
      
      // Mock reconnection processing
      const requestId = `RCN${Date.now()}`;
      
      const reconnectionData = {
        id: requestId,
        customerId,
        reconnectionReason,
        extensionDays,
        customerStatus,
        processDate: new Date(),
        status: "COMPLETED",
        workflowSteps: customerStatus === "Suspended" ? [
          { step: 1, name: "Trigger Reconnection via Portal", status: "COMPLETED", timestamp: new Date() },
          { step: 2, name: "Plan Status Validation in CM", status: "COMPLETED", timestamp: new Date() },
          { step: 3, name: "Send Unlock Request to SOM", status: "COMPLETED", timestamp: new Date() },
          { step: 4, name: "Notify CC for Reconnection", status: "COMPLETED", timestamp: new Date() },
          { step: 5, name: "SOM Unlock Process", status: "COMPLETED", timestamp: new Date() },
          { step: 6, name: "Provisioning Request to Nagra", status: "COMPLETED", timestamp: new Date() },
          { step: 7, name: "Update Subscription Status", status: "COMPLETED", timestamp: new Date() },
          { step: 8, name: "Success Acknowledgement", status: "COMPLETED", timestamp: new Date() }
        ] : [
          { step: 1, name: "Wallet Top-up Trigger", status: "COMPLETED", timestamp: new Date() },
          { step: 2, name: "Auto-Renewal Logic", status: "COMPLETED", timestamp: new Date() },
          { step: 3, name: "Wallet Balance Deduction", status: "COMPLETED", timestamp: new Date() },
          { step: 4, name: "Renewal Request to CC", status: "COMPLETED", timestamp: new Date() },
          { step: 5, name: "Plan Renewal Execution", status: "COMPLETED", timestamp: new Date() },
          { step: 6, name: "Update Subscription & Provisioning", status: "COMPLETED", timestamp: new Date() },
          { step: 7, name: "Billing & Invoicing", status: "COMPLETED", timestamp: new Date() },
          { step: 8, name: "Financial Posting", status: "COMPLETED", timestamp: new Date() }
        ],
        cmStatus: "COMPLETED",
        cmStatusMsg: `${customerStatus} customer reconnection completed successfully`,
        serviceTransactionId: `ST${Date.now()}`
      };

      res.json(reconnectionData);
    } catch (error) {
      console.error("Process reconnection error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/reconnection/history", async (req, res) => {
    try {
      res.json([
        {
          id: "RCN1752840001",
          customerId: "CUST003",
          customerName: "Michael Brown",
          reconnectionDate: "2025-07-17 14:30:00",
          type: "Manual Reconnection",
          status: "COMPLETED",
          reason: "Hardware replacement completed",
          planExtension: "3 days",
          requestId: "RCN001",
          cmStatus: "COMPLETED"
        },
        {
          id: "RCN1752840002",
          customerId: "CUST004", 
          customerName: "Grace Mollel",
          reconnectionDate: "2025-07-17 11:15:00",
          type: "Auto Reconnection",
          status: "COMPLETED",
          reason: "Wallet top-up TSH 19,000",
          newPlan: "Azam Play 1 Month",
          requestId: "RCN002",
          cmStatus: "COMPLETED"
        },
        {
          id: "RCN1752840003",
          customerId: "CUST005",
          customerName: "David Wilson",
          reconnectionDate: "2025-07-16 16:45:00",
          type: "Manual Reconnection",
          status: "FAILED",
          reason: "Nagra provisioning timeout",
          error: "System timeout after 30 seconds",
          requestId: "RCN003",
          cmStatus: "FAILED",
          failureReason: "Nagra system communication timeout"
        }
      ]);
    } catch (error) {
      console.error("Get reconnection history error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Plan Validity Extension API endpoints
  app.get("/api/extension/customers", async (req, res) => {
    try {
      const { customerId, smartCardNumber } = req.query;
      
      // Mock customer search for plan extension
      const mockCustomers: Record<string, any> = {
        "CUST001": {
          customerId: "CUST001",
          firstName: "John",
          lastName: "Doe",
          smartCardNumber: "SC123456789",
          sapBpId: "BP00001234",
          sapCaId: "CA00001234",
          sapContractId: "CON00001234",
          currentPlan: "Azam Lite 1 Month",
          planStartDate: "2025-04-24 14:00:00",
          planEndDate: "2025-05-23 23:59:59",
          planAmount: 12000,
          status: "Active",
          walletBalance: 5000,
          lastExtensionDate: "2025-04-10 10:30:00",
          totalExtensionsUsed: 2,
          maxExtensionsAllowed: 5,
          subscriptionType: "Prepaid"
        },
        "CUST002": {
          customerId: "CUST002",
          firstName: "Sarah",
          lastName: "Johnson",
          smartCardNumber: "SC987654321",
          sapBpId: "BP00002345",
          sapCaId: "CA00002345",
          sapContractId: "CON00002345",
          currentPlan: "Azam Pure 1 Month",
          planStartDate: "2025-05-01 00:00:00",
          planEndDate: "2025-05-31 23:59:59",
          planAmount: 19000,
          status: "Active",
          walletBalance: 25000,
          lastExtensionDate: null,
          totalExtensionsUsed: 0,
          maxExtensionsAllowed: 5,
          subscriptionType: "Prepaid"
        }
      };

      if (customerId && typeof customerId === 'string' && mockCustomers[customerId]) {
        res.json(mockCustomers[customerId]);
      } else {
        res.status(404).json({ message: "Customer not found or not eligible for extension" });
      }
    } catch (error) {
      console.error("Customer search for extension error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/extension/request", async (req, res) => {
    try {
      const { customerId, extensionDays, reason, justification, urgentRequest, userRole } = req.body;
      
      // User role limits
      const roleLimits = {
        "agent": 7,
        "supervisor": 15,
        "manager": 30,
        "admin": 30
      };
      
      const maxDaysForRole = roleLimits[userRole as keyof typeof roleLimits] || 7;
      const requiresApproval = extensionDays > maxDaysForRole;
      
      // Mock extension processing
      const requestId = `EXT${Date.now()}`;
      
      const extensionData = {
        id: requestId,
        customerId,
        extensionDays,
        reason,
        justification,
        urgentRequest,
        userRole,
        maxDaysForRole,
        requiresApproval,
        requestDate: new Date(),
        status: requiresApproval ? "PENDING_APPROVAL" : "COMPLETED",
        workflowSteps: [
          { step: 1, name: "Plan Extension Request in Portal", status: "COMPLETED", timestamp: new Date() },
          { step: 2, name: "Approval Process", status: requiresApproval ? "PENDING" : "COMPLETED", timestamp: requiresApproval ? null : new Date() },
          { step: 3, name: "Submit Request to CM", status: requiresApproval ? "PENDING" : "COMPLETED", timestamp: requiresApproval ? null : new Date() },
          { step: 4, name: "Provisioning Request to Nagra", status: requiresApproval ? "PENDING" : "COMPLETED", timestamp: requiresApproval ? null : new Date() },
          { step: 5, name: "Update Current Subscription", status: requiresApproval ? "PENDING" : "COMPLETED", timestamp: requiresApproval ? null : new Date() },
          { step: 6, name: "Extend End Date in SAP CC", status: requiresApproval ? "PENDING" : "COMPLETED", timestamp: requiresApproval ? null : new Date() },
          { step: 7, name: "Final Response to Portal", status: requiresApproval ? "PENDING" : "COMPLETED", timestamp: requiresApproval ? null : new Date() }
        ],
        cmStatus: requiresApproval ? "PENDING_APPROVAL" : "COMPLETED",
        cmStatusMsg: requiresApproval ? `Extension request of ${extensionDays} days pending approval (exceeds ${userRole} limit of ${maxDaysForRole} days)` : `Plan validity extended by ${extensionDays} days successfully`,
        serviceTransactionId: requiresApproval ? null : `ST${Date.now()}`,
        approvalRequired: requiresApproval,
        approverRole: extensionDays > 15 ? "manager" : "supervisor"
      };

      res.json(extensionData);
    } catch (error) {
      console.error("Process extension request error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/extension/pending-approvals", async (req, res) => {
    try {
      res.json([
        {
          requestId: "EXT001",
          customerId: "CUST003",
          customerName: "Michael Brown",
          requestedDays: 15,
          reason: "Service outage compensation",
          justification: "Customer experienced 5-day service outage due to infrastructure maintenance. Extending plan validity to compensate for lost service time.",
          requestedBy: "Agent John Smith",
          requestedByRole: "agent",
          requestDate: "2025-07-18 09:30:00",
          status: "PENDING_SUPERVISOR_APPROVAL",
          urgency: "Normal",
          currentPlanEndDate: "2025-07-20 23:59:59",
          proposedEndDate: "2025-08-04 23:59:59"
        },
        {
          requestId: "EXT002",
          customerId: "CUST004",
          customerName: "Grace Mollel",
          requestedDays: 25,
          reason: "Hardware replacement delay",
          justification: "Customer's STB replacement took 3 weeks due to supply chain issues. Customer was unable to access services during this period and deserves compensation.",
          requestedBy: "Agent Mary Wilson",
          requestedByRole: "agent",
          requestDate: "2025-07-18 11:15:00",
          status: "PENDING_MANAGER_APPROVAL",
          urgency: "High",
          currentPlanEndDate: "2025-07-22 23:59:59",
          proposedEndDate: "2025-08-16 23:59:59"
        }
      ]);
    } catch (error) {
      console.error("Get pending approvals error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/extension/approve/:requestId", async (req, res) => {
    try {
      const { requestId } = req.params;
      const { action, notes, approverRole } = req.body; // action: 'approve' or 'reject'
      
      const approvalData = {
        requestId,
        action,
        notes,
        approverRole,
        approvedDate: new Date(),
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        cmStatus: action === 'approve' ? 'COMPLETED' : 'REJECTED',
        cmStatusMsg: action === 'approve' ? 'Extension request approved and processed successfully' : `Extension request rejected: ${notes}`
      };

      res.json(approvalData);
    } catch (error) {
      console.error("Process approval error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/extension/history", async (req, res) => {
    try {
      res.json([
        {
          requestId: "EXT001",
          customerId: "CUST005",
          customerName: "David Wilson",
          extensionDays: 7,
          reason: "Technical support delay",
          justification: "Customer reported technical issues which took 7 days to resolve due to part availability.",
          processedDate: "2025-07-17 16:45:00",
          processedBy: "Agent Sarah Lee",
          processedByRole: "agent",
          status: "COMPLETED",
          oldEndDate: "2025-07-20 23:59:59",
          newEndDate: "2025-07-27 23:59:59",
          approvalRequired: false,
          cmStatus: "COMPLETED",
          serviceTransactionId: "ST1752840001"
        },
        {
          requestId: "EXT002",
          customerId: "CUST006",
          customerName: "Lisa Anderson",
          extensionDays: 3,
          reason: "Customer service compensation",
          justification: "Compensation for poor customer service experience during plan renewal process.",
          processedDate: "2025-07-17 14:20:00",
          processedBy: "Agent Mike Johnson",
          processedByRole: "agent",
          status: "COMPLETED",
          oldEndDate: "2025-07-19 23:59:59",
          newEndDate: "2025-07-22 23:59:59",
          approvalRequired: false,
          cmStatus: "COMPLETED",
          serviceTransactionId: "ST1752840002"
        },
        {
          requestId: "EXT003",
          customerId: "CUST007",
          customerName: "Robert Martinez",
          extensionDays: 20,
          reason: "Major service disruption",
          justification: "Customer affected by major network outage lasting 2 weeks. Service was completely unavailable during this period.",
          processedDate: "2025-07-16 10:30:00",
          processedBy: "Manager Alice Brown",
          processedByRole: "manager",
          status: "COMPLETED",
          oldEndDate: "2025-07-18 23:59:59",
          newEndDate: "2025-08-07 23:59:59",
          approvalRequired: true,
          approvedBy: "Manager Alice Brown",
          approvedDate: "2025-07-16 10:00:00",
          cmStatus: "COMPLETED",
          serviceTransactionId: "ST1752840003"
        }
      ]);
    } catch (error) {
      console.error("Get extension history error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add-On Pack Management routes based on SAP BRIM implementation
  
  // Mock data for Add-On Packs
  const mockAddOnPacks: AddOnPackSAP[] = [
    {
      id: 1,
      packId: "SPORTS001",
      packName: "Premium Sports Package",
      description: "Access to all premium sports channels including EPL, Champions League, and local sports",
      price: 15000,
      currency: "TSH",
      channels: 12,
      category: "Sports",
      validityDays: 30,
      autoRenewalFlag: true,
      status: "active",
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 2,
      packId: "MOVIES001",
      packName: "Hollywood Movies Pack",
      description: "Latest Hollywood blockbusters and classic movies",
      price: 12000,
      currency: "TSH",
      channels: 8,
      category: "Movies",
      validityDays: 30,
      autoRenewalFlag: true,
      status: "active",
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 3,
      packId: "KIDS001",
      packName: "Kids Entertainment",
      description: "Educational and entertainment content for children",
      price: 8000,
      currency: "TSH",
      channels: 6,
      category: "Kids",
      validityDays: 30,
      autoRenewalFlag: true,
      status: "active",
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 4,
      packId: "NEWS001",
      packName: "International News",
      description: "Global news channels including BBC, CNN, Al Jazeera",
      price: 10000,
      currency: "TSH",
      channels: 5,
      category: "News",
      validityDays: 30,
      autoRenewalFlag: true,
      status: "active",
      createdAt: new Date("2025-01-01"),
    },
    {
      id: 5,
      packId: "MUSIC001",
      packName: "Music Channels Pack",
      description: "Music videos, concerts, and music documentaries",
      price: 7000,
      currency: "TSH",
      channels: 4,
      category: "Music",
      validityDays: 30,
      autoRenewalFlag: true,
      status: "active",
      createdAt: new Date("2025-01-01"),
    }
  ];

  const mockAddOnPurchases: AddOnPurchase[] = [
    {
      id: 1,
      customerId: "CUST001",
      customerName: "John Doe",
      smartCardNo: "SC123456789",
      sapBpId: "BP001",
      sapCaId: "CA001",
      sapContractId: "CON001",
      addOnPackId: "SPORTS001",
      addOnPackName: "Premium Sports Package",
      baseplanEndDate: new Date("2025-08-15"),
      proratedAmount: 8750,
      totalAmount: 10000,
      vatAmount: 0,
      purchaseDate: new Date("2025-07-18"),
      startDate: new Date("2025-07-18"),
      endDate: new Date("2025-08-15"),
      autoRenewalFlag: true,
      status: "active",
      requestId: "REQ001752854001",
      cmStatus: "COMPLETED",
      cmStatusMessage: "Add-On successfully provisioned",
      createdAt: new Date("2025-07-18"),
    },
    {
      id: 2,
      customerId: "CUST002",
      customerName: "Jane Smith",
      smartCardNo: "SC987654321",
      sapBpId: "BP002",
      sapCaId: "CA002",
      sapContractId: "CON002",
      addOnPackId: "MOVIES001",
      addOnPackName: "Hollywood Movies Pack",
      baseplanEndDate: new Date("2025-08-20"),
      proratedAmount: 7200,
      totalAmount: 8400,
      vatAmount: 0,
      purchaseDate: new Date("2025-07-17"),
      startDate: new Date("2025-07-17"),
      endDate: new Date("2025-08-20"),
      autoRenewalFlag: true,
      status: "active",
      requestId: "REQ001752854002",
      cmStatus: "COMPLETED",
      cmStatusMessage: "Add-On successfully provisioned",
      createdAt: new Date("2025-07-17"),
    }
  ];

  const mockAddOnRenewals: AddOnRenewal[] = [
    {
      id: 1,
      customerId: "CUST001",
      addOnPurchaseId: 1,
      renewalType: "auto",
      baseplanEndDate: new Date("2025-09-15"),
      proratedAmount: 15000,
      totalAmount: 17250,
      vatAmount: 0,
      renewalDate: new Date("2025-08-15"),
      newEndDate: new Date("2025-09-15"),
      status: "completed",
      requestId: "REN001752854001",
      cmStatus: "COMPLETED",
      cmStatusMessage: "Add-On auto-renewal successful",
      createdAt: new Date("2025-08-15"),
    }
  ];

  const mockAddOnRemovals: AddOnRemoval[] = [
    {
      id: 1,
      customerId: "CUST003",
      addOnPurchaseId: 3,
      removalDate: new Date("2025-07-16"),
      reason: "Customer request - budget constraints",
      status: "completed",
      requestId: "REM001752854001",
      cmStatus: "COMPLETED",
      cmStatusMessage: "Add-On successfully removed",
      createdAt: new Date("2025-07-16"),
    }
  ];

  // Get all available Add-On Packs
  app.get("/api/addon-packs", async (req, res) => {
    try {
      res.json(mockAddOnPacks.filter(pack => pack.status === 'active'));
    } catch (error: unknown) {
      console.error("Get add-on packs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Add-On Pack Purchase endpoint
  app.post("/api/addon-packs/purchase", async (req, res) => {
    try {
      const validatedData = insertAddOnPurchaseSchema.parse(req.body);
      
      // Generate unique request ID
      const requestId = `REQ${Date.now()}`;
      
      // Calculate prorated amount based on base plan end date
      const purchaseDate = new Date();
      const baseplanEndDate = validatedData.baseplanEndDate;
      const daysRemaining = Math.ceil((baseplanEndDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Find the pack to get pricing info
      const pack = mockAddOnPacks.find(p => p.packId === validatedData.addOnPackId);
      if (!pack) {
        return res.status(404).json({ message: "Add-On Pack not found" });
      }
      
      const proratedAmount = Math.round((pack.price * daysRemaining) / 30);
      const vatAmount = 0; // VAT removed as requested
      const totalAmount = proratedAmount;

      const newPurchase: AddOnPurchase = {
        id: mockAddOnPurchases.length + 1,
        ...validatedData,
        proratedAmount,
        totalAmount,
        vatAmount,
        purchaseDate,
        startDate: purchaseDate,
        endDate: baseplanEndDate,
        requestId,
        status: "pending",
        cmStatus: "IN_PROGRESS",
        cmStatusMessage: "Processing Add-On purchase request",
        createdAt: purchaseDate,
      };

      mockAddOnPurchases.push(newPurchase);

      // Simulate SAP BRIM processing workflow
      setTimeout(() => {
        const purchase = mockAddOnPurchases.find(p => p.requestId === requestId);
        if (purchase) {
          purchase.status = "active";
          purchase.cmStatus = "COMPLETED";
          purchase.cmStatusMessage = "Add-On successfully provisioned";
        }
      }, 3000);

      res.json({
        message: "Add-On purchase request submitted successfully",
        requestId,
        estimatedAmount: totalAmount,
        proratedAmount,
        vatAmount,
        purchase: newPurchase
      });
    } catch (error: unknown) {
      console.error("Add-On purchase error:", error);
      res.status(400).json({ message: "Invalid request data", error: (error as Error).message });
    }
  });

  // Manual Add-On Renewal endpoint
  app.post("/api/addon-packs/renew", async (req, res) => {
    try {
      const validatedData = insertAddOnRenewalSchema.parse(req.body);
      
      const requestId = `REN${Date.now()}`;
      const renewalDate = new Date();
      
      // Calculate prorated amount for renewal period
      const baseplanEndDate = validatedData.baseplanEndDate;
      const daysRemaining = Math.ceil((baseplanEndDate.getTime() - renewalDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Find original purchase to get pack info
      const originalPurchase = mockAddOnPurchases.find(p => p.id === validatedData.addOnPurchaseId);
      if (!originalPurchase) {
        return res.status(404).json({ message: "Original Add-On purchase not found" });
      }
      
      const pack = mockAddOnPacks.find(p => p.packId === originalPurchase.addOnPackId);
      if (!pack) {
        return res.status(404).json({ message: "Add-On Pack not found" });
      }
      
      const proratedAmount = Math.round((pack.price * daysRemaining) / 30);
      const vatAmount = 0; // VAT removed as requested  
      const totalAmount = proratedAmount;

      const newRenewal: AddOnRenewal = {
        id: mockAddOnRenewals.length + 1,
        ...validatedData,
        proratedAmount,
        totalAmount,
        vatAmount,
        renewalDate,
        newEndDate: baseplanEndDate,
        requestId,
        status: "pending",
        cmStatus: "IN_PROGRESS",
        cmStatusMessage: "Processing Add-On renewal request",
        createdAt: renewalDate,
      };

      mockAddOnRenewals.push(newRenewal);

      // Update original purchase end date
      originalPurchase.endDate = baseplanEndDate;
      originalPurchase.updatedAt = renewalDate;

      res.json({
        message: "Add-On renewal request submitted successfully",
        requestId,
        estimatedAmount: totalAmount,
        renewal: newRenewal
      });
    } catch (error: unknown) {
      console.error("Add-On renewal error:", error);
      res.status(400).json({ message: "Invalid request data", error: (error as Error).message });
    }
  });

  // Remove Add-On endpoint
  app.post("/api/addon-packs/remove", async (req, res) => {
    try {
      const validatedData = insertAddOnRemovalSchema.parse(req.body);
      
      const requestId = `REM${Date.now()}`;
      const removalDate = new Date();

      const newRemoval: AddOnRemoval = {
        id: mockAddOnRemovals.length + 1,
        ...validatedData,
        removalDate,
        requestId,
        status: "pending",
        cmStatus: "IN_PROGRESS",
        cmStatusMessage: "Processing Add-On removal request",
        createdAt: removalDate,
      };

      mockAddOnRemovals.push(newRemoval);

      // Update purchase status to removed
      const purchase = mockAddOnPurchases.find(p => p.id === validatedData.addOnPurchaseId);
      if (purchase) {
        purchase.status = "removed";
        purchase.updatedAt = removalDate;
      }

      res.json({
        message: "Add-On removal request submitted successfully",
        requestId,
        removal: newRemoval
      });
    } catch (error: unknown) {
      console.error("Add-On removal error:", error);
      res.status(400).json({ message: "Invalid request data", error: (error as Error).message });
    }
  });

  // Get customer Add-On purchases
  app.get("/api/addon-packs/customer/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const customerPurchases = mockAddOnPurchases.filter(p => p.customerId === customerId);
      res.json(customerPurchases);
    } catch (error: unknown) {
      console.error("Get customer add-ons error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get Add-On renewals history
  app.get("/api/addon-packs/renewals", async (req, res) => {
    try {
      res.json(mockAddOnRenewals);
    } catch (error: unknown) {
      console.error("Get renewals error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get Add-On removals history
  app.get("/api/addon-packs/removals", async (req, res) => {
    try {
      res.json(mockAddOnRemovals);
    } catch (error: unknown) {
      console.error("Get removals error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update Add-On auto-renewal flag
  app.patch("/api/addon-packs/:purchaseId/auto-renewal", async (req, res) => {
    try {
      const { purchaseId } = req.params;
      const { autoRenewalFlag } = req.body;
      
      const purchase = mockAddOnPurchases.find(p => p.id === parseInt(purchaseId));
      if (!purchase) {
        return res.status(404).json({ message: "Add-On purchase not found" });
      }
      
      purchase.autoRenewalFlag = autoRenewalFlag;
      purchase.updatedAt = new Date();
      
      res.json({
        message: "Auto-renewal flag updated successfully",
        purchase
      });
    } catch (error) {
      console.error("Update auto-renewal error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Enhanced Subscription Management API Routes
  
  // Consolidated subscription purchase with payment gateway integration
  app.post("/api/subscriptions/purchase", async (req, res) => {
    try {
      const { smartCardNumber, customerType, planId, serviceType, numberOfRooms, paymentMethod, paymentAmount, autoRenewal } = req.body;
      
      // Simulate comprehensive subscription purchase workflow
      const purchaseResult = {
        id: Date.now(),
        contractId: `CON${Date.now()}`,
        smartCardNumber,
        customerType,
        planId,
        serviceType,
        numberOfRooms,
        paymentMethod,
        paymentAmount,
        autoRenewal,
        status: "ACTIVE",
        activationDate: new Date().toISOString(),
        invoiceNumber: `INV${Date.now()}`,
        sapSomOrderId: `SOM${Date.now()}`,
        nagraProvisioningId: `NAG${Date.now()}`,
        workflowSteps: [
          { step: 1, name: "Customer Validation", status: "COMPLETED" },
          { step: 2, name: "Payment Processing", status: "COMPLETED" },
          { step: 3, name: "Plan Activation", status: "COMPLETED" },
          { step: 4, name: "NAGRA Provisioning", status: "COMPLETED" },
          { step: 5, name: "Invoice Generation", status: "COMPLETED" }
        ]
      };
      
      res.status(201).json(purchaseResult);
    } catch (error) {
      console.error("Subscription purchase error:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  // Enhanced renewal with count input and balance validation
  app.post("/api/subscriptions/renewal", async (req, res) => {
    try {
      const { smartCardNumber, renewalCount, paymentMethod } = req.body;
      
      const renewalResult = {
        id: Date.now(),
        renewalId: `REN${Date.now()}`,
        smartCardNumber,
        renewalCount,
        paymentMethod,
        totalAmount: 12000 * renewalCount, // Mock calculation
        status: "COMPLETED",
        renewalDate: new Date().toISOString(),
        newExpiryDate: new Date(Date.now() + (renewalCount * 30 * 24 * 60 * 60 * 1000)).toISOString(),
        walletBalanceAfter: 25000 - (12000 * renewalCount),
        invoiceNumber: `INV${Date.now()}`,
      };
      
      res.json(renewalResult);
    } catch (error) {
      console.error("Subscription renewal error:", error);
      res.status(500).json({ message: "Failed to process renewal" });
    }
  });

  // Plan change with buffer period logic
  app.post("/api/subscriptions/plan-change", async (req, res) => {
    try {
      const { smartCardNumber, newPlanId, changeType, scheduledDate } = req.body;
      
      const planChangeResult = {
        id: Date.now(),
        changeId: `PCH${Date.now()}`,
        smartCardNumber,
        newPlanId,
        changeType,
        scheduledDate,
        status: changeType === "immediate" ? "COMPLETED" : "SCHEDULED",
        changeDate: changeType === "immediate" ? new Date().toISOString() : scheduledDate,
        previousInvoiceCancelled: true, // Assuming within buffer period
        refundAmount: 12000, // Mock previous plan amount
        newPlanAmount: 19000, // Mock new plan amount
        netPayment: 7000,
        walletBalanceAfter: 18000,
        workflowSteps: [
          { step: 1, name: "Buffer Period Check", status: "COMPLETED" },
          { step: 2, name: "Previous Invoice Cancellation", status: "COMPLETED" },
          { step: 3, name: "New Plan Activation", status: "COMPLETED" },
          { step: 4, name: "NAGRA Provisioning", status: "COMPLETED" }
        ]
      };
      
      res.json(planChangeResult);
    } catch (error) {
      console.error("Plan change error:", error);
      res.status(500).json({ message: "Failed to process plan change" });
    }
  });

  // Offer change implementation
  app.post("/api/subscriptions/offer-change", async (req, res) => {
    try {
      const { smartCardNumber, newOfferId, changeType, scheduledDate } = req.body;
      
      const offerChangeResult = {
        id: Date.now(),
        changeId: `OCH${Date.now()}`,
        smartCardNumber,
        newOfferId,
        changeType,
        scheduledDate,
        status: changeType === "immediate" ? "COMPLETED" : "SCHEDULED",
        changeDate: changeType === "immediate" ? new Date().toISOString() : scheduledDate,
        discountApplied: 50, // Mock discount percentage
        effectiveUntil: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
      };
      
      res.json(offerChangeResult);
    } catch (error) {
      console.error("Offer change error:", error);
      res.status(500).json({ message: "Failed to process offer change" });
    }
  });

  // Add-on packs with proration calculation
  app.post("/api/subscriptions/addons", async (req, res) => {
    try {
      const { smartCardNumber, addOnIds, prorationEnabled } = req.body;
      
      // Mock proration calculation
      const mockAddOns = [
        { id: "SPORT001", name: "Sports Pack", price: 8000 },
        { id: "MOVIE001", name: "Movie Pack", price: 6000 },
        { id: "KIDS001", name: "Kids Pack", price: 4000 },
        { id: "NEWS001", name: "News Pack", price: 3000 }
      ];
      
      const selectedAddOns = mockAddOns.filter(addon => addOnIds.includes(addon.id));
      const totalPrice = selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);
      const prorationFactor = prorationEnabled ? 0.8 : 1; // Mock 20 days remaining out of 30
      const finalAmount = totalPrice * prorationFactor;
      
      const addOnResult = {
        id: Date.now(),
        addOnId: `ADN${Date.now()}`,
        smartCardNumber,
        addOns: selectedAddOns,
        prorationEnabled,
        prorationFactor,
        originalAmount: totalPrice,
        finalAmount,
        status: "ACTIVE",
        activationDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString(),
      };
      
      res.json(addOnResult);
    } catch (error) {
      console.error("Add-on purchase error:", error);
      res.status(500).json({ message: "Failed to add-on packs" });
    }
  });

  // Enhanced suspension with reason selection and CM integration
  app.post("/api/subscriptions/suspension", async (req, res) => {
    try {
      const { smartCardNumber, suspensionType, reason, suspensionDate, notes } = req.body;
      
      const suspensionResult = {
        id: Date.now(),
        suspensionId: `SUS${Date.now()}`,
        smartCardNumber,
        suspensionType,
        reason,
        suspensionDate: suspensionDate || new Date().toISOString(),
        notes,
        status: "SUSPENDED",
        cmRequestId: `CM${Date.now()}`, // Content Management system request ID
        nagraDisconnectionId: `NAG${Date.now()}`,
        workflowSteps: [
          { step: 1, name: "Suspension Validation", status: "COMPLETED" },
          { step: 2, name: "CM Request Sent", status: "COMPLETED" },
          { step: 3, name: "NAGRA Disconnection", status: "COMPLETED" },
          { step: 4, name: "Customer Notification", status: "COMPLETED" }
        ]
      };
      
      res.json(suspensionResult);
    } catch (error) {
      console.error("Suspension error:", error);
      res.status(500).json({ message: "Failed to process suspension" });
    }
  });

  // Service actions: Disconnection, Reconnection, Termination
  app.post("/api/subscriptions/service-action", async (req, res) => {
    try {
      const { smartCardNumber, actionType, reason, effectiveDate, notes } = req.body;
      
      const serviceActionResult = {
        id: Date.now(),
        actionId: `${actionType.toUpperCase()}${Date.now()}`,
        smartCardNumber,
        actionType,
        reason,
        effectiveDate: effectiveDate || new Date().toISOString(),
        notes,
        status: actionType === "reconnect" ? "ACTIVE" : actionType.toUpperCase(),
        cmRequestId: `CM${Date.now()}`,
        nagraActionId: `NAG${Date.now()}`,
        workflowSteps: [
          { step: 1, name: "Action Validation", status: "COMPLETED" },
          { step: 2, name: "CM Processing", status: "COMPLETED" },
          { step: 3, name: "NAGRA Update", status: "COMPLETED" },
          { step: 4, name: "Status Update", status: "COMPLETED" }
        ]
      };
      
      res.json(serviceActionResult);
    } catch (error) {
      console.error("Service action error:", error);
      res.status(500).json({ message: "Failed to process service action" });
    }
  });

  // Plan validity extension with approval workflow
  app.post("/api/subscriptions/validity-extension", async (req, res) => {
    try {
      const { smartCardNumber, extensionDays, extensionDate, reason, approvalRequired } = req.body;
      
      const extensionResult = {
        id: Date.now(),
        extensionId: `EXT${Date.now()}`,
        smartCardNumber,
        extensionDays,
        extensionDate,
        reason,
        approvalRequired,
        status: approvalRequired ? "PENDING_APPROVAL" : "APPROVED",
        requestDate: new Date().toISOString(),
        approverRequired: approvalRequired ? "MANAGER" : null,
        workflowSteps: [
          { step: 1, name: "Extension Request", status: "COMPLETED" },
          { step: 2, name: "Approval Process", status: approvalRequired ? "PENDING" : "COMPLETED" },
          { step: 3, name: "Validity Update", status: approvalRequired ? "PENDING" : "COMPLETED" }
        ]
      };
      
      res.json(extensionResult);
    } catch (error) {
      console.error("Validity extension error:", error);
      res.status(500).json({ message: "Failed to process validity extension" });
    }
  });

  // Hardware replacement with warranty validation and stock check
  app.post("/api/subscriptions/replacement", async (req, res) => {
    try {
      const { smartCardNumber, newSerialNumber, replacementType, centerId, reason, warrantyDetails } = req.body;
      
      const replacementResult = {
        id: Date.now(),
        replacementId: `REP${Date.now()}`,
        smartCardNumber,
        newSerialNumber,
        replacementType,
        centerId,
        reason,
        warrantyDetails,
        status: "COMPLETED",
        replacementDate: new Date().toISOString(),
        oldDeviceId: `OLD${Date.now()}`,
        newDeviceId: `NEW${Date.now()}`,
        centerStockUpdated: true,
        warrantyValidated: replacementType === "warranty",
        workflowSteps: [
          { step: 1, name: "Warranty Validation", status: "COMPLETED" },
          { step: 2, name: "Stock Verification", status: "COMPLETED" },
          { step: 3, name: "Device Replacement", status: "COMPLETED" },
          { step: 4, name: "Configuration Transfer", status: "COMPLETED" }
        ]
      };
      
      res.json(replacementResult);
    } catch (error) {
      console.error("Hardware replacement error:", error);
      res.status(500).json({ message: "Failed to process replacement" });
    }
  });

  // Customer search with comprehensive subscription details
  app.get("/api/customers/search", async (req, res) => {
    try {
      const { smartCardNumber } = req.query;
      
      if (smartCardNumber === "SC123456789") {
        const customerDetails = {
          customerId: "CUST001",
          smartCardNumber: "SC123456789",
          firstName: "John",
          lastName: "Doe",
          phone: "+255712345678",
          email: "john.doe@example.com",
          currentPlan: {
            id: "AZAM_LITE_1M",
            name: "Azam Lite 1 Month",
            price: 12000,
            startDate: "2025-01-15T10:00:00Z",
            endDate: "2025-02-14T23:59:59Z",
            status: "Active"
          },
          currentOffers: [
            { id: "PROMO001", name: "50% Off First Month", endDate: "2025-02-14T23:59:59Z" }
          ],
          addOns: [
            { id: "SPORT001", name: "Sports Pack", endDate: "2025-02-14T23:59:59Z" }
          ],
          walletBalance: 25000,
          autoRenewalEnabled: true,
          lastPaymentDate: "2025-01-15T10:00:00Z",
          bufferPeriodDays: 2,
          status: "ACTIVE",
          serviceType: "residential",
          accountType: "prepaid",
          subscriptionHistory: [
            { date: "2025-01-15", action: "Plan Purchase", plan: "Azam Lite 1 Month", amount: -12000 },
            { date: "2025-01-10", action: "Wallet Top-up", amount: 50000 }
          ]
        };
        
        res.json(customerDetails);
      } else {
        res.status(404).json({ message: "Customer not found" });
      }
    } catch (error) {
      console.error("Customer search error:", error);
      res.status(500).json({ message: "Search failed" });
    }
  });

  // Wallet balance and payment gateway simulation
  app.post("/api/wallet/topup", async (req, res) => {
    try {
      const { smartCardNumber, amount, paymentMethod } = req.body;
      
      const topupResult = {
        id: Date.now(),
        transactionId: `TXN${Date.now()}`,
        smartCardNumber,
        amount,
        paymentMethod,
        status: "COMPLETED",
        transactionDate: new Date().toISOString(),
        newBalance: 25000 + amount, // Mock calculation
        paymentGatewayRef: `PG${Date.now()}`,
      };
      
      res.json(topupResult);
    } catch (error) {
      console.error("Wallet topup error:", error);
      res.status(500).json({ message: "Failed to process topup" });
    }
  });

  // === SERVICE TICKETING ROUTES ===
  app.get("/api/service-tickets", async (req, res) => {
    try {
      const tickets = [
        {
          id: 1,
          ticketId: "ST-2025-001",
          ticketType: "Hardware",
          smartCardNumber: "1234567890",
          customerId: "CUST001",
          issueDescription: "STB not responding to remote control",
          priority: "High",
          channel: "Portal",
          status: "New",
          assignedGroup: "Technical Support",
          userInfo: "Agent John Doe",
          location: "Dar es Salaam",
          timestamp: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      ];
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service tickets" });
    }
  });

  app.post("/api/service-tickets", async (req, res) => {
    try {
      const ticketData = req.body;
      const newTicket = {
        id: Math.floor(Math.random() * 10000),
        ticketId: `ST-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        ...ticketData,
        status: "New",
        timestamp: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Portal → CM (REST API integration)
      console.log("Service ticket created:", newTicket);
      
      res.status(201).json(newTicket);
    } catch (error) {
      res.status(500).json({ error: "Failed to create service ticket" });
    }
  });

  // === SYSTEM INCIDENT MANAGEMENT ROUTES ===
  // === SYSTEM INCIDENT ROUTES ===
  app.get("/api/system-incidents", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const incidents = await storage.getSystemIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("Error fetching system incidents:", error);
      res.status(500).json({ error: "Failed to fetch system incidents" });
    }
  });

  app.get("/api/system-incidents/:id", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const id = parseInt(req.params.id);
      const incident = await storage.getSystemIncidentById(id);
      
      if (!incident) {
        return res.status(404).json({ error: "System incident not found" });
      }
      
      res.json(incident);
    } catch (error) {
      console.error("Error fetching system incident:", error);
      res.status(500).json({ error: "Failed to fetch system incident" });
    }
  });

  app.post("/api/system-incidents", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const { insertSystemIncidentSchema } = await import("@shared/schema");
      
      // Validate request body
      const validatedData = insertSystemIncidentSchema.parse(req.body);
      
      // Create the incident with proper type casting
      const incidentData = {
        ...validatedData,
        startTime: new Date(validatedData.startTime),
        endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
        status: validatedData.status as "Open" | "Investigating" | "Resolved" | "Closed",
        affectedSystem: validatedData.affectedSystem as "Portal" | "CM" | "SOM" | "CC" | "CI" | "NAGRA",
        severity: validatedData.severity as "Critical" | "Major" | "Minor",
        notificationSettings: validatedData.notificationSettings ? {
          ...validatedData.notificationSettings,
          stakeholders: validatedData.notificationSettings.stakeholders || []
        } : undefined
      };
      const newIncident = await storage.createSystemIncident(incidentData);
      
      console.log("System incident created:", newIncident.incidentId);
      res.status(201).json(newIncident);
    } catch (error) {
      console.error("Error creating system incident:", error);
      if (error instanceof Error && error.message.includes('validation')) {
        res.status(400).json({ error: "Invalid request data" });
      } else {
        res.status(500).json({ error: "Failed to create system incident" });
      }
    }
  });

  app.put("/api/system-incidents/:id", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const id = parseInt(req.params.id);
      
      const updatedIncident = await storage.updateSystemIncident(id, req.body);
      
      if (!updatedIncident) {
        return res.status(404).json({ error: "System incident not found" });
      }
      
      console.log("System incident updated:", updatedIncident.incidentId);
      res.json(updatedIncident);
    } catch (error) {
      console.error("Error updating system incident:", error);
      res.status(500).json({ error: "Failed to update system incident" });
    }
  });

  app.delete("/api/system-incidents/:id", async (req, res) => {
    try {
      const { storage } = await import("./storage");
      const id = parseInt(req.params.id);
      
      const deleted = await storage.deleteSystemIncident(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "System incident not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting system incident:", error);
      res.status(500).json({ error: "Failed to delete system incident" });
    }
  });

  // === REPORT ROUTES ===
  // Daily Reports
  app.get("/api/reports/daily", ReportController.getDailyReports);
  app.get("/api/reports/daily/:id", ReportController.getDailyReportById);
  app.post("/api/reports/daily/generate", ReportController.generateDailyReport);

  // TRA Reports
  app.get("/api/reports/tra", ReportController.getTRAReports);
  app.get("/api/reports/tra/:id", ReportController.getTRAReportById);
  app.post("/api/reports/tra/generate", ReportController.generateTRAReport);

  // TCRA Reports
  app.get("/api/reports/tcra", ReportController.getTCRAReports);
  app.get("/api/reports/tcra/:id", ReportController.getTCRAReportById);
  app.post("/api/reports/tcra/generate", ReportController.generateTCRAReport);

  // Report Audit and Export
  app.get("/api/reports/audit-logs", ReportController.getReportAuditLogs);
  app.post("/api/reports/export", ReportController.exportReport);

  // === SUBSCRIBER VIEW ROUTES ===
  
  // Get payment transactions for a customer
  app.get("/api/customers/:customerId/payment-transactions", async (req, res) => {
    try {
      const { customerId } = req.params;
      const mockPaymentTransactions = [
        {
          id: 1,
          date: "2024-04-25",
          time: "10:30:15",
          transactionId: "PT-2024042501",
          paymentMethod: "M-Pesa",
          amount: 25000,
          currency: "TZS",
          status: "Completed",
          reference: "MP240425XXXX",
          description: "Monthly subscription payment"
        },
        {
          id: 2,
          date: "2024-04-20",
          time: "16:45:22",
          transactionId: "PT-2024042002",
          paymentMethod: "Tigo Pesa",
          amount: 8000,
          currency: "TZS",
          status: "Completed",
          reference: "TP240420XXXX",
          description: "Sports Pack Add-on"
        },
        {
          id: 3,
          date: "2024-04-18",
          time: "11:20:30",
          transactionId: "PT-2024041801",
          paymentMethod: "Wallet Top-up",
          amount: 30000,
          currency: "TZS",
          status: "Completed",
          reference: "WL240418XXXX",
          description: "Wallet balance top-up"
        }
      ];
      
      res.json({ success: true, data: mockPaymentTransactions });
    } catch (error) {
      console.error('Get payment transactions error:', error);
      res.status(500).json({ message: "Failed to fetch payment transactions" });
    }
  });

  // Get service transactions for a customer
  app.get("/api/customers/:customerId/service-transactions", async (req, res) => {
    try {
      const { customerId } = req.params;
      const mockServiceTransactions = [
        {
          id: 1,
          date: "2024-04-25",
          time: "11:15:00",
          serviceType: "Subscription Purchase",
          smartCard: "SUM524567",
          action: "New Activation",
          status: "Completed",
          agent: "John Agent",
          remarks: "Base plan activated successfully"
        },
        {
          id: 2,
          date: "2024-04-20",
          time: "14:30:00",
          serviceType: "Add-On Purchase",
          smartCard: "SUM524567",
          action: "Sports Pack Added",
          status: "Active",
          agent: "Sarah Agent",
          remarks: "Sports Ultimate Pack activated"
        },
        {
          id: 3,
          date: "2024-04-18",
          time: "09:45:00",
          serviceType: "Plan Change",
          smartCard: "SUM524567",
          action: "Upgrade to Standard",
          status: "Completed",
          agent: "Mike Agent",
          remarks: "Upgraded from Basic to Standard"
        }
      ];
      
      res.json({ success: true, data: mockServiceTransactions });
    } catch (error) {
      console.error('Get service transactions error:', error);
      res.status(500).json({ message: "Failed to fetch service transactions" });
    }
  });

  // Get service actions history for a customer
  app.get("/api/customers/:customerId/service-actions", async (req, res) => {
    try {
      const { customerId } = req.params;
      const mockServiceActions = [
        {
          id: 1,
          date: "2024-04-25",
          time: "10:30",
          actionType: "Subscription Purchase",
          smartCard: "SUM524567",
          details: "Base Plan - 1 Month",
          status: "Completed",
          performedBy: "John Agent"
        },
        {
          id: 2,
          date: "2024-04-20",
          time: "16:15",
          actionType: "Subscription Renewal",
          smartCard: "SUM524567",
          details: "Base Plan - Extended 1 Month",
          status: "Active",
          performedBy: "Sarah Agent"
        },
        {
          id: 3,
          date: "2024-04-18",
          time: "11:45",
          actionType: "Plan Change",
          smartCard: "SUM524567",
          details: "Basic → Standard Plan",
          status: "Completed",
          performedBy: "Mike Agent"
        },
        {
          id: 4,
          date: "2024-04-15",
          time: "09:30",
          actionType: "Offer Change",
          smartCard: "SUM524567",
          details: "Applied 20% Discount Offer",
          status: "Applied",
          performedBy: "Lisa Agent"
        },
        {
          id: 5,
          date: "2024-04-12",
          time: "14:20",
          actionType: "Suspension",
          smartCard: "SUM524567",
          details: "Payment Issue - Auto Suspended",
          status: "Resolved",
          performedBy: "System Auto"
        },
        {
          id: 6,
          date: "2024-04-12",
          time: "15:45",
          actionType: "Reconnection",
          smartCard: "SUM524567",
          details: "Payment Received - Service Restored",
          status: "Active",
          performedBy: "John Agent"
        },
        {
          id: 7,
          date: "2024-04-10",
          time: "12:00",
          actionType: "Plan Validity Extension",
          smartCard: "SUM524567",
          details: "Extended validity by 7 days",
          status: "Applied",
          performedBy: "Support Team"
        },
        {
          id: 8,
          date: "2024-04-08",
          time: "16:30",
          actionType: "Add Add-ON Pack",
          smartCard: "SUM524567",
          details: "Sports Ultimate Pack Added",
          status: "Active",
          performedBy: "Sarah Agent"
        },
        {
          id: 9,
          date: "2024-04-05",
          time: "10:15",
          actionType: "Retrack",
          smartCard: "SUM524567",
          details: "Signal tracking reconfigured",
          status: "Completed",
          performedBy: "Tech Support"
        },
        {
          id: 10,
          date: "2024-04-03",
          time: "13:20",
          actionType: "Replacement",
          smartCard: "SUM524567",
          details: "Smart card replaced due to damage",
          status: "Completed",
          performedBy: "Field Agent"
        }
      ];
      
      res.json({ success: true, data: mockServiceActions });
    } catch (error) {
      console.error('Get service actions error:', error);
      res.status(500).json({ message: "Failed to fetch service actions" });
    }
  });

  // Get invoices for a customer
  app.get("/api/customers/:customerId/invoices", async (req, res) => {
    try {
      const { customerId } = req.params;
      const mockInvoices = [
        {
          id: 1,
          invoiceNumber: "INV-2024-001234",
          date: "2024-04-25",
          description: "Base Plan Subscription - April 2024",
          amount: 25000,
          currency: "TZS",
          status: "Paid",
          paymentMethod: "M-Pesa"
        },
        {
          id: 2,
          invoiceNumber: "INV-2024-001233",
          date: "2024-04-20",
          description: "Sports Ultimate Pack Add-on",
          amount: 8000,
          currency: "TZS",
          status: "Paid",
          paymentMethod: "Tigo Pesa"
        },
        {
          id: 3,
          invoiceNumber: "INV-2024-001232",
          date: "2024-04-15",
          description: "Plan Upgrade - Standard Plan",
          amount: 10000,
          currency: "TZS",
          status: "Paid",
          paymentMethod: "Wallet"
        },
        {
          id: 4,
          invoiceNumber: "INV-2024-001231",
          date: "2024-04-10",
          description: "Monthly Subscription - March 2024",
          amount: 25000,
          currency: "TZS",
          status: "Cancelled",
          paymentMethod: null
        }
      ];
      
      res.json({ success: true, data: mockInvoices });
    } catch (error) {
      console.error('Get invoices error:', error);
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  // Get support tickets for a customer
  app.get("/api/customers/:customerId/tickets", async (req, res) => {
    try {
      const { customerId } = req.params;
      const mockTickets = [
        {
          id: 1,
          date: "2024-04-25",
          time: "14:30",
          ticketId: "TK-001234",
          type: "Signal Issue",
          priority: "Medium",
          status: "Resolved",
          agent: "John Agent"
        },
        {
          id: 2,
          date: "2024-04-22",
          time: "09:15",
          ticketId: "TK-001233",
          type: "Billing Query",
          priority: "Low",
          status: "Closed",
          agent: "Sarah Agent"
        }
      ];
      
      res.json({ success: true, data: mockTickets });
    } catch (error) {
      console.error('Get tickets error:', error);
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // Get customer auto-renewal settings
  app.get("/api/customers/:customerId/auto-renewal", async (req, res) => {
    try {
      const { customerId } = req.params;
      const mockAutoRenewalSettings = {
        enabled: true,
        nextRenewalDate: "2025-05-23",
        amount: 25000,
        currency: "TZS",
        paymentMethod: "M-Pesa"
      };
      
      res.json({ success: true, data: mockAutoRenewalSettings });
    } catch (error) {
      console.error('Get auto-renewal settings error:', error);
      res.status(500).json({ message: "Failed to fetch auto-renewal settings" });
    }
  });

  // Update customer auto-renewal settings
  app.patch("/api/customers/:customerId/auto-renewal", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { enabled } = req.body;
      
      const updatedSettings = {
        enabled,
        nextRenewalDate: enabled ? "2025-05-23" : null,
        amount: enabled ? 25000 : null,
        currency: "TZS",
        paymentMethod: enabled ? "M-Pesa" : null
      };
      
      res.json({ success: true, data: updatedSettings, message: "Auto-renewal settings updated successfully" });
    } catch (error) {
      console.error('Update auto-renewal settings error:', error);
      res.status(500).json({ message: "Failed to update auto-renewal settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}