import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Repeat, 
  Package, 
  User, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Settings,
  FileText,
  CheckSquare,
  ArrowRight,
  Wrench
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AgentReplacement } from "@shared/schema";

export default function AgentReplacementPage() {
  const [selectedTab, setSelectedTab] = useState("create");
  const [searchSerial, setSearchSerial] = useState("");
  const [replacementData, setReplacementData] = useState<Partial<AgentReplacement>>({
    requestType: "AGENT_REPLACEMENT",
    itemQty: "1",
    status: "PENDING",
    cmStatus: "PENDING",
    vatAmount: 0,
  });

  const queryClient = useQueryClient();

  const { data: replacements, isLoading } = useQuery<AgentReplacement[]>({
    queryKey: ["/api/agent-replacements"],
  });

  const { data: agents } = useQuery<any[]>({
    queryKey: ["/api/agents"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<AgentReplacement>) => apiRequest("/api/agent-replacements", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-replacements"] });
      toast({
        title: "Success",
        description: "Agent replacement request created successfully",
      });
      setReplacementData({
        requestType: "AGENT_REPLACEMENT",
        itemQty: "1",
        status: "PENDING",
        cmStatus: "PENDING",
        vatAmount: 0,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create agent replacement request",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AgentReplacement> }) =>
      apiRequest(`/api/agent-replacements/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-replacements"] });
      toast({
        title: "Success",
        description: "Agent replacement request updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update agent replacement request",
        variant: "destructive",
      });
    },
  });

  const materialTypes = [
    { code: "STB001", name: "HD Set-Top Box", price: 50000, type: "STB" },
    { code: "STB002", name: "4K Set-Top Box", price: 75000, type: "STB" },
    { code: "SC001", name: "Smart Card Basic", price: 25000, type: "SMART_CARD" },
    { code: "SC002", name: "Smart Card Premium", price: 35000, type: "SMART_CARD" },
    { code: "CBL001", name: "HDMI Cable", price: 15000, type: "CABLE" },
    { code: "RMT001", name: "Remote Control", price: 10000, type: "REMOTE" }
  ];

  const replacementCenters = [
    { id: "REPAIR_CENTER_DAR", name: "Repair Center - Dar es Salaam" },
    { id: "REPAIR_CENTER_MWANZA", name: "Repair Center - Mwanza" },
    { id: "REPAIR_CENTER_ARUSHA", name: "Repair Center - Arusha" },
    { id: "REPAIR_CENTER_DODOMA", name: "Repair Center - Dodoma" },
    { id: "REPAIR_CENTER_MBEYA", name: "Repair Center - Mbeya" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementData.itemType || !replacementData.itemSerialNo || !replacementData.sapBpId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const selectedMaterial = materialTypes.find(m => m.code === replacementData.itemType);
    if (selectedMaterial) {
      const itemAmount = selectedMaterial.price;
      const vatAmount = itemAmount * 0.18; // 18% VAT
      const totalAmount = itemAmount + vatAmount;

      const submissionData = {
        ...replacementData,
        requestId: `REP${Date.now().toString().slice(-6)}`,
        itemAmount,
        totalAmount,
        vatAmount,
        createId: "current_user",
        transferFrom: replacementData.replacementCenter || "REPAIR_CENTER_DAR",
        transferTo: replacementData.sapBpId || "AGENT_001",
      };

      createMutation.mutate(submissionData);
    }
  };

  const handleApprove = (id: number) => {
    updateMutation.mutate({
      id,
      data: {
        status: "APPROVED",
        cmStatus: "APPROVED",
        cmStatusMsg: "Approved by center executive",
        centerExecutive: "current_user",
        approvedBy: "current_user",
      },
    });
  };

  const handleReject = (id: number) => {
    updateMutation.mutate({
      id,
      data: {
        status: "REJECTED",
        cmStatus: "REJECTED",
        cmStatusMsg: "Rejected by center executive",
        centerExecutive: "current_user",
      },
    });
  };

  const handleComplete = (id: number) => {
    updateMutation.mutate({
      id,
      data: {
        status: "COMPLETED",
        cmStatus: "COMPLETED",
        cmStatusMsg: "Replacement completed successfully",
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case "APPROVED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><CheckSquare className="w-3 h-3 mr-1" />Completed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><AlertTriangle className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  const filteredReplacements = replacements?.filter(replacement => {
    if (!searchSerial) return true;
    return replacement.itemSerialNo.toLowerCase().includes(searchSerial.toLowerCase()) ||
           replacement.requestId.toLowerCase().includes(searchSerial.toLowerCase()) ||
           replacement.agentName?.toLowerCase().includes(searchSerial.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agent replacements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Repeat className="w-5 h-5 text-azam-blue" />
          <h1 className="text-xl font-semibold text-gray-900">Agent Replacement</h1>
        </div>
        <p className="text-sm text-gray-600">
          Process agent equipment replacement requests for faulty hardware
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Create Request
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approved
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                New Agent Replacement Request
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sapBpId">Agent Business Partner ID *</Label>
                    <Input
                      id="sapBpId"
                      value={replacementData.sapBpId || ""}
                      onChange={(e) => setReplacementData({...replacementData, sapBpId: e.target.value})}
                      placeholder="Enter SAP BP ID"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sapCaId">Contract Account ID *</Label>
                    <Input
                      id="sapCaId"
                      value={replacementData.sapCaId || ""}
                      onChange={(e) => setReplacementData({...replacementData, sapCaId: e.target.value})}
                      placeholder="Enter SAP CA ID"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemType">Material Type *</Label>
                    <Select
                      value={replacementData.itemType || ""}
                      onValueChange={(value) => {
                        const selectedMaterial = materialTypes.find(m => m.code === value);
                        setReplacementData({
                          ...replacementData,
                          itemType: value,
                          itemAmount: selectedMaterial?.price || 0,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select material type" />
                      </SelectTrigger>
                      <SelectContent>
                        {materialTypes.map(material => (
                          <SelectItem key={material.code} value={material.code}>
                            {material.name} - {material.price.toLocaleString()} TSH
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="itemSerialNo">Serial Number *</Label>
                    <Input
                      id="itemSerialNo"
                      value={replacementData.itemSerialNo || ""}
                      onChange={(e) => setReplacementData({...replacementData, itemSerialNo: e.target.value})}
                      placeholder="Enter faulty device serial number"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="replacementCenter">Replacement Center *</Label>
                    <Select
                      value={replacementData.replacementCenter || ""}
                      onValueChange={(value) => setReplacementData({...replacementData, replacementCenter: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select replacement center" />
                      </SelectTrigger>
                      <SelectContent>
                        {replacementCenters.map(center => (
                          <SelectItem key={center.id} value={center.id}>
                            {center.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="agentName">Agent Name</Label>
                    <Input
                      id="agentName"
                      value={replacementData.agentName || ""}
                      onChange={(e) => setReplacementData({...replacementData, agentName: e.target.value})}
                      placeholder="Enter agent name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="faultyReason">Faulty Reason *</Label>
                  <Textarea
                    id="faultyReason"
                    value={replacementData.faultyReason || ""}
                    onChange={(e) => setReplacementData({...replacementData, faultyReason: e.target.value})}
                    placeholder="Describe the hardware issue"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="replacementNotes">Additional Notes</Label>
                  <Textarea
                    id="replacementNotes"
                    value={replacementData.replacementNotes || ""}
                    onChange={(e) => setReplacementData({...replacementData, replacementNotes: e.target.value})}
                    placeholder="Any additional notes about the replacement"
                    rows={2}
                  />
                </div>

                {replacementData.itemAmount && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">Cost Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Item Amount:</span>
                        <span>{replacementData.itemAmount.toLocaleString()} TSH</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (18%):</span>
                        <span>{(replacementData.itemAmount * 0.18).toLocaleString()} TSH</span>
                      </div>
                      <Separator className="my-1" />
                      <div className="flex justify-between font-medium">
                        <span>Total Amount:</span>
                        <span>{(replacementData.itemAmount * 1.18).toLocaleString()} TSH</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setReplacementData({
                    requestType: "AGENT_REPLACEMENT",
                    itemQty: "1",
                    status: "PENDING",
                    cmStatus: "PENDING",
                    vatAmount: 0,
                  })}>
                    Reset
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Request"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Replacement Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by serial number, request ID, or agent name"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-3">
                  {filteredReplacements?.filter(r => r.status === "PENDING").map((replacement) => (
                    <div key={replacement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{replacement.requestId}</span>
                            {getStatusBadge(replacement.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Agent:</span> {replacement.agentName}
                            </div>
                            <div>
                              <span className="text-gray-600">Item:</span> {replacement.itemType}
                            </div>
                            <div>
                              <span className="text-gray-600">Serial:</span> {replacement.itemSerialNo}
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span> {replacement.totalAmount.toLocaleString()} TSH
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Reason:</span> {replacement.faultyReason}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApprove(replacement.id)}
                            disabled={updateMutation.isPending}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(replacement.id)}
                            disabled={updateMutation.isPending}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredReplacements?.filter(r => r.status === "PENDING").length === 0 && (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending replacement requests found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Approved Replacement Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by serial number, request ID, or agent name"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-3">
                  {filteredReplacements?.filter(r => r.status === "APPROVED").map((replacement) => (
                    <div key={replacement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{replacement.requestId}</span>
                            {getStatusBadge(replacement.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Agent:</span> {replacement.agentName}
                            </div>
                            <div>
                              <span className="text-gray-600">Item:</span> {replacement.itemType}
                            </div>
                            <div>
                              <span className="text-gray-600">Serial:</span> {replacement.itemSerialNo}
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span> {replacement.totalAmount.toLocaleString()} TSH
                            </div>
                            <div>
                              <span className="text-gray-600">Approved By:</span> {replacement.centerExecutive}
                            </div>
                            <div>
                              <span className="text-gray-600">Approved:</span> {replacement.approvedDate ? new Date(replacement.approvedDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Reason:</span> {replacement.faultyReason}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleComplete(replacement.id)}
                            disabled={updateMutation.isPending}
                          >
                            <CheckSquare className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredReplacements?.filter(r => r.status === "APPROVED").length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No approved replacement requests found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Replacement History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by serial number, request ID, or agent name"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-3">
                  {filteredReplacements?.map((replacement) => (
                    <div key={replacement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{replacement.requestId}</span>
                            {getStatusBadge(replacement.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Agent:</span> {replacement.agentName}
                            </div>
                            <div>
                              <span className="text-gray-600">Item:</span> {replacement.itemType}
                            </div>
                            <div>
                              <span className="text-gray-600">Serial:</span> {replacement.itemSerialNo}
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span> {replacement.totalAmount.toLocaleString()} TSH
                            </div>
                            <div>
                              <span className="text-gray-600">Created:</span> {new Date(replacement.createDt).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="text-gray-600">Center:</span> {replacement.replacementCenter}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Reason:</span> {replacement.faultyReason}
                          </div>
                          {replacement.replacementNotes && (
                            <div className="text-sm">
                              <span className="text-gray-600">Notes:</span> {replacement.replacementNotes}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{replacement.cmStatus}</div>
                          {replacement.cmStatusMsg && (
                            <div className="text-xs">{replacement.cmStatusMsg}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredReplacements?.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No replacement requests found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}