import { useState, useEffect, useMemo } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Tv, 
  Calendar, 
  DollarSign,
  Edit,
  RefreshCw,
  Download,
  Eye,
  Settings,
  History,
  Wallet,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft,
  Package,
  Shield,
  Zap,
  ShoppingCart,
  RotateCcw,
  ArrowUpDown,
  Gift,
  Pause,
  Play,
  Power,
  X,
  Repeat,
  FileText,
  Users,
  TrendingUp,
  XCircle,
  Grid3x3,
  Filter,
  Plus,
  ChevronRight,
  Home,
  Star,
  Target,
  UserCheck,
  PhoneCall,
  MessageSquare,
  BarChart3,
  Receipt,
  Calendar as CalendarIcon,
  Search,
  ChevronDown,
  Building2,
  Server,
  CreditCard as CardIcon,
  HardDrive,
  Calculator,
  Loader2,
  Ban
} from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";
import type { Customer, Subscription } from "@shared/schema";

// Subscription purchase schema
const subscriptionPurchaseSchema = z.object({
  smartCardNumber: z.string().min(1, "Smart card number is required"),
  customerType: z.enum(["prepaid", "postpaid"]),
  planId: z.string().min(1, "Plan selection is required"),
  serviceType: z.enum(["residential", "hotel", "commercial"]).optional(),
  numberOfRooms: z.number().min(1).optional(),
  paymentMethod: z.enum(["wallet", "online", "agent", "otc"]),
  paymentAmount: z.number().min(0),
  autoRenewal: z.boolean(),
});

// Subscription renewal schema
const renewalSchema = z.object({
  smartCardNumber: z.string().min(1, "Smart card number is required"),
  renewalCount: z.number().min(1, "Renewal count must be at least 1").max(12, "Maximum 12 months"),
  paymentMethod: z.enum(["wallet", "online", "agent"]),
});

export default function SubscriberViewNew() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("customer");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("1");
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  
  // Additional state for subscription purchase functionality
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(0);
  
  const { t } = useTranslation();
  const { toast } = useToast();

  // Extract customer ID from URL
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const customerId = urlParams.get('id') || selectedAccount;

  // Fetch real-time data from your existing API
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['/api/customers'],
    enabled: true,
    refetchInterval: autoRefreshEnabled ? 30000 : false,
  });

  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['/api/subscriptions'],
    enabled: true,
    refetchInterval: autoRefreshEnabled ? 30000 : false,
  });

  // Fetch additional subscriber data
  const { data: paymentTransactionsData } = useQuery({
    queryKey: [`/api/customers/${customerId}/payment-transactions`],
    enabled: !!customerId,
  });

  const { data: serviceTransactionsData } = useQuery({
    queryKey: [`/api/customers/${customerId}/service-transactions`],
    enabled: !!customerId,
  });

  const { data: serviceActionsData } = useQuery({
    queryKey: [`/api/customers/${customerId}/service-actions`],
    enabled: !!customerId,
  });

  const { data: invoicesData } = useQuery({
    queryKey: [`/api/customers/${customerId}/invoices`],
    enabled: !!customerId,
  });

  const { data: ticketsData } = useQuery({
    queryKey: [`/api/customers/${customerId}/tickets`],
    enabled: !!customerId,
  });

  const { data: autoRenewalData } = useQuery({
    queryKey: [`/api/customers/${customerId}/auto-renewal`],
    enabled: !!customerId,
  });

  // Master data queries for subscription purchase
  const { data: subscriptionPlans = [], isLoading: plansLoading } = useQuery<any[]>({
    queryKey: ["/api/subscriptions/plans"],
  });

  const { data: availableOffers = [], isLoading: offersLoading } = useQuery<any[]>({
    queryKey: ["/api/subscriptions/offers"],
  });

  const { data: addOnPacks = [], isLoading: addOnsLoading } = useQuery<any[]>({
    queryKey: ["/api/subscriptions/addons"],
  });

  // Form initialization for subscription purchase
  const purchaseForm = useForm({ 
    resolver: zodResolver(subscriptionPurchaseSchema),
    defaultValues: {
      smartCardNumber: "",
      customerType: "prepaid" as const,
      planId: "",
      serviceType: "residential" as const,
      numberOfRooms: 1,
      paymentMethod: "wallet" as const,
      paymentAmount: 0,
      autoRenewal: false,
    }
  });

  // Form initialization for subscription renewal
  const renewalForm = useForm({ 
    resolver: zodResolver(renewalSchema),
    defaultValues: {
      smartCardNumber: "",
      renewalCount: 1,
      paymentMethod: "wallet" as const,
    }
  });

  // Wallet balance check and top-up prompt
  const checkWalletBalance = (requiredAmount: number) => {
    if (walletBalance < requiredAmount) {
      setTopUpAmount(requiredAmount - walletBalance);
      setPaymentGatewayOpen(true);
      return false;
    }
    return true;
  };

  // Process subscription purchase with payment gateway integration
  const processSubscriptionPurchase = async (data: any) => {
    setIsProcessing(true);
    setProcessingStep("Initiating subscription purchase...");

    try {
      const response = await apiRequest("POST", "/api/subscriptions/purchase", data);
      const result = await response.json();

      // Process workflow steps
      if (result.workflowSteps) {
        for (const step of result.workflowSteps) {
          setProcessingStep(`${step.step}. ${step.name}`);
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      // Update wallet balance if provided in response
      if (result.walletBalanceAfter !== undefined) {
        setWalletBalance(result.walletBalanceAfter);
      } else {
        setWalletBalance(prev => prev - data.paymentAmount);
      }

      toast({
        title: "Subscription Created Successfully",
        description: `Contract ID: ${result.contractId}, Invoice: ${result.invoiceNumber}`,
      });

      // Invalidate customer data to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
    } catch (error) {
      console.error("Subscription purchase error:", error);
      toast({
        title: "Subscription Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // Process payment top-up
  const processPaymentTopup = async (data: any) => {
    setIsProcessing(true);
    setProcessingStep("Processing payment top-up...");

    try {
      const response = await apiRequest("POST", "/api/subscriptions/payment-topup", data);
      const result = await response.json();

      setWalletBalance(prev => prev + data.topupAmount);
      
      toast({
        title: "Top-up Successful",
        description: `Wallet balance updated: TSH ${(walletBalance + data.topupAmount).toLocaleString()}`,
      });

    } catch (error) {
      console.error("Payment top-up error:", error);
      toast({
        title: "Top-up Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // Process renewal with count input and balance validation
  const processRenewal = async (data: any) => {
    const plan = subscriptionPlans.find(p => p.id === activeSubscription?.planId);
    const totalAmount = plan ? plan.price * data.renewalCount : 0;

    if (!checkWalletBalance(totalAmount)) return;

    setIsProcessing(true);
    setProcessingStep("Initiating subscription renewal...");

    try {
      const response = await apiRequest("POST", "/api/subscriptions/renewal", data);
      const result = await response.json();

      // Process predefined workflow steps
      const steps = [
        "1. Validating renewal eligibility",
        "2. Calculating renewal amount and count",
        "3. Wallet balance verification",
        "4. Processing payment transaction",
        "5. Creating renewal order in SAP SOM",
        "6. Extending subscription validity",
        "7. Updating contract in SAP CC",
        "8. Generating renewal invoice",
        "9. Financial posting to sub-ledger"
      ];

      for (let i = 0; i < steps.length; i++) {
        setProcessingStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      // Update wallet balance from response
      if (result.walletBalanceAfter !== undefined) {
        setWalletBalance(result.walletBalanceAfter);
      } else {
        setWalletBalance(prev => prev - totalAmount);
      }
      
      toast({
        title: "Renewal Successful",
        description: `Renewed until ${new Date(result.newExpiryDate).toLocaleDateString()}, Invoice: ${result.invoiceNumber}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      
    } catch (error) {
      console.error("Renewal error:", error);
      toast({
        title: "Renewal Failed",
        description: "Please try again or contact support",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // Find the current customer and their subscription
  const customerData = Array.isArray(customers) ? customers : (customers as any)?.data || [];
  const subscriptionData = Array.isArray(subscriptions) ? subscriptions : [];
  
  const currentCustomer = customerData.find((c: Customer) => c.id.toString() === customerId) || customerData[0];
  const customerSubscriptions = subscriptionData.filter((s: Subscription) => 
    s.customerId === (currentCustomer?.id || 1)
  );
  const activeSubscription = customerSubscriptions.find((s: Subscription) => s.status === 'active') || customerSubscriptions[0];

  // Extract API data with fallbacks
  const paymentTransactions = (paymentTransactionsData as any)?.data || [];
  const serviceTransactions = (serviceTransactionsData as any)?.data || [];
  const serviceActions = (serviceActionsData as any)?.data || [];
  const invoices = (invoicesData as any)?.data || [];
  const tickets = (ticketsData as any)?.data || [];
  const autoRenewalSettings = (autoRenewalData as any)?.data;

  // Format status badge
  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: string }> = {
      ACTIVE: { color: "bg-green-100 text-green-800", icon: "●" },
      COMPLETED: { color: "bg-cyan-100 text-cyan-800", icon: "●" },
      SUSPENDED: { color: "bg-yellow-100 text-yellow-800", icon: "●" },
      EXPIRED: { color: "bg-red-100 text-red-800", icon: "●" },
      PENDING: { color: "bg-blue-100 text-blue-800", icon: "●" }
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;

    return (
      <Badge className={`${config.color} text-xs px-2 py-1`}>
        <span className="mr-1">{config.icon}</span>
        {status}
      </Badge>
    );
  };

  if (customersLoading || subscriptionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscriber data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="flex min-h-full bg-gray-50">
      {/* Left Sidebar - Hidden as requested */}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        

        {/* Content Grid */}
        <div className="flex-1 p-3">
          <div className="flex gap-2">

            {/* Main Content Area */}
            <div className="flex-1" style={{ width: '80%' }}>
              {/* Customer Header */}
              <div className="bg-gradient-to-r from-azam-orange to-azam-orange-dark rounded-lg p-4 mb-3 text-white">
                <div className="flex items-start justify-between">
                  {/* Left Section - Customer Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold mb-2">
                        {currentCustomer?.firstName} {currentCustomer?.lastName}
                      </h1>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">
                          ID: {currentCustomer?.id}
                        </Badge>
                        <Badge className="bg-white/20 text-white border-white/30 text-xs px-2 py-1">
                          {currentCustomer?.customerType || 'Individual'}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-green-300" />
                          <span className="text-green-300 font-semibold text-sm">ACTIVE</span>
                        </div>
                        
                        {/* Member Info - moved after active section and on one line */}
                        <div className="text-orange-200 text-xs ml-2">
                          Member since: {currentCustomer?.createdAt ? new Date(currentCustomer.createdAt).toLocaleDateString() : '1/20/2024'} | Last update: {new Date().toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-orange-200 mb-2">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{currentCustomer?.phone || '+255 XXX XXX XXX'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{currentCustomer?.email || 'email@example.com'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Account Balance */}
                  <div className="text-right flex flex-col items-end">
                    {/* Account Balance */}
                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20 min-w-[160px]">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Wallet className="h-4 w-4 text-green-300" />
                        <span className="text-xs text-white/80 font-medium">Account Balance</span>
                      </div>
                      <div className="text-xl font-bold text-green-300 text-center">TZS 45,000</div>
                      <div className="text-xs text-white/60 text-center mt-1">Updated Today</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <div className="border-b border-gray-200">
                    <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
                      <TabsTrigger 
                        value="customer" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3"
                      >
                        Customer
                      </TabsTrigger>
                      <TabsTrigger 
                        value="billing" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3"
                      >
                        Billing
                      </TabsTrigger>
                      
                      <TabsTrigger 
                        value="tickets" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3"
                      >
                        Tickets
                      </TabsTrigger>
                      <TabsTrigger 
                        value="offer-change" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3"
                      >
                        Offer Change
                      </TabsTrigger>
                      <TabsTrigger 
                        value="transactions" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3"
                      >
                        Transactions
                      </TabsTrigger>
                      <TabsTrigger 
                        value="service-actions" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3"
                      >
                        Service Actions
                      </TabsTrigger>
                      <TabsTrigger 
                        value="invoices" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none px-6 py-3"
                      >
                        Invoices
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="history" className="m-0 p-6">
                   

                    {/* Recent Payments Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Receipt className="h-4 w-4 mr-2" />
                        Recent Payments
                      </h3>
                      <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-green-900">Service Fee 1 Month - Auto Renewal</p>
                              <p className="text-xs text-gray-600">26/4/2025</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 text-xs">TZS 25,000</Badge>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-green-900">Sports Ultimate Pack</p>
                              <p className="text-xs text-gray-600">24/4/2025</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 text-xs">TZS 8,000</Badge>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-sm font-medium text-green-900">Wallet Top up to M-Pesa</p>
                              <p className="text-xs text-gray-600">22/4/2025</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800 text-xs">TZS 30,000</Badge>
                          </div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Completed</Badge>
                        </div>
                      </div>
                    </div>

                    {/* Payment History Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
                        <div className="flex items-center gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Start Date</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>End Date</span>
                          </div>
                          <Input 
                            type="date" 
                            defaultValue="2024-01-01"
                            className="w-32"
                          />
                          <Input 
                            type="date" 
                            defaultValue="2024-12-31"
                            className="w-32"
                          />
                          <Select defaultValue={currentCustomer?.id?.toString() || ""}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={currentCustomer?.id?.toString() || ""}>
                                {currentCustomer?.id} - ({currentCustomer?.firstName})
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-600 hover:bg-blue-600">
                              <TableHead className="text-white font-semibold">Date</TableHead>
                              <TableHead className="text-white font-semibold">Payment ID</TableHead>
                              <TableHead className="text-white font-semibold">Process Type</TableHead>
                              <TableHead className="text-white font-semibold">Paid Amount (TZS)</TableHead>
                              <TableHead className="text-white font-semibold">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {customerSubscriptions.map((subscription: Subscription, index: number) => (
                              <TableRow key={`payment-${subscription.id}`} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                <TableCell className="text-sm">
                                  {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'}
                                </TableCell>
                                <TableCell className="text-sm">PAY{subscription.id.toString().padStart(6, '0')}</TableCell>
                                <TableCell className="text-sm">Payment History</TableCell>
                                <TableCell className="text-sm font-medium">
                                  {subscription.amount?.toLocaleString() || 'N/A'}
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                    ACTIVE
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="customer" className="m-0 p-6">
                    {/* Customer Accounts Section */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Customer Accounts</h3>
                      <div className="flex items-center gap-4 mb-4">
                        <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">CUS001 - Primary Account</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Accounts Found
                        </Button>
                      </div>
                    </div>

                    {/* Content Sections - 2x2 Grid Layout */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Customer Information */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
                            <User className="h-4 w-4 mr-2 text-blue-600" />
                            Customer Information
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Full Name:</span>
                              <span className="font-medium">{currentCustomer?.firstName} {currentCustomer?.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium">{currentCustomer?.customerType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Account Class:</span>
                              <span className="font-medium">RESIDENTIAL</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Connected:</span>
                              <span className="font-medium">15/1/2024</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="font-medium text-blue-600">{currentCustomer?.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">{currentCustomer?.phone}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Address:</span>
                              <span className="font-medium">132 Uhuru Street, Dar es Salaam</span>
                            </div>
                          </div>
                        </div>

                        {/* SAP Integration */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                            <Server className="h-4 w-4 mr-2 text-green-600" />
                            SAP Integration
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">BP ID:</span>
                              <span className="font-medium">8012345</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">CAP ID:</span>
                              <span className="font-medium">CAP398</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Contract ID:</span>
                              <span className="font-medium">GR123456789</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Smart Card:</span>
                              <span className="font-medium">{activeSubscription?.smartCardNumber}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">STB Serial:</span>
                              <span className="font-medium">VTVH300715</span>
                            </div>
                          </div>
                        </div>

                        {/* Hardware Details */}
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
                            <HardDrive className="h-4 w-4 mr-2 text-purple-600" />
                            Hardware Details
                          </h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">STB Model:</span>
                              <span className="font-medium">AZAM HD BOX V2</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Purchase Date:</span>
                              <span className="font-medium">15/1/2024</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Warranty:</span>
                              <span className="font-medium">15/1/2025</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Condition:</span>
                              <Badge className="bg-green-100 text-green-800 text-xs">Working</Badge>
                            </div>
                          </div>
                        </div>

                        {/* KYC Status & Documents - Combined */}
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-6">
                            {/* KYC Status Section */}
                            <div>
                              <h3 className="font-semibold text-orange-900 mb-4 flex items-center">
                                <Shield className="h-4 w-4 mr-2 text-orange-600" />
                                KYC Status
                              </h3>
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">KYC Status:</span>
                                  <Badge className="bg-green-100 text-green-800 text-xs">Verified</Badge>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Verification Date:</span>
                                  <span className="font-medium">15/01/2024</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600">Document ID:</span>
                                  <span className="font-medium">KYC-2024-003101</span>
                                </div>
                              </div>
                            </div>

                            {/* KYC Documents Section */}
                            <div>
                              <h3 className="font-semibold text-orange-900 mb-4 flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-orange-600" />
                                KYC Documents
                              </h3>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">Download PD (Proof of Identity)</span>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                                  <div className="flex items-center">
                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                    <span className="text-sm">Download PD (Proof of Address)</span>
                                  </div>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              <p className="text-xs text-gray-500 mt-2">Last Updated: 2 days ago</p>
                            </div>
                          </div>
                        </div>
                      </div>
                  </TabsContent>

                  <TabsContent value="customer-addons" className="m-0 p-6">
                    <div className="space-y-6">
                      {/* Active Add-Ons Section */}
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                          <Gift className="h-4 w-4 mr-2" />
                          Active Add-Ons
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-green-900">Sports Ultimate Pack</h4>
                                <p className="text-sm text-gray-600">TZS 8,000/month</p>
                                <p className="text-xs text-gray-500">Expires: 26/4/2025</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-medium text-green-900">Premium Movies Pack</h4>
                                <p className="text-sm text-gray-600">TZS 5,000/month</p>
                                <p className="text-xs text-gray-500">Expires: 26/4/2025</p>
                              </div>
                              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="billing" className="m-0 p-3">
                    {/* Current Subscription Section */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                        <Tv className="h-6 w-6 mr-3 text-blue-600" />
                        Current Subscription Plan
                      </h3>
                      {activeSubscription ? (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3 shadow-lg">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-2xl font-bold text-blue-900 mb-1">{activeSubscription.plan}</h4>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-blue-600 text-white text-sm px-3 py-1">PREPAID</Badge>
                                <Badge className="bg-purple-100 text-purple-800 text-sm px-3 py-1">
                                  Card: {activeSubscription.smartCardNumber}
                                </Badge>
                              </div>
                            </div>
                            <Badge className={`text-sm px-4 py-2 ${activeSubscription.status === 'active' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {activeSubscription.status.charAt(0).toUpperCase() + activeSubscription.status.slice(1)}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-1 mt-3">
                            <div className="bg-white/50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center gap-2 mb-0">
                                <DollarSign className="h-5 w-5 text-green-600" />
                                <span className="text-gray-700 font-medium">Monthly Amount</span>
                              </div>
                              <p className="text-2xl font-bold text-green-600">TZS {activeSubscription.amount.toLocaleString()}</p>
                            </div>
                            
                            <div className="bg-white/50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Calendar className="h-5 w-5 text-blue-600" />
                                <span className="text-gray-700 font-medium">Subscription Period</span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {new Date(activeSubscription.startDate).toLocaleDateString('en-GB')} - {new Date(activeSubscription.endDate).toLocaleDateString('en-GB')}
                              </p>
                            </div>
                            
                            <div className="bg-white/50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <RefreshCw className="h-5 w-5 text-orange-600" />
                                <span className="text-gray-700 font-medium">Auto Renewal</span>
                              </div>
                              <Badge className={`text-sm ${activeSubscription.autoRenewal ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <Zap className="h-3 w-3 mr-1" />
                                {activeSubscription.autoRenewal ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                            
                            <div className="bg-white/50 rounded-lg p-4 border border-blue-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Clock className="h-5 w-5 text-purple-600" />
                                <span className="text-gray-700 font-medium">Days Remaining</span>
                              </div>
                              <p className="text-xl font-bold text-purple-600">
                                {Math.ceil((new Date(activeSubscription.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                          <Tv className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-gray-500 text-lg">No active subscription found</p>
                          <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Subscribe Now
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* All Subscription Management Table */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 flex items-center">
                          <Grid3x3 className="h-4 w-4 mr-2" />
                          All Subscription Management
                        </h3>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => setActiveOperation("new-purchase")}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            New Subscription
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-blue-600 text-blue-600"
                            onClick={() => setActiveOperation("renew-plan")}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Renewal
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-purple-600 text-purple-600"
                            onClick={() => setActiveOperation("change-plan")}
                          >
                            <ArrowUpDown className="h-4 w-4 mr-1" />
                            Plan Change
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-orange-600 text-orange-600"
                            onClick={() => setActiveOperation("add-ons")}
                          >
                            <Gift className="h-4 w-4 mr-1" />
                            Add-ons
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-600 hover:bg-blue-600">
                              <TableHead className="text-white font-semibold">Smart Card</TableHead>
                              <TableHead className="text-white font-semibold">Plan Details</TableHead>
                              <TableHead className="text-white font-semibold">Amount</TableHead>
                              <TableHead className="text-white font-semibold">Start Date</TableHead>
                              <TableHead className="text-white font-semibold">End Date</TableHead>
                              <TableHead className="text-white font-semibold">Status</TableHead>
                              <TableHead className="text-white font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <TableRow>
                              <TableCell className="text-sm font-medium">SUM524567</TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm font-medium text-blue-600">Base</p>
                                  <p className="text-xs text-gray-500">→ Expires Soon</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium">TZS 25,000</TableCell>
                              <TableCell className="text-sm">14/06/2025</TableCell>
                              <TableCell className="text-sm">13/06/2025</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                  active
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                            <TableRow className="bg-gray-50">
                              <TableCell className="text-sm font-medium">SUM524568</TableCell>
                              <TableCell>
                                <div>
                                  <p className="text-sm font-medium text-blue-600">Base</p>
                                  <p className="text-xs text-gray-500">→ Expires Soon</p>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm font-medium">TZS 15,000</TableCell>
                              <TableCell className="text-sm">14/06/2025</TableCell>
                              <TableCell className="text-sm">13/06/2025</TableCell>
                              <TableCell>
                                <Badge className="bg-green-100 text-green-800 text-xs flex items-center gap-1">
                                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                                  active
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    {/* Subscription Operation Forms */}
                    {activeOperation && (
                      <div className="mt-8">
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                          
                          {/* New Purchase Form */}
                          {activeOperation === "new-purchase" && (
                            <div>
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-blue-900 flex items-center">
                                  <ShoppingCart className="h-6 w-6 mr-3" />
                                  New Subscription Purchase
                                </h3>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setActiveOperation(null)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <Form {...purchaseForm}>
                                <form onSubmit={purchaseForm.handleSubmit((data) => {
                                  const selectedPlan = subscriptionPlans.find(p => p.id === data.planId);
                                  if (!selectedPlan) return;
                                  
                                  const finalData = {
                                    ...data,
                                    paymentAmount: selectedPlan.price,
                                    smartCardNumber: data.smartCardNumber || `SC${Date.now()}`
                                  };

                                  if (!checkWalletBalance(finalData.paymentAmount)) return;
                                  processSubscriptionPurchase(finalData);
                                })} className="space-y-6">
                                  
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <FormField
                                        control={purchaseForm.control}
                                        name="smartCardNumber"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Smart Card Number</FormLabel>
                                            <FormControl>
                                              <Input
                                                placeholder="Enter smart card number"
                                                {...field}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={purchaseForm.control}
                                        name="customerType"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Customer Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select customer type" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="prepaid">Prepaid</SelectItem>
                                                <SelectItem value="postpaid">Postpaid</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      {(purchaseForm.watch("customerType") as string) === "postpaid" && (
                                        <>
                                          <FormField
                                            control={purchaseForm.control}
                                            name="serviceType"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Service Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Select service type" />
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    <SelectItem value="residential">Residential</SelectItem>
                                                    <SelectItem value="hotel">Hotel</SelectItem>
                                                    <SelectItem value="commercial">Commercial</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />

                                          <FormField
                                            control={purchaseForm.control}
                                            name="numberOfRooms"
                                            render={({ field }) => (
                                              <FormItem>
                                                <FormLabel>Number of Rooms</FormLabel>
                                                <FormControl>
                                                  <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                  />
                                                </FormControl>
                                                <FormMessage />
                                              </FormItem>
                                            )}
                                          />
                                        </>
                                      )}

                                      <FormField
                                        control={purchaseForm.control}
                                        name="planId"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Select Plan</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select subscription plan" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                {subscriptionPlans.map((plan) => (
                                                  <SelectItem key={plan.id} value={plan.id}>
                                                    {plan.name} - TSH {plan.price.toLocaleString()}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <FormField
                                        control={purchaseForm.control}
                                        name="paymentMethod"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Payment Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="wallet">Wallet Balance</SelectItem>
                                                <SelectItem value="online">Online Payment</SelectItem>
                                                <SelectItem value="agent">Agent Payment</SelectItem>
                                                <SelectItem value="otc">Over The Counter</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={purchaseForm.control}
                                        name="autoRenewal"
                                        render={({ field }) => (
                                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                            <div className="space-y-0.5">
                                              <FormLabel>Auto Renewal</FormLabel>
                                              <div className="text-sm text-gray-600">
                                                Enable automatic subscription renewal
                                              </div>
                                            </div>
                                            <FormControl>
                                              <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                              />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />

                                      {purchaseForm.watch("planId") && (
                                        <div className="bg-green-50 p-4 rounded-lg">
                                          <div className="text-sm font-medium text-green-800">Total Amount</div>
                                          <div className="text-2xl font-bold text-green-600">
                                            TSH {subscriptionPlans.find(p => p.id === purchaseForm.watch("planId"))?.price.toLocaleString() || "0"}
                                          </div>
                                          <div className="text-xs text-green-600">Including taxes and fees</div>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {isProcessing && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <div className="flex items-center space-x-3">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        <div>
                                          <div className="font-medium text-blue-900">Processing Purchase...</div>
                                          <div className="text-sm text-blue-700">{processingStep}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-3">
                                    <Button 
                                      type="submit" 
                                      disabled={isProcessing}
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                    >
                                      <CreditCard className="h-4 w-4 mr-2" />
                                      {isProcessing ? "Processing..." : "Create Subscription"}
                                    </Button>
                                    <Button type="button" variant="outline">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Save as Draft
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </div>
                          )}

                          {/* Renew Plan Form */}
                          {activeOperation === "renew-plan" && (
                            <div>
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-blue-900 flex items-center">
                                  <RefreshCw className="h-6 w-6 mr-3" />
                                  Renew Subscription Plan
                                </h3>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setActiveOperation(null)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>

                              <Form {...renewalForm}>
                                <form onSubmit={renewalForm.handleSubmit((data) => {
                                  const finalData = {
                                    ...data,
                                    smartCardNumber: activeSubscription?.smartCardNumber || `SC${Date.now()}`
                                  };
                                  processRenewal(finalData);
                                })} className="space-y-6">
                                  
                                  <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <div className="bg-blue-50 p-4 rounded-lg">
                                        <h4 className="font-medium text-blue-800 mb-2">Current Subscription</h4>
                                        <div className="text-sm space-y-1">
                                          <div className="flex justify-between">
                                            <span>Smart Card:</span>
                                            <span className="font-medium">{activeSubscription?.smartCardNumber}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Plan:</span>
                                            <span className="font-medium">{activeSubscription?.plan}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Expires:</span>
                                            <span className="font-medium">
                                              {activeSubscription?.endDate ? new Date(activeSubscription.endDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>Status:</span>
                                            <Badge className="bg-green-100 text-green-800 text-xs">
                                              {activeSubscription?.status}
                                            </Badge>
                                          </div>
                                        </div>
                                      </div>

                                      <FormField
                                        control={renewalForm.control}
                                        name="renewalCount"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Renewal Count (Months)</FormLabel>
                                            <FormControl>
                                              <Input
                                                type="number"
                                                min="1"
                                                max="12"
                                                {...field}
                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />

                                      <FormField
                                        control={renewalForm.control}
                                        name="paymentMethod"
                                        render={({ field }) => (
                                          <FormItem>
                                            <FormLabel>Payment Method</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                              <FormControl>
                                                <SelectTrigger>
                                                  <SelectValue placeholder="Select payment method" />
                                                </SelectTrigger>
                                              </FormControl>
                                              <SelectContent>
                                                <SelectItem value="wallet">Wallet Balance</SelectItem>
                                                <SelectItem value="online">Online Payment</SelectItem>
                                                <SelectItem value="agent">Agent Payment</SelectItem>
                                              </SelectContent>
                                            </Select>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>
                                    
                                    <div className="space-y-4">
                                      {renewalForm.watch("renewalCount") && activeSubscription && (
                                        <div className="p-4 bg-green-50 rounded-lg">
                                          <h4 className="font-semibold mb-2">Renewal Summary</h4>
                                          <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                              <span className="text-gray-600">Current Plan:</span>
                                              <div className="font-medium">{activeSubscription.plan}</div>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">Renewal Period:</span>
                                              <div className="font-medium">{renewalForm.watch("renewalCount")} months</div>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">Current Expiry:</span>
                                              <div className="font-medium">
                                                {activeSubscription.endDate ? new Date(activeSubscription.endDate).toLocaleDateString() : 'N/A'}
                                              </div>
                                            </div>
                                            <div>
                                              <span className="text-gray-600">New Expiry:</span>
                                              <div className="font-medium text-green-600">
                                                {activeSubscription.endDate ? 
                                                  new Date(new Date(activeSubscription.endDate).getTime() + 
                                                    (renewalForm.watch("renewalCount") * 30 * 24 * 60 * 60 * 1000))
                                                    .toLocaleDateString() : 'N/A'}
                                              </div>
                                            </div>
                                          </div>
                                          <div className="mt-4 pt-4 border-t border-green-200">
                                            <div className="flex justify-between items-center">
                                              <span className="font-semibold">Total Amount:</span>
                                              <span className="font-bold text-lg text-green-600">
                                                TSH {((subscriptionPlans.find(p => p.id === activeSubscription.planId)?.price || 0) * 
                                                  renewalForm.watch("renewalCount")).toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-sm font-medium text-gray-700">Wallet Balance</div>
                                        <div className="text-xl font-bold text-gray-900">
                                          TSH {walletBalance.toLocaleString()}
                                        </div>
                                        <div className="text-xs text-gray-600">Available for payment</div>
                                      </div>
                                    </div>
                                  </div>

                                  {isProcessing && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                      <div className="flex items-center space-x-3">
                                        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                                        <div>
                                          <div className="font-medium text-blue-900">Processing Renewal...</div>
                                          <div className="text-sm text-blue-700">{processingStep}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <div className="flex gap-3">
                                    <Button 
                                      type="submit" 
                                      disabled={isProcessing}
                                      className="bg-blue-600 hover:bg-blue-700 text-white"
                                    >
                                      <RefreshCw className="h-4 w-4 mr-2" />
                                      {isProcessing ? "Processing..." : "Process Renewal"}
                                    </Button>
                                    <Button type="button" variant="outline">
                                      <Calendar className="h-4 w-4 mr-2" />
                                      Schedule Renewal
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </div>
                          )}

                          {/* Change Plan Form */}
                          {activeOperation === "change-plan" && (
                            <div>
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-blue-900 flex items-center">
                                  <ArrowUpDown className="h-6 w-6 mr-3" />
                                  Change Subscription Plan
                                </h3>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setActiveOperation(null)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Current Subscription</Label>
                                    <Select>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select subscription to change" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {customerSubscriptions.map((sub: Subscription) => (
                                          <SelectItem key={sub.id} value={sub.id.toString()}>
                                            {sub.smartCardNumber} - {sub.plan}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">New Plan</Label>
                                    <Select>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select new plan" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="basic">Basic Plan - TZS 15,000</SelectItem>
                                        <SelectItem value="standard">Standard Plan - TZS 25,000</SelectItem>
                                        <SelectItem value="premium">Premium Plan - TZS 35,000</SelectItem>
                                        <SelectItem value="ultimate">Ultimate Plan - TZS 50,000</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Change Type</Label>
                                    <Select>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select change type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="immediate">Immediate Change</SelectItem>
                                        <SelectItem value="next-cycle">Next Billing Cycle</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Current Plan</h4>
                                    <div className="text-sm space-y-1">
                                      <div className="flex justify-between">
                                        <span>Plan:</span>
                                        <span className="font-medium">{activeSubscription?.plan}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Amount:</span>
                                        <span className="font-medium">TZS {activeSubscription?.amount?.toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-green-800 mb-2">Price Difference</h4>
                                    <div className="text-sm space-y-1">
                                      <div className="flex justify-between">
                                        <span>Current Plan:</span>
                                        <span>TZS 25,000</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>New Plan:</span>
                                        <span>TZS 35,000</span>
                                      </div>
                                      <div className="flex justify-between font-medium">
                                        <span>Difference:</span>
                                        <span className="text-green-600">+TZS 10,000</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-3 mt-6">
                                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                  <ArrowUpDown className="h-4 w-4 mr-2" />
                                  Change Plan
                                </Button>
                                <Button variant="outline">
                                  <Calculator className="h-4 w-4 mr-2" />
                                  Calculate Difference
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Add-ons Form */}
                          {activeOperation === "add-ons" && (
                            <div>
                              <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-blue-900 flex items-center">
                                  <Gift className="h-6 w-6 mr-3" />
                                  Manage Add-ons
                                </h3>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setActiveOperation(null)}
                                  className="text-gray-500 hover:text-gray-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700">Subscription</Label>
                                    <Select>
                                      <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Select subscription" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {customerSubscriptions.map((sub: Subscription) => (
                                          <SelectItem key={sub.id} value={sub.id.toString()}>
                                            {sub.smartCardNumber} - {sub.plan}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Available Add-ons</Label>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                          <div className="font-medium">Sports Ultimate Pack</div>
                                          <div className="text-sm text-gray-600">TZS 8,000/month</div>
                                        </div>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                          <Plus className="h-4 w-4 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                      
                                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                          <div className="font-medium">Premium Movies Pack</div>
                                          <div className="text-sm text-gray-600">TZS 5,000/month</div>
                                        </div>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                          <Plus className="h-4 w-4 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                      
                                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                          <div className="font-medium">Kids Entertainment</div>
                                          <div className="text-sm text-gray-600">TZS 3,000/month</div>
                                        </div>
                                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                          <Plus className="h-4 w-4 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div>
                                    <Label className="text-sm font-medium text-gray-700 mb-3 block">Current Add-ons</Label>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                          <div className="font-medium text-green-800">Sports Ultimate Pack</div>
                                          <div className="text-sm text-green-600">TZS 8,000/month - Expires: 26/4/2025</div>
                                        </div>
                                        <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                                          <X className="h-4 w-4 mr-1" />
                                          Remove
                                        </Button>
                                      </div>
                                      
                                      <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                        <div>
                                          <div className="font-medium text-green-800">Premium Movies Pack</div>
                                          <div className="text-sm text-green-600">TZS 5,000/month - Expires: 26/4/2025</div>
                                        </div>
                                        <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
                                          <X className="h-4 w-4 mr-1" />
                                          Remove
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="text-sm font-medium text-blue-800">Total Add-ons Cost</div>
                                    <div className="text-2xl font-bold text-blue-600">TZS 13,000</div>
                                    <div className="text-xs text-blue-600">Per month</div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-3 mt-6">
                                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                                  <Gift className="h-4 w-4 mr-2" />
                                  Apply Changes
                                </Button>
                                <Button variant="outline">
                                  <FileText className="h-4 w-4 mr-2" />
                                  Preview Invoice
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tickets" className="m-0 p-6">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Support Tickets & Service Calls</h3>
                      
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-600 hover:bg-blue-600">
                              <TableHead className="text-white font-semibold">Date</TableHead>
                              <TableHead className="text-white font-semibold">Ticket ID</TableHead>
                              <TableHead className="text-white font-semibold">Type</TableHead>
                              <TableHead className="text-white font-semibold">Priority</TableHead>
                              <TableHead className="text-white font-semibold">Status</TableHead>
                              <TableHead className="text-white font-semibold">Agent</TableHead>
                              <TableHead className="text-white font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tickets.length > 0 ? tickets.map((ticket: any, index: number) => (
                              <TableRow key={ticket.id} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                                <TableCell className="text-sm">{ticket.date} {ticket.time}</TableCell>
                                <TableCell className="text-sm font-medium">{ticket.ticketId}</TableCell>
                                <TableCell className="text-sm">{ticket.type}</TableCell>
                                <TableCell>
                                  <Badge className={`${
                                    ticket.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    ticket.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  } text-xs`}>
                                    {ticket.priority}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={`${
                                    ticket.status === 'Resolved' || ticket.status === 'Closed' ? 'bg-green-100 text-green-800' :
                                    ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  } text-xs`}>
                                    {ticket.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{ticket.agent}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                  No tickets found for this customer
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="offer-change" className="m-0 p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        
                        
                      </div>

                      {/* Customer Offer Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-azam-blue">{activeSubscription?.planName}</div>
                            <p className="text-xs text-gray-600 mt-1">Valid until {activeSubscription?.endDate ? new Date(activeSubscription.endDate).toLocaleDateString() : 'N/A'}</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-green-600">1</div>
                            <p className="text-xs text-gray-600 mt-1">50% Off First Month</p>
                          </CardContent>
                        </Card>
                        
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium">Available Offers</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold text-azam-orange">4</div>
                            <p className="text-xs text-gray-600 mt-1">Eligible offers ready to apply</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Offer Change Tabs */}
                      <Tabs defaultValue="immediate" className="space-y-3">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="immediate" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Immediate Change
                          </TabsTrigger>
                          <TabsTrigger value="scheduled" className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Scheduled Change
                          </TabsTrigger>
                          <TabsTrigger value="active-offers" className="flex items-center gap-2">
                            <Gift className="h-4 w-4" />
                            Active Offers
                          </TabsTrigger>
                          <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Change History
                          </TabsTrigger>
                        </TabsList>

                        {/* Immediate Offer Change */}
                        <TabsContent value="immediate" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-azam-blue" />
                                Immediate Offer Change
                              </CardTitle>
                              <CardDescription>
                                Apply promotional offers immediately with real-time activation. Changes take effect instantly.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              {/* Customer is already loaded, so we skip customer search */}
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium text-blue-900">Customer Details</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-gray-600">Name: </span>
                                    <span className="font-medium">{currentCustomer?.firstName} {currentCustomer?.lastName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Smart Card: </span>
                                    <span className="font-medium">{activeSubscription?.smartCardNumber}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Current Plan: </span>
                                    <span className="font-medium">{activeSubscription?.planName}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Status: </span>
                                    <Badge className="bg-green-100 text-green-800 text-xs">{activeSubscription?.status}</Badge>
                                  </div>
                                </div>
                              </div>

                              {/* Available Offers */}
                              <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Available Offers</h4>
                                <div className="grid gap-4">
                                  {/* Offer 1 */}
                                  <div className="border border-gray-200 rounded-lg p-4 hover:border-azam-blue transition-colors">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-medium text-gray-900">50% Off First Month</h5>
                                          <Badge className="bg-azam-orange/10 text-azam-orange text-xs">DISCOUNT</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Get 50% discount on your current plan for the first month</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                          <span>Validity: 30 days</span>
                                          <span>Savings: TZS 6,000</span>
                                        </div>
                                      </div>
                                      <Button size="sm" className="bg-azam-blue hover:bg-azam-blue/90">
                                        Apply Now
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Offer 2 */}
                                  <div className="border border-gray-200 rounded-lg p-4 hover:border-azam-blue transition-colors">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-medium text-gray-900">Free Premium Upgrade</h5>
                                          <Badge className="bg-blue-100 text-blue-800 text-xs">UPGRADE</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Upgrade to Premium plan for free for 2 months</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                          <span>Validity: 60 days</span>
                                          <span>Value: TZS 23,000</span>
                                        </div>
                                      </div>
                                      <Button size="sm" className="bg-azam-blue hover:bg-azam-blue/90">
                                        Apply Now
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Offer 3 */}
                                  <div className="border border-gray-200 rounded-lg p-4 hover:border-azam-blue transition-colors">
                                    <div className="flex items-start justify-between">
                                      <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-medium text-gray-900">Sports Package Free</h5>
                                          <Badge className="bg-green-100 text-green-800 text-xs">FREE ADDON</Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">Get Sports add-on pack completely free for 1 month</p>
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                          <span>Validity: 30 days</span>
                                          <span>Value: TZS 8,000</span>
                                        </div>
                                      </div>
                                      <Button size="sm" className="bg-azam-blue hover:bg-azam-blue/90">
                                        Apply Now
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Scheduled Offer Change */}
                        <TabsContent value="scheduled" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-azam-blue" />
                                Scheduled Offer Change
                              </CardTitle>
                              <CardDescription>
                                Schedule promotional offers for future activation. Perfect for renewal dates or special occasions.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="text-center py-8 text-gray-500">
                                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                <p>No scheduled offer changes</p>
                                <p className="text-sm">Schedule an offer to appear here</p>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Active Offers */}
                        <TabsContent value="active-offers" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Gift className="h-5 w-5 text-azam-blue" />
                                Active Offers
                              </CardTitle>
                              <CardDescription>
                                Currently active promotional offers and their details.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <h5 className="font-medium text-green-900">50% Off First Month</h5>
                                        <Badge className="bg-green-100 text-green-800 text-xs">ACTIVE</Badge>
                                      </div>
                                      <p className="text-sm text-green-700">Applied on: January 15, 2025</p>
                                      <p className="text-sm text-green-700">Expires: February 14, 2025</p>
                                      <p className="text-sm text-green-700">Monthly Savings: TZS 6,000</p>
                                    </div>
                                    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                                      Cancel Offer
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Change History */}
                        <TabsContent value="history" className="space-y-6">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-azam-blue" />
                                Offer Change History
                              </CardTitle>
                              <CardDescription>
                                Complete history of all offer changes and modifications for this customer.
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-azam-blue hover:bg-azam-blue">
                                        <TableHead className="text-white font-semibold">Date & Time</TableHead>
                                        <TableHead className="text-white font-semibold">Event</TableHead>
                                        <TableHead className="text-white font-semibold">Offer Name</TableHead>
                                        <TableHead className="text-white font-semibold">Type</TableHead>
                                        <TableHead className="text-white font-semibold">Status</TableHead>
                                        <TableHead className="text-white font-semibold">Savings</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell className="text-sm">2025-01-25 14:30</TableCell>
                                        <TableCell className="text-sm">Offer change - Immediate</TableCell>
                                        <TableCell className="text-sm font-medium">Free Premium Upgrade</TableCell>
                                        <TableCell className="text-sm">Immediate</TableCell>
                                        <TableCell>
                                          <Badge className="bg-green-100 text-green-800 text-xs">Success</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">TZS 23,000</TableCell>
                                      </TableRow>
                                      <TableRow className="bg-gray-50">
                                        <TableCell className="text-sm">2025-01-20 09:15</TableCell>
                                        <TableCell className="text-sm">Scheduled offer cancelled</TableCell>
                                        <TableCell className="text-sm font-medium">Sports Package Free</TableCell>
                                        <TableCell className="text-sm">Cancellation</TableCell>
                                        <TableCell>
                                          <Badge className="bg-red-100 text-red-800 text-xs">Cancelled</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">TZS 0</TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell className="text-sm">2025-01-15 10:00</TableCell>
                                        <TableCell className="text-sm">Initial offer applied</TableCell>
                                        <TableCell className="text-sm font-medium">50% Off First Month</TableCell>
                                        <TableCell className="text-sm">Immediate</TableCell>
                                        <TableCell>
                                          <Badge className="bg-green-100 text-green-800 text-xs">Success</Badge>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium">TZS 6,000</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </TabsContent>

                  <TabsContent value="transactions" className="m-0 p-6">
                    <div className="space-y-6">
                      {/* Payment Transactions Section */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                            Payment Transactions
                          </h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                            <Button variant="outline" size="sm">
                              <Filter className="h-4 w-4 mr-1" />
                              Filter
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-green-600 hover:bg-green-600">
                                <TableHead className="text-white font-semibold">Date & Time</TableHead>
                                <TableHead className="text-white font-semibold">Transaction ID</TableHead>
                                <TableHead className="text-white font-semibold">Payment Method</TableHead>
                                <TableHead className="text-white font-semibold">Amount</TableHead>
                                <TableHead className="text-white font-semibold">Status</TableHead>
                                <TableHead className="text-white font-semibold">Reference</TableHead>
                                <TableHead className="text-white font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paymentTransactions.length > 0 ? paymentTransactions.map((payment: any, index: number) => (
                                <TableRow key={payment.id} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                                  <TableCell className="text-sm">{payment.date} {payment.time}</TableCell>
                                  <TableCell className="text-sm font-medium text-blue-600">{payment.transactionId}</TableCell>
                                  <TableCell className="text-sm">{payment.paymentMethod}</TableCell>
                                  <TableCell className="text-sm font-medium">{payment.currency} {payment.amount.toLocaleString()}</TableCell>
                                  <TableCell>
                                    <Badge className={`${
                                      payment.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                      payment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    } text-xs`}>
                                      {payment.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">{payment.reference}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1">
                                      <Button variant="ghost" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                    No payment transactions found for this customer
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>

                      {/* Service Transactions Section */}
                      <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Settings className="h-5 w-5 mr-2 text-blue-600" />
                            Service Transactions
                          </h3>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Export
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-blue-600 hover:bg-blue-600">
                                <TableHead className="text-white font-semibold">Date & Time</TableHead>
                                <TableHead className="text-white font-semibold">Service Type</TableHead>
                                <TableHead className="text-white font-semibold">Smart Card</TableHead>
                                <TableHead className="text-white font-semibold">Action</TableHead>
                                <TableHead className="text-white font-semibold">Status</TableHead>
                                <TableHead className="text-white font-semibold">Agent</TableHead>
                                <TableHead className="text-white font-semibold">Remarks</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {serviceTransactions.length > 0 ? serviceTransactions.map((service: any, index: number) => (
                                <TableRow key={service.id} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                                  <TableCell className="text-sm">{service.date} {service.time}</TableCell>
                                  <TableCell className="text-sm">{service.serviceType}</TableCell>
                                  <TableCell className="text-sm font-medium">{service.smartCard}</TableCell>
                                  <TableCell className="text-sm">{service.action}</TableCell>
                                  <TableCell>
                                    <Badge className={`${
                                      service.status === 'Completed' || service.status === 'Active' ? 'bg-green-100 text-green-800' :
                                      service.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                      'bg-yellow-100 text-yellow-800'
                                    } text-xs`}>
                                      {service.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">{service.agent}</TableCell>
                                  <TableCell className="text-sm">{service.remarks}</TableCell>
                                </TableRow>
                              )) : (
                                <TableRow>
                                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                    No service transactions found for this customer
                                  </TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="service-actions" className="m-0 p-6">
                    <div className="space-y-6">
                      {/* Service Actions Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <Settings className="h-6 w-6 mr-3 text-blue-600" />
                          Subscription Service Actions
                        </h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Event
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Export History
                          </Button>
                        </div>
                      </div>

                      {/* Quick Action Cards */}
                      <div className="grid grid-cols-4 gap-4 mb-8">
                        <Card className="border-green-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 text-center">
                            <ShoppingCart className="h-8 w-8 text-green-600 mx-auto mb-2" />
                            <h4 className="font-medium text-green-900">Purchase</h4>
                            <p className="text-xs text-green-600">New Subscription</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 text-center">
                            <RefreshCw className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                            <h4 className="font-medium text-blue-900">Renewal</h4>
                            <p className="text-xs text-blue-600">Extend Service</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-yellow-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 text-center">
                            <Pause className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <h4 className="font-medium text-yellow-900">Suspension</h4>
                            <p className="text-xs text-yellow-600">Temporary Hold</p>
                          </CardContent>
                        </Card>
                        
                        <Card className="border-red-200 hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4 text-center">
                            <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                            <h4 className="font-medium text-red-900">Termination</h4>
                            <p className="text-xs text-red-600">End Service</p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Service Actions History */}
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4 bg-blue-50 border-b border-gray-200">
                          <h4 className="font-semibold text-blue-900">Service Actions History</h4>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="font-semibold">Date & Time</TableHead>
                              <TableHead className="font-semibold">Action Type</TableHead>
                              <TableHead className="font-semibold">Smart Card</TableHead>
                              <TableHead className="font-semibold">Details</TableHead>
                              <TableHead className="font-semibold">Status</TableHead>
                              <TableHead className="font-semibold">Performed By</TableHead>
                              <TableHead className="font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {serviceActions.length > 0 ? serviceActions.map((action: any, index: number) => (
                              <TableRow key={action.id} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                                <TableCell className="text-sm">{action.date} {action.time}</TableCell>
                                <TableCell>
                                  <Badge className={`${
                                    action.actionType === 'Subscription Purchase' ? 'bg-green-100 text-green-800' :
                                    action.actionType === 'Subscription Renewal' ? 'bg-blue-100 text-blue-800' :
                                    action.actionType === 'Plan Change' ? 'bg-purple-100 text-purple-800' :
                                    action.actionType === 'Offer Change' ? 'bg-orange-100 text-orange-800' :
                                    action.actionType === 'Suspension' ? 'bg-yellow-100 text-yellow-800' :
                                    action.actionType === 'Reconnection' ? 'bg-green-100 text-green-800' :
                                    action.actionType === 'Plan Validity Extension' ? 'bg-blue-100 text-blue-800' :
                                    action.actionType === 'Add Add-ON Pack' ? 'bg-indigo-100 text-indigo-800' :
                                    action.actionType === 'Retrack' ? 'bg-gray-100 text-gray-800' :
                                    action.actionType === 'Replacement' ? 'bg-teal-100 text-teal-800' :
                                    'bg-gray-100 text-gray-800'
                                  } text-xs`}>
                                    {action.actionType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm font-medium">{action.smartCard}</TableCell>
                                <TableCell className="text-sm">{action.details}</TableCell>
                                <TableCell>
                                  <Badge className={`${
                                    action.status === 'Completed' || action.status === 'Active' || action.status === 'Applied' ? 'bg-green-100 text-green-800' :
                                    action.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                    action.status === 'Resolved' ? 'bg-red-100 text-red-800' :
                                    'bg-yellow-100 text-yellow-800'
                                  } text-xs`}>
                                    {action.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{action.performedBy}</TableCell>
                                <TableCell>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                  No service actions found for this customer
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="invoices" className="m-0 p-6">
                    <div className="space-y-6">
                      {/* Invoice Header */}
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <FileText className="h-6 w-6 mr-3 text-blue-600" />
                          Invoice Management
                        </h3>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Generate Invoice
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            Export All
                          </Button>
                        </div>
                      </div>

                      {/* Auto Renew Settings */}
                      <Card className="border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center">
                            <RefreshCw className="h-5 w-5 mr-2 text-blue-600" />
                            Auto Renew Settings
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                                <div>
                                  <h4 className="font-medium text-blue-900">Current Status</h4>
                                  <p className="text-sm text-blue-600">Auto renewal for active subscriptions</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${autoRenewalSettings?.enabled ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                    {autoRenewalSettings?.enabled ? 'ON' : 'OFF'}
                                  </Badge>
                                  <Button variant="outline" size="sm">
                                    {autoRenewalSettings?.enabled ? 'Turn OFF' : 'Turn ON'}
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium text-gray-900 mb-2">Next Auto Renewal</h4>
                                <p className="text-sm text-gray-600">
                                  {autoRenewalSettings?.nextRenewalDate ? 
                                    `Scheduled for ${autoRenewalSettings.nextRenewalDate}` 
                                    : 'No scheduled renewal'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Amount: {autoRenewalSettings?.amount || 'TZS 0'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Invoice List */}
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <h4 className="font-semibold text-gray-900">Invoice History</h4>
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-blue-600 hover:bg-blue-600">
                              <TableHead className="text-white font-semibold">Invoice #</TableHead>
                              <TableHead className="text-white font-semibold">Date</TableHead>
                              <TableHead className="text-white font-semibold">Description</TableHead>
                              <TableHead className="text-white font-semibold">Amount</TableHead>
                              <TableHead className="text-white font-semibold">Status</TableHead>
                              <TableHead className="text-white font-semibold">Payment Method</TableHead>
                              <TableHead className="text-white font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoices.length > 0 ? invoices.map((invoice: any, index: number) => (
                              <TableRow key={invoice.id} className={index % 2 === 0 ? "" : "bg-gray-50"}>
                                <TableCell className={`text-sm font-medium ${
                                  invoice.status === 'Cancelled' ? 'text-red-600' : 'text-blue-600'
                                }`}>
                                  {invoice.invoiceNumber}
                                </TableCell>
                                <TableCell className="text-sm">{invoice.date}</TableCell>
                                <TableCell className="text-sm">{invoice.description}</TableCell>
                                <TableCell className="text-sm font-medium">{invoice.currency} {invoice.amount.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Badge className={`${
                                    invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                    invoice.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                    invoice.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  } text-xs`}>
                                    {invoice.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{invoice.paymentMethod || '-'}</TableCell>
                                <TableCell>
                                  <div className="flex gap-1">
                                    {invoice.status !== 'Cancelled' && (
                                      <Button variant="ghost" size="sm">
                                        <Download className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button variant="ghost" size="sm">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    {invoice.status === 'Cancelled' && (
                                      <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                                        <X className="h-4 w-4 mr-1" />
                                        Cancelled
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                                  No invoices found for this customer
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Invoice Cancellation Section */}
                      <Card className="border-red-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center text-red-600">
                            <XCircle className="h-5 w-5 mr-2" />
                            Invoice Cancellation
                          </CardTitle>
                          <CardDescription>
                            Manage invoice cancellations and refund requests
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 className="font-medium text-red-900 mb-2">Recent Cancellations</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-red-700">INV-2024-001231 - Cancelled on Apr 10, 2024</span>
                                <Badge className="bg-red-100 text-red-800 text-xs">Refund Processed</Badge>
                              </div>
                              <p className="text-red-600 text-xs">Reason: Customer requested cancellation within 24 hours</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
      
    {/* Payment Gateway Dialog for Wallet Top-up */}
    <Dialog open={paymentGatewayOpen} onOpenChange={setPaymentGatewayOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insufficient Wallet Balance</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Your wallet balance is insufficient. Please top up to continue.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Current Balance</Label>
              <p className="text-lg font-bold">TSH {walletBalance.toLocaleString()}</p>
            </div>
            <div>
              <Label>Required Top-up</Label>
              <p className="text-lg font-bold text-red-600">TSH {topUpAmount.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                if (currentCustomer && topUpAmount > 0) {
                  processPaymentTopup({
                    smartCardNumber: activeSubscription?.smartCardNumber || `SC${Date.now()}`,
                    topupAmount: topUpAmount,
                    paymentMethod: "online",
                    notes: "Customer wallet top-up"
                  });
                  setPaymentGatewayOpen(false);
                } else {
                  toast({
                    title: "Invalid Top-up",
                    description: "Please enter a valid amount",
                    variant: "destructive"
                  });
                }
              }}
              className="flex-1"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Top Up Now"
              )}
            </Button>
            <Button variant="outline" onClick={() => setPaymentGatewayOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}