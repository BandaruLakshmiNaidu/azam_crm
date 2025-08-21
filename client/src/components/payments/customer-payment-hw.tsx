import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  CreditCard, 
  Search, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  DollarSign, 
  FileText, 
  Receipt,
  X,
  Package2,
  User,
  Building
} from "lucide-react";

export default function CustomerPaymentHWPage() {
  const [selectedTab, setSelectedTab] = useState("process-payment");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentForm, setPaymentForm] = useState({
    sapBpId: "",
    sapCaId: "",
    customerName: "",
    customerPhone: "",
    payAmount: "",
    payMode: "CASH",
    chequeNo: "",
    bankName: "",
    currency: "TSH",
    description: "",
    collectionCenter: "OTC_DAR_01",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API Queries
  const { data: paymentDetails = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/payment-details"],
    select: (data: any) => Array.isArray(data) ? data.filter((p: any) => p.module === "Customer" && p.payType === "Hardware") : [],
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Mutations
  const processPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => apiRequest("/api/payment-details", "POST", paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-details"] });
      toast({
        title: "Success",
        description: "Payment processed successfully and submitted to CM",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const approvePaymentMutation = useMutation({
    mutationFn: ({ id, approvedBy }: { id: number; approvedBy: string }) =>
      apiRequest(`/api/payment-details/${id}/approve`, "POST", { approvedBy }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-details"] });
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

  const cancelPaymentMutation = useMutation({
    mutationFn: ({ id, cancelReason, cancelledBy }: { id: number; cancelReason: string; cancelledBy: string }) =>
      apiRequest(`/api/payment-details/${id}/cancel`, "POST", { cancelReason, cancelledBy }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-details"] });
      toast({
        title: "Success",
        description: "Payment cancelled successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cancel payment",
        variant: "destructive",
      });
    },
  });

  const postTRAMutation = useMutation({
    mutationFn: ({ id, vatAmount, payType }: { id: number; vatAmount: number; payType: string }) =>
      apiRequest(`/api/payment-details/${id}/tra-post`, "POST", { vatAmount, payType }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payment-details"] });
      toast({
        title: "Success",
        description: "TRA posting completed successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post to TRA",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setPaymentForm({
      sapBpId: "",
      sapCaId: "",
      customerName: "",
      customerPhone: "",
      payAmount: "",
      payMode: "CASH",
      chequeNo: "",
      bankName: "",
      currency: "TSH",
      description: "",
      collectionCenter: "OTC_DAR_01",
    });
  };

  const handleCustomerSelect = (customerId: string) => {
    const customerData = Array.isArray((customers as any)?.data) ? (customers as any).data : [];
    const customer = customerData.find((c: any) => c.id.toString() === customerId);
    if (customer) {
      setPaymentForm({
        ...paymentForm,
        sapBpId: customer.sapBpId || `BP_CUST_${customer.id.toString().padStart(3, '0')}`,
        sapCaId: customer.sapCaId || `CA_CUST_${customer.id.toString().padStart(3, '0')}`,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerPhone: customer.phone,
      });
    }
  };

  const handleProcessPayment = () => {
    if (!paymentForm.sapBpId || !paymentForm.customerName || !paymentForm.payAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const payAmount = parseFloat(paymentForm.payAmount);
    const vatAmount = payAmount * 0.18; // 18% VAT

    const paymentData = {
      ...paymentForm,
      payAmount: payAmount,
      vatAmount: vatAmount,
      module: "Customer",
      payType: "Hardware",
      salesOrg: "1000",
      division: "10",
      collectedBy: "OTC_Cashier_Current",
      createId: "otc_user_current",
    };

    processPaymentMutation.mutate(paymentData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800"><X className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  const filteredPayments = paymentDetails.filter((payment: any) =>
    payment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.sapBpId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.transId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Payment - Hardware</h1>
          <p className="text-gray-600">Process hardware payments for customers following CM workflow</p>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-azam-blue" />
          <span className="text-sm text-gray-600">Payment Processing</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="process-payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Process Payment</span>
          </TabsTrigger>
          <TabsTrigger value="approve-payment" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Approve</span>
          </TabsTrigger>
          <TabsTrigger value="tra-posting" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">TRA Posting</span>
          </TabsTrigger>
          <TabsTrigger value="payment-history" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="process-payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-azam-blue" />
                Process Customer Hardware Payment
              </CardTitle>
              <CardDescription>Collect payment from customers for hardware purchases</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerSelect">Select Customer</Label>
                  <Select onValueChange={handleCustomerSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray((customers as any)?.data) && (customers as any).data.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id.toString()}>
                          {customer.firstName} {customer.lastName} - {customer.phone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="payAmount">Payment Amount (TSH) *</Label>
                  <Input
                    id="payAmount"
                    type="number"
                    value={paymentForm.payAmount}
                    onChange={(e) => setPaymentForm({...paymentForm, payAmount: e.target.value})}
                    placeholder="Enter payment amount"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={paymentForm.customerName}
                    onChange={(e) => setPaymentForm({...paymentForm, customerName: e.target.value})}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    value={paymentForm.customerPhone}
                    onChange={(e) => setPaymentForm({...paymentForm, customerPhone: e.target.value})}
                    placeholder="+255..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sapBpId">SAP BP ID *</Label>
                  <Input
                    id="sapBpId"
                    value={paymentForm.sapBpId}
                    onChange={(e) => setPaymentForm({...paymentForm, sapBpId: e.target.value})}
                    placeholder="BP_CUST_001"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="sapCaId">SAP Contract Account ID *</Label>
                  <Input
                    id="sapCaId"
                    value={paymentForm.sapCaId}
                    onChange={(e) => setPaymentForm({...paymentForm, sapCaId: e.target.value})}
                    placeholder="CA_CUST_001"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="payMode">Payment Mode *</Label>
                  <Select value={paymentForm.payMode} onValueChange={(value) => setPaymentForm({...paymentForm, payMode: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                      <SelectItem value="AZAM PAY">Azam Pay</SelectItem>
                      <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                      <SelectItem value="CARD">Card Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="collectionCenter">Collection Center</Label>
                  <Select value={paymentForm.collectionCenter} onValueChange={(value) => setPaymentForm({...paymentForm, collectionCenter: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection center" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OTC_DAR_01">OTC Dar es Salaam</SelectItem>
                      <SelectItem value="OTC_ARU_01">OTC Arusha</SelectItem>
                      <SelectItem value="OTC_MWZ_01">OTC Mwanza</SelectItem>
                      <SelectItem value="OTC_DOD_01">OTC Dodoma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(paymentForm.payMode === "CHEQUE") && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="chequeNo">Cheque Number</Label>
                    <Input
                      id="chequeNo"
                      value={paymentForm.chequeNo}
                      onChange={(e) => setPaymentForm({...paymentForm, chequeNo: e.target.value})}
                      placeholder="Enter cheque number"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bankName">Bank Name</Label>
                    <Input
                      id="bankName"
                      value={paymentForm.bankName}
                      onChange={(e) => setPaymentForm({...paymentForm, bankName: e.target.value})}
                      placeholder="Enter bank name"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                  placeholder="Enter payment description"
                  rows={3}
                />
              </div>

              {paymentForm.payAmount && (
                <Card className="bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Payment Amount:</span>
                        <span>TSH {parseFloat(paymentForm.payAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>VAT (18%):</span>
                        <span>TSH {(parseFloat(paymentForm.payAmount) * 0.18).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total Amount:</span>
                        <span>TSH {(parseFloat(paymentForm.payAmount) * 1.18).toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={handleProcessPayment} 
                  disabled={processPaymentMutation.isPending}
                  className="flex-1"
                >
                  {processPaymentMutation.isPending ? "Processing..." : "Process Payment"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approve-payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-azam-blue" />
                Payment Approval
              </CardTitle>
              <CardDescription>Approve pending customer hardware payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-4">
                  {filteredPayments.filter((payment: any) => payment.status === "PENDING").map((payment: any) => (
                    <Card key={payment.payId} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{payment.name}</h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {payment.transId} • {payment.sapBpId} • {payment.payMode}
                          </p>
                          <p className="text-sm font-medium">
                            Amount: TSH {payment.payAmount.toLocaleString()} (VAT: TSH {payment.vatAmount.toLocaleString()})
                          </p>
                          <p className="text-sm text-gray-500">
                            CM Status: {payment.cmStatus} • {payment.cmStatusMsg}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => approvePaymentMutation.mutate({ id: payment.payId, approvedBy: "manager" })}
                            disabled={approvePaymentMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => cancelPaymentMutation.mutate({ 
                              id: payment.payId, 
                              cancelReason: "Manager review", 
                              cancelledBy: "manager" 
                            })}
                            disabled={cancelPaymentMutation.isPending}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tra-posting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-azam-blue" />
                TRA Tax Posting
              </CardTitle>
              <CardDescription>Post VAT to Tanzania Revenue Authority</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.filter((payment: any) => payment.status === "APPROVED" && payment.cmStatus !== "TRA_POSTED").map((payment: any) => (
                  <Card key={payment.payId} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{payment.name}</h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          {payment.transId} • {payment.sapBpId}
                        </p>
                        <p className="text-sm font-medium">
                          VAT Amount: TSH {payment.vatAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => postTRAMutation.mutate({ 
                            id: payment.payId, 
                            vatAmount: payment.vatAmount, 
                            payType: payment.payType 
                          })}
                          disabled={postTRAMutation.isPending}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Post to TRA
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-azam-blue" />
                Payment History
              </CardTitle>
              <CardDescription>View all customer hardware payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payment history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-4">
                  {filteredPayments.map((payment: any) => (
                    <Card key={payment.payId} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{payment.name}</h3>
                            {getStatusBadge(payment.status)}
                          </div>
                          <p className="text-sm text-gray-600">
                            {payment.transId} • {payment.sapBpId} • {payment.payMode}
                          </p>
                          <p className="text-sm">
                            Collected by: {payment.collectedBy} • {payment.collectionCenter}
                          </p>
                          <p className="text-sm text-gray-500">
                            {payment.createDt ? new Date(payment.createDt).toLocaleString() : ''} • {payment.createId}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">TSH {payment.payAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">VAT: TSH {payment.vatAmount.toLocaleString()}</p>
                          <p className="text-sm text-gray-500">CM: {payment.cmStatus}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}