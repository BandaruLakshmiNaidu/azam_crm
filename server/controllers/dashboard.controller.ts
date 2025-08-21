// === DASHBOARD CONTROLLER ===
// Organized dashboard data logic

import { Request, Response } from 'express';

export class DashboardController {
  static async getStats(req: Request, res: Response) {
    try {
      // Simulate dashboard statistics
      const stats = {
        totalAgents: 245,
        activeSubscriptions: 18420,
        monthlyRevenue: 2840000,
        pendingOrders: 67,
        agentGrowth: 12.5,
        subscriptionGrowth: 8.3,
        revenueGrowth: 15.7,
        orderGrowth: -2.1,
        regionStats: {
          dares_salaam: { agents: 85, subscriptions: 6200 },
          mwanza: { agents: 42, subscriptions: 3100 },
          arusha: { agents: 38, subscriptions: 2800 },
          mbeya: { agents: 35, subscriptions: 2500 },
          dodoma: { agents: 28, subscriptions: 2100 },
          others: { agents: 17, subscriptions: 1720 }
        },
        planDistribution: {
          basic: 45,
          standard: 35,
          premium: 20
        }
      };

      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ message: "Failed to fetch dashboard statistics" });
    }
  }

  static async getChartData(req: Request, res: Response) {
    try {
      const { type, period } = req.query;

      let chartData = {};

      switch (type) {
        case 'revenue':
          chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Revenue',
              data: [2200000, 2350000, 2180000, 2420000, 2680000, 2840000],
              borderColor: '#e67c1a',
              backgroundColor: 'rgba(230, 124, 26, 0.1)'
            }]
          };
          break;
        case 'subscriptions':
          chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Subscriptions',
              data: [16200, 16800, 17100, 17600, 18100, 18420],
              borderColor: '#238fb7',
              backgroundColor: 'rgba(35, 143, 183, 0.1)'
            }]
          };
          break;
        case 'agents':
          chartData = {
            labels: ['Q1', 'Q2', 'Q3', 'Q4'],
            datasets: [{
              label: 'Active Agents',
              data: [198, 215, 232, 245],
              backgroundColor: ['#e67c1a', '#238fb7', '#10b981', '#f59e0b']
            }]
          };
          break;
        default:
          chartData = { labels: [], datasets: [] };
      }

      res.json(chartData);
    } catch (error) {
      console.error('Chart data error:', error);
      res.status(500).json({ message: "Failed to fetch chart data" });
    }
  }

  static async getActivities(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;

      const activities = [
        {
          id: 1,
          type: 'subscription',
          message: 'New subscription created for customer SC123456789',
          timestamp: new Date().toISOString(),
          user: 'Field Agent',
          status: 'completed'
        },
        {
          id: 2,
          type: 'payment',
          message: 'Payment of TZS 45,000 received for hardware sale',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          user: 'Agent Smith',
          status: 'completed'
        },
        {
          id: 3,
          type: 'inventory',
          message: 'Stock transfer approved from Warehouse A to Agent Center B',
          timestamp: new Date(Date.now() - 600000).toISOString(),
          user: 'Warehouse Manager',
          status: 'approved'
        },
        {
          id: 4,
          type: 'agent',
          message: 'New agent registration submitted for approval',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          user: 'System',
          status: 'pending'
        },
        {
          id: 5,
          type: 'customer',
          message: 'Customer KYC documents uploaded and verified',
          timestamp: new Date(Date.now() - 1200000).toISOString(),
          user: 'Regional Manager',
          status: 'verified'
        }
      ].slice(0, limit);

      res.json(activities);
    } catch (error) {
      console.error('Activities error:', error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  }

  static async getSystemStatus(req: Request, res: Response) {
    try {
      const systemStatus = {
        api: { status: 'operational', uptime: '99.9%' },
        database: { status: 'operational', uptime: '99.8%' },
        payment_gateway: { status: 'operational', uptime: '99.7%' },
        sms_service: { status: 'operational', uptime: '99.5%' },
        backup_system: { status: 'operational', uptime: '99.9%' },
        lastUpdated: new Date().toISOString()
      };

      res.json(systemStatus);
    } catch (error) {
      console.error('System status error:', error);
      res.status(500).json({ message: "Failed to fetch system status" });
    }
  }
}