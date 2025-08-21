import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, CheckCircle, XCircle, FileText, User, MapPin, Hash, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PageHeader from "@/components/layout/page-header";

export default function KYCVerification() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [remarks, setRemarks] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingAgents, isLoading } = useQuery<{success: boolean; data: any[]}>({
    queryKey: ["/api/kyc/pending", searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      return await apiRequest("GET", `/api/kyc/pending?${params}`);
    }
  });

  const approveMutation = useMutation({
    mutationFn: async ({ id, remarks }: { id: number; remarks: string }) => {
      return await apiRequest("POST", `/api/kyc/approve/${id}`, {
        remarks,
        approvedBy: 'kyc@azamtv.co.tz'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agents"] });
      toast({
        title: "Agent Approved",
        description: "Agent KYC has been approved and SAP Business Partner created successfully",
      });
      setShowApprovalDialog(false);
      setSelectedAgent(null);
      setRemarks("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve agent KYC",
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, remarks }: { id: number; remarks: string }) => {
      return await apiRequest("POST", `/api/kyc/reject/${id}`, {
        remarks,
        rejectedBy: 'kyc@azamtv.co.tz'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc/pending"] });
      toast({
        title: "Agent Rejected",
        description: "Agent KYC has been rejected. Agent will be notified to resubmit documents.",
      });
      setShowRejectionDialog(false);
      setSelectedAgent(null);
      setRemarks("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject agent KYC",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="KYC Verification"
        subtitle="Review and approve agent KYC documents"
        icon={<FileText className="h-6 w-6" />}
      />

      {/* Search and Stats */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or reference number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="text-sm">
            <Clock className="h-4 w-4 mr-1" />
            Pending: {pendingAgents?.data?.length || 0}
          </Badge>
        </div>
      </div>

      {/* Pending Agents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending KYC Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading pending agents...</div>
          ) : !pendingAgents?.data?.length ? (
            <div className="text-center py-8 text-gray-500">
              No pending KYC verifications found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference No.</TableHead>
                    <TableHead>Agent Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAgents.data.map((agent: any) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-mono text-sm">
                        {agent.onboardingRefNo}
                      </TableCell>
                      <TableCell className="font-medium">
                        {agent.firstName} {agent.lastName}
                      </TableCell>
                      <TableCell>{agent.email}</TableCell>
                      <TableCell>{agent.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{agent.type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(agent.createdAt || new Date())}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAgent(agent)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Agent KYC Review - {agent.firstName} {agent.lastName}</DialogTitle>
                              </DialogHeader>
                              {selectedAgent && (
                                <div className="space-y-6">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                          <User className="h-4 w-4 mr-2" />
                                          Personal Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                          <p><strong>Name:</strong> {selectedAgent.title} {selectedAgent.firstName} {selectedAgent.lastName}</p>
                                          <p><strong>Email:</strong> {selectedAgent.email}</p>
                                          <p><strong>Phone:</strong> {selectedAgent.phone}</p>
                                          <p><strong>Mobile:</strong> {selectedAgent.mobile}</p>
                                          <p><strong>Type:</strong> {selectedAgent.type}</p>
                                          <p><strong>Role:</strong> {selectedAgent.role}</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                          <MapPin className="h-4 w-4 mr-2" />
                                          Address Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                          <p><strong>Country:</strong> {selectedAgent.country}</p>
                                          <p><strong>Region:</strong> {selectedAgent.region}</p>
                                          <p><strong>City:</strong> {selectedAgent.city}</p>
                                          <p><strong>District:</strong> {selectedAgent.district}</p>
                                          <p><strong>Ward:</strong> {selectedAgent.ward}</p>
                                          <p><strong>Address:</strong> {selectedAgent.address1}</p>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <div>
                                        <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                          <Hash className="h-4 w-4 mr-2" />
                                          Tax & Financial Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                          <p><strong>TIN Number:</strong> {selectedAgent.tinNumber}</p>
                                          <p><strong>VRN Number:</strong> {selectedAgent.vrnNumber || "Not provided"}</p>
                                          <p><strong>Currency:</strong> {selectedAgent.currency}</p>
                                          <p><strong>Commission Rate:</strong> {selectedAgent.commission}%</p>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <h3 className="font-semibold text-gray-900 mb-2">KYC Documents</h3>
                                        <div className="space-y-2 text-sm">
                                          <p><strong>KYC Document ID:</strong> {selectedAgent.kycDocId || "Not provided"}</p>
                                          <p><strong>KYC Document Number:</strong> {selectedAgent.kycDocNo || "Not provided"}</p>
                                          <p><strong>Submission Date:</strong> {formatDate(selectedAgent.createdAt || new Date())}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setShowRejectionDialog(true);
                                        setSelectedAgent(agent);
                                      }}
                                      className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                      <XCircle className="h-4 w-4 mr-2" />
                                      Reject KYC
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setShowApprovalDialog(true);
                                        setSelectedAgent(agent);
                                      }}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Approve KYC
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Agent KYC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to approve the KYC for <strong>{selectedAgent?.firstName} {selectedAgent?.lastName}</strong>?
              This will create a SAP Business Partner and activate the agent account.
            </p>
            <div>
              <Label htmlFor="approval-remarks">Approval Remarks (Optional)</Label>
              <Textarea
                id="approval-remarks"
                placeholder="Add any remarks about the approval..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedAgent) {
                    approveMutation.mutate({ id: selectedAgent.id, remarks });
                  }
                }}
                disabled={approveMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {approveMutation.isPending ? "Approving..." : "Approve KYC"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Agent KYC</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to reject the KYC for <strong>{selectedAgent?.firstName} {selectedAgent?.lastName}</strong>?
              The agent will be notified and will need to resubmit their documents.
            </p>
            <div>
              <Label htmlFor="rejection-remarks">Rejection Remarks <span className="text-red-500">*</span></Label>
              <Textarea
                id="rejection-remarks"
                placeholder="Please provide detailed reasons for rejection..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowRejectionDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedAgent && remarks.trim()) {
                    rejectMutation.mutate({ id: selectedAgent.id, remarks });
                  }
                }}
                disabled={rejectMutation.isPending || !remarks.trim()}
                variant="destructive"
              >
                {rejectMutation.isPending ? "Rejecting..." : "Reject KYC"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}