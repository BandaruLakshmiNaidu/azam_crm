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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  User, 
  Shield, 
  Package,
  Wrench,
  Zap,
  Settings,
  Info,
  ArrowRight,
  Tv,
  CreditCard,
  Building,
  Calendar,
  DollarSign
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Replacement Form Schema
const replacementSchema = z.object({
  smartCardNumber: z.string().min(1, "Smart card number is required"),
  replacementType: z.enum(["OTC_IN_WARRANTY", "OTC_OUT_WARRANTY", "AGENT_IN_WARRANTY", "AGENT_OUT_WARRANTY"]),
  newStbSerialNumber: z.string().min(1, "New STB serial number is required"),
  replacementReason: z.string().min(1, "Replacement reason is required"),
  issuingCenter: z.string().optional(),
  returnCenter: z.string().optional(),
  subscriptionAdvanceMonths: z.number().min(0).max(12).optional(),
  notes: z.string().optional(),
});

type ReplacementData = z.infer<typeof replacementSchema>;

// Mock customer data with STB details
const mockCustomerData = {
  customerId: "CUST001",
  smartCardNumber: "SC123456789",
  sapBpId: "BP12345",
  sapCaId: "CA67890",
  sapContractId: "CON123456789",
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+255712345678",
  currentPlan: {
    id: "AZ002",
    name: "Azam Play 1 Month",
    planType: "PREPAID",
    amount: 19000,
    status: "Active",
    endDate: "2025-05-23 23:59:59"
  },
  hardware: {
    stbSerialNumber: "STB987654321",
    stbModel: "AZAM HD BOX V2",
    smartCardNumber: "SC123456789",
    purchaseDate: "2024-01-15",
    warrantyEndDate: "2025-01-15",
    warrantyStatus: "OUT_WARRANTY", // IN_WARRANTY or OUT_WARRANTY
    condition: "FAULTY"
  },
  walletBalance: 15000,
  customerType: "Prepaid"
};

// Replacement reasons
const replacementReasons = [
  { value: "FAULTY", label: "Hardware Fault/Damage" },
  { value: "POWER_FAILURE", label: "Power Failure" },
  { value: "MANUFACTURING_DEFECT", label: "Manufacturing Defect" },
  { value: "CUSTOMER_DAMAGE", label: "Customer Damage" },
  { value: "TECHNICAL_ISSUE", label: "Technical Issue" },
  { value: "SIGNAL_ISSUE", label: "Signal Reception Issue" },
  { value: "SOFTWARE_CORRUPTION", label: "Software Corruption" },
  { value: "OTHER", label: "Other" }
];

// Centers/locations
const centers = [
  { value: "DAR_CENTRAL", label: "Dar es Salaam Central" },
  { value: "DAR_KINONDONI", label: "Dar es Salaam Kinondoni" },
  { value: "ARUSHA_MAIN", label: "Arusha Main Center" },
  { value: "MWANZA_BRANCH", label: "Mwanza Branch" },
  { value: "DODOMA_CENTER", label: "Dodoma Center" },
  { value: "MBEYA_OUTLET", label: "Mbeya Outlet" }
];

// Replacement workflow steps
const replacementWorkflowSteps = [
  { 
    id: 1, 
    name: "Customer Search & Validation", 
    description: "Search customer and validate existing STB/SC details", 
    system: "Portal", 
    status: "pending" 
  },
  { 
    id: 2, 
    name: "Stock Validation", 
    description: "Validate new STB from OTC/Agent stock via MM/BRIM", 
    system: "Portal, MM/BRIM", 
    status: "pending" 
  },
  { 
    id: 3, 
    name: "Warranty & Charge Calculation", 
    description: "Check warranty status and calculate charges", 
    system: "Portal", 
    status: "pending" 
  },
  { 
    id: 4, 
    name: "Submit to CM", 
    description: "Send replacement order request to CM", 
    system: "Portal, CM", 
    status: "pending" 
  },
  { 
    id: 5, 
    name: "SOM Change Order", 
    description: "CM calls SOM change-order for replacement", 
    system: "CM, SOM", 
    status: "pending" 
  },
  { 
    id: 6, 
    name: "Update Technical Resource", 
    description: "SOM updates STB/SC details and replicates to CC", 
    system: "SOM, CC", 
    status: "pending" 
  },
  { 
    id: 7, 
    name: "Nagra Provisioning", 
    description: "Deactivate old STB/SC and activate new STB/SC", 
    system: "Nagra", 
    status: "pending" 
  },
  { 
    id: 8, 
    name: "MM Orders Processing", 
    description: "Process STB issue and return orders in MM", 
    system: "SD-MM", 
    status: "pending" 
  }
];

export default function Replacement() {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("search");
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  const [selectedReplacementType, setSelectedReplacementType] = useState<string>("");
  const [calculateCharges, setCalculateCharges] = useState(false);
  const [estimatedCharges, setEstimatedCharges] = useState(0);
  const { toast } = useToast();

  const form = useForm<ReplacementData>({
    resolver: zodResolver(replacementSchema),
    defaultValues: {
      smartCardNumber: "",
      replacementType: "OTC_IN_WARRANTY",
      newStbSerialNumber: "",
      replacementReason: "",
      issuingCenter: "",
      returnCenter: "",
      subscriptionAdvanceMonths: 0,
      notes: "",
    },
  });

  // Calculate replacement charges based on type and warranty
  const calculateReplacementCharges = (replacementType: string, reason: string) => {
    if (!selectedCustomer) return 0;

    const baseStbPrice = 75000; // Base STB price
    const isInWarranty = replacementType.includes("IN_WARRANTY");
    const isCustomerFault = reason === "CUSTOMER_DAMAGE";

    if (isInWarranty && !isCustomerFault) {
      return 0; // Free replacement
    } else if (isInWarranty && isCustomerFault) {
      return baseStbPrice; // Full charge for customer fault
    } else {
      // Out of warranty
      return baseStbPrice;
    }
  };

  // Handle customer search
  const handleCustomerSearch = () => {
    if (customerSearch === "SC123456789" || customerSearch === "CUST001") {
      setSelectedCustomer(mockCustomerData);
      form.setValue("smartCardNumber", mockCustomerData.smartCardNumber);
      setActiveTab("replacement");
      toast({
        title: "Customer Found",
        description: `Customer ${mockCustomerData.firstName} ${mockCustomerData.lastName} loaded successfully.`,
      });
    } else {
      toast({
        title: "Customer Not Found",
        description: "Please check the smart card number and try again.",
        variant: "destructive",
      });
    }
  };

  // Watch form values for dynamic calculations
  const watchedReplacementType = form.watch("replacementType");
  const watchedReplacementReason = form.watch("replacementReason");

  // Update charges when type or reason changes
  useMemo(() => {
    if (watchedReplacementType && watchedReplacementReason) {
      const charges = calculateReplacementCharges(watchedReplacementType, watchedReplacementReason);
      setEstimatedCharges(charges);
      setCalculateCharges(charges > 0);
    }
  }, [watchedReplacementType, watchedReplacementReason, selectedCustomer]);

  // Simulate workflow progression
  const simulateWorkflowStep = (stepIndex: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentStep(stepIndex + 1);
        setWorkflowProgress(((stepIndex + 1) / replacementWorkflowSteps.length) * 100);
        resolve(true);
      }, 1200 + Math.random() * 800);
    });
  };

  // Handle form submission
  const onSubmit = async (data: ReplacementData) => {
    if (!selectedCustomer) return;

    setIsProcessing(true);
    setActiveTab("workflow");
    
    try {
      // Simulate each workflow step
      for (let i = 0; i < replacementWorkflowSteps.length; i++) {
        await simulateWorkflowStep(i);
      }
      
      setProcessComplete(true);
      toast({
        title: "Replacement Process Completed",
        description: `STB replacement for ${selectedCustomer.firstName} ${selectedCustomer.lastName} has been successfully processed.`,
      });
    } catch (error) {
      toast({
        title: "Replacement Failed",
        description: "There was an error processing the replacement request.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Replacement</h1>
          <p className="text-gray-600 mt-1">Replace faulty or damaged STB hardware for customers</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Hardware Replacement
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Customer Search</TabsTrigger>
          <TabsTrigger value="replacement" disabled={!selectedCustomer}>Replacement Details</TabsTrigger>
          <TabsTrigger value="workflow" disabled={!isProcessing && !processComplete}>Process Status</TabsTrigger>
        </TabsList>

        {/* Customer Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Customer for Replacement
              </CardTitle>
              <CardDescription>
                Enter customer smart card number to begin hardware replacement process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>Note:</strong> Replacement process handles both STB and Smart Card replacement with automatic provisioning updates.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="customer-search">Smart Card Number / Customer ID</Label>
                  <Input
                    id="customer-search"
                    placeholder="Enter smart card number or customer ID"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                <Button onClick={handleCustomerSearch} className="mt-6">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {selectedCustomer && (
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <Label className="text-sm font-medium">Customer Name</Label>
                        <p className="text-sm">{selectedCustomer.firstName} {selectedCustomer.lastName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Smart Card</Label>
                        <p className="text-sm font-mono">{selectedCustomer.smartCardNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Current Plan</Label>
                        <p className="text-sm">{selectedCustomer.currentPlan.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Wallet Balance</Label>
                        <p className="text-sm font-medium text-green-600">
                          TZS {selectedCustomer.walletBalance.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-sm font-medium">STB Serial Number</Label>
                        <p className="text-sm font-mono">{selectedCustomer.hardware.stbSerialNumber}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">STB Model</Label>
                        <p className="text-sm">{selectedCustomer.hardware.stbModel}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Purchase Date</Label>
                        <p className="text-sm">{selectedCustomer.hardware.purchaseDate}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Warranty Status</Label>
                        <Badge 
                          variant={selectedCustomer.hardware.warrantyStatus === 'IN_WARRANTY' ? 'default' : 'destructive'}
                          className="text-xs"
                        >
                          {selectedCustomer.hardware.warrantyStatus === 'IN_WARRANTY' ? 'In Warranty' : 'Out of Warranty'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Replacement Details Tab */}
        <TabsContent value="replacement" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Hardware Replacement Request
                  </CardTitle>
                  <CardDescription>
                    Configure replacement details based on warranty status and replacement type
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Hardware Summary */}
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <Label className="text-sm font-medium">Current STB</Label>
                      <p className="text-sm font-mono">{selectedCustomer?.hardware.stbSerialNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Smart Card</Label>
                      <p className="text-sm font-mono">{selectedCustomer?.smartCardNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Warranty Status</Label>
                      <Badge 
                        variant={selectedCustomer?.hardware.warrantyStatus === 'IN_WARRANTY' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {selectedCustomer?.hardware.warrantyStatus === 'IN_WARRANTY' ? 'In Warranty' : 'Out of Warranty'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Condition</Label>
                      <Badge variant="destructive" className="text-xs">
                        {selectedCustomer?.hardware.condition}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Replacement Configuration */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="replacementType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Replacement Type</FormLabel>
                            <Select onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedReplacementType(value);
                            }} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select replacement type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="OTC_IN_WARRANTY">OTC - In Warranty</SelectItem>
                                <SelectItem value="OTC_OUT_WARRANTY">OTC - Out of Warranty</SelectItem>
                                <SelectItem value="AGENT_IN_WARRANTY">Agent - In Warranty</SelectItem>
                                <SelectItem value="AGENT_OUT_WARRANTY">Agent - Out of Warranty</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newStbSerialNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New STB Serial Number</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter new STB serial number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="replacementReason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Replacement Reason</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select replacement reason" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {replacementReasons.map((reason) => (
                                  <SelectItem key={reason.value} value={reason.value}>
                                    {reason.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Center Configuration */}
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="issuingCenter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issuing Center</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select issuing center" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {centers.map((center) => (
                                  <SelectItem key={center.value} value={center.value}>
                                    {center.label}
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
                        name="returnCenter"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Return Hardware Center</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select return center" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {centers.map((center) => (
                                  <SelectItem key={center.value} value={center.value}>
                                    {center.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {calculateCharges && (
                        <FormField
                          control={form.control}
                          name="subscriptionAdvanceMonths"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Advance Subscription (Months)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="12"
                                  placeholder="Enter advance months for free replacement"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <p className="text-xs text-gray-600">
                                Pay 2+ months advance to get free replacement
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Add any additional notes about the replacement..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Charge Summary */}
                  {estimatedCharges > 0 && (
                    <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
                      <h3 className="font-semibold mb-2 text-amber-800">Replacement Charges</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label>Estimated Cost</Label>
                          <p className="font-medium">TZS {estimatedCharges.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label>Advance Months</Label>
                          <p>{form.watch("subscriptionAdvanceMonths") || 0} months</p>
                        </div>
                      </div>
                      {(form.watch("subscriptionAdvanceMonths") || 0) >= 2 && (
                        <Alert className="mt-3 border-green-200 bg-green-50">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-700 text-sm">
                            Replacement will be free with {form.watch("subscriptionAdvanceMonths")} months advance payment.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  )}

                  <Button type="submit" className="w-full" size="lg">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Process Hardware Replacement
                  </Button>
                </CardContent>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Workflow Status Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className={`h-5 w-5 ${isProcessing ? 'animate-spin' : ''}`} />
                Replacement Process Status
              </CardTitle>
              <CardDescription>
                Tracking the hardware replacement workflow across all systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(workflowProgress)}%</span>
                </div>
                <Progress value={workflowProgress} className="w-full" />
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {replacementWorkflowSteps.map((step, index) => (
                  <div 
                    key={step.id} 
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      index < currentStep ? 'bg-green-50 border-green-200' :
                      index === currentStep ? 'bg-blue-50 border-blue-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index < currentStep ? 'bg-green-500 text-white' :
                      index === currentStep ? 'bg-blue-500 text-white' :
                      'bg-gray-300 text-gray-600'
                    }`}>
                      {index < currentStep ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : index === currentStep ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <span className="text-xs">{step.id}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{step.name}</h4>
                      <p className="text-xs text-gray-600">{step.description}</p>
                      <Badge variant="outline" className="mt-1 text-xs">{step.system}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              {processComplete && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    <strong>Hardware Replacement Completed Successfully!</strong>
                    <br />
                    Old STB has been deactivated and new STB {form.getValues("newStbSerialNumber")} has been activated for {selectedCustomer?.firstName} {selectedCustomer?.lastName}.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}