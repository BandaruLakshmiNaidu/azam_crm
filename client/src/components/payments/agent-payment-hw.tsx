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
  CreditCard, 
  Package, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Receipt,
  DollarSign,
  Building,
  User,
  Phone,
  Calendar,
  FileText,
  Trash2,
  Edit,
  Eye,
  Plus,
  Minus,
  Search
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AgentHardwarePayment } from "@shared/schema";

export default function AgentPaymentHWPage() {
  const [selectedTab, setSelectedTab] = useState("new-payment");
  const [searchTerm, setSearchTerm] = useState("");
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<AgentHardwarePayment | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hardwareItems, setHardwareItems] = useState([
    { materialCode: "", materialName: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
  ]);
  const [paymentData, setPaymentData] = useState({
    sapBpId: "",
    sapCaId: "",
    name: "",
    payAmount: 0,
    vatAmount: 0,
    payMode: "",
    chequeNo: "",
    bankName: "",
    currency: "TSH",
    description: "",
    salesOrg: "1000",
    division: "10",
    collectedBy: "",
    collectionCenter: "",
    createId: "current_user",
  });
  
  // Mock user role for demonstration (in production, get from auth context)
  const [currentUserRole] = useState("agent"); // Can be: agent, finance, admin
  
  // Helper function to check if payment can be cancelled
  const canCancelPayment = (payment: AgentHardwarePayment): { canCancel: boolean; reason?: string } => {
    if (payment.status === "COMPLETED") {
      return { canCancel: false, reason: "Cannot cancel completed payments" };
    }
    
    if (payment.status === "CANCELLED") {
      return { canCancel: false, reason: "Payment is already cancelled" };
    }
    
    const paymentAge = Date.now() - new Date(payment.createDt).getTime();
    const maxCancelTimeMs = 72 * 60 * 60 * 1000; // 72 hours
    
    // Time-based restriction
    if (paymentAge > maxCancelTimeMs && currentUserRole !== "finance") {
      return { canCancel: false, reason: "Cancellation period expired. Contact finance team." };
    }
    
    // Role-based restriction for specific payment modes
    if ((payment.payMode === "CHEQUE" || payment.payMode === "BANK_DEPOSIT") && currentUserRole !== "finance") {
      return { canCancel: false, reason: "Finance approval required for this payment type" };
    }
    
    return { canCancel: true };
  };

  const queryClient = useQueryClient();

  const { data: payments, isLoading: paymentsLoading } = useQuery<AgentHardwarePayment[]>({
    queryKey: ["/api/agent-hardware-payments"],
  });

  const { data: agentsResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/agents"],
  });

  const { data: hardwareItemsResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ["/api/hardware-items"],
  });

  const agents = agentsResponse?.data || [];
  const availableHardwareItems = hardwareItemsResponse?.data || [];

  const createPaymentMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/agent-hardware-payments", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-hardware-payments"] });
      toast({
        title: "Success",
        description: "Agent hardware payment created successfully",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create agent hardware payment",
        variant: "destructive",
      });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/agent-hardware-payments/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-hardware-payments"] });
      toast({
        title: "Success",
        description: "Payment status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    },
  });

  const cancelPaymentMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      apiRequest(`/api/agent-hardware-payments/${id}`, "DELETE", { reason, userRole: currentUserRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-hardware-payments"] });
      toast({
        title: "Success",
        description: "Payment cancelled successfully",
      });
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || "Failed to cancel payment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const paymentModes = [
    { value: "CASH", label: "Cash" },
    { value: "CHEQUE", label: "Cheque" },
    { value: "BANK_DEPOSIT", label: "Bank Deposit" },
    { value: "POS", label: "POS" },
    { value: "MOBILE_MONEY", label: "Mobile Money" },
  ];

  const collectionCenters = [
    { value: "Main Warehouse - Dar es Salaam", label: "Main Warehouse - Dar es Salaam" },
    { value: "Main Warehouse - Mwanza", label: "Main Warehouse - Mwanza" },
    { value: "Main Warehouse - Arusha", label: "Main Warehouse - Arusha" },
    { value: "Main Warehouse - Dodoma", label: "Main Warehouse - Dodoma" },
    { value: "Main Warehouse - Mbeya", label: "Main Warehouse - Mbeya" },
  ];

  const currencies = [
    { value: "TSH", label: "TSH - Tanzanian Shilling" },
    { value: "USD", label: "USD - US Dollar" },
    { value: "ZIG", label: "ZIG - Zimbabwean Gold" },
  ];

  const resetForm = () => {
    setPaymentData({
      sapBpId: "",
      sapCaId: "",
      name: "",
      payAmount: 0,
      vatAmount: 0,
      payMode: "",
      chequeNo: "",
      bankName: "",
      currency: "TSH",
      description: "",
      salesOrg: "1000",
      division: "10",
      collectedBy: "",
      collectionCenter: "",
      createId: "current_user",
    });
    setHardwareItems([
      { materialCode: "", materialName: "", quantity: 1, unitPrice: 0, totalPrice: 0 }
    ]);
    setSelectedPayment(null);
    setIsEditing(false);
  };

  const handleAgentSelect = (agentId: string) => {
    const agent = agents?.find(a => a.sapBpId === agentId);
    if (agent) {
      setPaymentData(prev => ({
        ...prev,
        sapBpId: agent.sapBpId,
        sapCaId: agent.sapCaId || `CA_${agent.sapBpId}`,
        name: `${agent.firstName} ${agent.lastName}`,
      }));
    }
  };

  const addHardwareItem = () => {
    setHardwareItems([...hardwareItems, { materialCode: "", materialName: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]);
  };

  const removeHardwareItem = (index: number) => {
    if (hardwareItems.length > 1) {
      setHardwareItems(hardwareItems.filter((_, i) => i !== index));
    }
  };

  const updateHardwareItem = (index: number, field: string, value: any) => {
    const updatedItems = [...hardwareItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-populate material data when material code is selected
    if (field === 'materialCode') {
      const selectedItem = availableHardwareItems.find(item => item.materialCode === value);
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          materialCode: selectedItem.materialCode,
          materialName: selectedItem.materialName,
          unitPrice: selectedItem.unitPrice
        };
      }
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].totalPrice = updatedItems[index].quantity * updatedItems[index].unitPrice;
    }
    
    setHardwareItems(updatedItems);
    
    // Update total amount and calculate VAT (18%)
    const totalAmount = updatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const vatAmount = totalAmount * 0.18; // 18% VAT as per requirements
    setPaymentData(prev => ({
      ...prev,
      payAmount: totalAmount,
      vatAmount: vatAmount,
    }));
  };

  const handleSubmit = () => {
    if (!paymentData.sapBpId || !paymentData.name || !paymentData.payMode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const validItems = hardwareItems.filter(item => item.materialCode && item.materialName);
    if (validItems.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one hardware item",
        variant: "destructive",
      });
      return;
    }

    const submitData = {
      ...paymentData,
      hardwareItems: validItems,
    };

    createPaymentMutation.mutate(submitData);
  };

  const approvePaymentMutation = useMutation({
    mutationFn: ({ id, approvedBy, remarks }: { id: number; approvedBy: string; remarks?: string }) =>
      apiRequest(`/api/agent-hardware-payments/${id}/approve`, "POST", { approvedBy, remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-hardware-payments"] });
      toast({
        title: "Success",
        description: "Payment approved successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve payment",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (payment: AgentHardwarePayment, remarks?: string) => {
    approvePaymentMutation.mutate({
      id: payment.id,
      approvedBy: "current_user", // In production, get from auth context
      remarks
    });
  };

  const handleReject = (payment: AgentHardwarePayment, reason?: string) => {
    updatePaymentMutation.mutate({
      id: payment.id,
      data: {
        status: "REJECTED",
        approvedBy: "current_user",
        cmStatus: "FAILED",
        cmStatusMsg: reason || "Payment rejected by finance team",
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case "INPROGRESS":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case "PENDING_APPROVAL": // Keep for backward compatibility
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending Approval</Badge>;
      case "REJECTED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case "CASH":
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case "CHEQUE":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "BANK_DEPOSIT":
        return <Building className="w-4 h-4 text-purple-500" />;
      case "POS":
        return <CreditCard className="w-4 h-4 text-orange-500" />;
      case "MOBILE_MONEY":
        return <Phone className="w-4 h-4 text-pink-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredPayments = payments?.filter(payment => {
    if (!searchTerm) return true;
    return payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payment.payId.toLowerCase().includes(searchTerm.toLowerCase()) ||
           payment.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (paymentsLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading agent hardware payments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-5 h-5 text-azam-blue" />
          <h1 className="text-xl font-semibold text-gray-900">Agent Hardware Payment</h1>
        </div>
        <p className="text-sm text-gray-600">
          Process hardware payments for agents with support for multiple payment modes and approval workflow
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-payment" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Payment
          </TabsTrigger>
          <TabsTrigger value="payment-history" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Payment History
          </TabsTrigger>
          <TabsTrigger value="approval-queue" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Approval Queue
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                New Agent Hardware Payment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
               
                {/* Agent Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="agent">Agent *</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search by agent name, ID, or email..."
                        value={agentSearchQuery}
                        onChange={(e) => setAgentSearchQuery(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={() => {
                          if (agentSearchQuery.trim()) {
                            const foundAgent = agents?.find(agent => 
                              agent.firstName?.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
                              agent.lastName?.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
                              agent.sapBpId?.toLowerCase().includes(agentSearchQuery.toLowerCase()) ||
                              agent.email?.toLowerCase().includes(agentSearchQuery.toLowerCase())
                            );
                            if (foundAgent) {
                              handleAgentSelect(foundAgent.sapBpId);
                              setAgentSearchQuery(`${foundAgent.firstName || ''} ${foundAgent.lastName || ''}`.trim());
                            } else {
                              toast({
                                title: "Not Found",
                                description: "No agent found matching your search",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                        className="flex items-center gap-2"
                      >
                        <Search className="w-4 h-4" />
                        Search
                      </Button>
                    </div>
                    {paymentData.name && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                        <User className="w-4 h-4" />
                        <span>Selected: {paymentData.name} ({paymentData.sapBpId})</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collectionCenter">Collection Center *</Label>
                    <Select
                      value={paymentData.collectionCenter}
                      onValueChange={(value) => setPaymentData({...paymentData, collectionCenter: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collection center" />
                      </SelectTrigger>
                      <SelectContent>
                        {collectionCenters.map(center => (
                          <SelectItem key={center.value} value={center.value}>
                            {center.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Hardware Items */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-medium">Hardware Items</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addHardwareItem}
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Item
                    </Button>
                  </div>
                  
                  {hardwareItems.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Item {index + 1}</span>
                        {hardwareItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeHardwareItem(index)}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Material</Label>
                          <Select
                            value={item.materialCode}
                            onValueChange={(value) => updateHardwareItem(index, 'materialCode', value)}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableHardwareItems.map(hwItem => (
                                <SelectItem key={hwItem.materialCode} value={hwItem.materialCode}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{hwItem.materialCode}</span>
                                    <span className="text-xs text-gray-600">{hwItem.materialName}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Name</Label>
                          <Input
                            placeholder="Material Name"
                            value={item.materialName}
                            onChange={(e) => updateHardwareItem(index, 'materialName', e.target.value)}
                            className="h-9"
                            disabled={!!item.materialCode}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Qty</Label>
                          <Input
                            type="number"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => updateHardwareItem(index, 'quantity', parseInt(e.target.value) || 0)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Unit Price</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.unitPrice}
                            onChange={(e) => updateHardwareItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="h-9"
                            disabled={!!item.materialCode}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">Total</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.totalPrice}
                            disabled
                            className="h-9 bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Payment Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payMode">Payment Mode *</Label>
                    <Select
                      value={paymentData.payMode}
                      onValueChange={(value) => setPaymentData({...paymentData, payMode: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {paymentModes.map(mode => (
                          <SelectItem key={mode.value} value={mode.value}>
                            {mode.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={paymentData.currency}
                      onValueChange={(value) => setPaymentData({...paymentData, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map(currency => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="collectedBy">Collected By</Label>
                    <Input
                      id="collectedBy"
                      value={paymentData.collectedBy}
                      onChange={(e) => setPaymentData({...paymentData, collectedBy: e.target.value})}
                      placeholder="Enter collector name"
                    />
                  </div>
                </div>

                {/* Conditional Fields */}
                {(paymentData.payMode === "CHEQUE" || paymentData.payMode === "BANK_DEPOSIT") && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="chequeNo">Cheque Number</Label>
                      <Input
                        id="chequeNo"
                        value={paymentData.chequeNo}
                        onChange={(e) => setPaymentData({...paymentData, chequeNo: e.target.value})}
                        placeholder="Enter cheque number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={paymentData.bankName}
                        onChange={(e) => setPaymentData({...paymentData, bankName: e.target.value})}
                        placeholder="Enter bank name"
                      />
                    </div>
                  </div>
                )}

                {/* Amount Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Payment Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-900 font-semibold">Total Amount:</span>
                      <span className="font-bold text-lg text-azam-blue">{paymentData.currency} {(paymentData.payAmount + paymentData.vatAmount).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={paymentData.description}
                    onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                    placeholder="Enter payment description"
                    rows={3}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    disabled={createPaymentMutation.isPending}
                    className="bg-azam-blue hover:bg-azam-blue/90"
                  >
                    {createPaymentMutation.isPending ? "Processing..." : "Create Payment"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search by agent name, payment ID, or receipt number"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="space-y-3">
                  {filteredPayments?.map((payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getPaymentModeIcon(payment.payMode)}
                            <span className="font-medium">{payment.name}</span>
                            {getStatusBadge(payment.status)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Payment ID:</span> {payment.payId}
                            </div>
                            <div>
                              <span className="text-gray-600">Receipt:</span> {payment.receiptNumber}
                            </div>
                            <div>
                              <span className="text-gray-600">Amount:</span> {payment.currency} {payment.payAmount.toLocaleString()}
                            </div>
                            <div>
                              <span className="text-gray-600">Payment Mode:</span> {payment.payMode}
                            </div>
                            <div>
                              <span className="text-gray-600">Date:</span> {new Date(payment.createDt).toLocaleDateString()}
                            </div>
                            <div>
                              <span className="text-gray-600">Collection Center:</span> {payment.collectionCenter}
                            </div>
                          </div>
                          {payment.description && (
                            <div className="text-sm">
                              <span className="text-gray-600">Description:</span> {payment.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPayment(payment)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(() => {
                            const cancelCheck = canCancelPayment(payment);
                            return cancelCheck.canCancel && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => cancelPaymentMutation.mutate({ id: payment.id, reason: "Cancelled by user" })}
                                title={cancelCheck.reason || "Cancel payment"}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredPayments?.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No payment history found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval-queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Payment Approval Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPayments?.filter(p => p.status === "INPROGRESS" || p.status === "PENDING_APPROVAL").map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getPaymentModeIcon(payment.payMode)}
                          <span className="font-medium">{payment.name}</span>
                          {getStatusBadge(payment.status)}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Payment ID:</span> {payment.payId}
                          </div>
                          <div>
                            <span className="text-gray-600">Amount:</span> {payment.currency} {payment.payAmount.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-gray-600">Payment Mode:</span> {payment.payMode}
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span> {new Date(payment.createDt).toLocaleDateString()}
                          </div>
                        </div>
                        {payment.chequeNo && (
                          <div className="text-sm">
                            <span className="text-gray-600">Cheque No:</span> {payment.chequeNo}
                          </div>
                        )}
                        {payment.bankName && (
                          <div className="text-sm">
                            <span className="text-gray-600">Bank:</span> {payment.bankName}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(payment)}
                          disabled={updatePaymentMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(payment)}
                          disabled={updatePaymentMutation.isPending}
                          className="bg-azam-blue hover:bg-azam-blue/90"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredPayments?.filter(p => p.status === "INPROGRESS" || p.status === "PENDING_APPROVAL").length === 0 && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payments pending approval</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}