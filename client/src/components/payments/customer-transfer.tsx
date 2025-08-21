import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Users, AlertTriangle, CheckCircle, Clock, DollarSign, FileText, Search, User, CreditCard } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

const transferSchema = z.object({
  sourceCustomerId: z.string().min(1, 'Source customer is required'),
  targetCustomerId: z.string().min(1, 'Target customer is required'),
  transferAmount: z.string().min(1, 'Transfer amount is required'),
  currency: z.string().default('TZS'),
  transferReason: z.string().min(10, 'Please provide detailed reason (minimum 10 characters)'),
  paymentType: z.string().default('SUBSCRIPTION'),
  paymentId: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface CustomerData {
  customer: {
    id: number;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    customerType: string;
    sapBpId: string;
  };
  eligibility: {
    hasActivePayments: boolean;
    totalPayments: number;
    totalAmount: number;
    currency: string;
  };
  recentPayments: Array<{
    id: number;
    amount: number;
    currency: string;
    paymentMode: string;
    type: string;
    receiptNumber: string;
    createdAt: string;
  }>;
}

interface TransferValidation {
  eligible: boolean;
  reason?: string;
  sourceCustomer?: any;
  targetCustomer?: any;
  availablePayments?: any[];
}

export default function CustomerTransfer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [sourceCustomer, setSourceCustomer] = useState<CustomerData | null>(null);
  const [targetCustomer, setTargetCustomer] = useState<CustomerData | null>(null);
  const [validationResult, setValidationResult] = useState<TransferValidation | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      currency: 'TZS',
      paymentType: 'SUBSCRIPTION',
    },
  });

  // Fetch customer transfers
  const { data: transfers, isLoading: transfersLoading } = useQuery({
    queryKey: ['/api/customer-transfer'],
    queryFn: async () => {
      const response = await fetch('/api/customer-transfer');
      if (!response.ok) throw new Error('Failed to fetch transfers');
      return response.json();
    },
  });

  // Validate transfer mutation
  const validateTransferMutation = useMutation({
    mutationFn: async (data: { sourceCustomerId: number; targetCustomerId: number; amount: number }) => {
      const response = await fetch('/api/customer-transfer/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Validation failed');
      return response.json() as Promise<TransferValidation>;
    },
    onSuccess: (data: TransferValidation) => {
      setValidationResult(data);
      if (data.eligible) {
        setCurrentStep(3);
        toast({
          title: 'Validation Successful',
          description: 'Transfer is eligible. Please review details and submit.',
        });
      } else {
        toast({
          title: 'Transfer Not Eligible',
          description: data.reason || 'Transfer validation failed',
          variant: 'destructive',
        });
      }
    },
    onError: () => {
      toast({
        title: 'Validation Failed',
        description: 'Failed to validate transfer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Create transfer mutation
  const createTransferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/customer-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Transfer creation failed');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Transfer Created',
        description: 'Customer transfer request has been submitted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/customer-transfer'] });
      setCurrentStep(4);
      form.reset();
    },
    onError: () => {
      toast({
        title: 'Transfer Failed',
        description: 'Failed to create transfer request. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Search customer function
  const searchCustomer = async (customerId: string, type: 'source' | 'target') => {
    try {
      const response = await fetch(`/api/customer-transfer/customer/${customerId}/eligibility`);
      if (!response.ok) throw new Error('Customer not found');
      const data = await response.json() as CustomerData;
      
      if (type === 'source') {
        setSourceCustomer(data);
      } else {
        setTargetCustomer(data);
      }
      
      toast({
        title: 'Customer Found',
        description: `${data.customer.firstName} ${data.customer.lastName} loaded successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Customer Not Found',
        description: 'Unable to find customer with the provided ID.',
        variant: 'destructive',
      });
    }
  };

  const handleValidateTransfer = () => {
    if (!sourceCustomer || !targetCustomer) {
      toast({
        title: 'Missing Customer Data',
        description: 'Please search and select both source and target customers.',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(form.getValues('transferAmount'));
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid transfer amount.',
        variant: 'destructive',
      });
      return;
    }

    validateTransferMutation.mutate({
      sourceCustomerId: sourceCustomer.customer.id,
      targetCustomerId: targetCustomer.customer.id,
      amount,
    });
  };

  const handleCreateTransfer = (data: TransferFormData) => {
    if (!sourceCustomer || !targetCustomer || !validationResult?.eligible) {
      toast({
        title: 'Validation Required',
        description: 'Please validate the transfer before submitting.',
        variant: 'destructive',
      });
      return;
    }

    const transferData = {
      sourceBpId: sourceCustomer.customer.sapBpId,
      targetBpId: targetCustomer.customer.sapBpId,
      sourceCustomerId: sourceCustomer.customer.id,
      targetCustomerId: targetCustomer.customer.id,
      transferAmount: parseFloat(data.transferAmount),
      currency: data.currency,
      transferReason: data.transferReason,
      paymentType: data.paymentType,
      paymentId: data.paymentId ? parseInt(data.paymentId) : undefined,
      invoiceNumber: data.invoiceNumber,
    };

    createTransferMutation.mutate(transferData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500';
      case 'APPROVED': return 'bg-blue-500';
      case 'INPROGRESS': return 'bg-yellow-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const CustomerCard = ({ customer, type }: { customer: CustomerData; type: 'source' | 'target' }) => (
    <Card className="border-2 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5" />
          {type === 'source' ? 'Source Customer' : 'Target Customer'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-600">Name</Label>
            <p className="font-semibold">{customer.customer.firstName} {customer.customer.lastName}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">SAP BP ID</Label>
            <p className="font-mono text-sm">{customer.customer.sapBpId}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Phone</Label>
            <p>{customer.customer.phone}</p>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-600">Type</Label>
            <Badge variant="outline">{customer.customer.customerType}</Badge>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <Label className="text-sm font-medium text-gray-600">Payment Eligibility</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Payments</p>
              <p className="font-bold text-blue-600">{customer.eligibility.totalPayments}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-bold text-green-600">{customer.eligibility.totalAmount.toLocaleString()} {customer.eligibility.currency}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={customer.eligibility.hasActivePayments ? "default" : "destructive"}>
                {customer.eligibility.hasActivePayments ? "Eligible" : "No Payments"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-blue-100 p-2 rounded-lg">
            <ArrowRight className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer-to-Customer Payment Transfer</h1>
            <p className="text-gray-600">Transfer subscription payments between customers</p>
          </div>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[
            { step: 1, title: 'Select Customers', icon: Users },
            { step: 2, title: 'Enter Details', icon: FileText },
            { step: 3, title: 'Validate Transfer', icon: CheckCircle },
            { step: 4, title: 'Complete', icon: DollarSign },
          ].map(({ step, title, icon: Icon }) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'border-gray-300 text-gray-400'
              }`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= step ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {title}
              </span>
              {step < 4 && <ArrowRight className="h-4 w-4 text-gray-400 mx-4" />}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Transfer Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Transfer Request Form</CardTitle>
              <CardDescription>
                Create a new customer-to-customer payment transfer request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(handleCreateTransfer)} className="space-y-6">
                {/* Step 1: Customer Selection */}
                {currentStep >= 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Step 1: Customer Selection
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sourceSearch">Source Customer ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="sourceSearch"
                            placeholder="Enter customer ID"
                            onChange={(e) => form.setValue('sourceCustomerId', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => searchCustomer(form.getValues('sourceCustomerId'), 'source')}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="targetSearch">Target Customer ID</Label>
                        <div className="flex gap-2">
                          <Input
                            id="targetSearch"
                            placeholder="Enter customer ID"
                            onChange={(e) => form.setValue('targetCustomerId', e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => searchCustomer(form.getValues('targetCustomerId'), 'target')}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {(sourceCustomer || targetCustomer) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        {sourceCustomer && <CustomerCard customer={sourceCustomer} type="source" />}
                        {targetCustomer && <CustomerCard customer={targetCustomer} type="target" />}
                      </div>
                    )}

                    {sourceCustomer && targetCustomer && (
                      <Button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="w-full"
                      >
                        Continue to Transfer Details
                      </Button>
                    )}
                  </div>
                )}

                {/* Step 2: Transfer Details */}
                {currentStep >= 2 && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Step 2: Transfer Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="transferAmount">Transfer Amount</Label>
                        <Input
                          id="transferAmount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...form.register('transferAmount')}
                        />
                        {form.formState.errors.transferAmount && (
                          <p className="text-sm text-red-600 mt-1">
                            {form.formState.errors.transferAmount.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select onValueChange={(value) => form.setValue('currency', value)} defaultValue="TZS">
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentId">Payment ID (Optional)</Label>
                        <Input
                          id="paymentId"
                          placeholder="Specific payment to transfer"
                          {...form.register('paymentId')}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="invoiceNumber">Invoice Number (Optional)</Label>
                        <Input
                          id="invoiceNumber"
                          placeholder="Related invoice number"
                          {...form.register('invoiceNumber')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="transferReason">Transfer Reason</Label>
                      <Textarea
                        id="transferReason"
                        placeholder="Provide detailed reason for the transfer (minimum 10 characters)"
                        rows={3}
                        {...form.register('transferReason')}
                      />
                      {form.formState.errors.transferReason && (
                        <p className="text-sm text-red-600 mt-1">
                          {form.formState.errors.transferReason.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="button"
                      onClick={handleValidateTransfer}
                      disabled={validateTransferMutation.isPending}
                      className="w-full"
                    >
                      {validateTransferMutation.isPending ? 'Validating...' : 'Validate Transfer'}
                    </Button>
                  </div>
                )}

                {/* Step 3: Validation Results */}
                {currentStep >= 3 && validationResult && (
                  <div className="space-y-4">
                    <Separator />
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CheckCircle className="h-5 w-5" />
                      Step 3: Validation Results
                    </h3>
                    
                    {validationResult.eligible ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold text-green-800">Transfer Eligible</span>
                        </div>
                        <p className="text-green-700">All validation checks passed. You can proceed with the transfer.</p>
                        
                        <Button
                          type="submit"
                          disabled={createTransferMutation.isPending}
                          className="w-full mt-4"
                        >
                          {createTransferMutation.isPending ? 'Creating Transfer...' : 'Submit Transfer Request'}
                        </Button>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <span className="font-semibold text-red-800">Transfer Not Eligible</span>
                        </div>
                        <p className="text-red-700">{validationResult.reason}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 4: Success */}
                {currentStep >= 4 && (
                  <div className="space-y-4">
                    <Separator />
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-green-800 mb-2">Transfer Request Submitted</h3>
                      <p className="text-green-700">Your customer transfer request has been submitted successfully and is now being processed.</p>
                      <Button
                        type="button"
                        onClick={() => {
                          setCurrentStep(1);
                          setSourceCustomer(null);
                          setTargetCustomer(null);
                          setValidationResult(null);
                          form.reset();
                        }}
                        className="mt-4"
                      >
                        Create New Transfer
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Transfer History Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Transfers
              </CardTitle>
              <CardDescription>
                Latest customer transfer requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transfersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : transfers && Array.isArray(transfers) && transfers.length > 0 ? (
                <div className="space-y-3">
                  {(transfers as any[]).slice(0, 5).map((transfer: any) => (
                    <div key={transfer.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStatusColor(transfer.status)}>
                          {transfer.status}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(transfer.createDt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {transfer.transferAmount.toLocaleString()} {transfer.currency}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {transfer.transferReason}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                        <CreditCard className="h-3 w-3" />
                        <span>{transfer.sourceBpId} → {transfer.targetBpId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No transfer requests found
                </p>
              )}
            </CardContent>
          </Card>

          {/* Integration Status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Integration Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Central Module (CM)</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SAP FICA</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">SAP SOM</span>
                <Badge variant="default">Available</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}