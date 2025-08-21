import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Receipt, Users, TrendingUp, Search, DollarSign, Calendar, FileText, Building } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function AgentPaymentSubscription() {
  const [paymentForm, setPaymentForm] = useState({
    sapBpId: "",
    sapCaId: "",
    customerId: "",
    customerName: "",
    payAmount: "",
    payMode: "",
    collectedBy: "AGENT001", // Default to current agent
    collectionCenter: "",
    description: "",
    receiptNo: "",
    chequeNo: "",
    bankRef: "",
    mobileRef: ""
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const { toast } = useToast();

  // Fetch agent payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["/api/agent-payments", { payType: 'Subscription' }],
  });

  // Fetch collection centers
  const { data: collectionCenters } = useQuery({
    queryKey: ["/api/agent-payments/collection-centers"],
  });

  // Fetch payment statistics
  const { data: paymentStats } = useQuery({
    queryKey: ["/api/agent-payments/stats"],
  });

  // Fetch customers for search
  const { data: customers } = useQuery({
    queryKey: ["/api/customers"],
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/agent-payments/subscription", data),
    onSuccess: () => {
      toast({ title: "Subscription payment recorded successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/agent-payments"] });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to record payment", variant: "destructive" });
    }
  });

  const resetForm = () => {
    setPaymentForm({
      sapBpId: "",
      sapCaId: "",
      customerId: "",
      customerName: "",
      payAmount: "",
      payMode: "",
      collectedBy: "AGENT001",
      collectionCenter: "",
      description: "",
      receiptNo: "",
      chequeNo: "",
      bankRef: "",
      mobileRef: ""
    });
  };

  const handleCustomerSelect = (customer: any) => {
    setPaymentForm({
      ...paymentForm,
      sapBpId: customer.sapBpId || `BP${customer.id.toString().padStart(3, '0')}`,
      sapCaId: customer.sapCaId || `CA${customer.id.toString().padStart(3, '0')}`,
      customerId: customer.id.toString(),
      customerName: `${customer.firstName} ${customer.lastName}`
    });
  };



  const handleSubmitPayment = () => {
    if (!paymentForm.customerId || !paymentForm.payAmount || !paymentForm.payMode || !paymentForm.collectionCenter) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }

    const paymentData = {
      ...paymentForm,
      payAmount: parseFloat(paymentForm.payAmount),
      payType: 'Subscription',
      createId: 'current_agent_id'
    };

    createPaymentMutation.mutate(paymentData);
  };

  const getPaymentModeIcon = (mode: string) => {
    switch (mode) {
      case 'CASH': return '💵';
      case 'MOBILE_MONEY': return '📱';
      case 'CHEQUE': return '📝';
      case 'POS': return '💳';
      case 'BANK_DEPOSIT': return '🏦';
      case 'AZAM_PAY': return '💰';
      case 'DPO': return '🔒';
      default: return '💳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Payment - Subscription</h1>
          <p className="text-gray-600">Collect and manage customer subscription payments</p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="px-3 py-1">
            <Building className="w-4 h-4 mr-1" />
            Agent Portal
          </Badge>
        </div>
      </div>

      

      <Tabs defaultValue="new-payment" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-payment">New Payment</TabsTrigger>
          <TabsTrigger value="payment-history">Payment History</TabsTrigger>
          <TabsTrigger value="settlement">Settlement</TabsTrigger>
        </TabsList>

        {/* New Payment Tab */}
        <TabsContent value="new-payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-azam-blue" />
                Record Subscription Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Search Customer</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search by name or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  {/* Customer search results */}
                  {searchTerm && Array.isArray((customers as any)?.data) && (
                    <div className="border rounded-md max-h-40 overflow-y-auto">
                      {(customers as any).data
                        .filter((customer: any) => 
                          customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          customer.id.toString().includes(searchTerm)
                        )
                        .slice(0, 5)
                        .map((customer: any) => (
                          <div
                            key={customer.id}
                            className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                            <div className="text-xs text-gray-500">ID: {customer.id} | Phone: {customer.phone}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Selected Customer</Label>
                  <Input 
                    value={paymentForm.customerName} 
                    placeholder="No customer selected"
                    readOnly 
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <Separator />

              {/* Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Amount (TSH) *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentForm.payAmount}
                    onChange={(e) => setPaymentForm({...paymentForm, payAmount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Amount</Label>
                  <Input
                    value={paymentForm.payAmount || "0.00"}
                    readOnly
                    className="bg-gray-50 font-bold"
                  />
                </div>
              </div>

              {/* Payment Mode and Collection Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Mode *</Label>
                  <Select value={paymentForm.payMode} onValueChange={(value) => setPaymentForm({...paymentForm, payMode: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">💵 Cash</SelectItem>
                      <SelectItem value="MOBILE_MONEY">📱 Mobile Money</SelectItem>
                      <SelectItem value="CHEQUE">📝 Cheque</SelectItem>
                      <SelectItem value="POS">💳 POS Terminal</SelectItem>
                      <SelectItem value="BANK_DEPOSIT">🏦 Bank Deposit</SelectItem>
                      <SelectItem value="AZAM_PAY">💰 Azam Pay</SelectItem>
                      <SelectItem value="DPO">🔒 DPO Gateway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Collection Center *</Label>
                  <Select value={paymentForm.collectionCenter} onValueChange={(value) => setPaymentForm({...paymentForm, collectionCenter: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select collection center" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray((collectionCenters as any)?.data) && (collectionCenters as any).data.map((center: any) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Payment Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Receipt Number</Label>
                  <Input
                    placeholder="Receipt number (optional)"
                    value={paymentForm.receiptNo}
                    onChange={(e) => setPaymentForm({...paymentForm, receiptNo: e.target.value})}
                  />
                </div>
                {paymentForm.payMode === 'CHEQUE' && (
                  <div className="space-y-2">
                    <Label>Cheque Number</Label>
                    <Input
                      placeholder="Cheque number"
                      value={paymentForm.chequeNo}
                      onChange={(e) => setPaymentForm({...paymentForm, chequeNo: e.target.value})}
                    />
                  </div>
                )}
                {paymentForm.payMode === 'BANK_DEPOSIT' && (
                  <div className="space-y-2">
                    <Label>Bank Reference</Label>
                    <Input
                      placeholder="Bank reference number"
                      value={paymentForm.bankRef}
                      onChange={(e) => setPaymentForm({...paymentForm, bankRef: e.target.value})}
                    />
                  </div>
                )}
                {paymentForm.payMode === 'MOBILE_MONEY' && (
                  <div className="space-y-2">
                    <Label>Mobile Reference</Label>
                    <Input
                      placeholder="Mobile money reference"
                      value={paymentForm.mobileRef}
                      onChange={(e) => setPaymentForm({...paymentForm, mobileRef: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Payment description (optional)"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm({...paymentForm, description: e.target.value})}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={resetForm}>
                  Reset Form
                </Button>
                <Button 
                  onClick={handleSubmitPayment}
                  disabled={createPaymentMutation.isPending}
                >
                  {createPaymentMutation.isPending ? "Processing..." : "Record Payment"}
                </Button>
              </div>

              {/* Accounting Entry Preview */}
              {paymentForm.payAmount && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-sm text-blue-900">Accounting Entries Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs space-y-2">
                      <div className="flex justify-between">
                        <span>Agent/Aggregator (Dr)</span>
                        <span>TSH {parseFloat(paymentForm.payAmount).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Subscription Receipts (Cr)</span>
                        <span>TSH {parseFloat(paymentForm.payAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payment-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-azam-blue" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentsLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payments...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray((payments as any)?.data) ? (payments as any).data.map((payment: any) => (
                    <div key={payment.payId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getPaymentModeIcon(payment.payMode)}</span>
                            <h3 className="font-medium">{payment.customerName}</h3>
                            <Badge className={getStatusColor(payment.status)} variant="secondary">
                              {payment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Payment ID: {payment.payId}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">TSH {payment.totalAmount?.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(payment.createDt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Payment Mode:</span>
                          <p className="font-medium">{payment.payMode}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <p className="font-medium">TSH {payment.payAmount?.toLocaleString()}</p>
                        </div>

                        <div>
                          <span className="text-gray-600">Collection Center:</span>
                          <p className="font-medium">{payment.collectionCenter}</p>
                        </div>
                      </div>
                      {payment.cmStatus && (
                        <div className="mt-2 pt-2 border-t">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">CM Status: {payment.cmStatus}</span>
                            <span className="text-gray-600">FICA Status: {payment.ficaStatus}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600">No payment records found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settlement Tab */}
        <TabsContent value="settlement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-azam-blue" />
                Agent Settlement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      <strong>Settlement Process:</strong> Agents settle collections periodically. 
                      Aggregators settle daily. Settlement is processed on FIFO (First In, First Out) basis.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Pending Settlement</h4>
                    <div className="text-2xl font-bold text-yellow-600">
                      TSH {(paymentStats as any)?.data?.totalPending?.toLocaleString() || '0'}
                    </div>
                    <p className="text-sm text-gray-600">Awaiting settlement</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Total Settled</h4>
                    <div className="text-2xl font-bold text-green-600">
                      TSH {(paymentStats as any)?.data?.totalSettled?.toLocaleString() || '0'}
                    </div>
                    <p className="text-sm text-gray-600">Successfully settled</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label>Settlement Mode</Label>
                <Select defaultValue="BANK">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                    <SelectItem value="CASH">Cash Settlement</SelectItem>
                    <SelectItem value="MOBILE_MONEY">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">
                Process Settlement
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}