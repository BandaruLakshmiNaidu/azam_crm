import { useState, useMemo, useEffect, useRef } from "react";
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
import { Plus, Trash2, FileText, CheckCircle, AlertCircle, Clock, Package, Search, DollarSign, Calculator, Receipt, CreditCard, User } from "lucide-react";
import type { CustomerHardwareSale, CustomerHardwareSaleItem } from "@shared/schema";

interface HardwareItem {
  materialCode: string;
  materialName: string;
  materialType: string;
  kitPrice?: number;
  individualPrice: number;
  availableStock: number;
  isKitItem: boolean;
}

interface PricingPlan {
  planId: string;
  planName: string;
  description: string;
  discountPercent: number;
  validFor: string;
}

export default function CustomerHardwareSalePage() {
  const [selectedTab, setSelectedTab] = useState("new-sale");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<CustomerHardwareSale | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const [currentRequest, setCurrentRequest] = useState({
    sapBpId: "",
    sapCaId: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    planSelected: "",
    currency: "TSH",
    salesOrg: "1000",
    division: "10",
    transferFrom: "OTC_DAR_01",
    transferTo: "Customer_Walk_In",
    exchangeRate: 1,
  });
  const [selectedItems, setSelectedItems] = useState<CustomerHardwareSaleItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API Queries
  const { data: sales = [], isLoading: salesLoading } = useQuery<CustomerHardwareSale[]>({
    queryKey: ["/api/customer-hardware-sales"],
  });

  const { data: hardwareItems = [] } = useQuery<HardwareItem[]>({
    queryKey: ["/api/hardware-items"],
  });

  const { data: pricingPlans = [] } = useQuery<PricingPlan[]>({
    queryKey: ["/api/pricing-plans"],
  });

  const { data: paymentDetails = [] } = useQuery({
    queryKey: ["/api/payment-details"],
    select: (data: any) => data?.filter((p: any) => p.module === "Customer" && p.payType === "Hardware") || [],
  });

  const { data: customersResponse } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/customers"],
  });
  
  const customers = customersResponse?.data || [];

  // Click outside handler for customer dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm.trim() || !customers || !Array.isArray(customers)) return [];
    const searchLower = customerSearchTerm.toLowerCase();
    return customers.filter((customer: any) => {
      if (!customer) return false;
      const firstName = customer.firstName || '';
      const lastName = customer.lastName || '';
      const sapBpId = customer.sapBpId || '';
      const sapCaId = customer.sapCaId || '';
      const phone = customer.phone || '';
      const email = customer.email || '';
      
      return `${firstName} ${lastName}`.toLowerCase().includes(searchLower) ||
             sapBpId.toLowerCase().includes(searchLower) ||
             sapCaId.toLowerCase().includes(searchLower) ||
             phone.toLowerCase().includes(searchLower) ||
             email.toLowerCase().includes(searchLower);
    });
  }, [customers, customerSearchTerm]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = (customer: any) => {
    setCurrentRequest({
      ...currentRequest,
      customerName: `${customer.firstName} ${customer.lastName}`,
      customerPhone: customer.phone,
      customerEmail: customer.email || '',
      sapBpId: customer.sapBpId,
      sapCaId: customer.sapCaId,
    });
    setCustomerSearchTerm(`${customer.firstName} ${customer.lastName}`);
    setShowCustomerDropdown(false);
  };

  // Mutations
  const createSaleMutation = useMutation({
    mutationFn: (saleData: any) => apiRequest("/api/customer-hardware-sales", "POST", saleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-hardware-sales"] });
      toast({
        title: "Success",
        description: "Customer hardware sale created successfully",
      });
      resetForm();
      setSelectedTab("payment-check");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create customer hardware sale",
        variant: "destructive",
      });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: ({ id, paymentStatus }: { id: number; paymentStatus: string }) =>
      apiRequest(`/api/customer-hardware-sales/${id}/payment`, "POST", { paymentStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-hardware-sales"] });
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

  const processPaymentMutation = useMutation({
    mutationFn: (paymentData: any) => apiRequest("/api/payment-details", "POST", paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-hardware-sales"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payment-details"] });
      toast({
        title: "Success",
        description: "Payment processed successfully and submitted to CM",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/customer-hardware-sales/${id}/invoice`, "POST", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customer-hardware-sales"] });
      toast({
        title: "Success",
        description: "Invoice generated and TRA request posted",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setCurrentRequest({
      sapBpId: "",
      sapCaId: "",
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      planSelected: "",
      currency: "TSH",
      salesOrg: "1000",
      division: "10",
      transferFrom: "OTC_DAR_01",
      transferTo: "Customer_Walk_In",
      exchangeRate: 1,
    });
    setSelectedItems([]);
    setPaymentMethod("CASH");
    setCustomerSearchTerm("");
    setShowCustomerDropdown(false);
  };

  const addHardwareItem = () => {
    const newItem: CustomerHardwareSaleItem = {
      materialCode: "",
      materialName: "",
      materialType: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const removeHardwareItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateHardwareItem = (index: number, field: keyof CustomerHardwareSaleItem, value: any) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-update pricing and material details when material or quantity changes
    if (field === "materialCode" || field === "quantity") {
      const item = hardwareItems.find(h => h.materialCode === newItems[index].materialCode);
      if (item) {
        // Use individual price for customer sales
        newItems[index].unitPrice = item.individualPrice;
        newItems[index].totalPrice = item.individualPrice * newItems[index].quantity;
        newItems[index].materialName = item.materialName;
        newItems[index].materialType = item.materialType;
      }
    }
    
    setSelectedItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    
    // Apply plan discount if selected
    const selectedPlan = pricingPlans.find(p => p.planName === currentRequest.planSelected);
    const discountAmount = selectedPlan ? subtotal * (selectedPlan.discountPercent / 100) : 0;
    const total = subtotal - discountAmount;
    
    return { subtotal, discountAmount, total };
  };

  const handleCreateSale = () => {
    if (!currentRequest.customerName || !currentRequest.customerPhone || selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one item",
        variant: "destructive",
      });
      return;
    }

    const { total } = calculateTotals();
    const itemType = selectedItems.length > 0 ? selectedItems[0].materialCode : "";
    const itemQty = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
    const itemAmount = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const saleData = {
      ...currentRequest,
      itemType,
      itemQty,
      itemAmount,
      totalAmount: total,
      vatAmount: 0, // VAT removed as requested
      items: selectedItems,
      paymentStatus: "PENDING",
      invoiceGenerated: false,
      traRequestPosted: false,
      createId: "otc_user_current",
    };

    createSaleMutation.mutate(saleData);
  };

  const handleProcessPayment = (sale: CustomerHardwareSale) => {
    const { total } = calculateTotals();
    
    // Create payment details following CM workflow
    const paymentData = {
      sapBpId: sale.sapBpId,
      sapCaId: sale.sapCaId,
      module: "Customer",
      payType: "Hardware",
      payAmount: total,
      vatAmount: 0, // VAT removed as requested
      payMode: paymentMethod,
      currency: sale.currency,
      transId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: sale.customerName,
      description: `Hardware sale payment for ${selectedItems.map(i => i.materialName).join(", ")}`,
      salesOrg: sale.salesOrg,
      division: sale.division,
      collectedBy: "OTC_Cashier_Current",
      collectionCenter: sale.transferFrom,
      createId: "otc_user_current",
    };

    processPaymentMutation.mutate(paymentData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case "APPROVED":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "INPROGRESS":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="h-3 w-3 mr-1" />Paid</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Unknown</Badge>;
    }
  };

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerPhone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Hardware Sale - OTC</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage customer hardware sales through OTC channel</p>
        </div>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-azam-blue-600" />
          <span className="text-sm text-gray-600 dark:text-gray-300">OTC Sales Portal</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="new-sale" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Sale</span>
          </TabsTrigger>
          <TabsTrigger value="payment-check" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="invoice" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Invoice</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-sale" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-azam-blue-600" />
                New Customer Hardware Sale
              </CardTitle>
              <CardDescription>Create a new hardware sale for walk-in customers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative" ref={customerDropdownRef}>
                  <Label htmlFor="customerName">Search Customer *</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 h-4 w-4 text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      id="customerName"
                      placeholder="Search by name, BP ID, CA ID, phone..."
                      value={customerSearchTerm}
                      onChange={(e) => {
                        setCustomerSearchTerm(e.target.value);
                        setShowCustomerDropdown(e.target.value.length > 0);
                        // Clear form fields if user is typing a new search
                        if (e.target.value !== currentRequest.customerName) {
                          setCurrentRequest({
                            ...currentRequest,
                            customerName: e.target.value,
                            customerPhone: "",
                            customerEmail: "",
                            sapBpId: "",
                            sapCaId: "",
                          });
                        }
                      }}
                      onFocus={() => {
                        if (customerSearchTerm.length > 0) {
                          setShowCustomerDropdown(true);
                        }
                      }}
                      className="pl-10"
                      required
                    />
                  </div>
                  
                  {showCustomerDropdown && customerSearchTerm && filteredCustomers && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer: any) => (
                          <div
                            key={customer.id}
                            className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 border-gray-100 dark:border-gray-600"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              BP: {customer.sapBpId} | CA: {customer.sapCaId}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              {customer.phone} | {customer.email}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400">
                          No customers found. You can enter a new customer name.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="customerPhone">Customer Phone *</Label>
                  <Input
                    id="customerPhone"
                    value={currentRequest.customerPhone}
                    onChange={(e) => setCurrentRequest({...currentRequest, customerPhone: e.target.value})}
                    placeholder="+255..."
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Customer Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={currentRequest.customerEmail}
                    onChange={(e) => setCurrentRequest({...currentRequest, customerEmail: e.target.value})}
                    placeholder="customer@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="planSelected">Select Plan</Label>
                  <Select value={currentRequest.planSelected} onValueChange={(value) => setCurrentRequest({...currentRequest, planSelected: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricing plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {pricingPlans.map((plan) => (
                        <SelectItem key={plan.planId} value={plan.planName}>
                          {plan.planName} ({plan.discountPercent}% discount)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* SAP Integration Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sapBpId">SAP BP ID *</Label>
                  <Input
                    id="sapBpId"
                    value={currentRequest.sapBpId}
                    onChange={(e) => setCurrentRequest({...currentRequest, sapBpId: e.target.value})}
                    placeholder="Business Partner ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sapCaId">SAP CA ID *</Label>
                  <Input
                    id="sapCaId"
                    value={currentRequest.sapCaId}
                    onChange={(e) => setCurrentRequest({...currentRequest, sapCaId: e.target.value})}
                    placeholder="Contract Account ID"
                    required
                  />
                </div>
              </div>

              {/* Hardware Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Hardware Items</h3>
                  <Button onClick={addHardwareItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {selectedItems.map((item, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                      <div className="md:col-span-2">
                        <Label>Material Code</Label>
                        <Select 
                          value={item.materialCode} 
                          onValueChange={(value) => updateHardwareItem(index, "materialCode", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {hardwareItems.map((hardware) => (
                              <SelectItem key={hardware.materialCode} value={hardware.materialCode}>
                                {hardware.materialCode} - {hardware.materialName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateHardwareItem(index, "quantity", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div>
                        <Label>Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          readOnly
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <Label>Total Price</Label>
                        <Input
                          type="number"
                          value={item.totalPrice}
                          readOnly
                          className="bg-gray-50 dark:bg-gray-800"
                        />
                      </div>
                      <div>
                        <Button variant="destructive" size="sm" onClick={() => removeHardwareItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Pricing Summary */}
              {selectedItems.length > 0 && (
                <Card className="bg-gray-50 dark:bg-gray-800">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>TSH {calculateTotals().subtotal.toLocaleString()}</span>
                      </div>
                      {calculateTotals().discountAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Plan Discount:</span>
                          <span>-TSH {calculateTotals().discountAmount.toLocaleString()}</span>
                        </div>
                      )}

                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>TSH {calculateTotals().total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button onClick={handleCreateSale} disabled={createSaleMutation.isPending} className="flex-1">
                  {createSaleMutation.isPending ? "Creating..." : "Create Sale"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-check" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-azam-blue-600" />
                Payment Processing
              </CardTitle>
              <CardDescription>Process customer payments for hardware sales following CM workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by customer name, phone, or request ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-4">
                  {filteredSales.filter(sale => sale.paymentStatus === "PENDING").map((sale) => (
                    <Card key={sale.id} className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{sale.customerName}</h3>
                              {getStatusBadge(sale.status)}
                              {getPaymentStatusBadge(sale.paymentStatus)}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {sale.requestId} • {sale.customerPhone}
                            </p>
                            <p className="text-sm">
                              SAP BP ID: {sale.sapBpId} • Contract Account: {sale.sapCaId}
                            </p>
                            <p className="text-sm font-medium">
                              Total: TSH {sale.totalAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-4">
                          <div>
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment method" />
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
                          
                          <div className="flex items-end">
                            <Button
                              size="sm"
                              onClick={() => handleProcessPayment(sale)}
                              disabled={processPaymentMutation.isPending}
                              className="w-full"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {processPaymentMutation.isPending ? "Processing..." : "Process Payment"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Payment Details History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Payment Transactions</CardTitle>
                    <CardDescription>Customer hardware payment transactions processed through CM</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {paymentDetails.slice(0, 5).map((payment: any) => (
                        <div key={payment.payId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{payment.name}</span>
                              <Badge variant={payment.status === "COMPLETED" ? "default" : "secondary"}>
                                {payment.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {payment.payMode} • {payment.transId} • {payment.collectionCenter}
                            </p>
                            <p className="text-sm text-gray-500">
                              CM Status: {payment.cmStatus} • {payment.cmStatusMsg}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">TSH {payment.payAmount.toLocaleString()}</p>

                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-azam-blue-600" />
                Invoice Generation
              </CardTitle>
              <CardDescription>Generate invoices and post TRA requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredSales.filter(sale => sale.paymentStatus === "COMPLETED" && !sale.invoiceGenerated).map((sale) => (
                  <Card key={sale.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{sale.customerName}</h3>
                          {getStatusBadge(sale.status)}
                          {getPaymentStatusBadge(sale.paymentStatus)}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {sale.requestId} • {sale.customerPhone}
                        </p>
                        <p className="text-sm font-medium">
                          Total: TSH {sale.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => generateInvoiceMutation.mutate(sale.id)}
                          disabled={generateInvoiceMutation.isPending}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Invoice
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-azam-blue-600" />
                Sales History
              </CardTitle>
              <CardDescription>View all customer hardware sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search sales history..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="space-y-4">
                  {filteredSales.map((sale) => (
                    <Card key={sale.id} className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{sale.customerName}</h3>
                            {getStatusBadge(sale.status)}
                            {getPaymentStatusBadge(sale.paymentStatus)}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {sale.requestId} • {sale.customerPhone}
                          </p>
                          <p className="text-sm">
                            Total: TSH {sale.totalAmount.toLocaleString()} • 
                            Created: {new Date(sale.createDt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-2">
                            {sale.invoiceGenerated && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <Receipt className="h-3 w-3 mr-1" />
                                Invoice Generated
                              </Badge>
                            )}
                            {sale.traRequestPosted && (
                              <Badge variant="outline" className="text-blue-600 border-blue-600">
                                <FileText className="h-3 w-3 mr-1" />
                                TRA Posted
                              </Badge>
                            )}
                          </div>
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