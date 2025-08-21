import type { Request, Response } from "express";
import { storage } from "../storage";

export class ReportController {
  // === DAILY REPORTS ===
  static async getDailyReports(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, region } = req.query;
      const reports = await storage.getDailyReports(
        dateFrom as string, 
        dateTo as string, 
        region as string
      );
      
      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'DAILY',
        reportId: 0, // For list view
        action: 'VIEWED',
        performedBy: 'current_user', // In real app, get from auth
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: reports });
    } catch (error) {
      console.error("Get daily reports error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getDailyReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await storage.getDailyReportById(parseInt(id));
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'DAILY',
        reportId: report.id,
        action: 'VIEWED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: report });
    } catch (error) {
      console.error("Get daily report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async generateDailyReport(req: Request, res: Response) {
    try {
      const { reportDate, reportType, region } = req.body;
      
      const report = await storage.generateDailyReport(
        new Date(reportDate), 
        reportType, 
        region
      );

      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'DAILY',
        reportId: report.id,
        action: 'GENERATED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: report });
    } catch (error) {
      console.error("Generate daily report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // === TRA REPORTS ===
  static async getTRAReports(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo } = req.query;
      const reports = await storage.getTRAReports(dateFrom as string, dateTo as string);
      
      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'TRA',
        reportId: 0,
        action: 'VIEWED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: reports });
    } catch (error) {
      console.error("Get TRA reports error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getTRAReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await storage.getTRAReportById(parseInt(id));
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'TRA',
        reportId: report.id,
        action: 'VIEWED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: report });
    } catch (error) {
      console.error("Get TRA report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async generateTRAReport(req: Request, res: Response) {
    try {
      const { reportDate, reportType } = req.body;
      
      const report = await storage.generateTRAReport(new Date(reportDate), reportType);

      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'TRA',
        reportId: report.id,
        action: 'GENERATED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: report });
    } catch (error) {
      console.error("Generate TRA report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // === TCRA REPORTS ===
  static async getTCRAReports(req: Request, res: Response) {
    try {
      const { dateFrom, dateTo, region } = req.query;
      const reports = await storage.getTCRAReports(
        dateFrom as string, 
        dateTo as string, 
        region as string
      );
      
      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'TCRA',
        reportId: 0,
        action: 'VIEWED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: reports });
    } catch (error) {
      console.error("Get TCRA reports error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getTCRAReportById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const report = await storage.getTCRAReportById(parseInt(id));
      
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }

      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'TCRA',
        reportId: report.id,
        action: 'VIEWED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: report });
    } catch (error) {
      console.error("Get TCRA report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async generateTCRAReport(req: Request, res: Response) {
    try {
      const { reportDate, reportType, region } = req.body;
      
      const report = await storage.generateTCRAReport(
        new Date(reportDate), 
        reportType, 
        region
      );

      // Create audit log
      await storage.createReportAuditLog({
        reportType: 'TCRA',
        reportId: report.id,
        action: 'GENERATED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip
      });

      res.json({ success: true, data: report });
    } catch (error) {
      console.error("Generate TCRA report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // === AUDIT LOGS ===
  static async getReportAuditLogs(req: Request, res: Response) {
    try {
      const { reportType, reportId } = req.query;
      const logs = await storage.getReportAuditLogs(
        reportType as string, 
        reportId ? parseInt(reportId as string) : undefined
      );

      res.json({ success: true, data: logs });
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // === EXPORT FUNCTIONALITY ===
  static async exportReport(req: Request, res: Response) {
    try {
      const { reportType, reportId, format } = req.body;
      
      // Create audit log for export
      await storage.createReportAuditLog({
        reportType: reportType as any,
        reportId: parseInt(reportId),
        action: 'EXPORTED',
        performedBy: 'current_user',
        userRole: 'admin',
        ipAddress: req.ip,
        exportFormat: format as any
      });

      res.json({ 
        success: true, 
        message: `Report exported as ${format}`,
        downloadUrl: `/api/reports/download/${reportType}/${reportId}?format=${format}`
      });
    } catch (error) {
      console.error("Export report error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}