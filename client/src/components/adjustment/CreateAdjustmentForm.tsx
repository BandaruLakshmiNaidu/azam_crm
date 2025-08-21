import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, User, Phone, Mail, DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const adjustmentFormSchema = z.object({
  bpId: z.string().min(1, "BP ID is required"),
  scId: z.string().optional(),
  type: z.enum(["CREDIT", "DEBIT"]),
  invoiceNumber: z.string().optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
  comments: z.string().optional(),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be a positive number"),
  currency: z.string().default("TZS"),
  walletType: z.enum(["HW", "SUBSCRIPTION", "PREPAID"]),
  vatType: z.enum(["VAT", "NO_VAT"])
});

type AdjustmentFormData = z.infer<typeof adjustmentFormSchema>;

export default function CreateAdjustmentForm() {
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentFormSchema),
    defaultValues: {
      type: "CREDIT",
      currency: "TZS",
      walletType: "SUBSCRIPTION",
      vatType: "VAT"
    }
  });

  // Search customer by BP ID
  const searchCustomer = async (bpId: string) => {
    if (!bpId.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/customers/bp/${bpId}`);
      if (response.ok) {
        const details = await response.json();
        setCustomerDetails(details);
        toast({
          title: "Customer Found",
          description: `Found customer: ${details.name}`
        });
      } else {
        setCustomerDetails(null);
        toast({
          title: "Customer Not Found",
          description: "No customer found with this BP ID",
          variant: "destructive"
        });
      }
    } catch (error) {
      setCustomerDetails(null);
      toast({
        title: "Search Error",
        description: "Failed to search for customer",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  // Create adjustment mutation
  const createAdjustmentMutation = useMutation({
    mutationFn: async (data: AdjustmentFormData) => {
      const response = await fetch('/api/adjustments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount)
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create adjustment');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Adjustment Created",
        description: "Adjustment request submitted successfully and is pending approval."
      });
      form.reset();
      setCustomerDetails(null);
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/adjustments/pending'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: AdjustmentFormData) => {
    if (!customerDetails) {
      toast({
        title: "Customer Required",
        description: "Please search and select a valid customer first",
        variant: "destructive"
      });
      return;
    }
    createAdjustmentMutation.mutate(data);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Search Section */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <Search className="h-5 w-5 text-blue-600" />
                Customer Search
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Enter BP ID or SC ID to search for customer details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="bpId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Partner ID</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="Enter BP ID"
                            {...field}
                            className="flex-1"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => searchCustomer(field.value)}
                          disabled={isSearching || !field.value}
                        >
                          {isSearching ? "Searching..." : "Search"}
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="scId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Smart Card ID (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter SC ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Customer Details Display */}
              {customerDetails && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-green-800 dark:text-green-300">Customer Found</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span><strong>Name:</strong> {customerDetails.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{customerDetails.customerType}</Badge>
                      <Badge variant="secondary">{customerDetails.accountType}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span><strong>Balance:</strong> {formatCurrency(customerDetails.balance)}</span>
                    </div>
                    {customerDetails.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span>{customerDetails.phone}</span>
                      </div>
                    )}
                    {customerDetails.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span>{customerDetails.email}</span>
                      </div>
                    )}
                    <div>
                      <span><strong>Status:</strong> </span>
                      <Badge className={customerDetails.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {customerDetails.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Separator />

          {/* Adjustment Details Section */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <DollarSign className="h-5 w-5 text-blue-600" />
                Adjustment Details
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Configure the adjustment type, amount, and reason
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adjustment Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CREDIT">Credit (Add to customer)</SelectItem>
                          <SelectItem value="DEBIT">Debit (Charge customer)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (TZS)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Enter amount"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="walletType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wallet Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select wallet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HW">Hardware Wallet</SelectItem>
                          <SelectItem value="SUBSCRIPTION">Subscription Wallet</SelectItem>
                          <SelectItem value="PREPAID">Prepaid Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vatType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>VAT Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select VAT" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="VAT">With VAT</SelectItem>
                          <SelectItem value="NO_VAT">Without VAT</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter invoice number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Reference invoice if adjustment is related to a specific invoice
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adjustment Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide detailed reason for this adjustment..."
                        className="resize-none"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 5 characters. Be specific about why this adjustment is needed.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Comments (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional comments or context..."
                        className="resize-none"
                        rows={2}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Section */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setCustomerDetails(null);
              }}
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              disabled={createAdjustmentMutation.isPending || !customerDetails}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createAdjustmentMutation.isPending ? "Submitting..." : "Submit Adjustment Request"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}