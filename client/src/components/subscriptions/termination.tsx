import { useState } from "react";
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
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  X, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Shield, 
  RefreshCw,
  FileX,
  Zap,
  Settings,
  Info,
  ArrowRight,
  Trash2,
  Ban
} from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Termination Form Schema
const terminationSchema = z.object({
  smartCardNumber: z.string().min(1, "Smart card number is required"),
  terminationReason: z.string().min(1, "Termination reason is required"),
  notes: z.string().optional(),
  confirmTermination: z.boolean().refine(val => val === true, {
    message: "You must confirm the termination to proceed"
  }),
});

type TerminationData = z.infer<typeof terminationSchema>;

// Mock customer data
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
    vatAmount: 3420,
    totalAmount: 22420,
    startDate: "2025-04-24 14:00:00",
    endDate: "2025-05-23 23:59:59",
    status: "Active"
  },
  addOns: [
    {
      id: "SPORT001",
      name: "Sports Ultimate Pack",
      amount: 8000,
      status: "Active",
      endDate: "2025-05-23 23:59:59"
    }
  ],
  lastPaymentDate: "2025-04-24 14:00:00",
  walletBalance: 5000,
  customerType: "Prepaid",
  connectionDate: "2024-01-15 10:30:00"
};

// Termination reasons
const terminationReasons = [
  { value: "CUSTOMER_REQUEST", label: "Customer Request" },
  { value: "NON_PAYMENT", label: "Non-Payment" },
  { value: "FRAUD_SUSPECTED", label: "Fraud Suspected" },
  { value: "TECHNICAL_ISSUES", label: "Technical Issues" },
  { value: "POLICY_VIOLATION", label: "Policy Violation" },
  { value: "BUSINESS_CLOSURE", label: "Business Closure" },
  { value: "OTHER", label: "Other" }
];

// Termination workflow steps (7 steps as per the flow diagram)
const terminationWorkflowSteps = [
  { 
    id: 1, 
    name: "Termination Option in Portal", 
    description: "Portal provides termination option for all customer statuses", 
    system: "Portal", 
    status: "pending" 
  },
  { 
    id: 2, 
    name: "Request Sent to SAP CM", 
    description: "Portal sends termination request to SAP CM", 
    system: "Portal, SAP CM", 
    status: "pending" 
  },
  { 
    id: 3, 
    name: "Forward Termination to SOM", 
    description: "SAP CM forwards request to SOM for processing", 
    system: "SAP CM, SOM", 
    status: "pending" 
  },
  { 
    id: 4, 
    name: "SOM Executes Termination Process", 
    description: "SOM handles backend subscription and contract termination", 
    system: "SOM", 
    status: "pending" 
  },
  { 
    id: 5, 
    name: "Provisioning Termination via Nagra", 
    description: "SAP CM sends disconnect request to Nagra", 
    system: "SAP CM, Nagra", 
    status: "pending" 
  },
  { 
    id: 6, 
    name: "Allowance Termination in SAP CC", 
    description: "SAP CM terminates charging allowances in SAP CC", 
    system: "SAP CM, SAP CC", 
    status: "pending" 
  },
  { 
    id: 7, 
    name: "Contract Termination Replication", 
    description: "Terminated contract replicated to SAP CC, CI, and FICA", 
    system: "SAP CC, SAP CI, SAP FICA", 
    status: "pending" 
  }
];

export default function Termination() {
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("search");
  const [workflowProgress, setWorkflowProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processComplete, setProcessComplete] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { toast } = useToast();

  const form = useForm<TerminationData>({
    resolver: zodResolver(terminationSchema),
    defaultValues: {
      smartCardNumber: "",
      terminationReason: "",
      notes: "",
      confirmTermination: false,
    },
  });

  // Handle customer search
  const handleCustomerSearch = () => {
    if (customerSearch === "SC123456789" || customerSearch === "CUST001") {
      setSelectedCustomer(mockCustomerData);
      form.setValue("smartCardNumber", mockCustomerData.smartCardNumber);
      setActiveTab("termination");
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

  // Simulate workflow progression
  const simulateWorkflowStep = (stepIndex: number) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setCurrentStep(stepIndex + 1);
        setWorkflowProgress(((stepIndex + 1) / terminationWorkflowSteps.length) * 100);
        resolve(true);
      }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5 seconds
    });
  };

  // Handle form submission
  const onSubmit = async (data: TerminationData) => {
    if (!selectedCustomer) return;

    setShowConfirmation(true);
  };

  // Confirm and process termination
  const processTermination = async () => {
    setIsProcessing(true);
    setShowConfirmation(false);
    setActiveTab("workflow");
    
    try {
      // Simulate each workflow step
      for (let i = 0; i < terminationWorkflowSteps.length; i++) {
        await simulateWorkflowStep(i);
      }
      
      setProcessComplete(true);
      toast({
        title: "Termination Completed",
        description: `Customer ${selectedCustomer.firstName} ${selectedCustomer.lastName}'s subscription has been permanently terminated.`,
      });
    } catch (error) {
      toast({
        title: "Termination Failed",
        description: "There was an error processing the termination request.",
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
          <h1 className="text-3xl font-bold text-gray-900">Customer Termination</h1>
          <p className="text-gray-600 mt-1">Permanently terminate customer subscriptions and services</p>
        </div>
        <Badge variant="destructive" className="px-3 py-1">
          <X className="h-4 w-4 mr-2" />
          Permanent Disconnection
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Customer Search</TabsTrigger>
          <TabsTrigger value="termination" disabled={!selectedCustomer}>Termination Details</TabsTrigger>
          <TabsTrigger value="workflow" disabled={!isProcessing && !processComplete}>Process Status</TabsTrigger>
        </TabsList>

        {/* Customer Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Customer for Termination
              </CardTitle>
              <CardDescription>
                Enter customer smart card number or customer ID to begin termination process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-700">
                  <strong>Warning:</strong> Termination is a permanent action that cannot be undone. The customer will need to create a new subscription to resume services.
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
                <Card className="border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant="secondary" className="text-xs">
                          {selectedCustomer.currentPlan.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Termination Details Tab */}
        <TabsContent value="termination" className="space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileX className="h-5 w-5" />
                    Termination Request
                  </CardTitle>
                  <CardDescription>
                    Review customer details and provide termination information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Summary */}
                  <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                    <div>
                      <Label className="text-sm font-medium">Customer</Label>
                      <p className="text-sm">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Email</Label>
                      <p className="text-sm">{selectedCustomer?.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Phone</Label>
                      <p className="text-sm">{selectedCustomer?.phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Connection Date</Label>
                      <p className="text-sm">{selectedCustomer?.connectionDate}</p>
                    </div>
                  </div>

                  {/* Current Subscription Details */}
                  {selectedCustomer && (
                    <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                      <h3 className="font-semibold mb-3 text-red-800">Current Subscription to be Terminated</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Plan Name</Label>
                          <p className="text-sm">{selectedCustomer.currentPlan.name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Plan Type</Label>
                          <p className="text-sm">{selectedCustomer.currentPlan.planType}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Monthly Amount</Label>
                          <p className="text-sm">TZS {selectedCustomer.currentPlan.totalAmount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium">End Date</Label>
                          <p className="text-sm">{selectedCustomer.currentPlan.endDate}</p>
                        </div>
                      </div>

                      {selectedCustomer.addOns.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium">Active Add-Ons</Label>
                          <div className="mt-2 space-y-2">
                            {selectedCustomer.addOns.map((addon: any, index: number) => (
                              <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                                <span className="text-sm">{addon.name}</span>
                                <Badge variant="outline" className="text-xs">TZS {addon.amount.toLocaleString()}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Termination Form */}
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="terminationReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Termination Reason</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select termination reason" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {terminationReasons.map((reason) => (
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

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide any additional details about the termination..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="confirmTermination"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 border-red-200 bg-red-50">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-red-800 font-medium">
                              I confirm that I want to permanently terminate this customer's subscription
                            </FormLabel>
                            <p className="text-xs text-red-600">
                              This action cannot be undone. The customer will lose access to all services immediately and will need to create a new subscription to resume services.
                            </p>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Alert className="border-red-200 bg-red-50">
                    <Ban className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      <strong>Important:</strong> No refund will be processed for the remaining subscription period. All services will be immediately disconnected.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    variant="destructive"
                    className="w-full" 
                    size="lg"
                    disabled={!form.watch("confirmTermination")}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Initiate Termination Process
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
                Termination Process Status
              </CardTitle>
              <CardDescription>
                Tracking the 7-step termination workflow across all systems
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
                {terminationWorkflowSteps.map((step, index) => (
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
                <Alert className="border-red-200 bg-red-50">
                  <CheckCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <strong>Termination Process Completed!</strong>
                    <br />
                    Customer {selectedCustomer?.firstName} {selectedCustomer?.lastName}'s subscription has been permanently terminated. All services have been disconnected and contract closed in all systems.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Confirm Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you absolutely sure you want to terminate <strong>{selectedCustomer?.firstName} {selectedCustomer?.lastName}'s</strong> subscription?
              </p>
              <Alert className="border-red-200 bg-red-50">
                <Ban className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700 text-sm">
                  This action is permanent and cannot be reversed. The customer will immediately lose access to all services.
                </AlertDescription>
              </Alert>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={processTermination}
                  className="flex-1"
                >
                  Proceed with Termination
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}