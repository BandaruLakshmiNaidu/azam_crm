// === INVENTORY CONTROLLER ===
// Handles inventory-related operations

import { Request, Response } from 'express';

export class InventoryController {
  static async getInventoryItems(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const items = await storage.getInventoryItems();
      res.json({ success: true, data: items });
    } catch (error) {
      console.error('Get inventory items error:', error);
      res.status(500).json({ message: "Failed to fetch inventory items" });
    }
  }

  static async getInventoryItem(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const id = parseInt(req.params.id);
      const item = await storage.getInventoryItemById(id);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.json({ success: true, data: item });
    } catch (error) {
      console.error('Get inventory item error:', error);
      res.status(500).json({ message: "Failed to fetch inventory item" });
    }
  }

  static async createInventoryItem(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const item = await storage.createInventoryItem(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      console.error('Create inventory item error:', error);
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  }

  static async updateInventoryItem(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const id = parseInt(req.params.id);
      const item = await storage.updateInventoryItem(id, req.body);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.json({ success: true, data: item });
    } catch (error) {
      console.error('Update inventory item error:', error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  }

  static async deleteInventoryItem(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteInventoryItem(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Inventory item not found" });
      }

      res.json({ success: true, message: "Inventory item deleted successfully" });
    } catch (error) {
      console.error('Delete inventory item error:', error);
      res.status(500).json({ message: "Failed to delete inventory item" });
    }
  }

  // Get inventory requests
  static async getInventoryRequests(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const requests = await storage.getInventoryRequests();
      res.json({ success: true, data: requests });
    } catch (error) {
      console.error('Get inventory requests error:', error);
      res.status(500).json({ message: "Failed to fetch inventory requests" });
    }
  }

  static async createInventoryRequest(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const request = await storage.createInventoryRequest(req.body);
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      console.error('Create inventory request error:', error);
      res.status(500).json({ message: "Failed to create inventory request" });
    }
  }

  static async approveInventoryRequest(req: Request, res: Response) {
    try {
      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();
      const id = parseInt(req.params.id);
      const request = await storage.updateInventoryRequest(id, { 
        status: 'approved',
        updateId: 'manager',
        updateDt: new Date(),
        updateTs: new Date()
      });
      
      if (!request) {
        return res.status(404).json({ message: "Inventory request not found" });
      }

      res.json({ 
        success: true, 
        data: request,
        message: "Inventory request approved successfully" 
      });
    } catch (error) {
      console.error('Approve inventory request error:', error);
      res.status(500).json({ message: "Failed to approve inventory request" });
    }
  }

  // Serial number upload (mock)
  static async uploadSerialNumbers(req: Request, res: Response) {
    try {
      const { file, materialType, warehouse } = req.body;
      
      // Mock processing of uploaded serial numbers
      const processedCount = Math.floor(Math.random() * 50) + 10;
      const errorCount = Math.floor(Math.random() * 5);
      
      res.json({
        success: true,
        processed: processedCount,
        errors: errorCount,
        message: `Successfully processed ${processedCount} serial numbers with ${errorCount} errors`
      });
    } catch (error) {
      console.error('Upload serial numbers error:', error);
      res.status(500).json({ message: "Failed to upload serial numbers" });
    }
  }

  // Get movement history for a serial (Portal-only aggregation)
  static async getSerialMovements(req: Request, res: Response) {
    try {
      const serialParam = String(req.params.serial || "").trim();
      if (!serialParam) {
        return res.status(400).json({ message: "Serial is required" });
      }

      const serialLc = serialParam.toLowerCase();

      const { MemStorage } = await import("../storage");
      const storage = new MemStorage();

      const [items, requests] = await Promise.all([
        storage.getInventoryItems(),
        storage.getInventoryRequests(),
      ]);

      const matchedItem = items.find(
        (it) => it.serialNumber?.toLowerCase() === serialLc
      );

      // Find inventory requests referencing this serial (comma-separated list)
      const relatedRequests = requests.filter((req: any) => {
        const list = (req.itemSerialNo || "")
          .toLowerCase()
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        return list.includes(serialLc);
      });

      if (!matchedItem && relatedRequests.length === 0) {
        return res.status(404).json({ message: "No portal records found for this serial" });
      }

      // Build movement events from portal data
      type MovementEvent = {
        type: string;
        location?: string;
        status?: string;
        timestamp: string | Date;
        operator?: string;
        notes?: string;
        source: string;
      };

      const events: MovementEvent[] = [];

      if (matchedItem) {
        // Initial receipt/creation
        if (matchedItem.createTs || matchedItem.createDt) {
          events.push({
            type: "RECEIVED",
            location: matchedItem.owner,
            status: matchedItem.state || matchedItem.status,
            timestamp: matchedItem.createTs || matchedItem.createDt,
            operator: matchedItem.createId || "system",
            notes: `Item created in portal inventory (${matchedItem.materialName || matchedItem.materialCode || "Item"})`,
            source: "inventory",
          });
        }

        // Any subsequent update
        if (matchedItem.updateTs || matchedItem.updateDt) {
          events.push({
            type: "STATUS_UPDATE",
            location: matchedItem.owner,
            status: matchedItem.state || matchedItem.status,
            timestamp: matchedItem.updateTs || matchedItem.updateDt,
            operator: matchedItem.updateId || "system",
            notes: "Inventory record updated",
            source: "inventory",
          });
        }
      }

      for (const reqItem of relatedRequests) {
        // Request created
        events.push({
          type: reqItem.requestType === "TRANSFER" ? "TRANSFER_REQUESTED" : "REQUEST_CREATED",
          location: reqItem.transferFrom && reqItem.transferTo
            ? `${reqItem.transferFrom} → ${reqItem.transferTo}`
            : reqItem.module,
          status: reqItem.status,
          timestamp: reqItem.createTs || reqItem.createDt,
          operator: reqItem.createId || "system",
          notes: reqItem.reason || reqItem.requestType,
          source: "inventory-request",
        });

        // Request updated (approval/in-transit/etc.)
        if (reqItem.updateTs || reqItem.updateDt) {
          events.push({
            type: reqItem.requestType === "TRANSFER" ? "TRANSFER_UPDATED" : "REQUEST_UPDATED",
            location: reqItem.transferFrom && reqItem.transferTo
              ? `${reqItem.transferFrom} → ${reqItem.transferTo}`
              : reqItem.module,
            status: reqItem.status,
            timestamp: reqItem.updateTs || reqItem.updateDt,
            operator: reqItem.updateId || "system",
            notes: `Request ${String(reqItem.status).toUpperCase()}`,
            source: "inventory-request",
          });
        }
      }

      // Sort events chronologically
      events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const current = matchedItem
        ? {
            serialNumber: matchedItem.serialNumber,
            materialName: matchedItem.materialName,
            materialCode: matchedItem.materialCode,
            owner: matchedItem.owner,
            state: matchedItem.state || matchedItem.status,
            casId: matchedItem.casId,
            createDt: matchedItem.createDt || matchedItem.createTs,
            updateTs: matchedItem.updateTs || matchedItem.updateDt,
          }
        : null;

      res.json({
        success: true,
        data: {
          serialNumber: serialParam,
          current,
          events,
        },
      });
    } catch (error) {
      console.error("Get serial movements error:", error);
      res.status(500).json({ message: "Failed to fetch serial movement history" });
    }
  }

  // STB status search (mock)
  static async searchStbStatus(req: Request, res: Response) {
    try {
      const { serialNumber } = req.query;
      
      if (!serialNumber) {
        return res.status(400).json({ message: "Serial number is required" });
      }

      // Mock STB status data
      const mockStatus = {
        serialNumber: serialNumber as string,
        status: 'active',
        customerId: 'CUST001',
        customerName: 'John Doe',
        smartCardNumber: 'SC123456789',
        planName: 'Azam Premium',
        lastActivity: new Date().toISOString(),
        location: 'Dar es Salaam',
        warrantyStatus: 'In warranty',
        installationDate: '2024-01-15'
      };

      res.json({ success: true, data: mockStatus });
    } catch (error) {
      console.error('Search STB status error:', error);
      res.status(500).json({ message: "Failed to search STB status" });
    }
  }

  // Center STB status search (mock)
  static async searchCenterStbStatus(req: Request, res: Response) {
    try {
      const { centerId, status } = req.query;
      
      // Mock center STB data
      const mockData = [
        {
          serialNumber: 'STB123456789',
          status: status || 'available',
          materialType: 'STB',
          dateReceived: '2024-02-01',
          location: `Center-${centerId || '001'}`
        },
        {
          serialNumber: 'STB123456790',
          status: status || 'allocated',
          materialType: 'STB',
          dateReceived: '2024-02-02',
          location: `Center-${centerId || '001'}`
        }
      ];

      res.json({ success: true, data: mockData });
    } catch (error) {
      console.error('Search center STB status error:', error);
      res.status(500).json({ message: "Failed to search center STB status" });
    }
  }

  // Stock requests (different from inventory requests)
  static async getStockRequests(req: Request, res: Response) {
    try {
      // Mock stock requests data
      const mockStockRequests = [
        {
          id: 1,
          requestId: 'STK-2024-001',
          agentId: 1,
          agentName: 'John Mwangi',
          itemType: 'STB',
          quantity: 10,
          status: 'pending',
          requestDate: new Date('2024-02-01'),
          priority: 'medium'
        },
        {
          id: 2,
          requestId: 'STK-2024-002',
          agentId: 1,
          agentName: 'John Mwangi',
          itemType: 'Remote',
          quantity: 25,
          status: 'approved',
          requestDate: new Date('2024-01-28'),
          priority: 'high'
        }
      ];

      res.json(mockStockRequests);
    } catch (error) {
      console.error('Get stock requests error:', error);
      res.status(500).json({ message: "Failed to fetch stock requests" });
    }
  }

  // STB devices (mock)
  static async getStbDevices(req: Request, res: Response) {
    try {
      const mockStbDevices = [
        {
          id: 1,
          serialNumber: 'STB123456789',
          model: 'AZAM STB Pro',
          status: 'active',
          customerId: 1,
          assignedAgent: 1,
          lastUpdate: new Date()
        },
        {
          id: 2,
          serialNumber: 'STB123456790',
          model: 'AZAM STB Pro',
          status: 'available',
          customerId: null,
          assignedAgent: 1,
          lastUpdate: new Date()
        }
      ];

      res.json(mockStbDevices);
    } catch (error) {
      console.error('Get STB devices error:', error);
      res.status(500).json({ message: "Failed to fetch STB devices" });
    }
  }

  // Warehouse transfers (mock)
  static async processTransfer(req: Request, res: Response) {
    try {
      const { fromWarehouse, toWarehouse, items } = req.body;
      
      res.json({
        success: true,
        transferId: `TRF-${Date.now()}`,
        message: `Transfer from ${fromWarehouse} to ${toWarehouse} processed successfully`,
        processedItems: items?.length || 0
      });
    } catch (error) {
      console.error('Process transfer error:', error);
      res.status(500).json({ message: "Failed to process transfer" });
    }
  }
}