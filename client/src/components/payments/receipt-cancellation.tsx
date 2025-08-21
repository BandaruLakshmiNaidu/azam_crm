import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Search, X, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";

interface Receipt {
  payId: string;
  customerName: string;
  payType: string;
  totalAmount: number;
  payMode: string;
  status: string;
  receiptNo: string;
  createDt: string;
  description: string;
}

interface CancellationRequest {
  payId: string;
  cancellationReason: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

interface ReceiptDetails {
  payId: string;
  customerName: string;
  payType: string;
  totalAmount: number;
  payMode: string;
  status: string;
  receiptNo: string;
  createDt: string;
  description: string;
  cancellationEligibility?: {
    eligible: boolean;
    reason?: string;
  };
}

export default function ReceiptCancellationPage() {
  const [searchFilters, setSearchFilters] = useState({
    dateFrom: "",
    dateTo: "",
    customerId: "",
    agentId: "",
    paymentMode: "",
    page: 1,
    limit: 20
  });
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [showCancellationForm, setShowCancellationForm] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch eligible receipts
  const {
    data: receiptsData,
    isLoading: receiptsLoading,
    refetch: refetchReceipts
  } = useQuery<ApiResponse<Receipt[]>>({
    queryKey: ["/api/receipt-cancellation/eligible", searchFilters],
    enabled: false // Only fetch when user searches
  });

  // Fetch receipt details
  const {
    data: receiptDetails,
    isLoading: detailsLoading
  } = useQuery<ApiResponse<ReceiptDetails>>({
    queryKey: ["/api/receipt-cancellation", selectedReceipt?.payId],
    enabled: !!selectedReceipt?.payId
  });

  // Cancel receipt mutation
  const cancelReceiptMutation = useMutation({
    mutationFn: async (data: CancellationRequest) => {
      return await apiRequest("POST", "/api/receipt-cancellation/cancel", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Receipt cancellation initiated successfully"
      });
      setShowCancellationForm(false);
      setSelectedReceipt(null);
      setCancellationReason("");
      refetchReceipts();
      queryClient.invalidateQueries({ queryKey: ["/api/receipt-cancellation"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error", 
        description: error.message || "Failed to cancel receipt",
        variant: "destructive"
      });
    }
  });

  const handleSearch = () => {
    refetchReceipts();
  };

  const handleSelectReceipt = (receipt: Receipt) => {
    setSelectedReceipt(receipt);
    setShowCancellationForm(false);
  };

  const handleCancelReceipt = () => {
    if (!selectedReceipt || !cancellationReason.trim()) {
      toast({
        title: "Error",
        description: "Please provide a cancellation reason",
        variant: "destructive"
      });
      return;
    }

    cancelReceiptMutation.mutate({
      payId: selectedReceipt.payId,
      cancellationReason: cancellationReason.trim()
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TSH',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Receipt Cancellation</h1>
          <p className="text-muted-foreground">Search and cancel eligible payment receipts</p>
        </div>
      </div>

      {/* Search Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Eligible Receipts
          </CardTitle>
          <CardDescription>
            Only receipts eligible for cancellation will be shown (within FI period)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={searchFilters.dateFrom}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={searchFilters.dateTo}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="customerId">Customer ID</Label>
              <Input
                id="customerId"
                placeholder="Enter customer ID"
                value={searchFilters.customerId}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, customerId: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="agentId">Agent ID</Label>
              <Input
                id="agentId"
                placeholder="Enter agent ID"
                value={searchFilters.agentId}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, agentId: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="paymentMode">Payment Mode</Label>
              <Input
                id="paymentMode"
                placeholder="e.g., CASH, MOBILE_MONEY"
                value={searchFilters.paymentMode}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, paymentMode: e.target.value }))}
              />
            </div>
          </div>
          <Button onClick={handleSearch} disabled={receiptsLoading}>
            {receiptsLoading ? <Clock className="h-4 w-4 mr-2" /> : <Search className="h-4 w-4 mr-2" />}
            Search Receipts
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {receiptsData && (
        <Card>
          <CardHeader>
            <CardTitle>Eligible Receipts ({receiptsData.data?.length || 0})</CardTitle>
            <CardDescription>Click on a receipt to view details and initiate cancellation</CardDescription>
          </CardHeader>
          <CardContent>
            {receiptsData.data?.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Results</AlertTitle>
                <AlertDescription>
                  No eligible receipts found matching your search criteria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {receiptsData.data?.map((receipt: Receipt) => (
                  <div
                    key={receipt.payId}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      selectedReceipt?.payId === receipt.payId ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200' : ''
                    }`}
                    onClick={() => handleSelectReceipt(receipt)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{receipt.payId}</span>
                          {getStatusBadge(receipt.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {receipt.customerName} • {receipt.payType}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {receipt.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(receipt.totalAmount)}</p>
                        <p className="text-sm text-muted-foreground">{receipt.payMode}</p>
                        <p className="text-sm text-muted-foreground">{formatDate(receipt.createDt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Receipt Details */}
      {selectedReceipt && receiptDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Receipt Details
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedReceipt(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {receiptDetails.data?.cancellationEligibility?.eligible ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Eligible for Cancellation</AlertTitle>
                <AlertDescription>
                  This receipt can be cancelled as it's within the FI period.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Not Eligible for Cancellation</AlertTitle>
                <AlertDescription>
                  {receiptDetails.data?.cancellationEligibility?.reason}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Payment ID</Label>
                <p className="font-medium">{receiptDetails.data?.payId}</p>
              </div>
              <div>
                <Label>Customer</Label>
                <p className="font-medium">{receiptDetails.data?.customerName}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p className="font-medium">{formatCurrency(receiptDetails.data?.totalAmount)}</p>
              </div>
              <div>
                <Label>Payment Mode</Label>
                <p className="font-medium">{receiptDetails.data?.payMode}</p>
              </div>
              <div>
                <Label>Receipt Number</Label>
                <p className="font-medium">{receiptDetails.data?.receiptNo}</p>
              </div>
              <div>
                <Label>Status</Label>
                {getStatusBadge(receiptDetails.data?.status)}
              </div>
            </div>

            {receiptDetails.data?.cancellationEligibility?.eligible && (
              <div className="pt-4 border-t">
                {!showCancellationForm ? (
                  <Button onClick={() => setShowCancellationForm(true)} variant="destructive">
                    Cancel Receipt
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cancellationReason">Cancellation Reason *</Label>
                      <Textarea
                        id="cancellationReason"
                        placeholder="Please provide a detailed reason for cancellation..."
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCancelReceipt}
                        variant="destructive"
                        disabled={cancelReceiptMutation.isPending || !cancellationReason.trim()}
                      >
                        {cancelReceiptMutation.isPending ? (
                          <Clock className="h-4 w-4 mr-2" />
                        ) : null}
                        Confirm Cancellation
                      </Button>
                      <Button
                        onClick={() => {
                          setShowCancellationForm(false);
                          setCancellationReason("");
                        }}
                        variant="outline"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}