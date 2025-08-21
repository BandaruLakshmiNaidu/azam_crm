import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Play, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  Tv,
  Calendar,
  CreditCard,
  RefreshCw,
  Zap,
  ArrowRight,
  Info,
  History
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form schemas
const customerSearchSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  smartCardNumber: z.string().optional(),
});

const reconnectionSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  reconnectionReason: z.string().min(1, "Reconnection reason is required"),
  extensionDays: z.number().min(0).max(365).optional(),
});

type CustomerSearchData = z.infer<typeof customerSearchSchema>;
type ReconnectionData = z.infer<typeof reconnectionSchema>;

// Mock data for customer information
const mockCustomerData = {
  suspended: {
    customerId: "CUST001",
    firstName: "John",
    lastName: "Doe",
    smartCardNumber: "SC123456789",
    status: "Suspended",
    suspensionDate: "2025-05-13 11:00:00",
    suspensionReason: "Hardware Issues",
    currentPlan: "Azam Lite 1 Month",
    planStartDate: "2025-04-24 14:00:00",
    planEndDate: "2025-05-23 23:59:59",
    walletBalance: 0,
    planAmount: 12000,
    isActive: true,
    suspensionDays: 5,
    planStatus: "Active"
  },
  disconnected: {
    customerId: "CUST002",
    firstName: "Sarah",
    lastName: "Johnson",
    smartCardNumber: "SC987654321",
    status: "Disconnected",
    disconnectionDate: "2025-05-24 00:00:00",
    disconnectionReason: "Insufficient Balance",
    lastPlan: "Azam Play 1 Month",
    lastPlanEndDate: "2025-05-23 23:59:59",
    walletBalance: 28000,
    lastPlanAmount: 19000,
    isActive: false,
    autoReconnectionEligible: true
  }
};

// Mock reconnection workflow steps
const reconnectionSteps = [
  { id: 1, name: "Trigger Reconnection via Portal", status: "completed", description: "Portal sends JSON request to CM" },
  { id: 2, name: "Plan Status Validation in CM", status: "completed", description: "CM checks current plan status" },
  { id: 3, name: "Send Unlock Request to SOM", status: "processing", description: "CM sends unlock request to SOM" },
  { id: 4, name: "Notify CC for Reconnection", status: "pending", description: "CM notifies CC for reconnection" },
  { id: 5, name: "SOM Unlock Process", status: "pending", description: "SOM initiates unlock process" },
  { id: 6, name: "Provisioning Request to Nagra", status: "pending", description: "CM sends reactivation to Nagra" },
  { id: 7, name: "Update Subscription Status", status: "pending", description: "CM updates subscription status" },
  { id: 8, name: "Success Acknowledgement", status: "pending", description: "Success response to portal" }
];

const autoReconnectionSteps = [
  { id: 1, name: "Wallet Top-up Trigger", status: "completed", description: "Customer payment detected" },
  { id: 2, name: "Auto-Renewal Logic", status: "completed", description: "CM executes auto-renewal logic" },
  { id: 3, name: "Wallet Balance Deduction", status: "processing", description: "CM deducts required amount" },
  { id: 4, name: "Renewal Request to CC", status: "pending", description: "CM sends renewal to CC" },
  { id: 5, name: "Plan Renewal Execution", status: "pending", description: "CC processes plan renewal" },
  { id: 6, name: "Update Subscription & Provisioning", status: "pending", description: "Update subscription and Nagra provisioning" },
  { id: 7, name: "Billing & Invoicing", status: "pending", description: "CI performs billing and invoicing" },
  { id: 8, name: "Financial Posting", status: "pending", description: "Financial postings in SAP FICA" }
];

export default function Reconnection() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [activeTab, setActiveTab] = useState("search");
  const { toast } = useToast();

  const searchForm = useForm<CustomerSearchData>({
    resolver: zodResolver(customerSearchSchema),
    defaultValues: {
      customerId: "",
      smartCardNumber: "",
    },
  });

  const reconnectionForm = useForm<ReconnectionData>({
    resolver: zodResolver(reconnectionSchema),
    defaultValues: {
      customerId: "",
      reconnectionReason: "",
      extensionDays: 0,
    },
  });

  const handleCustomerSearch = (data: CustomerSearchData) => {
    // Mock search logic - in real implementation, this would call API
    if (data.customerId === "CUST001") {
      setSelectedCustomer(mockCustomerData.suspended);
      reconnectionForm.setValue("customerId", data.customerId);
      setActiveTab("reconnection");
    } else if (data.customerId === "CUST002") {
      setSelectedCustomer(mockCustomerData.disconnected);
      reconnectionForm.setValue("customerId", data.customerId);
      setActiveTab("reconnection");
    } else {
      toast({
        title: "Customer Not Found",
        description: "Try CUST001 (suspended) or CUST002 (disconnected) for demo",
        variant: "destructive",
      });
    }
  };

  const handleReconnection = async (data: ReconnectionData) => {
    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate processing steps
    const steps = selectedCustomer?.status === "Suspended" ? reconnectionSteps : autoReconnectionSteps;
    
    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingStep(i + 1);
    }

    setIsProcessing(false);
    
    toast({
      title: "Reconnection Successful",
      description: `Customer ${selectedCustomer?.firstName} ${selectedCustomer?.lastName} has been successfully reconnected.`,
    });

    // Reset form and customer
    setTimeout(() => {
      setSelectedCustomer(null);
      setProcessingStep(0);
      searchForm.reset();
      reconnectionForm.reset();
      setActiveTab("search");
    }, 2000);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
      case "completed":
        return "default";
      case "Suspended":
      case "processing": 
        return "secondary";
      case "Disconnected":
      case "pending":
        return "outline";
      default:
        return "outline";
    }
  };

  const renderCustomerInfo = () => {
    if (!selectedCustomer) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-azam-blue" />
            Customer Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Customer Name:</span>
                <span className="text-sm font-semibold">{selectedCustomer.firstName} {selectedCustomer.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Customer ID:</span>
                <span className="text-sm">{selectedCustomer.customerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Smart Card:</span>
                <span className="text-sm">{selectedCustomer.smartCardNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Status:</span>
                <Badge variant={getStatusBadgeVariant(selectedCustomer.status)}>
                  {selectedCustomer.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Current Plan:</span>
                <span className="text-sm">{selectedCustomer.currentPlan || selectedCustomer.lastPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Plan End Date:</span>
                <span className="text-sm">{selectedCustomer.planEndDate || selectedCustomer.lastPlanEndDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Wallet Balance:</span>
                <span className="text-sm font-semibold text-green-600">TSH {selectedCustomer.walletBalance.toLocaleString()}</span>
              </div>
              {selectedCustomer.status === "Suspended" && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-500">Suspension Days:</span>
                  <span className="text-sm text-orange-600">{selectedCustomer.suspensionDays} days</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProcessingWorkflow = () => {
    if (!isProcessing && processingStep === 0) return null;

    const steps = selectedCustomer?.status === "Suspended" ? reconnectionSteps : autoReconnectionSteps;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 text-azam-blue ${isProcessing ? 'animate-spin' : ''}`} />
            Reconnection Workflow
          </CardTitle>
          <CardDescription>
            {selectedCustomer?.status === "Suspended" 
              ? "Manual reconnection process for suspended customer"
              : "Auto reconnection process for disconnected customer"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const isCompleted = index < processingStep;
              const isCurrent = index === processingStep - 1 && isProcessing;
              const isPending = index >= processingStep;

              return (
                <div key={step.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : isCurrent ? (
                      <RefreshCw className="h-5 w-5 text-azam-blue animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                    {index < steps.length - 1 && (
                      <div className={`w-0.5 h-6 mt-1 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-green-700' : isCurrent ? 'text-azam-blue' : 'text-gray-500'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Reconnection</h1>
          <p className="text-gray-600">Reconnect suspended or disconnected customer services</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Play className="h-4 w-4 text-azam-blue" />
          Service Management
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Customer Search</TabsTrigger>
          <TabsTrigger value="reconnection" disabled={!selectedCustomer}>Reconnection Process</TabsTrigger>
          <TabsTrigger value="history">Reconnection History</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-azam-blue" />
                Search Customer
              </CardTitle>
              <CardDescription>
                Search for suspended or disconnected customers to initiate reconnection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...searchForm}>
                <form onSubmit={searchForm.handleSubmit(handleCustomerSearch)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={searchForm.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer ID *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. CUST001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={searchForm.control}
                      name="smartCardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Smart Card Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. SC123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" className="w-full md:w-auto">
                    <Search className="h-4 w-4 mr-2" />
                    Search Customer
                  </Button>
                </form>
              </Form>

              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Demo Data:</strong> Use CUST001 for suspended customer or CUST002 for disconnected customer
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reconnection" className="space-y-6">
          {renderCustomerInfo()}

          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-azam-blue" />
                  Reconnection Details
                </CardTitle>
                <CardDescription>
                  {selectedCustomer.status === "Suspended" 
                    ? "Manual reconnection for suspended customer" 
                    : "Auto reconnection logic for disconnected customer"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedCustomer.status === "Suspended" ? (
                  <div className="space-y-4">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Suspended Customer:</strong> This customer requires manual reconnection. 
                        The suspension period ({selectedCustomer.suspensionDays} days) will be added to the plan validity.
                      </AlertDescription>
                    </Alert>

                    <Form {...reconnectionForm}>
                      <form onSubmit={reconnectionForm.handleSubmit(handleReconnection)} className="space-y-4">
                        <FormField
                          control={reconnectionForm.control}
                          name="reconnectionReason"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Reconnection Reason *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Hardware issue resolved" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Plan Validity Extension</h4>
                          <p className="text-sm text-blue-700">
                            Current plan ends: {selectedCustomer.planEndDate}<br/>
                            Extension: {selectedCustomer.suspensionDays} days (suspension period)<br/>
                            New end date: {new Date(new Date(selectedCustomer.planEndDate).getTime() + selectedCustomer.suspensionDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                          </p>
                        </div>

                        <Button 
                          type="submit" 
                          className="w-full" 
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Processing Reconnection...
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Start Manual Reconnection
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Alert>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Disconnected Customer:</strong> This customer can be automatically reconnected 
                        based on wallet balance (TSH {selectedCustomer.walletBalance.toLocaleString()}) using auto-renewal logic.
                      </AlertDescription>
                    </Alert>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Auto Reconnection Logic</h4>
                      <div className="text-sm text-green-700 space-y-1">
                        <p>✓ Payment History Match: Check last 15 days for plan amount matches</p>
                        <p>✓ Exact Wallet Balance Match: Current balance vs plan costs</p>
                        <p>✓ Nearest Plan Range: Select closest matching plan amount</p>
                        <p>✓ Current Package 1M: Try 1-month variant of existing package</p>
                        <p>✓ Other Package 1M: Alternative 1-month plans</p>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleReconnection({ customerId: selectedCustomer.customerId, reconnectionReason: "Auto reconnection via wallet top-up" })}
                      className="w-full"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing Auto Reconnection...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Start Auto Reconnection
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {renderProcessingWorkflow()}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-azam-blue" />
                Reconnection History
              </CardTitle>
              <CardDescription>
                Recent customer reconnection transactions and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    customerId: "CUST003",
                    customerName: "Michael Brown",
                    reconnectionDate: "2025-07-17 14:30:00",
                    type: "Manual Reconnection",
                    status: "Completed",
                    reason: "Hardware replacement completed",
                    planExtension: "3 days"
                  },
                  {
                    customerId: "CUST004", 
                    customerName: "Grace Mollel",
                    reconnectionDate: "2025-07-17 11:15:00",
                    type: "Auto Reconnection",
                    status: "Completed",
                    reason: "Wallet top-up TSH 19,000",
                    newPlan: "Azam Play 1 Month"
                  },
                  {
                    customerId: "CUST005",
                    customerName: "David Wilson",
                    reconnectionDate: "2025-07-16 16:45:00",
                    type: "Manual Reconnection",
                    status: "Failed",
                    reason: "Nagra provisioning timeout",
                    error: "System timeout after 30 seconds"
                  }
                ].map((record, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{record.customerName}</h4>
                        <p className="text-sm text-gray-500">{record.customerId}</p>
                      </div>
                      <Badge variant={record.status === "Completed" ? "default" : record.status === "Failed" ? "destructive" : "secondary"}>
                        {record.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Date:</span> {record.reconnectionDate}</div>
                      <div><span className="font-medium">Type:</span> {record.type}</div>
                      <div className="md:col-span-2"><span className="font-medium">Reason:</span> {record.reason}</div>
                      {record.planExtension && (
                        <div><span className="font-medium">Extension:</span> {record.planExtension}</div>
                      )}
                      {record.newPlan && (
                        <div><span className="font-medium">New Plan:</span> {record.newPlan}</div>
                      )}
                      {record.error && (
                        <div className="md:col-span-2 text-red-600"><span className="font-medium">Error:</span> {record.error}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}