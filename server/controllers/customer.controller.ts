// === CUSTOMER CONTROLLER ===
// Handles customer-related operations

import { Request, Response } from 'express';

export class CustomerController {
  static async getCustomers(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const customers = await storage.getCustomers();
      res.json({ success: true, data: customers });
    } catch (error) {
      console.error('Get customers error:', error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  }

  static async getCustomer(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomerById(id);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json({ success: true, data: customer });
    } catch (error) {
      console.error('Get customer error:', error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  }

  static async createCustomer(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const customer = await storage.createCustomer(req.body);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      console.error('Create customer error:', error);
      res.status(500).json({ message: "Failed to create customer" });
    }
  }

  static async updateCustomer(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const id = parseInt(req.params.id);
      const customer = await storage.updateCustomer(id, req.body);
      
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json({ success: true, data: customer });
    } catch (error) {
      console.error('Update customer error:', error);
      res.status(500).json({ message: "Failed to update customer" });
    }
  }

  static async deleteCustomer(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteCustomer(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Customer not found" });
      }

      res.json({ success: true, message: "Customer deleted successfully" });
    } catch (error) {
      console.error('Delete customer error:', error);
      res.status(500).json({ message: "Failed to delete customer" });
    }
  }

  // Search customers (mock implementation for consolidated subscriptions page)
  static async searchCustomers(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const { query } = req.query;
      const customers = await storage.getCustomers();
      
      if (!query) {
        return res.json({ success: true, data: customers.slice(0, 10) });
      }

      // Simple search by name, phone, or email
      const searchTerm = (query as string).toLowerCase();
      const filteredCustomers = customers.filter(customer => 
        customer.firstName.toLowerCase().includes(searchTerm) ||
        customer.lastName.toLowerCase().includes(searchTerm) ||
        customer.phone.includes(searchTerm) ||
        customer.mobile.includes(searchTerm) ||
        (customer.email && customer.email.toLowerCase().includes(searchTerm))
      );

      // Mock customer data with additional subscription details for UI
      const enrichedCustomers = filteredCustomers.map(customer => ({
        ...customer,
        walletBalance: Math.floor(Math.random() * 1000000) + 100000, // Random balance
        sapBpId: `BP${customer.id.toString().padStart(6, '0')}`,
        sapCaId: `CA${customer.id.toString().padStart(6, '0')}`,
        smartCardNumber: `SC${customer.id.toString().padStart(9, '0')}`,
        stbSerialNumber: `STB${customer.id.toString().padStart(9, '0')}`,
        currentSubscription: {
          planId: 'AZAM_LITE_1M',
          planName: 'Azam Lite 1 Month',
          amount: 12000,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'ACTIVE'
        }
      }));

      res.json({ success: true, data: enrichedCustomers });
    } catch (error) {
      console.error('Search customers error:', error);
      res.status(500).json({ message: "Failed to search customers" });
    }
  }
}