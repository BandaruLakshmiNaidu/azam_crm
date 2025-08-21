import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Tv, 
  Calendar, 
  DollarSign,
  Eye,
  Filter,
  Download,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";

// Use customer search API instead of hardcoded data
const useSubscriberSearch = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchSubscribers = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use existing customer search API
      const response = await fetch(`/api/customers/search?smartCardNumber=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const customer = await response.json();
        setSearchResults([customer]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  return { searchResults, isSearching, searchSubscribers };
};

// Fallback mock data for demonstration
const mockSubscribers = [
  {
    customerId: "CUST001",
    sapBpId: "BP12345",
    sapCaId: "CA67890",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+255712345678",
    smartCardNumber: "SC123456789",
    stbSerialNumber: "STB987654321",
    customerType: "PREPAID" as const,
    accountClass: "RESIDENTIAL" as const,
    connectionDate: "2024-01-15",
    walletBalance: 15000,
    currentSubscription: {
      planName: "Azam Play 1 Month",
      status: "ACTIVE" as const,
      endDate: "2025-05-23",
      totalAmount: 22420
    },
    address: {
      city: "Dar es Salaam",
      region: "Dar es Salaam"
    }
  },
  {
    customerId: "CUST002",
    sapBpId: "BP12346",
    sapCaId: "CA67891",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+255723456789",
    smartCardNumber: "SC234567890",
    stbSerialNumber: "STB876543210",
    customerType: "POSTPAID" as const,
    accountClass: "COMMERCIAL" as const,
    connectionDate: "2024-02-20",
    walletBalance: 25000,
    currentSubscription: {
      planName: "Azam Premium 1 Month",
      status: "ACTIVE" as const,
      endDate: "2025-06-15",
      totalAmount: 35000
    },
    address: {
      city: "Arusha",
      region: "Arusha"
    }
  },
  {
    customerId: "CUST003",
    sapBpId: "BP12347",
    sapCaId: "CA67892",
    firstName: "Michael",
    lastName: "Johnson",
    email: "m.johnson@example.com",
    phone: "+255734567890",
    smartCardNumber: "SC345678901",
    stbSerialNumber: "STB765432109",
    customerType: "PREPAID" as const,
    accountClass: "RESIDENTIAL" as const,
    connectionDate: "2023-12-10",
    walletBalance: 8500,
    currentSubscription: {
      planName: "Azam Lite 1 Month",
      status: "SUSPENDED" as const,
      endDate: "2025-04-30",
      totalAmount: 12000
    },
    address: {
      city: "Mwanza",
      region: "Mwanza"
    }
  },
  {
    customerId: "CUST004",
    sapBpId: "BP12348",
    sapCaId: "CA67893",
    firstName: "Sarah",
    lastName: "Wilson",
    email: "s.wilson@example.com",
    phone: "+255745678901",
    smartCardNumber: "SC456789012",
    stbSerialNumber: "STB654321098",
    customerType: "POSTPAID" as const,
    accountClass: "CORPORATE" as const,
    connectionDate: "2024-03-05",
    walletBalance: 50000,
    currentSubscription: {
      planName: "Azam Plus 1 Month",
      status: "ACTIVE" as const,
      endDate: "2025-07-10",
      totalAmount: 45000
    },
    address: {
      city: "Dodoma",
      region: "Dodoma"
    }
  },
  {
    customerId: "CUST005",
    sapBpId: "BP12349",
    sapCaId: "CA67894",
    firstName: "David",
    lastName: "Brown",
    email: "d.brown@example.com",
    phone: "+255756789012",
    smartCardNumber: "SC567890123",
    stbSerialNumber: "STB543210987",
    customerType: "PREPAID" as const,
    accountClass: "RESIDENTIAL" as const,
    connectionDate: "2023-11-25",
    walletBalance: 2000,
    currentSubscription: {
      planName: "Azam Play 1 Month",
      status: "DISCONNECTED" as const,
      endDate: "2025-03-15",
      totalAmount: 22420
    },
    address: {
      city: "Mbeya",
      region: "Mbeya"
    }
  }
];

export default function SearchSubscriber() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [searchError, setSearchError] = useState("");
  const [_, setLocation] = useLocation();
  const { t } = useTranslation();
  const { searchResults, isSearching, searchSubscribers } = useSubscriberSearch();

  // Handle search using API
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchError(t('searchSubscriber.enterSearchTerm'));
      return;
    }

    setSearchError("");

    // Use API for search, fallback to mock data for demo
    if (searchType === "smartcard") {
      await searchSubscribers(searchTerm);
      
      if (searchResults.length > 0) {
        // Navigate directly to subscriber view
        setLocation(`/subscriber-view?id=${searchResults[0].customerId}`);
      } else {
        setSearchError(t('searchSubscriber.noSubscriberFound'));
      }
    } else {
      // For other search types, use mock data for demonstration
      const foundSubscriber = mockSubscribers.find(subscriber => {
        const term = searchTerm.toLowerCase();
        
        switch (searchType) {
          case "name":
            return `${subscriber.firstName} ${subscriber.lastName}`.toLowerCase().includes(term);
          case "phone":
            return subscriber.phone.includes(term);
          case "email":
            return subscriber.email.toLowerCase().includes(term);
          case "sapbp":
            return subscriber.sapBpId.toLowerCase().includes(term);
          default:
            return (
              `${subscriber.firstName} ${subscriber.lastName}`.toLowerCase().includes(term) ||
              subscriber.phone.includes(term) ||
              subscriber.email.toLowerCase().includes(term) ||
              subscriber.smartCardNumber.toLowerCase().includes(term) ||
              subscriber.sapBpId.toLowerCase().includes(term) ||
              subscriber.customerId.toLowerCase().includes(term)
            );
        }
      });

      if (foundSubscriber) {
        // Navigate directly to subscriber view
        setLocation(`/subscriber-view?id=${foundSubscriber.customerId}`);
      } else {
        setSearchError(t('searchSubscriber.noSubscriberFound'));
      }
    }
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('searchSubscriber.title')}</h1>
          <p className="text-gray-600 mt-1">{t('searchSubscriber.subtitle')}</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Search className="h-4 w-4 mr-2" />
          {t('searchSubscriber.title')}
        </Badge>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            {t('searchSubscriber.title')}
          </CardTitle>
          <CardDescription>
            {t('searchSubscriber.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search-term">{t('searchSubscriber.searchTerm')}</Label>
              <Input
                id="search-term"
                placeholder={t('searchSubscriber.placeholder')}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (searchError) setSearchError(""); // Clear error when user types
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <Label htmlFor="search-type">{t('searchSubscriber.searchType')}</Label>
              <select 
                id="search-type"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
              >
                <option value="all">{t('searchSubscriber.allFields')}</option>
                <option value="name">{t('searchSubscriber.customerName')}</option>
                <option value="phone">{t('searchSubscriber.phoneNumber')}</option>
                <option value="email">{t('searchSubscriber.emailAddress')}</option>
                <option value="smartcard">{t('searchSubscriber.smartCardNumber')}</option>
                <option value="sapbp">{t('searchSubscriber.sapBpId')}</option>
              </select>
            </div>
          </div>

          {/* Search Error */}
          {searchError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {searchError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button onClick={handleSearch} className="flex-1">
              <Search className="h-4 w-4 mr-2" />
              {t('searchSubscriber.findAndView')}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSearchError("");
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('common.clear')}
            </Button>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <Search className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>{t('searchSubscriber.searchTips')}:</strong> {t('searchSubscriber.searchTipsText')}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">{t('stats.total')} {t('stats.subscribers')}</p>
                <p className="text-2xl font-bold">{mockSubscribers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Tv className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">{t('stats.active')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockSubscribers.filter(s => s.currentSubscription.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Phone className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm text-gray-600">{t('stats.suspended')}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mockSubscribers.filter(s => s.currentSubscription.status === 'SUSPENDED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <RefreshCw className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">{t('stats.disconnected')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {mockSubscribers.filter(s => s.currentSubscription.status === 'DISCONNECTED').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}