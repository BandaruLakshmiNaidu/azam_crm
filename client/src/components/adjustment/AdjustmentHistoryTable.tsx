import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Clock, Eye, Search, Filter, Calendar, AlertCircle, Loader2 } from "lucide-react";

export default function AdjustmentHistoryTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Fetch all adjustments
  const { data: adjustments, isLoading } = useQuery({
    queryKey: ['/api/adjustments'],
    queryFn: async () => {
      const response = await fetch('/api/adjustments');
      if (!response.ok) throw new Error('Failed to fetch adjustments');
      return response.json();
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-TZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800';
      case 'PROCESSED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'CREDIT' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-3 w-3" />;
      case 'APPROVED':
        return <CheckCircle className="h-3 w-3" />;
      case 'PROCESSED':
        return <CheckCircle className="h-3 w-3" />;
      case 'REJECTED':
        return <XCircle className="h-3 w-3" />;
      default:
        return <AlertCircle className="h-3 w-3" />;
    }
  };

  // Filter adjustments based on search and filters
  const filteredAdjustments = adjustments?.filter((adjustment: any) => {
    const matchesSearch = 
      adjustment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.bpId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || adjustment.status === statusFilter;
    const matchesType = typeFilter === "ALL" || adjustment.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  }) || [];

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Loading adjustment history...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Filter className="h-5 w-5 text-blue-600" />
            Filter & Search
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Filter adjustments by status, type, or search by customer details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customer, BP ID, or reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="PROCESSED">Processed</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
                <SelectItem value="DEBIT">Debit</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("ALL");
                setTypeFilter("ALL");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredAdjustments.length} of {adjustments?.length || 0} adjustments
        </p>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Adjustment History</CardTitle>
          <CardDescription>
            Complete history of all adjustment requests and their current status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>BP ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CM Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdjustments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No adjustments found matching your criteria</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAdjustments.map((adjustment: any) => (
                    <TableRow key={adjustment.id} className="hover:bg-gray-50">
                      <TableCell className="text-sm">
                        {formatDate(adjustment.requestedAt)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {adjustment.customerName}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {adjustment.bpId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeColor(adjustment.type)}>
                          {adjustment.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        {formatCurrency(adjustment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(adjustment.status)}>
                          {getStatusIcon(adjustment.status)}
                          <span className="ml-1">{adjustment.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {adjustment.cmStatus ? (
                          <Badge variant="outline" className="text-xs">
                            {adjustment.cmStatus}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>{adjustment.requestedBy}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Adjustment Details</DialogTitle>
                              <DialogDescription>
                                Complete information for adjustment #{adjustment.id}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                              {/* Basic Information */}
                              <div>
                                <h4 className="font-semibold mb-3">Basic Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Customer Name</label>
                                    <p className="text-sm text-gray-600">{adjustment.customerName}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">BP ID</label>
                                    <p className="text-sm text-gray-600">{adjustment.bpId}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Type</label>
                                    <Badge className={getTypeColor(adjustment.type)}>
                                      {adjustment.type}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Amount</label>
                                    <p className="text-sm text-gray-600 font-mono">
                                      {formatCurrency(adjustment.amount)}
                                    </p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Wallet Type</label>
                                    <p className="text-sm text-gray-600">{adjustment.walletType}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">VAT Type</label>
                                    <p className="text-sm text-gray-600">{adjustment.vatType}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Request Details */}
                              <div>
                                <h4 className="font-semibold mb-3">Request Details</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm font-medium">Reason</label>
                                    <p className="text-sm text-gray-600">{adjustment.reason}</p>
                                  </div>
                                  {adjustment.comments && (
                                    <div>
                                      <label className="text-sm font-medium">Comments</label>
                                      <p className="text-sm text-gray-600">{adjustment.comments}</p>
                                    </div>
                                  )}
                                  {adjustment.invoiceNumber && (
                                    <div>
                                      <label className="text-sm font-medium">Invoice Number</label>
                                      <p className="text-sm text-gray-600">{adjustment.invoiceNumber}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Status Timeline */}
                              <div>
                                <h4 className="font-semibold mb-3">Status Timeline</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">Requested by {adjustment.requestedBy} on {formatDate(adjustment.requestedAt)}</span>
                                  </div>
                                  
                                  {adjustment.approvedBy && (
                                    <div className="flex items-center gap-3">
                                      <CheckCircle className="h-4 w-4 text-blue-600" />
                                      <span className="text-sm">Approved by {adjustment.approvedBy} on {formatDate(adjustment.approvedAt)}</span>
                                    </div>
                                  )}
                                  
                                  {adjustment.rejectedBy && (
                                    <div className="flex items-center gap-3">
                                      <XCircle className="h-4 w-4 text-red-600" />
                                      <span className="text-sm">Rejected by {adjustment.rejectedBy} on {formatDate(adjustment.rejectedAt)}</span>
                                      {adjustment.rejectionReason && (
                                        <div className="ml-6 mt-1">
                                          <p className="text-xs text-red-600">Reason: {adjustment.rejectionReason}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  
                                  {adjustment.processedAt && (
                                    <div className="flex items-center gap-3">
                                      <CheckCircle className="h-4 w-4 text-green-600" />
                                      <span className="text-sm">Processed on {formatDate(adjustment.processedAt)}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Integration Status */}
                              {(adjustment.cmStatus || adjustment.ficaStatus) && (
                                <div>
                                  <h4 className="font-semibold mb-3">Integration Status</h4>
                                  <div className="grid grid-cols-2 gap-4">
                                    {adjustment.cmStatus && (
                                      <div>
                                        <label className="text-sm font-medium">CM Status</label>
                                        <p className="text-sm text-gray-600">{adjustment.cmStatus}</p>
                                        {adjustment.cmStatusMessage && (
                                          <p className="text-xs text-gray-500">{adjustment.cmStatusMessage}</p>
                                        )}
                                      </div>
                                    )}
                                    {adjustment.ficaStatus && (
                                      <div>
                                        <label className="text-sm font-medium">FICA Status</label>
                                        <p className="text-sm text-gray-600">{adjustment.ficaStatus}</p>
                                        {adjustment.ficaStatusMessage && (
                                          <p className="text-xs text-gray-500">{adjustment.ficaStatusMessage}</p>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}