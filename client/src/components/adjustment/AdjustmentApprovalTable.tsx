import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdjustmentApprovalTable() {
  const [selectedAdjustment, setSelectedAdjustment] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending adjustments
  const { data: pendingAdjustments, isLoading } = useQuery({
    queryKey: ['/api/adjustments/pending'],
    queryFn: async () => {
      const response = await fetch('/api/adjustments/pending');
      if (!response.ok) throw new Error('Failed to fetch pending adjustments');
      return response.json();
    }
  });

  // Approve adjustment mutation
  const approveMutation = useMutation({
    mutationFn: async (adjustmentId: number) => {
      const response = await fetch(`/api/adjustments/${adjustmentId}/approve`, {
        method: 'PATCH'
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to approve adjustment');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Adjustment Approved",
        description: "The adjustment has been approved and will be processed automatically."
      });
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Reject adjustment mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ adjustmentId, reason }: { adjustmentId: number; reason: string }) => {
      const response = await fetch(`/api/adjustments/${adjustmentId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason: reason })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to reject adjustment');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Adjustment Rejected",
        description: "The adjustment has been rejected."
      });
      setShowRejectDialog(false);
      setRejectionReason("");
      setSelectedAdjustment(null);
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments/stats'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive"
      });
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

  const getTypeColor = (type: string) => {
    return type === 'CREDIT' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const handleReject = () => {
    if (!selectedAdjustment || !rejectionReason.trim() || rejectionReason.length < 10) {
      toast({
        title: "Invalid Rejection",
        description: "Please provide a detailed rejection reason (minimum 10 characters)",
        variant: "destructive"
      });
      return;
    }
    
    rejectMutation.mutate({
      adjustmentId: selectedAdjustment.id,
      reason: rejectionReason
    });
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 animate-spin" />
              <span className="text-gray-600 dark:text-gray-400">Loading pending adjustments...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!pendingAdjustments?.length) {
    return (
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Pending Approvals</h3>
            <p className="text-gray-500 dark:text-gray-400">All adjustment requests have been processed.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Pending Approvals ({pendingAdjustments.length})
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Review and approve or reject pending adjustment requests
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
                  <TableHead>Wallet</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAdjustments.map((adjustment: any) => (
                  <TableRow key={adjustment.id}>
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
                      <Badge variant="outline">{adjustment.walletType}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={adjustment.reason}>
                        {adjustment.reason}
                      </div>
                    </TableCell>
                    <TableCell>{adjustment.requestedBy}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Adjustment Details</DialogTitle>
                              <DialogDescription>
                                Review the complete adjustment information before approval
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-4 py-4">
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
                              <div className="col-span-2">
                                <label className="text-sm font-medium">Reason</label>
                                <p className="text-sm text-gray-600">{adjustment.reason}</p>
                              </div>
                              {adjustment.comments && (
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Comments</label>
                                  <p className="text-sm text-gray-600">{adjustment.comments}</p>
                                </div>
                              )}
                              {adjustment.invoiceNumber && (
                                <div className="col-span-2">
                                  <label className="text-sm font-medium">Invoice Number</label>
                                  <p className="text-sm text-gray-600">{adjustment.invoiceNumber}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          size="sm"
                          onClick={() => approveMutation.mutate(adjustment.id)}
                          disabled={approveMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedAdjustment(adjustment);
                            setShowRejectDialog(true);
                          }}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Adjustment</DialogTitle>
            <DialogDescription>
              Please provide a detailed reason for rejecting this adjustment request.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason (minimum 10 characters)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || rejectionReason.length < 10}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Adjustment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}