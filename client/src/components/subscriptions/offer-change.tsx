import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, Search, ArrowUpDown, RefreshCw, Ban, Loader2, CalendarDays } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Offer Change Form Schema
const offerChangeSchema = z.object({
  smartCardNumber: z.string().min(1, "Smart card number is required"),
  newOfferId: z.string().min(1, "Please select a new offer"),
  changeType: z.enum(["immediate", "scheduled"]),
  scheduledDate: z.date().optional(),
});

type OfferChangeData = z.infer<typeof offerChangeSchema>;

// Mock data for available offers
const availableOffers = [
  { 
    id: "PROMO001", 
    name: "50% Off First Month", 
    discount: 50, 
    validity: "30 days", 
    type: "discount",
    description: "Get 50% discount on your current plan for the first month",
    termsConditions: "Valid for new customers only. Cannot be combined with other offers.",
    eligibilityRules: ["New customer", "First-time offer redemption"],
    startDate: "2025-01-01",
    endDate: "2025-03-31"
  },
  { 
    id: "PROMO002", 
    name: "Free Premium Upgrade", 
    discount: 0, 
    validity: "60 days", 
    type: "upgrade",
    description: "Upgrade to Premium plan for free for 2 months",
    termsConditions: "Available for Lite and Play plan customers. Automatic renewal after promotion period.",
    eligibilityRules: ["Current plan: Lite or Play", "Account in good standing"],
    startDate: "2025-01-15",
    endDate: "2025-04-15"
  },
  { 
    id: "PROMO003", 
    name: "Sports Package Free", 
    discount: 100, 
    validity: "30 days", 
    type: "free_addon",
    description: "Get Sports add-on pack completely free for 1 month",
    termsConditions: "Valid for all active subscribers. One-time offer per customer.",
    eligibilityRules: ["Active subscription", "Sports pack not currently active"],
    startDate: "2025-02-01",
    endDate: "2025-05-31"
  },
  { 
    id: "PROMO004", 
    name: "Family Bundle Deal", 
    discount: 25, 
    validity: "90 days", 
    type: "bundle",
    description: "25% discount on Kids + Movie packages when purchased together",
    termsConditions: "Must purchase both packages. Discount applies to both add-ons.",
    eligibilityRules: ["Premium plan required", "No existing Kids or Movie packages"],
    startDate: "2025-01-01",
    endDate: "2025-06-30"
  },
  { 
    id: "PROMO005", 
    name: "Loyalty Reward 15%", 
    discount: 15, 
    validity: "180 days", 
    type: "loyalty",
    description: "15% off for customers with 12+ months continuous subscription",
    termsConditions: "Available for customers with 12+ months active subscription history.",
    eligibilityRules: ["12+ months continuous subscription", "Payment history in good standing"],
    startDate: "2025-01-01",
    endDate: "2025-12-31"
  }
];

// Mock customer data with comprehensive offer details
const mockCustomerData = {
  customerId: "CUST001",
  smartCardNumber: "SC123456789",
  firstName: "John",
  lastName: "Doe",
  phone: "+255712345678",
  email: "john.doe@example.com",
  currentPlan: {
    id: "AZAM_LITE_1M",
    name: "Azam Lite 1 Month",
    price: 12000,
    startDate: "2025-01-15T10:00:00Z",
    endDate: "2025-02-14T23:59:59Z",
    status: "Active"
  },
  currentOffers: [
    { 
      id: "PROMO001", 
      name: "50% Off First Month", 
      endDate: "2025-02-14T23:59:59Z",
      discountAmount: 6000,
      status: "ACTIVE"
    }
  ],
  eligibleOffers: ["PROMO002", "PROMO003", "PROMO005"],
  walletBalance: 25000,
  subscriptionTenure: 6, // months
  paymentHistory: "GOOD",
  bufferPeriodDays: 2,
  status: "ACTIVE",
  offerChangeHistory: [
    {
      id: 1,
      date: "2025-01-15",
      action: "Offer Applied",
      offerName: "50% Off First Month",
      changeType: "immediate",
      status: "ACTIVE",
      discountAmount: 6000
    }
  ]
};

// Mock offer change history
const mockOfferChangeHistory = [
  {
    id: 1,
    customerId: "CUST001",
    smartCardNumber: "SC123456789",
    eventDate: new Date("2025-01-25 14:30:00"),
    eventName: "Offer change - Immediate",
    offerName: "Free Premium Upgrade",
    offerStartDate: new Date("2025-01-25 14:30:00"),
    offerEndDate: new Date("2025-03-26 23:59:59"),
    changeType: "immediate" as const,
    status: "success" as const,
    discountAmount: 23000,
    walletImpact: 0
  },
  {
    id: 2,
    customerId: "CUST001",
    smartCardNumber: "SC123456789",
    eventDate: new Date("2025-01-20 09:15:00"),
    eventName: "Scheduled offer change cancelled",
    offerName: "Sports Package Free",
    changeType: "cancellation" as const,
    status: "cancelled" as const,
    discountAmount: 0,
    walletImpact: 0
  },
  {
    id: 3,
    customerId: "CUST001",
    smartCardNumber: "SC123456789",
    eventDate: new Date("2025-01-15 10:00:00"),
    eventName: "Initial offer applied",
    offerName: "50% Off First Month",
    offerStartDate: new Date("2025-01-15 10:00:00"),
    offerEndDate: new Date("2025-02-14 23:59:59"),
    changeType: "immediate" as const,
    status: "success" as const,
    discountAmount: 6000,
    walletImpact: 6000
  }
];

// Workflow steps for offer change processing
const workflowSteps = [
  { id: 1, name: "Customer Validation", description: "Verify customer details and subscription status", status: "completed" },
  { id: 2, name: "Offer Eligibility Check", description: "Validate customer eligibility for selected offer", status: "completed" },
  { id: 3, name: "Current Offer Analysis", description: "Analyze impact on existing offers", status: "completed" },
  { id: 4, name: "Pricing Calculation", description: "Calculate discount amounts and billing impact", status: "processing" },
  { id: 5, name: "Offer Activation", description: "Apply new offer to customer account", status: "pending" },
  { id: 6, name: "SOM Update", description: "Update offer details in SAP SOM", status: "pending" },
  { id: 7, name: "Contract Modification", description: "Modify contract terms in SAP CC", status: "pending" },
  { id: 8, name: "Billing Adjustment", description: "Process billing adjustments in SAP CI", status: "pending" },
  { id: 9, name: "Customer Notification", description: "Send offer change confirmation", status: "pending" },
];

export default function OfferChange() {
  const [selectedTab, setSelectedTab] = useState("immediate");
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomerData | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [scheduledOffers, setScheduledOffers] = useState<any[]>([]);
  const { toast } = useToast();

  // Form for offer change
  const form = useForm<OfferChangeData>({
    resolver: zodResolver(offerChangeSchema),
    defaultValues: {
      smartCardNumber: "",
      newOfferId: "",
      changeType: "immediate",
    },
  });

  // Check offer eligibility
  const isOfferEligible = (offerId: string) => {
    if (!selectedCustomer) return false;
    return selectedCustomer.eligibleOffers.includes(offerId);
  };

  // Calculate offer impact
  const offerImpact = useMemo(() => {
    if (!selectedCustomer || !selectedOffer) return null;

    const offer = availableOffers.find(o => o.id === selectedOffer);
    if (!offer) return null;

    const currentPlanPrice = selectedCustomer.currentPlan.price;
    let discountAmount = 0;
    let finalAmount = currentPlanPrice;
    let savingsAmount = 0;

    switch (offer.type) {
      case "discount":
        discountAmount = (currentPlanPrice * offer.discount) / 100;
        finalAmount = currentPlanPrice - discountAmount;
        savingsAmount = discountAmount;
        break;
      case "upgrade":
        // Free upgrade to premium (mock calculation)
        const premiumPrice = 35000;
        discountAmount = premiumPrice - currentPlanPrice;
        finalAmount = currentPlanPrice; // Customer pays current plan price
        savingsAmount = discountAmount;
        break;
      case "free_addon":
        // Free add-on pack
        discountAmount = 8000; // Sports pack price
        finalAmount = currentPlanPrice; // No change to base price
        savingsAmount = discountAmount;
        break;
      case "bundle":
        // Bundle discount on add-ons
        const bundlePrice = 14000; // Kids + Movie packs
        discountAmount = (bundlePrice * offer.discount) / 100;
        finalAmount = currentPlanPrice + bundlePrice - discountAmount;
        savingsAmount = discountAmount;
        break;
      case "loyalty":
        discountAmount = (currentPlanPrice * offer.discount) / 100;
        finalAmount = currentPlanPrice - discountAmount;
        savingsAmount = discountAmount;
        break;
    }

    return {
      offerType: offer.type,
      originalAmount: currentPlanPrice,
      discountAmount,
      finalAmount,
      savingsAmount,
      validityDays: parseInt(offer.validity.split(' ')[0])
    };
  }, [selectedCustomer, selectedOffer]);

  // Search customer by smart card
  const handleCustomerSearch = async () => {
    const smartCardNumber = form.getValues("smartCardNumber");
    if (!smartCardNumber) return;

    // Simulate customer search
    if (smartCardNumber === "SC123456789") {
      setSelectedCustomer(mockCustomerData);
      toast({
        title: "Customer Found",
        description: `${mockCustomerData.firstName} ${mockCustomerData.lastName} with active ${mockCustomerData.currentPlan.name} subscription.`,
      });
    } else {
      toast({
        title: "Customer Not Found",
        description: "No active subscription found for this smart card number.",
        variant: "destructive",
      });
    }
  };

  // Process offer change mutation
  const processOfferChange = useMutation({
    mutationFn: async (data: OfferChangeData) => {
      // Simulate API call to process offer change
      return await apiRequest("/api/subscriptions/offer-change", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Offer Change Successful",
        description: `Offer changed successfully. Change ID: ${result.changeId}`,
      });
      
      // Reset form
      form.reset();
      setSelectedCustomer(null);
      setSelectedOffer("");
    },
    onError: (error) => {
      toast({
        title: "Offer Change Failed",
        description: "Failed to process offer change. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle offer change submission
  const handleOfferChange = async (data: OfferChangeData) => {
    if (!selectedCustomer || !offerImpact) return;

    setIsProcessing(true);
    setCurrentStep(0);

    // Simulate workflow steps
    for (let i = 0; i < workflowSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setCurrentStep(i + 1);
    }

    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep(0);
      
      // Process the mutation
      processOfferChange.mutate(data);
    }, 1000);
  };

  // Cancel scheduled offer change
  const cancelScheduledOffer = async (offerId: string) => {
    toast({
      title: "Scheduled Offer Cancelled",
      description: "The scheduled offer change has been cancelled successfully.",
    });
    
    setScheduledOffers(prev => prev.filter(offer => offer.id !== offerId));
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Offer Change Management</h1>
          <p className="text-gray-600">Manage promotional offers and discount changes for customers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Gift className="h-5 w-5 text-azam-blue" />
          <span className="text-sm font-medium text-azam-blue">Promotional Offers Available</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
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
            <CalendarDays className="h-4 w-4" />
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleOfferChange)} className="space-y-6">
                  {/* Customer Search */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="smartCardNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Smart Card Number</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter smart card number" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" onClick={handleCustomerSearch} className="w-full">
                        <Search className="h-4 w-4 mr-2" />
                        Search Customer
                      </Button>
                    </div>
                  </div>

                  {/* Customer Details */}
                  {selectedCustomer && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-semibold">{selectedCustomer.firstName} {selectedCustomer.lastName}</h4>
                          <p className="text-sm text-gray-600">{selectedCustomer.customerId}</p>
                          <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Current Plan</h4>
                          <p className="text-sm">{selectedCustomer.currentPlan.name}</p>
                          <p className="text-sm text-gray-600">TSH {selectedCustomer.currentPlan.price.toLocaleString()}/month</p>
                        </div>
                        <div>
                          <h4 className="font-semibold">Active Offers</h4>
                          {selectedCustomer.currentOffers.length > 0 ? (
                            selectedCustomer.currentOffers.map(offer => (
                              <Badge key={offer.id} variant="outline" className="text-xs mr-1">
                                {offer.name}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">No active offers</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Offer Selection */}
                  {selectedCustomer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="newOfferId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Available Offers</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedOffer(value);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select promotional offer" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableOffers.map((offer) => (
                                  <SelectItem 
                                    key={offer.id} 
                                    value={offer.id}
                                    disabled={!isOfferEligible(offer.id)}
                                  >
                                    <div className="flex flex-col">
                                      <span>{offer.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {offer.type === "discount" && `${offer.discount}% off`}
                                        {offer.type === "upgrade" && "Free upgrade"}
                                        {offer.type === "free_addon" && "Free add-on"}
                                        {offer.type === "bundle" && `${offer.discount}% bundle discount`}
                                        {offer.type === "loyalty" && `${offer.discount}% loyalty discount`}
                                        {!isOfferEligible(offer.id) && " (Not eligible)"}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="changeType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Change Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="immediate">Immediate Change</SelectItem>
                                <SelectItem value="scheduled">Scheduled Change</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Offer Impact Summary */}
                  {selectedCustomer && selectedOffer && offerImpact && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Offer Impact Summary</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Original Amount</p>
                          <p className="font-semibold">TSH {offerImpact.originalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Discount Amount</p>
                          <p className="font-semibold text-green-600">TSH {offerImpact.discountAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Final Amount</p>
                          <p className="font-semibold">TSH {offerImpact.finalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Total Savings</p>
                          <p className="font-semibold text-green-600">TSH {offerImpact.savingsAmount.toLocaleString()}</p>
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <div className="text-xs text-gray-600">
                        <p>Offer valid for {offerImpact.validityDays} days from activation date</p>
                        <p>Terms and conditions apply. See offer details for complete information.</p>
                      </div>
                    </div>
                  )}

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="font-medium">Processing Offer Change...</span>
                      </div>
                      <div className="space-y-2">
                        {workflowSteps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-2 text-sm">
                            {index < currentStep ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : index === currentStep ? (
                              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={index < currentStep ? "text-green-700" : index === currentStep ? "text-blue-700" : "text-gray-500"}>
                              {step.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={!selectedCustomer || !selectedOffer || isProcessing}>
                    {isProcessing ? "Processing..." : "Apply Offer Change"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Offer Change */}
        <TabsContent value="scheduled" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-azam-blue" />
                Scheduled Offer Changes
              </CardTitle>
              <CardDescription>
                Schedule offer changes for future dates or plan end dates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Scheduled Changes</h3>
                <p className="text-gray-600 mb-4">There are no scheduled offer changes at the moment.</p>
                <p className="text-sm text-gray-500">Use the "Immediate Change" tab and select "Scheduled Change" to create one.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Offers */}
        <TabsContent value="active-offers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableOffers.map((offer) => (
              <Card key={offer.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg">{offer.name}</span>
                    <Badge variant={offer.type === "discount" ? "default" : offer.type === "upgrade" ? "secondary" : "outline"}>
                      {offer.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">{offer.description}</p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Discount:</span>
                      <span className="font-semibold text-green-600">
                        {offer.type === "discount" || offer.type === "bundle" || offer.type === "loyalty" ? `${offer.discount}%` : 
                         offer.type === "free_addon" ? "100%" : "Free Upgrade"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Validity:</span>
                      <span className="font-semibold">{offer.validity}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Valid Until:</span>
                      <span className="text-sm">{offer.endDate}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-1">
                      <h5 className="text-sm font-semibold">Eligibility:</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {offer.eligibilityRules.map((rule, index) => (
                          <li key={index} className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {rule}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{offer.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Description</h4>
                            <p className="text-sm text-gray-600">{offer.description}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Terms & Conditions</h4>
                            <p className="text-sm text-gray-600">{offer.termsConditions}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Validity Period</h4>
                            <p className="text-sm text-gray-600">From {offer.startDate} to {offer.endDate}</p>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Change History */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-azam-blue" />
                Offer Change History
              </CardTitle>
              <CardDescription>
                Track all offer changes and their impact on customer accounts.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Offer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOfferChangeHistory.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell>
                        <div className="text-sm">
                          <p>{history.eventDate.toLocaleDateString()}</p>
                          <p className="text-gray-500">{history.eventDate.toLocaleTimeString()}</p>
                        </div>
                      </TableCell>
                      <TableCell>{history.eventName}</TableCell>
                      <TableCell>{history.offerName}</TableCell>
                      <TableCell>
                        <Badge variant={history.changeType === "immediate" ? "default" : "outline"}>
                          {history.changeType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-green-600">+TSH {history.discountAmount.toLocaleString()}</p>
                          <p className="text-gray-500">Savings</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          history.status === "success" ? "default" : 
                          history.status === "cancelled" ? "destructive" : "secondary"
                        }>
                          {history.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}