import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CalendarDays, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Download,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Filter
} from "lucide-react";
import type { DailyReport } from "@shared/schema";

export default function DailyReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    region: "all",
    reportType: "all"
  });

  // Fetch daily reports
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['/api/reports/daily', filters],
    queryFn: async () => {
      // Filter out "all" values and create proper query params
      const queryParams = new URLSearchParams();
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo);
      if (filters.region && filters.region !== 'all') queryParams.append('region', filters.region);
      if (filters.reportType && filters.reportType !== 'all') queryParams.append('reportType', filters.reportType);
      
      const response = await apiRequest('GET', `/api/reports/daily?${queryParams.toString()}`);
      return response.json();
    }
  });

  // Generate new report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (data: { reportDate: string; reportType: string; region?: string }) => {
      const response = await apiRequest('POST', '/api/reports/daily/generate', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Daily report generated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/daily'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    }
  });

  // Export report mutation
  const exportReportMutation = useMutation({
    mutationFn: async (data: { reportId: number; format: string }) => {
      const response = await apiRequest('POST', '/api/reports/export', { 
        reportType: 'DAILY', 
        reportId: data.reportId, 
        format: data.format 
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to export report", variant: "destructive" });
    }
  });

  const reports: DailyReport[] = reportsData?.data || [];

  const handleGenerateReport = () => {
    generateReportMutation.mutate({
      reportDate: filters.dateFrom,
      reportType: filters.reportType || 'daily_transactions',
      region: filters.region
    });
  };

  const handleExport = (reportId: number, format: 'PDF' | 'EXCEL') => {
    exportReportMutation.mutate({ reportId, format });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Daily Reports</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Daily operational insights including transactions, agent activities, and reconciliation
          </p>
        </div>
        <Button 
          onClick={handleGenerateReport}
          disabled={generateReportMutation.isPending}
          className="bg-azam-blue hover:bg-azam-blue-dark"
        >
          {generateReportMutation.isPending ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <CalendarDays className="w-4 h-4 mr-2" />
          )}
          Generate Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="dateFrom">Date From</Label>
              <Input
                id="dateFrom"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">Date To</Label>
              <Input
                id="dateTo"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Select value={filters.region} onValueChange={(value) => setFilters(prev => ({ ...prev, region: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="Dar es Salaam">Dar es Salaam</SelectItem>
                  <SelectItem value="Mwanza">Mwanza</SelectItem>
                  <SelectItem value="Arusha">Arusha</SelectItem>
                  <SelectItem value="Dodoma">Dodoma</SelectItem>
                  <SelectItem value="Mbeya">Mbeya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={filters.reportType} onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="daily_transactions">Daily Transactions</SelectItem>
                  <SelectItem value="agent_summary">Agent Summary</SelectItem>
                  <SelectItem value="reconciliation">Reconciliation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Transactions</p>
                  <p className="text-2xl font-bold">{reports[0]?.totalTransactions || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-azam-blue" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(reports[0]?.totalRevenue || 0)}</p>
                </div>
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Agents</p>
                  <p className="text-2xl font-bold">{reports[0]?.activeAgents || 0}</p>
                </div>
                <Users className="w-8 h-8 text-azam-orange" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">VAT Collected</p>
                  <p className="text-2xl font-bold">{formatCurrency(reports[0]?.totalVAT || 0)}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            List of all generated daily reports with detailed insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading reports...</span>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Reports Generated</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Generate your first daily report to view transaction insights
              </p>
              <Button onClick={handleGenerateReport} disabled={generateReportMutation.isPending}>
                Generate Report
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      {new Date(report.reportDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {report.reportType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.region}</TableCell>
                    <TableCell>{report.totalTransactions}</TableCell>
                    <TableCell>{formatCurrency(report.totalRevenue)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={report.reconciliationStatus === 'COMPLETED' ? 'default' : 'secondary'}
                      >
                        {report.reconciliationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(report.generatedAt).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(report.id, 'EXCEL')}
                          disabled={exportReportMutation.isPending}
                        >
                          <FileSpreadsheet className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleExport(report.id, 'PDF')}
                          disabled={exportReportMutation.isPending}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}