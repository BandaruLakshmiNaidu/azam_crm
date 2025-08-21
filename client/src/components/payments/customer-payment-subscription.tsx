import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  CreditCard,
  Smartphone,
  Building2,
  Globe,
  Receipt,
  Users,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  FileText,
  Search
} from "lucide-react";

export default function CustomerPaymentSubscriptionPage() {
  const [activeTab, setActiveTab] = useState("payment-process");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [paymentForm, setPaymentForm] = useState({
    customerId: "",
    customerName: "",
    sapBpId: "",
    sapCaId: "",
    subscriptionPlan: "",
    planAmount: "",
    paymentChannel: "PORTAL", // PORTAL, OTC, AGENT, ONLINE
    paymentMethod: "CASH",
    payAmount: "",
    exciseDuty: "",
    revenueAmount: "",
    paymentType: "PREPAID", // PREPAID, POSTPAID
    rooms: "1",
    description: "",
    collectionCenter: ""
  });

  const { toast } = useToast();

  // API Queries
  const { data: customers, isLoading: customersLoading } = useQuery({
    queryKey: ["/api/customers"],
  });

  const { data: subscriptionPlans, isLoading: plansLoading } = useQuery({
    queryKey: ["/api/subscription-plans"],
  });

  const { data: paymentHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/customer-payments", "subscription"],
  });

  const { data: paymentStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/customer-payments/stats"],
  });

  // Subscription Plans (Bouquets)
  const bouquets = [
    {
      id: "BASIC_PKG",
      name: "Azam TV Basic",
      amount: 12000,
      channels: 45,
      description: "Essential entertainment package with local and international channels"
    },
    {
      id: "PREMIUM_PKG",
      name: "Azam TV Premium",
      amount: 25000,
      channels: 80,
      description: "Premium package with sports, movies, and exclusive content"
    },
    {
      id: "SPORTS_PKG",
      name: "Azam Sports Plus",
      amount: 18000,
      channels: 60,
      description: "Sports-focused package with live matches and sports analysis"
    },
    {
      id: "FAMILY_PKG",
      name: "Azam Family Package",
      amount: 30000,
      channels: 100,
      description: "Complete family entertainment with kids, lifestyle, and education channels"
    }
  ];

  // Payment Channels
  const paymentChannels = [
    { id: "PORTAL", name: "Customer Portal", icon: Globe },
    { id: "OTC", name: "Over-the-Counter", icon: Building2 },
    { id: "AGENT", name: "Agent Collection", icon: Users },
    { id: "ONLINE", name: "Online Payment (Azam Pay/DPO)", icon: Smartphone }
  ];

  // Payment Methods
  const paymentMethods = [
    "CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "AZAM_PAY", "DPO_GATEWAY"
  ];

  // Collection Centers
  const collectionCenters = [
    { id: "OTC_DAR_01", name: "OTC Dar es Salaam - Kariakoo" },
    { id: "OTC_MWANZA_01", name: "OTC Mwanza - City Center" },
    { id: "OTC_ARUSHA_01", name: "OTC Arusha - Central" },
    { id: "AGENT_NETWORK", name: "Agent Network Collection" },
    { id: "ONLINE_PORTAL", name: "Online Portal Payment" }
  ];

  // Calculate financial breakdown
  const calculateFinancials = (amount: number) => {
    // Revenue = Payment × (100/105) for Excise Duty only
    const revenueAmount = (amount * 100 / 105);
    const exciseDuty = amount - revenueAmount;
    
    return {
      revenueAmount: Math.round(revenueAmount * 100) / 100,
      exciseDuty: Math.round(exciseDuty * 100) / 100
    };
  };

  // Handle subscription plan selection
  const handlePlanSelect = (planId: string) => {
    const plan = bouquets.find(p => p.id === planId);
    if (plan) {
      const financials = calculateFinancials(plan.amount);
      setPaymentForm({
        ...paymentForm,
        subscriptionPlan: planId,
        planAmount: plan.amount.toString(),
        payAmount: plan.amount.toString(),
        ...financials,
        exciseDuty: financials.exciseDuty.toString(),
        revenueAmount: financials.revenueAmount.toString()
      });
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer);
    setPaymentForm({
      ...paymentForm,
      customerId: customer.id.toString(),
      customerName: `${customer.firstName} ${customer.lastName}`,
      sapBpId: customer.sapBpId || `BP_${customer.id.toString().padStart(6, '0')}`,
      sapCaId: customer.sapCaId || `CA_${customer.id.toString().padStart(6, '0')}`
    });
    setSearchTerm("");
  };

  // Process subscription payment mutation
  const processPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const payload = {
        ...paymentData,
        payType: "SUBSCRIPTION",
        status: "PENDING",
        transId: `TXN${Date.now()}`,
        createId: "customer_portal",
        createDt: new Date(),
        createTs: new Date(),
        cmStatus: "PENDING",
        ficaStatus: "PENDING",
        traStatus: paymentData.paymentType === "PREPAID" ? "PENDING" : "NOT_REQUIRED"
      };
      return apiRequest("/api/customer-payments", "POST", payload);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-payments"] });
      toast({
        title: "Payment Submitted",
        description: `Payment request submitted to Central Module. Transaction ID: ${(response as any)?.data?.transId || 'Generated'}`,
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Payment Failed",
        description: "Failed to process subscription payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPaymentForm({
      customerId: "",
      customerName: "",
      sapBpId: "",
      sapCaId: "",
      subscriptionPlan: "",
      planAmount: "",
      paymentChannel: "PORTAL",
      paymentMethod: "CASH",
      payAmount: "",
      exciseDuty: "",
      revenueAmount: "",
      paymentType: "PREPAID",
      rooms: "1",
      description: "",
      collectionCenter: ""
    });
    setSelectedCustomer(null);
  };

  const handleProcessPayment = () => {
    if (!paymentForm.customerId || !paymentForm.subscriptionPlan || !paymentForm.payAmount) {
      toast({
        title: "Missing Information",
        description: "Please fill in customer, subscription plan, and payment amount.",
        variant: "destructive",
      });
      return;
    }
    processPaymentMutation.mutate(paymentForm);
  };

  const filteredCustomers = Array.isArray((customers as any)?.data) 
    ? (customers as any).data.filter((customer: any) =>
        customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.id.toString().includes(searchTerm)
      ).slice(0, 8)
    : [];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-azam-blue to-blue-800 text-white p-2 md:p-3 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <CreditCard className="w-6 h-6 md:w-8 md:h-8 mr-3" />
              Customer Subscription Payment
            </h1>
            <p className="text-blue-100 mt-2 text-sm md:text-base">
              Process subscription payments for Azam TV bouquets with SAP BRIM integration
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="payment-process" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Payment Process
          </TabsTrigger>
          <TabsTrigger value="payment-history" className="flex items-center">
            <Receipt className="w-4 h-4 mr-2" />
            Payment History
          </TabsTrigger>
          <TabsTrigger value="accounting" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Accounting View
          </TabsTrigger>
          <TabsTrigger value="integration" className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-2" />
            Integration Status
          </TabsTrigger>
        </TabsList>

        {/* Payment Process Tab */}
        <TabsContent value="payment-process" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-azam-blue" />
                  Customer Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search customer by name or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {searchTerm && filteredCustomers.length > 0 && (
                  <div className="border rounded-md max-h-48 overflow-y-auto">
                    {filteredCustomers.map((customer: any) => (
                      <div
                        key={customer.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleCustomerSelect(customer)}
                      >
                        <div className="font-medium">{customer.firstName} {customer.lastName}</div>
                        <div className="text-sm text-gray-500">
                          ID: {customer.id} | Phone: {customer.phone}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedCustomer && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-800">
                          {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </div>
                        <div className="text-sm text-green-600">
                          SAP BP: {paymentForm.sapBpId} | CA: {paymentForm.sapCaId}
                        </div>
                      </div>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Subscription Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-azam-blue" />
                  Subscription Plans (Bouquets)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {bouquets.map((bouquet) => (
                    <div
                      key={bouquet.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        paymentForm.subscriptionPlan === bouquet.id
                          ? "border-azam-blue bg-blue-50"
                          : "hover:border-gray-300"
                      }`}
                      onClick={() => handlePlanSelect(bouquet.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{bouquet.name}</div>
                          <div className="text-sm text-gray-600">{bouquet.description}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {bouquet.channels} channels
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-azam-blue">
                            TSH {bouquet.amount.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-azam-blue" />
                Payment Details & Processing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Payment Channel */}
                <div className="space-y-2">
                  <Label>Payment Channel</Label>
                  <Select value={paymentForm.paymentChannel} onValueChange={(value) => setPaymentForm({...paymentForm, paymentChannel: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentChannels.map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Type */}
                <div className="space-y-2">
                  <Label>Payment Type</Label>
                  <Select value={paymentForm.paymentType} onValueChange={(value) => setPaymentForm({...paymentForm, paymentType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PREPAID">Prepaid</SelectItem>
                      <SelectItem value="POSTPAID">Postpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select value={paymentForm.paymentMethod} onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Financial Breakdown */}
              {paymentForm.payAmount && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-4">Financial Breakdown</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Payment:</span>
                      <p className="font-bold text-lg">TSH {parseFloat(paymentForm.payAmount).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Revenue Amount:</span>
                      <p className="font-medium text-green-600">TSH {parseFloat(paymentForm.revenueAmount || '0').toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Excise Duty:</span>
                      <p className="font-medium text-orange-600">TSH {parseFloat(paymentForm.exciseDuty || '0').toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Rooms (Postpaid)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={paymentForm.rooms}
                    onChange={(e) => setPaymentForm({...paymentForm, rooms: e.target.value})}
                    disabled={paymentForm.paymentType === "PREPAID"}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Collection Center</Label>
                  <Select value={paymentForm.collectionCenter} onValueChange={(value) => setPaymentForm({...paymentForm, collectionCenter: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select center" />
                    </SelectTrigger>
                    <SelectContent>
                      {collectionCenters.map((center) => (
                        <SelectItem key={center.id} value={center.id}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Process Payment Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleProcessPayment}
                  disabled={processPaymentMutation.isPending || !paymentForm.customerId || !paymentForm.subscriptionPlan}
                  className="bg-azam-blue hover:bg-blue-700"
                >
                  {processPaymentMutation.isPending ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Process Subscription Payment
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment History Tab */}
        <TabsContent value="payment-history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Receipt className="w-5 h-5 mr-2 text-azam-blue" />
                Subscription Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading payment history...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray((paymentHistory as any)?.data) && (paymentHistory as any).data.length > 0 ? (
                    (paymentHistory as any).data.map((payment: any) => (
                      <div key={payment.payId || payment.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-medium">{payment.customerName}</div>
                            <div className="text-sm text-gray-600">
                              Transaction: {payment.transId}
                            </div>
                          </div>
                          <Badge variant={payment.status === "COMPLETED" ? "default" : "secondary"}>
                            {payment.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Amount:</span>
                            <p className="font-medium">TSH {payment.payAmount?.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Payment Type:</span>
                            <p className="font-medium">{payment.paymentType || 'PREPAID'}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Method:</span>
                            <p className="font-medium">{payment.paymentMethod || payment.payMode}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Date:</span>
                            <p className="font-medium">{new Date(payment.createDt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No subscription payments found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accounting View Tab */}
        <TabsContent value="accounting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">
                      TSH {((paymentStats as any)?.totalRevenue || 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Excise Duty</p>
                    <p className="text-2xl font-bold text-orange-600">
                      TSH {((paymentStats as any)?.totalExcise || 0).toLocaleString()}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integration Status Tab */}
        <TabsContent value="integration" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Portal → CM Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">REST API</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <p className="text-xs text-gray-600">JSON requests to Central Module</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">CM → SAP BRIM FICA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">RFC Protocol</span>
                  <Badge variant="secondary">Configured</Badge>
                </div>
                <p className="text-xs text-gray-600">SAP standard integration</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">CM → TRA/TCRA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">SOAP/XML</span>
                  <Badge variant="outline">Ready</Badge>
                </div>
                <p className="text-xs text-gray-600">Regulatory compliance posting</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}