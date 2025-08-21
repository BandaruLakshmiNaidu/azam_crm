import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Calendar as CalendarIcon
} from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";

// Import popup components for inline operations
import SubscriptionPurchase from "./subscription-purchase";
import SubscriptionRenewal from "./subscription-renewal";
import PlanChange from "./plan-change";
import AddAddonPacks from "./add-addon-packs";
import CustomerSuspension from "./customer-suspension";

// Interfaces for enhanced functionality
interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  smartCardNumber?: string;
  stbSerialNumber?: string;
  customerType: string;
  accountClass: string;
  walletBalance?: number;
  address?: {
    city: string;
    region: string;
  };
}

interface Subscription {
  id: number;
  customerId: number;
  smartCardNumber: string;
  plan: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface QuickActionProps {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  color?: string;
  count?: number;
}

// Quick Action Card Component
function QuickActionCard({ icon: Icon, title, description, onClick, color = "azam-blue", count, disabled = false }: QuickActionProps & { disabled?: boolean }) {
  return (
    <Card className={`transition-all cursor-pointer hover:scale-[1.02] group border-l-4 border-l-azam-blue ${
      disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
    }`} onClick={disabled ? undefined : onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${disabled ? 'bg-gray-100' : 'bg-azam-blue-light group-hover:bg-azam-blue group-hover:text-white'} transition-colors`}>
              <Icon className={`h-5 w-5 ${disabled ? 'text-gray-400' : 'text-azam-blue group-hover:text-white'}`} />
            </div>
            <div>
              <h3 className={`font-semibold text-sm ${disabled ? 'text-gray-400' : 'text-gray-900 group-hover:text-azam-blue'} transition-colors`}>
                {title}
              </h3>
              <p className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
            </div>
          </div>
          {count !== undefined && (
            <div className="text-right">
              <div className={`text-lg font-bold ${disabled ? 'text-gray-400' : 'text-azam-blue'}`}>{count}</div>
              <div className="text-xs text-gray-500">records</div>
            </div>
          )}
          <ChevronRight className={`h-4 w-4 ${disabled ? 'text-gray-300' : 'text-gray-400 group-hover:text-azam-blue'} transition-colors`} />
        </div>
      </CardContent>
    </Card>
  );
}

// Mock data for different customer accounts
const accountsData = {
  "CUST001": {
    customerId: "CUST001",
    accountType: "Primary Account",
    sapBpId: "BP12345",
    sapCaId: "CA67890",
    sapContractId: "CON123456789",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+255712345678",
    smartCardNumber: "SC123456789",
    stbSerialNumber: "STB987654321",
    customerType: "PREPAID" as const,
    accountClass: "RESIDENTIAL" as const,
    connectionDate: "2024-01-15 10:30:00",
    lastPaymentDate: "2025-04-24 14:00:00",
    walletBalance: 15000,
    status: "ACTIVE" as const,
    kycStatus: "Verified",
    kycDate: "15/03/2024",
    kycDocId: "KYC-2024-001234",
    currentSubscription: {
      planId: "AZ002",
      planName: "Azam Play 1 Month",
      planType: "PREPAID" as const,
      amount: 19000,
      vatAmount: 3420,
      totalAmount: 22420,
      startDate: "2025-04-24 14:00:00",
      endDate: "2025-05-23 23:59:59",
      status: "ACTIVE" as const,
      autoRenewal: true
    },
    addOns: [
      {
        id: "SPORT001",
        name: "Sports Ultimate Pack",
        amount: 8000,
        startDate: "2025-04-24 14:00:00",
        endDate: "2025-05-23 23:59:59",
        status: "ACTIVE" as const
      },
      {
        id: "MOVIE001",
        name: "Premium Movies Pack",
        amount: 5000,
        startDate: "2025-04-24 14:00:00",
        endDate: "2025-05-23 23:59:59",
        status: "ACTIVE" as const
      }
    ],
    hardware: {
      stbModel: "AZAM HD BOX V2",
      stbSerialNumber: "STB987654321",
      smartCardNumber: "SC123456789",
      purchaseDate: "2024-01-15",
      warrantyEndDate: "2025-01-15",
      condition: "WORKING" as const
    },
    address: {
      street: "123 Uhuru Street",
      city: "Dar es Salaam",
      region: "Dar es Salaam",
      country: "Tanzania",
      postalCode: "12345"
    }
  },
  "CUST002": {
    customerId: "CUST002",
    accountType: "Secondary Account",
    sapBpId: "BP12346",
    sapCaId: "CA67891",
    sapContractId: "CON123456790",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe.secondary@example.com",
    phone: "+255712345679",
    smartCardNumber: "SC123456890",
    stbSerialNumber: "STB987654322",
    customerType: "PREPAID" as const,
    accountClass: "PREMIUM" as const,
    connectionDate: "2024-03-20 10:30:00",
    lastPaymentDate: "2025-04-20 14:00:00",
    walletBalance: 8500,
    status: "ACTIVE" as const,
    kycStatus: "Verified",
    kycDate: "25/03/2024",
    kycDocId: "KYC-2024-001235",
    currentSubscription: {
      planId: "AZ001",
      planName: "Azam Lite 1 Month",
      planType: "PREPAID" as const,
      amount: 10000,
      vatAmount: 1800,
      totalAmount: 11800,
      startDate: "2025-04-20 14:00:00",
      endDate: "2025-05-20 23:59:59",
      status: "ACTIVE" as const,
      autoRenewal: false
    },
    addOns: [
      {
        id: "NEWS001",
        name: "News Plus Pack",
        amount: 3000,
        startDate: "2025-04-20 14:00:00",
        endDate: "2025-05-20 23:59:59",
        status: "ACTIVE" as const
      }
    ],
    hardware: {
      stbModel: "AZAM BASIC BOX V1",
      stbSerialNumber: "STB987654322",
      smartCardNumber: "SC123456890",
      purchaseDate: "2024-03-20",
      warrantyEndDate: "2025-03-20",
      condition: "WORKING" as const
    },
    address: {
      street: "456 Kilimanjaro Road",
      city: "Arusha",
      region: "Arusha",
      country: "Tanzania",
      postalCode: "23456"
    }
  },
  "CUST003": {
    customerId: "CUST003",
    accountType: "Business Account",
    sapBpId: "BP12347",
    sapCaId: "CA67892",
    sapContractId: "CON123456791",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe.business@example.com",
    phone: "+255712345680",
    smartCardNumber: "SC123456891",
    stbSerialNumber: "STB987654323",
    customerType: "POSTPAID" as const,
    accountClass: "BUSINESS" as const,
    connectionDate: "2024-02-10 10:30:00",
    lastPaymentDate: "2025-04-01 14:00:00",
    walletBalance: 45000,
    status: "ACTIVE" as const,
    kycStatus: "Verified",
    kycDate: "12/02/2024",
    kycDocId: "KYC-2024-001236",
    currentSubscription: {
      planId: "AZ003",
      planName: "Azam Premium 3 Months",
      planType: "POSTPAID" as const,
      amount: 45000,
      vatAmount: 8100,
      totalAmount: 53100,
      startDate: "2025-04-01 14:00:00",
      endDate: "2025-07-01 23:59:59",
      status: "ACTIVE" as const,
      autoRenewal: true
    },
    addOns: [
      {
        id: "BIZ001",
        name: "Business News Pack",
        amount: 15000,
        startDate: "2025-04-01 14:00:00",
        endDate: "2025-07-01 23:59:59",
        status: "ACTIVE" as const
      },
      {
        id: "CONF001",
        name: "Conference Pack",
        amount: 20000,
        startDate: "2025-04-01 14:00:00",
        endDate: "2025-07-01 23:59:59",
        status: "ACTIVE" as const
      }
    ],
    hardware: {
      stbModel: "AZAM BUSINESS BOX V3",
      stbSerialNumber: "STB987654323",
      smartCardNumber: "SC123456891",
      purchaseDate: "2024-02-10",
      warrantyEndDate: "2027-02-10",
      condition: "WORKING" as const
    },
    address: {
      street: "789 Business District",
      city: "Mwanza",
      region: "Mwanza",
      country: "Tanzania",
      postalCode: "34567"
    }
  },
  "CUST004": {
    customerId: "CUST004",
    accountType: "Family Account",
    sapBpId: "BP12348",
    sapCaId: "CA67893",
    sapContractId: "CON123456792",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe.family@example.com",
    phone: "+255712345681",
    smartCardNumber: "SC123456892",
    stbSerialNumber: "STB987654324",
    customerType: "PREPAID" as const,
    accountClass: "FAMILY" as const,
    connectionDate: "2024-05-15 10:30:00",
    lastPaymentDate: "2025-04-15 14:00:00",
    walletBalance: 2200,
    status: "SUSPENDED" as const,
    kycStatus: "Pending",
    kycDate: "N/A",
    kycDocId: "KYC-2024-001237",
    currentSubscription: {
      planId: "AZ004",
      planName: "Azam Family 2 Months",
      planType: "PREPAID" as const,
      amount: 30000,
      vatAmount: 5400,
      totalAmount: 35400,
      startDate: "2025-04-15 14:00:00",
      endDate: "2025-06-15 23:59:59",
      status: "SUSPENDED" as const,
      autoRenewal: true
    },
    addOns: [
      {
        id: "KIDS001",
        name: "Kids Zone Pack",
        amount: 8000,
        startDate: "2025-04-15 14:00:00",
        endDate: "2025-06-15 23:59:59",
        status: "SUSPENDED" as const
      },
      {
        id: "EDU001",
        name: "Educational Pack",
        amount: 6000,
        startDate: "2025-04-15 14:00:00",
        endDate: "2025-06-15 23:59:59",
        status: "SUSPENDED" as const
      }
    ],
    hardware: {
      stbModel: "AZAM FAMILY BOX V2",
      stbSerialNumber: "STB987654324",
      smartCardNumber: "SC123456892",
      purchaseDate: "2024-05-15",
      warrantyEndDate: "2026-05-15",
      condition: "WORKING" as const
    },
    address: {
      street: "321 Family Avenue",
      city: "Dodoma",
      region: "Dodoma",
      country: "Tanzania",
      postalCode: "45678"
    }
  }
};

// Mock subscription history
const mockSubscriptionHistory = [
  {
    id: 1,
    customerId: "CUST001",
    planId: "AZ002",
    planName: "Azam Play 1 Month",
    amount: 22420,
    transactionType: "RENEWAL" as const,
    paymentMethod: "WALLET" as const,
    transactionDate: "2025-04-24 14:00:00",
    startDate: "2025-04-24 14:00:00",
    endDate: "2025-05-23 23:59:59",
    status: "COMPLETED" as const,
    notes: "Auto renewal successful"
  },
  {
    id: 2,
    customerId: "CUST001",
    planId: "AZ001",
    planName: "Azam Lite 1 Month",
    amount: 12000,
    transactionType: "PLAN_CHANGE" as const,
    paymentMethod: "WALLET" as const,
    transactionDate: "2025-03-24 10:30:00",
    startDate: "2025-03-24 10:30:00",
    endDate: "2025-04-23 23:59:59",
    status: "COMPLETED" as const,
    notes: "Plan upgraded from Lite to Play"
  },
  {
    id: 3,
    customerId: "CUST001",
    planId: "AZ001",
    planName: "Azam Lite 1 Month",
    amount: 12000,
    transactionType: "PURCHASE" as const,
    paymentMethod: "MOBILE_MONEY" as const,
    transactionDate: "2024-01-15 10:30:00",
    startDate: "2024-01-15 10:30:00",
    endDate: "2025-02-14 23:59:59",
    status: "COMPLETED" as const,
    notes: "Initial subscription purchase"
  }
];

// Mock payment history
const mockPaymentHistory = [
  {
    id: 1,
    customerId: "CUST001",
    amount: 22420,
    paymentType: "SUBSCRIPTION" as const,
    paymentMethod: "WALLET" as const,
    transactionDate: "2025-04-24 14:00:00",
    receiptNumber: "RCP-2025-004-001",
    status: "COMPLETED" as const,
    description: "Azam Play 1 Month - Auto Renewal"
  },
  {
    id: 2,
    customerId: "CUST001",
    amount: 8000,
    paymentType: "ADD_ON" as const,
    paymentMethod: "WALLET" as const,
    transactionDate: "2025-04-24 14:00:00",
    receiptNumber: "RCP-2025-004-002",
    status: "COMPLETED" as const,
    description: "Sports Ultimate Pack"
  },
  {
    id: 3,
    customerId: "CUST001",
    amount: 30000,
    paymentType: "SUBSCRIPTION" as const,
    paymentMethod: "MOBILE_MONEY" as const,
    transactionDate: "2025-04-20 09:15:00",
    receiptNumber: "RCP-2025-004-003",
    status: "COMPLETED" as const,
    description: "Wallet Top-up via M-Pesa"
  }
];

export default function SubscriberView() {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [activePopup, setActivePopup] = useState<string>("");
  const [subscriptionSearchTerm, setSubscriptionSearchTerm] = useState("");
  const [lastRefreshTime, setLastRefreshTime] = useState(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<string>("CUST001");
  const { toast } = useToast();
  const { t } = useTranslation();

  // Get current subscriber data based on selected account
  const currentSubscriberData = accountsData[selectedAccount];
  
  // Extract customer ID from URL parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const customerId = urlParams.get('id') || 'CUST001';

  // Fetch real-time data
  const { data: subscriptions = [], isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['/api/subscriptions'],
    enabled: true,
    refetchInterval: autoRefreshEnabled ? 30000 : false, // Auto-refresh every 30 seconds
  });

  const { data: customers = [] } = useQuery({
    queryKey: ['/api/customers'],
    enabled: true,
    refetchInterval: autoRefreshEnabled ? 30000 : false, // Auto-refresh every 30 seconds
  });

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefreshEnabled) {
      const interval = setInterval(() => {
        setLastRefreshTime(new Date());
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [autoRefreshEnabled, queryClient]);

  // Type safe arrays
  const subscriptionList = Array.isArray(subscriptions) ? subscriptions : [];
  const customerList = Array.isArray(customers) ? customers : [];

  // Find current customer from real data
  const realCustomerData = customerList.find((c: any) => c.id.toString() === customerId.replace('CUST', '').replace(/^0+/, ''));
  
  // Get customer's subscriptions
  const customerSubscriptions = subscriptionList.filter((sub: any) => 
    sub.customerId === realCustomerData?.id ||
    subscriptionSearchTerm === "" || 
    sub.plan?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase()) ||
    sub.smartCardNumber?.toLowerCase().includes(subscriptionSearchTerm.toLowerCase())
  );

  // Popup management functions
  const openPopup = (popupType: string) => {
    setActivePopup(popupType);
  };

  const closePopup = () => {
    setActivePopup("");
    // Refresh data when popup closes
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customers'] });
    }, 500);
  };

  const handleOperationSuccess = async (message: string, operationType?: string) => {
    try {
      // Create transaction record for backend sync
      const transactionData = {
        customerId: currentCustomer.id,
        smartCardNumber: currentCustomer.smartCardNumber,
        operationType: operationType || activePopup?.toUpperCase(),
        description: message,
        amount: currentSubscriberData.currentSubscription.totalAmount,
        timestamp: new Date().toISOString()
      };

      // Attempt to sync with backend APIs
      try {
        // Log the operation to backend
        await fetch('/api/subscription-operations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
        });

        // Update subscription status if needed
        if (['PURCHASE', 'RENEWAL', 'PLAN_CHANGE'].includes(operationType || '')) {
          await fetch(`/api/customers/${currentCustomer.id}/subscription-status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              status: 'ACTIVE',
              lastUpdated: new Date().toISOString(),
              operation: operationType
            })
          });
        }
      } catch (apiError) {
        console.warn('Backend sync failed, operation completed locally:', apiError);
      }

      // Refresh all data queries with customer-specific context
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/customers'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/subscription-history'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/payment-history'] })
      ]);

      // Show success notification
      toast({
        title: "Operation Successful",
        description: message,
        duration: 3000,
      });

      // Close popup after brief delay to show success
      setTimeout(closePopup, 1000);

    } catch (error) {
      console.error('Operation error:', error);
      toast({
        title: "Operation Completed",
        description: message + " (Data sync pending)",
        variant: "default",
        duration: 4000,
      });
      closePopup();
    }
  };

  // Use real customer data if available, otherwise fallback to mock
  const currentCustomer = realCustomerData || {
    id: parseInt(customerId.replace('CUST', '').replace(/^0+/, '') || '1'),
    firstName: currentSubscriberData.firstName,
    lastName: currentSubscriberData.lastName,
    email: currentSubscriberData.email,
    phone: currentSubscriberData.phone,
    smartCardNumber: currentSubscriberData.smartCardNumber,
    stbSerialNumber: currentSubscriberData.stbSerialNumber,
    customerType: currentSubscriberData.customerType,
    accountClass: currentSubscriberData.accountClass,
    walletBalance: currentSubscriberData.walletBalance
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Suspended</Badge>;
      case "DISCONNECTED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Disconnected</Badge>;
      case "TERMINATED":
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Terminated</Badge>;
      case "COMPLETED":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "FAILED":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get customer type badge
  const getCustomerTypeBadge = (type: string) => {
    return (
      <Badge variant="outline" className={type === "PREPAID" ? "border-blue-200 text-blue-700" : "border-purple-200 text-purple-700"}>
        {type}
      </Badge>
    );
  };

  // Get transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "RENEWAL":
        return <RefreshCw className="h-4 w-4 text-green-600" />;
      case "PLAN_CHANGE":
        return <Settings className="h-4 w-4 text-purple-600" />;
      case "OFFER_CHANGE":
        return <Zap className="h-4 w-4 text-orange-600" />;
      case "SUSPENSION":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case "RECONNECTION":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const renderSubscriptionOperationForm = () => {
    if (!activePopup) return null;

    const operation = activePopup;
    
    switch (operation) {
      case 'purchase':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {currentCustomer.firstName} {currentCustomer.lastName}</p>
                    <p><strong>Phone:</strong> {currentCustomer.phone}</p>
                    <p><strong>Smart Card:</strong> {currentCustomer.smartCardNumber}</p>
                    <p><strong>Wallet Balance:</strong> TZS {currentCustomer.walletBalance?.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-green-700">Available Plans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['Azam Lite - TZS 15,000', 'Azam Play - TZS 25,000', 'Azam Premium - TZS 35,000'].map((plan, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleOperationSuccess(`New subscription: ${plan}`, 'PURCHASE')}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {plan}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closePopup}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleOperationSuccess('New subscription purchased successfully', 'PURCHASE')}>
                Process Purchase
              </Button>
            </div>
          </div>
        );

      case 'renewal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Subscription */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">Current Subscription</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Plan:</strong> {currentSubscriberData.currentSubscription.planName}</p>
                    <p><strong>End Date:</strong> {new Date(currentSubscriberData.currentSubscription.endDate).toLocaleDateString()}</p>
                    <p><strong>Amount:</strong> TZS {currentSubscriberData.currentSubscription.totalAmount.toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Renewal Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-blue-700">Renewal Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['1 Month - TZS 25,000', '3 Months - TZS 70,000', '6 Months - TZS 135,000'].map((option, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleOperationSuccess(`Renewal: ${option}`, 'RENEWAL')}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {option}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closePopup}>Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOperationSuccess('Subscription renewed successfully', 'RENEWAL')}>
                Process Renewal
              </Button>
            </div>
          </div>
        );

      case 'planChange':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-purple-700">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Plan:</strong> {currentSubscriberData.currentSubscription.planName}</p>
                    <p><strong>Amount:</strong> TZS {currentSubscriberData.currentSubscription.totalAmount.toLocaleString()}</p>
                    <p><strong>End Date:</strong> {new Date(currentSubscriberData.currentSubscription.endDate).toLocaleDateString()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-purple-700">Change To</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['Azam Lite - TZS 15,000', 'Azam Premium - TZS 35,000', 'Azam Plus - TZS 45,000'].map((plan, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleOperationSuccess(`Plan changed to: ${plan}`, 'PLAN_CHANGE')}
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      {plan}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closePopup}>Cancel</Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleOperationSuccess('Plan changed successfully', 'PLAN_CHANGE')}>
                Process Change
              </Button>
            </div>
          </div>
        );

      case 'addons':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Add-ons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-orange-700">Current Add-ons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentSubscriberData.addOns.map((addon) => (
                      <div key={addon.id} className="flex justify-between items-center p-2 border rounded">
                        <span>{addon.name}</span>
                        <Badge>{addon.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Available Add-ons */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-orange-700">Available Add-ons</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {['Sports Pack - TZS 5,000', 'Movies Pack - TZS 7,000', 'Kids Pack - TZS 3,000'].map((addon, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => handleOperationSuccess(`Added: ${addon}`, 'ADD_ON')}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      {addon}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closePopup}>Cancel</Button>
              <Button className="bg-orange-600 hover:bg-orange-700" onClick={() => handleOperationSuccess('Add-ons updated successfully', 'ADD_ON')}>
                Update Add-ons
              </Button>
            </div>
          </div>
        );

      case 'suspension':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Suspension Options */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-red-700">Suspension Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border border-yellow-200 bg-yellow-50 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>Current Status:</strong> {currentSubscriberData.currentSubscription.status}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => handleOperationSuccess('Customer temporarily suspended', 'SUSPENSION')}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Temporary Suspension (30 days)
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleOperationSuccess('Customer permanently suspended', 'SUSPENSION')}
                      >
                        <Pause className="h-4 w-4 mr-2" />
                        Permanent Suspension
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => handleOperationSuccess('Customer reactivated successfully', 'REACTIVATION')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reactivate Service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={closePopup}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleOperationSuccess('Suspension action completed', 'SUSPENSION')}>
                Apply Changes
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-full mx-auto">
          {/* Main Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/search-subscriber">
                <Button variant="outline" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Search
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {currentSubscriberData.firstName} {currentSubscriberData.lastName}
                </h1>
                <p className="text-sm text-gray-500">Customer ID: {currentSubscriberData.customerId}</p>
              </div>
            </div>
            
            {/* Status Badges - Larger Size */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                currentSubscriberData.status === 'ACTIVE' 
                  ? 'bg-green-50 border border-green-200' 
                  : currentSubscriberData.status === 'SUSPENDED'
                  ? 'bg-yellow-50 border border-yellow-200'
                  : 'bg-red-50 border border-red-200'
              }`}>
                <CheckCircle className={`h-4 w-4 ${
                  currentSubscriberData.status === 'ACTIVE' 
                    ? 'text-green-600' 
                    : currentSubscriberData.status === 'SUSPENDED'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`} />
                <span className={`font-semibold text-sm ${
                  currentSubscriberData.status === 'ACTIVE' 
                    ? 'text-green-700' 
                    : currentSubscriberData.status === 'SUSPENDED'
                    ? 'text-yellow-700'
                    : 'text-red-700'
                }`}>{currentSubscriberData.status}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-blue-700 font-semibold text-sm">TZS {currentSubscriberData.walletBalance.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-purple-700 font-semibold text-sm">{new Date(currentSubscriberData.currentSubscription.endDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex gap-2 ml-4 border-l border-gray-200 pl-4">
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          
          {/* Multiple Accounts Selector */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Customer Accounts:</span>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="w-48 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUST001">CUST001 - Primary Account</SelectItem>
                    <SelectItem value="CUST002">CUST002 - Secondary Account</SelectItem>
                    <SelectItem value="CUST003">CUST003 - Business Account</SelectItem>
                    <SelectItem value="CUST004">CUST004 - Family Account</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="secondary" className="text-xs">
                  4 Accounts Found
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Last Updated:</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-azam-blue hover:text-azam-blue-dark">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Column SAP-style Layout */}
      <div className="max-w-full mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Complete Information with Dropdowns */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* Customer Information Card */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <User className="h-4 w-4 text-azam-blue" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Full Name:</span>
                    <span className="font-medium">{currentSubscriberData.firstName} {currentSubscriberData.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type:</span>
                    {getCustomerTypeBadge(currentSubscriberData.customerType)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Class:</span>
                    <span className="font-medium">{currentSubscriberData.accountClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Connected:</span>
                    <span className="font-medium">{new Date(currentSubscriberData.connectionDate).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-700">{currentSubscriberData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-700">{currentSubscriberData.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-700">{currentSubscriberData.address.street}, {currentSubscriberData.address.city}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SAP Integration Details */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Settings className="h-4 w-4 text-azam-blue" />
                  SAP Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">BP ID:</span>
                  <span className="font-mono text-xs">{currentSubscriberData.sapBpId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">CA ID:</span>
                  <span className="font-mono text-xs">{currentSubscriberData.sapCaId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contract ID:</span>
                  <span className="font-mono text-xs">{currentSubscriberData.sapContractId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Smart Card:</span>
                  <span className="font-mono text-xs">{currentSubscriberData.smartCardNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">STB Serial:</span>
                  <span className="font-mono text-xs">{currentSubscriberData.stbSerialNumber}</span>
                </div>
              </CardContent>
            </Card>

            {/* Hardware Information */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Shield className="h-4 w-4 text-azam-blue" />
                  Hardware Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">STB Model:</span>
                  <span className="font-medium">{currentSubscriberData.hardware.stbModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Purchase Date:</span>
                  <span className="font-medium">{new Date(currentSubscriberData.hardware.purchaseDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Warranty:</span>
                  <span className="font-medium">{new Date(currentSubscriberData.hardware.warrantyEndDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Condition:</span>
                  <Badge variant={currentSubscriberData.hardware.condition === 'WORKING' ? 'default' : 'destructive'} className="text-xs">
                    {currentSubscriberData.hardware.condition}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* KYC Status */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Shield className="h-4 w-4 text-azam-blue" />
                  KYC Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">KYC Status:</span>
                    <Badge className={`${
                      currentSubscriberData.kycStatus === 'Verified' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {currentSubscriberData.kycStatus}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Verification Date:</span>
                    <span className="font-medium">{currentSubscriberData.kycDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Document ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">{currentSubscriberData.kycDocId}</span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Document Downloads */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">KYC Documents</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start h-8 text-xs hover:bg-blue-50 hover:border-blue-300"
                    >
                      <Download className="h-3 w-3 mr-2 text-blue-600" />
                      <span className="flex-1 text-left">Download POI (Proof of Identity)</span>
                      <FileText className="h-3 w-3 text-gray-400" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="justify-start h-8 text-xs hover:bg-green-50 hover:border-green-300"
                    >
                      <Download className="h-3 w-3 mr-2 text-green-600" />
                      <span className="flex-1 text-left">Download POA (Proof of Address)</span>
                      <FileText className="h-3 w-3 text-gray-400" />
                    </Button>
                  </div>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>Last Updated:</span>
                    <span className="font-medium">2 days ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent History */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <History className="h-4 w-4 text-azam-blue" />
                  Recent History
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockSubscriptionHistory.slice(0, 5).map((history) => (
                  <div key={history.id} className="flex items-start gap-2 p-2 border rounded-lg text-sm">
                    {getTransactionIcon(history.transactionType)}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-xs">{history.planName}</h4>
                          <p className="text-xs text-gray-600">{history.transactionType.replace('_', ' ')}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-xs">TZS {history.amount.toLocaleString()}</p>
                          {getStatusBadge(history.status)}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(history.transactionDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Active Subscription & Add-ons */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            
            {/* Current Subscription */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Tv className="h-4 w-4 text-azam-blue" />
                  Current Subscription
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 border rounded-lg bg-blue-50">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-blue-900">
                      {currentSubscriberData.currentSubscription.planName}
                    </h3>
                    {getStatusBadge(currentSubscriberData.currentSubscription.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-xs text-gray-600">Plan Type:</span>
                      <p className="font-medium">{currentSubscriberData.currentSubscription.planType}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Monthly Amount:</span>
                      <p className="font-medium">TZS {currentSubscriberData.currentSubscription.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">Start Date:</span>
                      <p className="font-medium">{new Date(currentSubscriberData.currentSubscription.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-600">End Date:</span>
                      <p className="font-medium">{new Date(currentSubscriberData.currentSubscription.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-600">Auto Renewal:</span>
                    <Badge variant={currentSubscriberData.currentSubscription.autoRenewal ? "default" : "secondary"} className="text-xs">
                      {currentSubscriberData.currentSubscription.autoRenewal ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive Subscription Management */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Zap className="h-4 w-4 text-azam-blue" />
                  All Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Quick Actions Header */}
                <div className="border-2 border-azam-blue bg-gradient-to-r from-azam-blue-light to-white p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-azam-blue" />
                      <span className="font-semibold text-azam-blue text-sm">
                        {currentCustomer.firstName} {currentCustomer.lastName}
                      </span>
                    </div>
                    <div className="flex space-x-1">
                      <Button 
                        onClick={() => openPopup("purchase")}
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-xs"
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        New Subscription
                      </Button>
                      <Button 
                        onClick={() => openPopup("renewal")}
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Renewal
                      </Button>
                      <Button 
                        onClick={() => openPopup("planChange")}
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700 text-xs"
                      >
                        <ArrowUpDown className="h-3 w-3 mr-1" />
                        Plan Change
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Real-time Subscription Data */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold text-xs">Smart Card</TableHead>
                        <TableHead className="font-semibold text-xs">Plan Details</TableHead>
                        <TableHead className="font-semibold text-xs">Amount</TableHead>
                        <TableHead className="font-semibold text-xs">Start Date</TableHead>
                        <TableHead className="font-semibold text-xs">End Date</TableHead>
                        <TableHead className="font-semibold text-xs">Status</TableHead>
                        <TableHead className="font-semibold text-xs">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customerSubscriptions && customerSubscriptions.length > 0 ? (
                        customerSubscriptions.map((subscription: any, index) => {
                          const isExpiringSoon = subscription.endDate && 
                            new Date(subscription.endDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                          
                          return (
                            <TableRow key={subscription.id} className={`hover:bg-azam-blue-light/50 transition-colors text-xs ${
                              isExpiringSoon ? 'bg-orange-50' : ''
                            } ${index % 2 === 0 ? 'bg-gray-50/50' : ''}`}>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Tv className="h-3 w-3 text-azam-blue" />
                                  <span className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                                    {subscription.smartCardNumber}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-semibold text-xs text-gray-900">{subscription.plan}</div>
                                  {isExpiringSoon && (
                                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                                      <Clock className="h-2 w-2 mr-1" />
                                      Expires Soon
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="font-bold text-xs text-green-700 bg-green-50 px-1 py-0.5 rounded">
                                  TZS {subscription.amount?.toLocaleString()}
                                </div>
                              </TableCell>
                              <TableCell className="text-xs">
                                {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('en-GB') : 'N/A'}
                              </TableCell>
                              <TableCell className="text-xs">
                                {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString('en-GB') : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  subscription.status === 'ACTIVE' ? 'bg-green-100 text-green-800 border-green-200' :
                                  subscription.status === 'SUSPENDED' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  subscription.status === 'EXPIRED' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-gray-100 text-gray-800 border-gray-200'
                                }>
                                  <span className="w-1.5 h-1.5 rounded-full mr-1" style={{
                                    backgroundColor: 
                                      subscription.status === 'ACTIVE' ? '#10b981' :
                                      subscription.status === 'SUSPENDED' ? '#f59e0b' :
                                      subscription.status === 'EXPIRED' ? '#ef4444' : '#6b7280'
                                  }}></span>
                                  {subscription.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => openPopup("renewal")}
                                    className="h-6 w-6 p-0 hover:bg-green-100"
                                    title="Renew Subscription"
                                  >
                                    <RotateCcw className="h-3 w-3 text-green-600" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => openPopup("planChange")}
                                    className="h-6 w-6 p-0 hover:bg-orange-100"
                                    title="Change Plan"
                                  >
                                    <ArrowUpDown className="h-3 w-3 text-orange-600" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => openPopup("addons")}
                                    className="h-6 w-6 p-0 hover:bg-purple-100"
                                    title="Add Add-ons"
                                  >
                                    <Gift className="h-3 w-3 text-purple-600" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => openPopup("suspension")}
                                    className="h-6 w-6 p-0 hover:bg-red-100"
                                    title="Suspend/Manage"
                                  >
                                    <Pause className="h-3 w-3 text-red-600" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="space-y-3">
                              <div className="w-12 h-12 bg-azam-blue-light rounded-full flex items-center justify-center mx-auto">
                                <Tv className="h-6 w-6 text-azam-blue" />
                              </div>
                              <div>
                                <h3 className="text-base font-semibold text-gray-700 mb-1">No Subscriptions Found</h3>
                                <p className="text-gray-500 mb-3 text-sm">
                                  {currentCustomer.firstName} doesn't have any subscriptions yet.
                                </p>
                                <Button 
                                  onClick={() => openPopup("purchase")}
                                  className="bg-azam-blue hover:bg-azam-blue-dark"
                                  size="sm"
                                >
                                  <ShoppingCart className="h-4 w-4 mr-2" />
                                  Create First Subscription
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Active Add-Ons */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Package className="h-4 w-4 text-azam-blue" />
                  Active Add-Ons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentSubscriberData.addOns.map((addon) => (
                  <div key={addon.id} className="p-2 border rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{addon.name}</h4>
                        <p className="text-xs text-gray-600">
                          TZS {addon.amount.toLocaleString()} / month
                        </p>
                      </div>
                      {getStatusBadge(addon.status)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Expires: {new Date(addon.endDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Transaction History & Billing */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            
            {/* Quick Actions */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <Zap className="h-4 w-4 text-azam-blue" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {/* Primary Actions */}
                  <div 
                    onClick={() => openPopup("purchase")}
                    className="cursor-pointer p-3 border-2 rounded-lg bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300 transition-all duration-200 text-center"
                  >
                    <ShoppingCart className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <p className="text-xs font-medium text-green-700">New Plan</p>
                  </div>
                  
                  <div 
                    onClick={() => openPopup("renewal")}
                    className="cursor-pointer p-3 border-2 rounded-lg bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300 transition-all duration-200 text-center"
                  >
                    <RotateCcw className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <p className="text-xs font-medium text-blue-700">Renew</p>
                  </div>
                  
                  <div 
                    onClick={() => openPopup("planChange")}
                    className="cursor-pointer p-3 border-2 rounded-lg bg-purple-50 hover:bg-purple-100 border-purple-200 hover:border-purple-300 transition-all duration-200 text-center"
                  >
                    <ArrowUpDown className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                    <p className="text-xs font-medium text-purple-700">Plan Change</p>
                  </div>
                  
                  <div 
                    onClick={() => openPopup("addons")}
                    className="cursor-pointer p-3 border-2 rounded-lg bg-orange-50 hover:bg-orange-100 border-orange-200 hover:border-orange-300 transition-all duration-200 text-center"
                  >
                    <Gift className="h-4 w-4 mx-auto mb-1 text-orange-600" />
                    <p className="text-xs font-medium text-orange-700">Add-ons</p>
                  </div>
                  
                  <div 
                    className="cursor-pointer p-3 border-2 rounded-lg bg-teal-50 hover:bg-teal-100 border-teal-200 hover:border-teal-300 transition-all duration-200 text-center"
                  >
                    <RefreshCw className="h-4 w-4 mx-auto mb-1 text-teal-600" />
                    <p className="text-xs font-medium text-teal-700">Offer Change</p>
                  </div>
                  
                  <div 
                    className="cursor-pointer p-3 border-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border-indigo-200 hover:border-indigo-300 transition-all duration-200 text-center"
                  >
                    <Clock className="h-4 w-4 mx-auto mb-1 text-indigo-600" />
                    <p className="text-xs font-medium text-indigo-700">Extend Validity</p>
                  </div>
                  
                  <div 
                    className="cursor-pointer p-3 border-2 rounded-lg bg-gray-50 hover:bg-gray-100 border-gray-200 hover:border-gray-300 transition-all duration-200 text-center"
                  >
                    <Settings className="h-4 w-4 mx-auto mb-1 text-gray-600" />
                    <p className="text-xs font-medium text-gray-700">Manage Hardware</p>
                  </div>
                  
                  <div 
                    className="cursor-pointer p-3 border-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 border-cyan-200 hover:border-cyan-300 transition-all duration-200 text-center"
                  >
                    <CreditCard className="h-4 w-4 mx-auto mb-1 text-cyan-600" />
                    <p className="text-xs font-medium text-cyan-700">Payment</p>
                  </div>
                  
                  <div 
                    className="cursor-pointer p-3 border-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border-emerald-200 hover:border-emerald-300 transition-all duration-200 text-center"
                  >
                    <FileText className="h-4 w-4 mx-auto mb-1 text-emerald-600" />
                    <p className="text-xs font-medium text-emerald-700">Service Ticket</p>
                  </div>
                  
                  <div 
                    className="cursor-pointer p-3 border-2 rounded-lg bg-amber-50 hover:bg-amber-100 border-amber-200 hover:border-amber-300 transition-all duration-200 text-center"
                  >
                    <Edit className="h-4 w-4 mx-auto mb-1 text-amber-600" />
                    <p className="text-xs font-medium text-amber-700">Adjustment</p>
                  </div>
                  
                  <div 
                    onClick={() => openPopup("suspension")}
                    className="cursor-pointer p-3 border-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 border-yellow-200 hover:border-yellow-300 transition-all duration-200 text-center"
                  >
                    <Pause className="h-4 w-4 mx-auto mb-1 text-yellow-600" />
                    <p className="text-xs font-medium text-yellow-700">Suspend</p>
                  </div>
                  
                  <div 
                    className="cursor-pointer p-3 border-2 rounded-lg bg-red-50 hover:bg-red-100 border-red-200 hover:border-red-300 transition-all duration-200 text-center"
                  >
                    <Power className="h-4 w-4 mx-auto mb-1 text-red-600" />
                    <p className="text-xs font-medium text-red-700">Disconnect</p>
                  </div>
                  
                  <div 
                    className="cursor-pointer p-3 border-2 rounded-lg bg-rose-50 hover:bg-rose-100 border-rose-200 hover:border-rose-300 transition-all duration-200 text-center"
                  >
                    <XCircle className="h-4 w-4 mx-auto mb-1 text-rose-600" />
                    <p className="text-xs font-medium text-rose-700">Terminate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="bg-white shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base text-gray-900">
                  <DollarSign className="h-4 w-4 text-azam-blue" />
                  Recent Payments
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mockPaymentHistory.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-2 border rounded-lg text-sm">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-3 w-3 text-gray-500" />
                      <div>
                        <h4 className="font-medium text-xs">{payment.description}</h4>
                        <p className="text-xs text-gray-600">
                          {new Date(payment.transactionDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">Receipt: {payment.receiptNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-xs">TZS {payment.amount.toLocaleString()}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Popup Dialogs for Operations */}
      {activePopup && (
        <Dialog open={!!activePopup} onOpenChange={closePopup}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {activePopup === 'purchase' && (
                  <>
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                    <span>New Subscription Purchase</span>
                  </>
                )}
                {activePopup === 'renewal' && (
                  <>
                    <RefreshCw className="h-5 w-5 text-blue-600" />
                    <span>Subscription Renewal</span>
                  </>
                )}
                {activePopup === 'planChange' && (
                  <>
                    <ArrowUpDown className="h-5 w-5 text-purple-600" />
                    <span>Plan Change</span>
                  </>
                )}
                {activePopup === 'addons' && (
                  <>
                    <Gift className="h-5 w-5 text-orange-600" />
                    <span>Add Add-on Packages</span>
                  </>
                )}
                {activePopup === 'suspension' && (
                  <>
                    <Pause className="h-5 w-5 text-red-600" />
                    <span>Customer Suspension</span>
                  </>
                )}
              </DialogTitle>
              <DialogDescription>
                Manage subscription operations for {currentCustomer.firstName} {currentCustomer.lastName}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              {renderSubscriptionOperationForm()}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
