import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/ui/data-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Package, 
  ArrowRight, 
  FileText,
  Building,
  Users,
  Wrench,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Calendar,
  TrendingUp,
  Activity,
  CheckSquare,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  Rows,
  Download
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StockApproval() {
  const [activeTab, setActiveTab] = useState("pending");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState("");
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const { toast } = useToast();

  const { data: inventoryRequestsResponse, isLoading } = useQuery<any>({
    queryKey: ["/api/inventory-requests"],
  });

  // Extract data from API response format {success: true, data: [...]}
  const inventoryRequests = inventoryRequestsResponse?.success ? inventoryRequestsResponse.data : [];
  const safeInventoryRequests = Array.isArray(inventoryRequests) ? inventoryRequests : [];

  // Enhanced filtering logic
  const getFilteredRequests = (status: string) => {
    let filtered = safeInventoryRequests.filter((req: any) => {
      if (status === "pending") return req.status?.toLowerCase() === "pending" || req.status?.toLowerCase() === "in_transit";
      if (status === "approved") return req.status?.toLowerCase() === "approved";
      if (status === "rejected") return req.status?.toLowerCase() === "rejected";
      return true;
    });

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((req: any) =>
        req.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.itemType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.module?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply module filter
    if (moduleFilter !== "all") {
      filtered = filtered.filter((req: any) => req.module === moduleFilter);
    }

    // Apply date filter on createDt
    if (dateFilter !== "all") {
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfWeek = new Date(startOfToday);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      filtered = filtered.filter((req: any) => {
        const createdAt = req.createDt ? new Date(req.createDt) : null;
        if (!createdAt) return false;
        if (dateFilter === "today") return createdAt >= startOfToday;
        if (dateFilter === "week") return createdAt >= startOfWeek;
        if (dateFilter === "month") return createdAt >= startOfMonth;
        return true;
      });
    }

    return filtered;
  };

  const pendingRequests = getFilteredRequests("pending");
  const approvedRequests = getFilteredRequests("approved");
  const rejectedRequests = getFilteredRequests("rejected");

  // Pagination logic
  const getPaginatedData = (data: any[]) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return {
      data: data.slice(startIndex, endIndex),
      totalPages: Math.ceil(data.length / itemsPerPage),
      totalItems: data.length,
      currentPage,
      itemsPerPage
    };
  };

  const getCurrentTabData = () => {
    switch (activeTab) {
      case "pending": return getPaginatedData(pendingRequests);
      case "approved": return getPaginatedData(approvedRequests);
      case "rejected": return getPaginatedData(rejectedRequests);
      default: return getPaginatedData([]);
    }
  };

  const paginationData = getCurrentTabData();

  // Unpaginated data for table/export
  const getCurrentTabRawData = () => {
    switch (activeTab) {
      case "pending": return pendingRequests;
      case "approved": return approvedRequests;
      case "rejected": return rejectedRequests;
      default: return [];
    }
  };

  // Reset to first page when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1);
  };

  // Pagination controls
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1);
  };

  // Enhanced mutations with better error handling
  const approveMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("PATCH", `/api/inventory-requests/${data.id}`, {
      status: "APPROVED",
      updateId: "current_user_id",
      approvalDate: new Date().toISOString()
    }),
    onSuccess: () => {
      toast({ 
        title: "Request Approved Successfully", 
        description: "The stock request has been approved and processed.",
        className: "bg-green-50 border-green-200"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-requests"] });
    },
    onError: () => {
      toast({ 
        title: "Approval Failed", 
        description: "Unable to approve the request. Please try again.",
        variant: "destructive" 
      });
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("PATCH", `/api/inventory-requests/${data.id}`, {
      status: "REJECTED",
      updateId: "current_user_id",
      rejectionRemarks: data.remarks,
      rejectionDate: new Date().toISOString()
    }),
    onSuccess: () => {
      toast({ 
        title: "Request Rejected", 
        description: "The stock request has been rejected with remarks.",
        className: "bg-red-50 border-red-200"
      });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-requests"] });
      setRejectionModalOpen(false);
      setSelectedRequest(null);
      setRejectionRemarks("");
    },
    onError: () => {
      toast({ 
        title: "Rejection Failed", 
        description: "Unable to reject the request. Please try again.",
        variant: "destructive" 
      });
    }
  });

  const handleApprove = (request: any) => {
    approveMutation.mutate({ id: request.id });
  };

  const handleReject = (request: any) => {
    setSelectedRequest(request);
    setRejectionModalOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectionRemarks.trim()) {
      toast({ title: "Please provide rejection remarks", variant: "destructive" });
      return;
    }
    rejectMutation.mutate({ id: selectedRequest.id, remarks: rejectionRemarks });
  };

  const handleViewDetails = (request: any) => {
    setSelectedRequest(request);
    setDetailsModalOpen(true);
  };

  // Table columns
  const tableColumns = useMemo(() => [
    { key: 'requestId', label: 'Request ID', sortable: true, render: (v: any) => <span className="font-mono">#{v}</span> },
    { key: 'status', label: 'Status', sortable: true, render: (_: any, item: any) => (
      <Badge className={`${getStatusColor(item.status)} border`}>{item.status?.toUpperCase()}</Badge>
    )},
    { key: 'requestType', label: 'Type', sortable: true, render: (v: any) => getRequestTypeDisplay(v) },
    { key: 'itemType', label: 'Item', sortable: true },
    { key: 'itemQty', label: 'Qty', sortable: true, width: '80px' },
    { key: 'totalAmount', label: 'Total (TZS)', sortable: true, render: (v: number) => v ? v.toLocaleString() : 'N/A' },
    { key: 'module', label: 'Module', sortable: true },
    { key: 'transferFrom', label: 'Route', render: (_: any, item: any) => (
      <div className="flex items-center gap-2 text-xs">
        {item.transferFrom && (<span className="flex items-center gap-1">{getLocationIcon(item.transferFrom)}<span>{item.transferFrom}</span></span>)}
        {item.transferFrom && item.transferTo && <ArrowRight className="w-4 h-4 text-azam-blue" />}
        {item.transferTo && (<span className="flex items-center gap-1">{getLocationIcon(item.transferTo)}<span>{item.transferTo}</span></span>)}
      </div>
    )},
    { key: 'createDt', label: 'Created', sortable: true, render: (v: string) => v ? new Date(v).toLocaleString() : 'N/A' },
  ], [activeTab]);

  const exportToCsv = () => {
    const rows = getCurrentTabRawData();
    if (!rows || rows.length === 0) {
      toast({ title: 'Nothing to export', description: 'No records in the current view.' });
      return;
    }
    const headers = ['requestId','status','requestType','itemType','itemQty','totalAmount','module','transferFrom','transferTo','sapSoId','createDt'];
    const csv = [headers.join(',')]
      .concat(
        rows.map((r: any) => headers.map((h) => {
          const val = r[h];
          const str = (val ?? '').toString().replace(/"/g, '""');
          return `"${str}` + `"`;
        }).join(','))
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stock-approvals-${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'in_transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_transit': return <Package className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getLocationIcon = (location: string) => {
    if (location?.includes('WH') || location?.includes('Warehouse')) return <Building className="w-4 h-4 text-blue-600" />;
    if (location?.includes('AGENT') || location?.includes('Agent')) return <Users className="w-4 h-4 text-green-600" />;
    if (location?.includes('REPAIR') || location?.includes('Repair')) return <Wrench className="w-4 h-4 text-orange-600" />;
    return <Package className="w-4 h-4 text-purple-600" />;
  };

  const getPriorityLevel = (request: any) => {
    if (request.requestType === "EMERGENCY_REQUEST") return "high";
    if (request.totalAmount && request.totalAmount > 1000000) return "high";
    if (request.itemQty && parseInt(request.itemQty) > 10) return "medium";
    return "low";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getRequestTypeDisplay = (requestType: string) => {
    switch (requestType) {
      case 'STOCK_REQUEST': return 'Stock Request';
      case 'TRANSFER': return 'Stock Transfer';
      case 'EMERGENCY_REQUEST': return 'Emergency Request';
      case 'REPLENISHMENT': return 'Replenishment';
      default: return requestType;
    }
  };

  const RequestCard = ({ request, showActions = false }: { request: any, showActions?: boolean }) => {
    const priority = getPriorityLevel(request);
    
    return (
      <Card className="mb-4 hover:shadow-lg transition-all duration-200 border-l-2 border-l-azam-blue">
        <CardContent className="p-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge className={`${getStatusColor(request.status)} border`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1 font-medium">{request.status?.toUpperCase()}</span>
                </Badge>
                <Badge className={`${getPriorityColor(priority)} border`}>
                  {priority.toUpperCase()} PRIORITY
                </Badge>
                <span className="text-sm text-gray-500 font-mono">#{request.requestId}</span>
              </div>
              <h3 className="font-semibold text-xl text-gray-900">{getRequestTypeDisplay(request.requestType)}</h3>
              <p className="text-sm text-gray-600 mb-1">{request.itemType}</p>
              <p className="text-xs text-gray-500">Module: {request.module}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">
                {request.createDt ? new Date(request.createDt).toLocaleDateString() : 'N/A'}
              </p>
              <p className="text-xs text-gray-500">
                {request.createDt ? new Date(request.createDt).toLocaleTimeString() : ''}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Quantity</p>
              <p className="font-semibold text-lg">{request.itemQty}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Total Value</p>
              <p className="font-semibold text-lg">{request.totalAmount ? `TSH ${(request.totalAmount / 1000).toFixed(0)}K` : 'N/A'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">SAP Order</p>
              <p className="font-mono text-sm">{request.sapSoId || 'Pending'}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Days Pending</p>
              <p className="font-semibold text-lg">
                {request.createDt ? Math.ceil((new Date().getTime() - new Date(request.createDt).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </p>
            </div>
          </div>

          {(request.transferFrom || request.transferTo) && (
            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              {request.transferFrom && (
                <div className="flex items-center text-sm font-medium">
                  {getLocationIcon(request.transferFrom)}
                  <span className="ml-2">{request.transferFrom}</span>
                </div>
              )}
              {request.transferFrom && request.transferTo && (
                <ArrowRight className="w-5 h-5 text-azam-blue" />
              )}
              {request.transferTo && (
                <div className="flex items-center text-sm font-medium">
                  {getLocationIcon(request.transferTo)}
                  <span className="ml-2">{request.transferTo}</span>
                </div>
              )}
            </div>
          )}

          {request.itemSerialNo && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2 font-medium">Serial Numbers</p>
              <div className="flex flex-wrap gap-2">
                {request.itemSerialNo.split(',').slice(0, 3).map((serial: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs font-mono bg-gray-50">
                    {serial.trim()}
                  </Badge>
                ))}
                {request.itemSerialNo.split(',').length > 3 && (
                  <Badge variant="outline" className="text-xs bg-gray-100">
                    +{request.itemSerialNo.split(',').length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex gap-3">
            <Button
              onClick={() => handleViewDetails(request)}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            {showActions && (request.status?.toLowerCase() === 'pending' || request.status?.toLowerCase() === 'in_transit') && (
              <>
                <Button
                  onClick={() => handleApprove(request)}
                  disabled={approveMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </Button>
                <Button
                  onClick={() => handleReject(request)}
                  disabled={rejectMutation.isPending}
                  variant="destructive"
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 w-full">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-azam-blue via-blue-700 to-blue-900 text-white p-3 md:p-3 rounded-xl shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Stock Approval Center</h1>
            <p className="text-blue-100 text-sm md:text-base">Review and approve inventory requests with advanced workflow management</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
              <Activity className="w-4 h-4 mr-1" />
              Real-time
            </Badge>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/20">
              <CheckSquare className="w-4 h-4 mr-1" />
              SAP Integration
            </Badge>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-yellow-600">{pendingRequests.length}</p>
                <p className="text-xs text-gray-500 mt-1">Requires action</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved Today</p>
                <p className="text-3xl font-bold text-green-600">{approvedRequests.length}</p>
                <p className="text-xs text-gray-500 mt-1">Processing</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{rejectedRequests.length}</p>
                <p className="text-xs text-gray-500 mt-1">Need revision</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Requests</p>
                <p className="text-3xl font-bold text-blue-600">{safeInventoryRequests.length}</p>
                <p className="text-xs text-gray-500 mt-1">All time</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Filters */}
        <div className="lg:col-span-3">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Filter className="w-5 h-5 mr-2 text-azam-blue" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="ID, item, module..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="module-filter">Module</Label>
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All modules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="OTC">OTC</SelectItem>
                      <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                      <SelectItem value="AGENT">Agent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date-filter">Date</Label>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/inventory-requests"] })}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button 
                    variant="outline"
                    className="flex-1"
                    onClick={exportToCsv}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          <Card className="shadow-lg">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <TabsList className="grid w-full grid-cols-3 h-12">
                    <TabsTrigger value="pending" className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pending ({pendingRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Approved ({approvedRequests.length})
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="flex items-center gap-2 text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Rejected ({rejectedRequests.length})
                    </TabsTrigger>
                  </TabsList>
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('cards')}>
                      <LayoutGrid className="w-4 h-4 mr-2" /> Cards
                    </Button>
                    <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('table')}>
                      <Rows className="w-4 h-4 mr-2" /> Table
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-4">
                <TabsContent value="pending" className="mt-0">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading pending requests...</p>
                    </div>
                  ) : viewMode === 'table' ? (
                    <DataTable
                      data={getCurrentTabRawData()}
                      columns={tableColumns as any}
                      searchableFields={["requestId","itemType","module"] as any}
                      onRowClick={(item: any) => handleViewDetails(item)}
                      actions={[
                        { label: 'View Details', onClick: (item) => handleViewDetails(item) },
                        { label: 'Approve', onClick: (item) => handleApprove(item) },
                        { label: 'Reject', onClick: (item) => handleReject(item), variant: 'destructive' },
                      ]}
                      emptyMessage={'No pending requests'}
                    />
                  ) : paginationData.data.length > 0 && activeTab === "pending" ? (
                    <div className="space-y-4">
                      {paginationData.data.map((request: any) => (
                        <RequestCard key={request.id} request={request} showActions={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckSquare className="w-10 h-10 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                      <p className="text-gray-600">No pending requests require your attention</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="approved" className="mt-0">
                  {viewMode === 'table' ? (
                    <DataTable
                      data={getCurrentTabRawData()}
                      columns={tableColumns as any}
                      searchableFields={["requestId","itemType","module"] as any}
                      onRowClick={(item: any) => handleViewDetails(item)}
                      actions={[
                        { label: 'View Details', onClick: (item) => handleViewDetails(item) },
                      ]}
                      emptyMessage={'No approved requests'}
                    />
                  ) : paginationData.data.length > 0 && activeTab === "approved" ? (
                    <div className="space-y-4">
                      {paginationData.data.map((request: any) => (
                        <RequestCard key={request.id} request={request} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Approved Requests</h3>
                      <p className="text-gray-600">Approved requests will appear here</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="rejected" className="mt-0">
                  {viewMode === 'table' ? (
                    <DataTable
                      data={getCurrentTabRawData()}
                      columns={tableColumns as any}
                      searchableFields={["requestId","itemType","module"] as any}
                      onRowClick={(item: any) => handleViewDetails(item)}
                      actions={[
                        { label: 'View Details', onClick: (item) => handleViewDetails(item) },
                      ]}
                      emptyMessage={'No rejected requests'}
                    />
                  ) : paginationData.data.length > 0 && activeTab === "rejected" ? (
                    <div className="space-y-4">
                      {paginationData.data.map((request: any) => (
                        <RequestCard key={request.id} request={request} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-10 h-10 text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rejected Requests</h3>
                      <p className="text-gray-600">Rejected requests will appear here</p>
                    </div>
                  )}
                </TabsContent>
                
                {/* Pagination Controls - cards view only */}
                {viewMode === 'cards' && paginationData.totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Items per page:</span>
                      <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="6">6</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="ml-4">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, paginationData.totalItems)} of {paginationData.totalItems} items
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, paginationData.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          if (paginationData.totalPages <= 5) {
                            return (
                              <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(pageNum)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNum}
                              </Button>
                            );
                          } else {
                            let displayPage = pageNum;
                            if (currentPage > 3) {
                              displayPage = currentPage - 2 + i;
                              if (displayPage > paginationData.totalPages) {
                                displayPage = paginationData.totalPages - (5 - i - 1);
                              }
                            }
                            return (
                              <Button
                                key={displayPage}
                                variant={currentPage === displayPage ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(displayPage)}
                                className="w-8 h-8 p-0"
                              >
                                {displayPage}
                              </Button>
                            );
                          }
                        })}
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === paginationData.totalPages}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(paginationData.totalPages)}
                        disabled={currentPage === paginationData.totalPages}
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>


      

      {/* Enhanced Rejection Modal */}
      <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-700">
              <XCircle className="w-5 h-5 mr-2" />
              Reject Request #{selectedRequest?.requestId}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Warning:</strong> This action will reject the stock request and notify the requestor.
              </p>
            </div>
            <div>
              <Label htmlFor="remarks">Rejection Remarks *</Label>
              <Textarea
                id="remarks"
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="Please provide a clear reason for rejection..."
                className="min-h-[120px] mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be sent to the requestor
              </p>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setRejectionModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectConfirm}
                disabled={rejectMutation.isPending || !rejectionRemarks.trim()}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Request'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Enhanced Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center text-azam-blue">
              <FileText className="w-5 h-5 mr-2" />
              Request Details #{selectedRequest?.requestId}
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div className={`p-4 rounded-lg border ${getStatusColor(selectedRequest.status)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedRequest.status)}
                    <span className="font-semibold text-lg">{selectedRequest.status?.toUpperCase()}</span>
                  </div>
                  <Badge className={getPriorityColor(getPriorityLevel(selectedRequest))}>
                    {getPriorityLevel(selectedRequest).toUpperCase()} PRIORITY
                  </Badge>
                </div>
              </div>

              {/* Request Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Request Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Request Type</p>
                        <p className="text-sm font-medium">{getRequestTypeDisplay(selectedRequest.requestType)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Module</p>
                        <p className="text-sm font-medium">{selectedRequest.module}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Item Type</p>
                        <p className="text-sm">{selectedRequest.itemType}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Quantity</p>
                        <p className="text-sm font-semibold">{selectedRequest.itemQty}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Financial Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Total Amount</p>
                        <p className="text-sm font-semibold">
                          {selectedRequest.totalAmount ? `TSH ${selectedRequest.totalAmount.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">VAT Amount</p>
                        <p className="text-sm">
                          {selectedRequest.vatAmount ? `TSH ${selectedRequest.vatAmount.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">SAP Order ID</p>
                        <p className="text-sm font-mono">{selectedRequest.sapSoId || 'Pending'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">BP ID</p>
                        <p className="text-sm font-mono">{selectedRequest.sapBpId || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Timeline */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {selectedRequest.createDt ? new Date(selectedRequest.createDt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    {selectedRequest.updateDt && (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {new Date(selectedRequest.updateDt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {selectedRequest.itemSerialNo && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Serial Numbers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedRequest.itemSerialNo.split(',').map((serial: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs font-mono bg-gray-50">
                          {serial.trim()}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {selectedRequest.reason && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">Request Reason</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-800">{selectedRequest.reason}</p>
                  </CardContent>
                </Card>
              )}
              
              {selectedRequest.rejectionRemarks && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-red-700">Rejection Remarks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-800">{selectedRequest.rejectionRemarks}</p>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                  Close Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}