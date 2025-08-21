import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Filter,
  Receipt,
  ShieldCheck,
  AlertCircle,
  Send,
  Radio,
  Signal,
  CheckCircle2
} from "lucide-react";
import type { DailyReport, TRAReport, TCRAReport } from "@shared/schema";

export default function UnifiedReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Daily Reports Filters
  const [dailyFilters, setDailyFilters] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    region: "all",
    reportType: "all"
  });

  // TRA Reports Filters
  const [traFilters, setTraFilters] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    reportType: "all"
  });

  // TCRA Reports Filters
  const [tcraFilters, setTcraFilters] = useState({
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    region: "all",
    reportType: "all"
  });

  // Fetch Daily Reports
  const { data: dailyReportsData, isLoading: isDailyLoading } = useQuery({
    queryKey: ['/api/reports/daily', dailyFilters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (dailyFilters.dateFrom) queryParams.append('dateFrom', dailyFilters.dateFrom);
      if (dailyFilters.dateTo) queryParams.append('dateTo', dailyFilters.dateTo);
      if (dailyFilters.region && dailyFilters.region !== 'all') queryParams.append('region', dailyFilters.region);
      if (dailyFilters.reportType && dailyFilters.reportType !== 'all') queryParams.append('reportType', dailyFilters.reportType);
      
      const response = await apiRequest('GET', `/api/reports/daily?${queryParams.toString()}`);
      return response.json();
    }
  });

  // Fetch TRA Reports
  const { data: traReportsData, isLoading: isTraLoading } = useQuery({
    queryKey: ['/api/reports/tra', traFilters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (traFilters.dateFrom) queryParams.append('dateFrom', traFilters.dateFrom);
      if (traFilters.dateTo) queryParams.append('dateTo', traFilters.dateTo);
      if (traFilters.reportType && traFilters.reportType !== 'all') queryParams.append('reportType', traFilters.reportType);
      
      const response = await apiRequest('GET', `/api/reports/tra?${queryParams.toString()}`);
      return response.json();
    }
  });

  // Fetch TCRA Reports
  const { data: tcraReportsData, isLoading: isTcraLoading } = useQuery({
    queryKey: ['/api/reports/tcra', tcraFilters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (tcraFilters.dateFrom) queryParams.append('dateFrom', tcraFilters.dateFrom);
      if (tcraFilters.dateTo) queryParams.append('dateTo', tcraFilters.dateTo);
      if (tcraFilters.region && tcraFilters.region !== 'all') queryParams.append('region', tcraFilters.region);
      if (tcraFilters.reportType && tcraFilters.reportType !== 'all') queryParams.append('reportType', tcraFilters.reportType);
      
      const response = await apiRequest('GET', `/api/reports/tcra?${queryParams.toString()}`);
      return response.json();
    }
  });

  // Generate Daily Report Mutation
  const generateDailyReportMutation = useMutation({
    mutationFn: async (data: { reportDate: string; reportType: string; region?: string }) => {
      const response = await apiRequest('POST', '/api/reports/daily/generate', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Daily report generated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/daily'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate daily report", variant: "destructive" });
    }
  });

  // Generate TRA Report Mutation
  const generateTraReportMutation = useMutation({
    mutationFn: async (data: { reportDate: string; reportType: string }) => {
      const response = await apiRequest('POST', '/api/reports/tra/generate', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "TRA report generated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/tra'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate TRA report", variant: "destructive" });
    }
  });

  // Generate TCRA Report Mutation
  const generateTcraReportMutation = useMutation({
    mutationFn: async (data: { reportDate: string; reportType: string; region?: string }) => {
      const response = await apiRequest('POST', '/api/reports/tcra/generate', data);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "TCRA report generated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/reports/tcra'] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to generate TCRA report", variant: "destructive" });
    }
  });

  // Export Report Mutation
  const exportReportMutation = useMutation({
    mutationFn: async (data: { reportType: string; reportId: number; format: string }) => {
      const response = await apiRequest('POST', '/api/reports/export', data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({ title: "Success", description: data.message });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to export report", variant: "destructive" });
    }
  });

  const dailyReports: DailyReport[] = dailyReportsData?.data || [];
  const traReports: TRAReport[] = traReportsData?.data || [];
  const tcraReports: TCRAReport[] = tcraReportsData?.data || [];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getApiStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = (reportType: string, reportId: number, format: 'PDF' | 'EXCEL') => {
    exportReportMutation.mutate({ reportType, reportId, format });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports Management</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive reporting system for operational, TRA compliance, and TCRA regulatory reports
          </p>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4" />
            Daily Reports
          </TabsTrigger>
          <TabsTrigger value="tra" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            TRA Reports
          </TabsTrigger>
          <TabsTrigger value="tcra" className="flex items-center gap-2">
            <Radio className="w-4 h-4" />
            TCRA Reports
          </TabsTrigger>
        </TabsList>

        {/* ================================ DAILY REPORTS SECTION ================================ */}
        <TabsContent value="daily" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daily Reports</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Operational insights including transactions, revenue, and agent activities
              </p>
            </div>
            <Button 
              onClick={() => generateDailyReportMutation.mutate({
                reportDate: dailyFilters.dateFrom,
                reportType: dailyFilters.reportType !== 'all' ? dailyFilters.reportType : 'daily_transactions',
                region: dailyFilters.region !== 'all' ? dailyFilters.region : undefined
              })}
              disabled={generateDailyReportMutation.isPending}
              className="bg-azam-blue hover:bg-azam-blue-dark"
            >
              {generateDailyReportMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CalendarDays className="w-4 h-4 mr-2" />
              )}
              Generate Daily Report
            </Button>
          </div>

          {/* Daily Reports Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Daily Reports Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="dailyDateFrom">Date From</Label>
                  <Input
                    id="dailyDateFrom"
                    type="date"
                    value={dailyFilters.dateFrom}
                    onChange={(e) => setDailyFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dailyDateTo">Date To</Label>
                  <Input
                    id="dailyDateTo"
                    type="date"
                    value={dailyFilters.dateTo}
                    onChange={(e) => setDailyFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="dailyRegion">Region</Label>
                  <Select value={dailyFilters.region} onValueChange={(value) => setDailyFilters(prev => ({ ...prev, region: value }))}>
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
                  <Label htmlFor="dailyReportType">Report Type</Label>
                  <Select value={dailyFilters.reportType} onValueChange={(value) => setDailyFilters(prev => ({ ...prev, reportType: value }))}>
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

          {/* Daily Summary Cards */}
          {dailyReports.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Transactions</p>
                      <p className="text-2xl font-bold">{dailyReports[0]?.totalTransactions || 0}</p>
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
                      <p className="text-2xl font-bold">{formatCurrency(dailyReports[0]?.totalRevenue || 0)}</p>
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
                      <p className="text-2xl font-bold">{dailyReports[0]?.activeAgents || 0}</p>
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
                      <p className="text-2xl font-bold">{formatCurrency(dailyReports[0]?.totalVAT || 0)}</p>
                    </div>
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Daily Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Daily Reports</CardTitle>
              <CardDescription>
                List of all generated daily reports with detailed insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isDailyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading reports...</span>
                </div>
              ) : dailyReports.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Daily Reports Generated</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Generate your first daily report to view transaction insights
                  </p>
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
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyReports.map((report) => (
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExport('DAILY', report.id, 'EXCEL')}
                              disabled={exportReportMutation.isPending}
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExport('DAILY', report.id, 'PDF')}
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
        </TabsContent>

        {/* ================================ TRA REPORTS SECTION ================================ */}
        <TabsContent value="tra" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">TRA Reports</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Tanzania Revenue Authority compliance reporting with VAT breakdowns and invoice postings
              </p>
            </div>
            <Button 
              onClick={() => generateTraReportMutation.mutate({
                reportDate: traFilters.dateFrom,
                reportType: traFilters.reportType !== 'all' ? traFilters.reportType : 'vat_breakdown'
              })}
              disabled={generateTraReportMutation.isPending}
              className="bg-azam-blue hover:bg-azam-blue-dark"
            >
              {generateTraReportMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Receipt className="w-4 h-4 mr-2" />
              )}
              Generate TRA Report
            </Button>
          </div>

          {/* TRA Reports Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                TRA Reports Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="traDateFrom">Date From</Label>
                  <Input
                    id="traDateFrom"
                    type="date"
                    value={traFilters.dateFrom}
                    onChange={(e) => setTraFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="traDateTo">Date To</Label>
                  <Input
                    id="traDateTo"
                    type="date"
                    value={traFilters.dateTo}
                    onChange={(e) => setTraFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="traReportType">Report Type</Label>
                  <Select value={traFilters.reportType} onValueChange={(value) => setTraFilters(prev => ({ ...prev, reportType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="vat_breakdown">VAT Breakdown</SelectItem>
                      <SelectItem value="invoice_posting">Invoice Posting</SelectItem>
                      <SelectItem value="compliance">Compliance Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TRA Summary Cards */}
          {traReports.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total VAT</p>
                      <p className="text-2xl font-bold">{formatCurrency(traReports[0]?.totalVAT || 0)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-azam-blue" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Vatable Amount</p>
                      <p className="text-2xl font-bold">{formatCurrency(traReports[0]?.vatableAmount || 0)}</p>
                    </div>
                    <Receipt className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Invoices</p>
                      <p className="text-2xl font-bold">{traReports[0]?.totalInvoices || 0}</p>
                    </div>
                    <FileText className="w-8 h-8 text-azam-orange" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">VAT Rate</p>
                      <p className="text-2xl font-bold">{traReports[0]?.vatRate || 18}%</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TRA Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Generated TRA Reports</CardTitle>
              <CardDescription>
                List of all generated TRA compliance reports with submission status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTraLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading reports...</span>
                </div>
              ) : traReports.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No TRA Reports Generated</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Generate your first TRA compliance report to track VAT and invoice data
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>VAT Amount</TableHead>
                      <TableHead>Invoices</TableHead>
                      <TableHead>TRA Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {traReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          {new Date(report.reportDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {report.reportType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(report.totalVAT)}</TableCell>
                        <TableCell>{report.totalInvoices}</TableCell>
                        <TableCell>
                          <Badge 
                            className={getApiStatusColor(report.traApiStatus)}
                          >
                            {report.traApiStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {report.submittedToTRA ? (
                              <>
                                <ShieldCheck className="w-4 h-4 text-green-600" />
                                <span className="text-sm">
                                  {report.submissionDate ? new Date(report.submissionDate).toLocaleDateString() : 'Yes'}
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm">Pending</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExport('TRA', report.id, 'EXCEL')}
                              disabled={exportReportMutation.isPending}
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExport('TRA', report.id, 'PDF')}
                              disabled={exportReportMutation.isPending}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {!report.submittedToTRA && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-azam-blue hover:bg-azam-blue-dark"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================ TCRA REPORTS SECTION ================================ */}
        <TabsContent value="tcra" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">TCRA Reports</h2>
              <p className="text-gray-600 dark:text-gray-300">
                Tanzania Communications Regulatory Authority reporting for subscription activities and NAGRA provisioning
              </p>
            </div>
            <Button 
              onClick={() => generateTcraReportMutation.mutate({
                reportDate: tcraFilters.dateFrom,
                reportType: tcraFilters.reportType !== 'all' ? tcraFilters.reportType : 'subscription_activations',
                region: tcraFilters.region !== 'all' ? tcraFilters.region : undefined
              })}
              disabled={generateTcraReportMutation.isPending}
              className="bg-azam-blue hover:bg-azam-blue-dark"
            >
              {generateTcraReportMutation.isPending ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Radio className="w-4 h-4 mr-2" />
              )}
              Generate TCRA Report
            </Button>
          </div>

          {/* TCRA Reports Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                TCRA Reports Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="tcraDateFrom">Date From</Label>
                  <Input
                    id="tcraDateFrom"
                    type="date"
                    value={tcraFilters.dateFrom}
                    onChange={(e) => setTcraFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tcraDateTo">Date To</Label>
                  <Input
                    id="tcraDateTo"
                    type="date"
                    value={tcraFilters.dateTo}
                    onChange={(e) => setTcraFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="tcraRegion">Region</Label>
                  <Select value={tcraFilters.region} onValueChange={(value) => setTcraFilters(prev => ({ ...prev, region: value }))}>
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
                  <Label htmlFor="tcraReportType">Report Type</Label>
                  <Select value={tcraFilters.reportType} onValueChange={(value) => setTcraFilters(prev => ({ ...prev, reportType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="subscription_activations">Subscription Activations</SelectItem>
                      <SelectItem value="plan_changes">Plan Changes</SelectItem>
                      <SelectItem value="provisioning_logs">Provisioning Logs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* TCRA Summary Cards */}
          {tcraReports.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Subscribers</p>
                      <p className="text-2xl font-bold">{tcraReports[0]?.totalActiveSubscribers || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-azam-blue" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">New Activations</p>
                      <p className="text-2xl font-bold">{tcraReports[0]?.newActivations || 0}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">NAGRA Success</p>
                      <p className="text-2xl font-bold">{tcraReports[0]?.nagraProvisioningSuccess || 0}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-azam-orange" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">API Calls</p>
                      <p className="text-2xl font-bold">{tcraReports[0]?.nagraApiCalls || 0}</p>
                    </div>
                    <Signal className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* TCRA Reports Table */}
          <Card>
            <CardHeader>
              <CardTitle>Generated TCRA Reports</CardTitle>
              <CardDescription>
                List of all generated TCRA regulatory reports with submission status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isTcraLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading reports...</span>
                </div>
              ) : tcraReports.length === 0 ? (
                <div className="text-center py-8">
                  <Radio className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No TCRA Reports Generated</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Generate your first TCRA regulatory report to track subscription activities and provisioning
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Region</TableHead>
                      <TableHead>Activations</TableHead>
                      <TableHead>Renewals</TableHead>
                      <TableHead>NAGRA Status</TableHead>
                      <TableHead>TCRA Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tcraReports.map((report) => (
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
                        <TableCell>{report.newActivations}</TableCell>
                        <TableCell>{report.renewals}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{report.nagraProvisioningSuccess}</span>
                            <span className="text-xs text-gray-500">/ {report.nagraProvisioningSuccess + report.nagraProvisioningFailed}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={getApiStatusColor(report.tcraApiStatus)}
                          >
                            {report.tcraApiStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {report.submittedToTCRA ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm">
                                  {report.submissionDate ? new Date(report.submissionDate).toLocaleDateString() : 'Yes'}
                                </span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-yellow-600" />
                                <span className="text-sm">Pending</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExport('TCRA', report.id, 'EXCEL')}
                              disabled={exportReportMutation.isPending}
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExport('TCRA', report.id, 'PDF')}
                              disabled={exportReportMutation.isPending}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {!report.submittedToTCRA && (
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-azam-blue hover:bg-azam-blue-dark"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}