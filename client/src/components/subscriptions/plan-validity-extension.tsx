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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Search, 
  Calendar, 
  User, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Info,
  History,
  RefreshCw,
  Shield,
  ArrowRight,
  FileText,
  Tv
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

// Form schemas
const customerSearchSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  smartCardNumber: z.string().optional(),
});

const extensionRequestSchema = z.object({
  customerId: z.string().min(1, "Customer ID is required"),
  extensionDays: z.number().min(1, "Extension days must be at least 1").max(30, "Maximum extension is 30 days"),
  reason: z.string().min(1, "Extension reason is required"),
  justification: z.string().min(10, "Please provide detailed justification"),
  urgentRequest: z.boolean().default(false),
});

type CustomerSearchData = z.infer<typeof customerSearchSchema>;
type ExtensionRequestData = z.infer<typeof extensionRequestSchema>;

// Mock data for customer information
const mockCustomerData = {
  "CUST001": {
    customerId: "CUST001",
    firstName: "John",
    lastName: "Doe",
    smartCardNumber: "SC123456789",
    sapBpId: "BP00001234",
    sapCaId: "CA00001234",
    sapContractId: "CON00001234",
    currentPlan: "Azam Lite 1 Month",
    planStartDate: "2025-04-24 14:00:00",
    planEndDate: "2025-05-23 23:59:59",
    planAmount: 12000,
    status: "Active",
    walletBalance: 5000,
    lastExtensionDate: "2025-04-10 10:30:00",
    totalExtensionsUsed: 2,
    maxExtensionsAllowed: 5,
    subscriptionType: "Prepaid"
  },
  "CUST002": {
    customerId: "CUST002",
    firstName: "Sarah",
    lastName: "Johnson",
    smartCardNumber: "SC987654321",
    sapBpId: "BP00002345",
    sapCaId: "CA00002345",
    sapContractId: "CON00002345",
    currentPlan: "Azam Pure 1 Month",
    planStartDate: "2025-05-01 00:00:00",
    planEndDate: "2025-05-31 23:59:59",
    planAmount: 19000,
    status: "Active",
    walletBalance: 25000,
    lastExtensionDate: null,
    totalExtensionsUsed: 0,
    maxExtensionsAllowed: 5,
    subscriptionType: "Prepaid"
  }
};

// User roles and extension limits
const userRoleLimits = {
  "agent": { maxDays: 7, label: "Agent" },
  "supervisor": { maxDays: 15, label: "Supervisor" },
  "manager": { maxDays: 30, label: "Manager" },
  "admin": { maxDays: 30, label: "Admin" }
};

// Mock extension workflow steps
const extensionWorkflowSteps = [
  { id: 1, name: "Plan Extension Request in Portal", status: "completed", description: "Agent submits extension request" },
  { id: 2, name: "Approval Process", status: "pending", description: "Request awaiting approval" },
  { id: 3, name: "Submit Request to CM", status: "pending", description: "Approved request sent to CM" },
  { id: 4, name: "Provisioning Request to Nagra", status: "pending", description: "CM forwards to Nagra" },
  { id: 5, name: "Update Current Subscription", status: "pending", description: "CM updates subscription table" },
  { id: 6, name: "Extend End Date in SAP CC", status: "pending", description: "Update end date in Convergent Charging" },
  { id: 7, name: "Final Response to Portal", status: "pending", description: "Confirmation sent to portal" }
];

export default function PlanValidityExtension() {
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [activeTab, setActiveTab] = useState("search");
  const [userRole] = useState("agent"); // Mock user role
  const [requiresApproval, setRequiresApproval] = useState(false);
  const { toast } = useToast();

  const searchForm = useForm<CustomerSearchData>({
    resolver: zodResolver(customerSearchSchema),
    defaultValues: {
      customerId: "",
      smartCardNumber: "",
    },
  });

  const extensionForm = useForm<ExtensionRequestData>({
    resolver: zodResolver(extensionRequestSchema),
    defaultValues: {
      customerId: "",
      extensionDays: 1,
      reason: "",
      justification: "",
      urgentRequest: false,
    },
  });

  const handleCustomerSearch = (data: CustomerSearchData) => {
    if (mockCustomerData[data.customerId as keyof typeof mockCustomerData]) {
      const customer = mockCustomerData[data.customerId as keyof typeof mockCustomerData];
      setSelectedCustomer(customer);
      extensionForm.setValue("customerId", data.customerId);
      setActiveTab("extension");
    } else {
      toast({
        title: "Customer Not Found",
        description: "Try CUST001 or CUST002 for demo",
        variant: "destructive",
      });
    }
  };

  const handleExtensionRequest = async (data: ExtensionRequestData) => {
    const maxDaysForRole = userRoleLimits[userRole as keyof typeof userRoleLimits]?.maxDays || 7;
    
    // Check if approval is required
    if (data.extensionDays > maxDaysForRole) {
      setRequiresApproval(true);
      toast({
        title: "Approval Required",
        description: `Extension of ${data.extensionDays} days exceeds your limit of ${maxDaysForRole} days. Request sent for approval.`,
        variant: "default",
      });
      return;
    }

    setIsProcessing(true);
    setProcessingStep(0);

    // Simulate processing steps
    for (let i = 0; i < extensionWorkflowSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProcessingStep(i + 1);
    }

    setIsProcessing(false);
    
    // Calculate new end date
    const currentEndDate = new Date(selectedCustomer.planEndDate);
    const newEndDate = new Date(currentEndDate.getTime() + data.extensionDays * 24 * 60 * 60 * 1000);
    
    toast({
      title: "Extension Successful",
      description: `Plan validity extended by ${data.extensionDays} days. New end date: ${newEndDate.toLocaleDateString()}`,
    });

    // Reset form and customer
    setTimeout(() => {
      setSelectedCustomer(null);
      setProcessingStep(0);
      setRequiresApproval(false);
      searchForm.reset();
      extensionForm.reset();
      setActiveTab("search");
    }, 2000);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Active":
      case "completed":
        return "default";
      case "Expired":
      case "pending": 
        return "secondary";
      case "Suspended":
        return "destructive";
      default:
        return "outline";
    }
  };

  const renderCustomerInfo = () => {
    if (!selectedCustomer) return null;

    const currentEndDate = new Date(selectedCustomer.planEndDate);
    const daysUntilExpiry = Math.ceil((currentEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const maxDaysForRole = userRoleLimits[userRole as keyof typeof userRoleLimits]?.maxDays || 7;

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
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">SAP BP ID:</span>
                <span className="text-sm">{selectedCustomer.sapBpId}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Current Plan:</span>
                <span className="text-sm">{selectedCustomer.currentPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Plan End Date:</span>
                <span className={`text-sm ${daysUntilExpiry <= 3 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                  {currentEndDate.toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Days Until Expiry:</span>
                <span className={`text-sm ${daysUntilExpiry <= 3 ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                  {daysUntilExpiry} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Extensions Used:</span>
                <span className="text-sm">{selectedCustomer.totalExtensionsUsed} / {selectedCustomer.maxExtensionsAllowed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-500">Your Max Extension:</span>
                <span className="text-sm font-semibold text-azam-blue">{maxDaysForRole} days</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderProcessingWorkflow = () => {
    if (!isProcessing && processingStep === 0 && !requiresApproval) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className={`h-5 w-5 text-azam-blue ${isProcessing ? 'animate-spin' : ''}`} />
            {requiresApproval ? "Approval Workflow" : "Extension Workflow"}
          </CardTitle>
          <CardDescription>
            {requiresApproval 
              ? "Request pending approval due to role limitations"
              : "Plan validity extension process steps"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requiresApproval ? (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your request for extension exceeds your role limit and has been sent for approval. 
                You will be notified once the request is approved or rejected.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-3">
              {extensionWorkflowSteps.map((step, index) => {
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
                      {index < extensionWorkflowSteps.length - 1 && (
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
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plan Validity Extension</h1>
          <p className="text-gray-600">Extend subscription plan validity for active customers</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="h-4 w-4 text-azam-blue" />
          Subscription Operations
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Customer Search</TabsTrigger>
          <TabsTrigger value="extension" disabled={!selectedCustomer}>Extension Request</TabsTrigger>
          <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
          <TabsTrigger value="history">Extension History</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-azam-blue" />
                Search Customer
              </CardTitle>
              <CardDescription>
                Search for active customers to extend their plan validity
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
                  <strong>Demo Data:</strong> Use CUST001 or CUST002 for testing. Role: {userRoleLimits[userRole as keyof typeof userRoleLimits]?.label} (Max {userRoleLimits[userRole as keyof typeof userRoleLimits]?.maxDays} days)
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="extension" className="space-y-6">
          {renderCustomerInfo()}

          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-azam-blue" />
                  Plan Validity Extension Request
                </CardTitle>
                <CardDescription>
                  Extend the plan validity without financial impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...extensionForm}>
                  <form onSubmit={extensionForm.handleSubmit(handleExtensionRequest)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={extensionForm.control}
                        name="extensionDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Extension Days *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                max="30" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                              />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-gray-500">
                              Maximum 30 days. Your role limit: {userRoleLimits[userRole as keyof typeof userRoleLimits]?.maxDays} days
                            </p>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={extensionForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Extension Reason *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Technical issues resolved" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={extensionForm.control}
                      name="justification"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Detailed Justification *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Provide detailed justification for the extension request..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Extension Preview</h4>
                      <div className="text-sm text-blue-700 space-y-1">
                        <p>Current End Date: {new Date(selectedCustomer.planEndDate).toLocaleDateString()}</p>
                        <p>Extension Days: {extensionForm.watch("extensionDays") || 1} days</p>
                        <p>New End Date: {new Date(new Date(selectedCustomer.planEndDate).getTime() + (extensionForm.watch("extensionDays") || 1) * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                        <p className="font-medium">Financial Impact: None (Free extension)</p>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isProcessing || requiresApproval}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing Extension...
                        </>
                      ) : requiresApproval ? (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Request Sent for Approval
                        </>
                      ) : (
                        <>
                          <Calendar className="h-4 w-4 mr-2" />
                          Submit Extension Request
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          {renderProcessingWorkflow()}
        </TabsContent>

        <TabsContent value="approvals" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-azam-blue" />
                Pending Approvals
              </CardTitle>
              <CardDescription>
                Extension requests awaiting approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    requestId: "EXT001",
                    customerId: "CUST003",
                    customerName: "Michael Brown",
                    requestedDays: 15,
                    reason: "Service outage compensation",
                    requestedBy: "Agent John Smith",
                    requestDate: "2025-07-18 09:30:00",
                    status: "Pending Supervisor Approval",
                    urgency: "Normal"
                  },
                  {
                    requestId: "EXT002",
                    customerId: "CUST004",
                    customerName: "Grace Mollel",
                    requestedDays: 25,
                    reason: "Hardware replacement delay",
                    requestedBy: "Agent Mary Wilson",
                    requestDate: "2025-07-18 11:15:00",
                    status: "Pending Manager Approval",
                    urgency: "High"
                  }
                ].map((request, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{request.customerName}</h4>
                        <p className="text-sm text-gray-500">{request.customerId} • {request.requestId}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={request.urgency === "High" ? "destructive" : "secondary"}>
                          {request.urgency}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{request.status}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Extension Days:</span> {request.requestedDays} days</div>
                      <div><span className="font-medium">Requested By:</span> {request.requestedBy}</div>
                      <div><span className="font-medium">Request Date:</span> {request.requestDate}</div>
                      <div className="md:col-span-2"><span className="font-medium">Reason:</span> {request.reason}</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" variant="default">Approve</Button>
                      <Button size="sm" variant="outline">Reject</Button>
                      <Button size="sm" variant="ghost">View Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-azam-blue" />
                Extension History
              </CardTitle>
              <CardDescription>
                Recent plan validity extension records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    requestId: "EXT001",
                    customerId: "CUST005",
                    customerName: "David Wilson",
                    extensionDays: 7,
                    reason: "Technical support delay",
                    processedDate: "2025-07-17 16:45:00",
                    processedBy: "Agent Sarah Lee",
                    status: "Completed",
                    oldEndDate: "2025-07-20 23:59:59",
                    newEndDate: "2025-07-27 23:59:59"
                  },
                  {
                    requestId: "EXT002",
                    customerId: "CUST006",
                    customerName: "Lisa Anderson",
                    extensionDays: 3,
                    reason: "Customer service compensation",
                    processedDate: "2025-07-17 14:20:00",
                    processedBy: "Agent Mike Johnson",
                    status: "Completed",
                    oldEndDate: "2025-07-19 23:59:59",
                    newEndDate: "2025-07-22 23:59:59"
                  },
                  {
                    requestId: "EXT003",
                    customerId: "CUST007",
                    customerName: "Robert Martinez",
                    extensionDays: 20,
                    reason: "Major service disruption",
                    processedDate: "2025-07-16 10:30:00",
                    processedBy: "Manager Alice Brown",
                    status: "Completed",
                    oldEndDate: "2025-07-18 23:59:59",
                    newEndDate: "2025-08-07 23:59:59",
                    approvalRequired: true,
                    approvedBy: "Manager Alice Brown"
                  }
                ].map((record, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{record.customerName}</h4>
                        <p className="text-sm text-gray-500">{record.customerId} • {record.requestId}</p>
                      </div>
                      <Badge variant="default">
                        {record.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      <div><span className="font-medium">Extension:</span> {record.extensionDays} days</div>
                      <div><span className="font-medium">Processed Date:</span> {record.processedDate}</div>
                      <div><span className="font-medium">Processed By:</span> {record.processedBy}</div>
                      <div><span className="font-medium">Old End Date:</span> {record.oldEndDate}</div>
                      <div><span className="font-medium">New End Date:</span> {record.newEndDate}</div>
                      {record.approvedBy && (
                        <div><span className="font-medium">Approved By:</span> {record.approvedBy}</div>
                      )}
                      <div className="md:col-span-2"><span className="font-medium">Reason:</span> {record.reason}</div>
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