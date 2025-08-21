import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Search, X, Power, PowerOff, AlertTriangle, CheckCircle2, XCircle, Users, Calendar, Clock, Shield, Wifi, WifiOff } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';

interface CustomerData {
  id: string;
  name: string;
  email: string;
  phone: string;
  sapBpId: string;
  sapCaId: string;
  sapContractId: string;
  smartCardNo: string;
  currentPlan: {
    id: string;
    name: string;
    type: string;
    amount: number;
    startDate: string;
    endDate: string;
    status: string;
  };
  connectionStatus: 'CONNECTED' | 'DISCONNECTED' | 'SUSPENDED' | 'EXPIRED';
  walletBalance: number;
  lastRenewalAttempt?: string;
  autoRenewalStatus?: string;
  ftaDisconnectionDate?: string;
  scheduledPlanChange?: {
    planId: string;
    planName: string;
    scheduledDate: string;
    status: string;
  };
}

interface DisconnectionReason {
  id: string;
  name: string;
  description: string;
  category: string;
  isAutomatic: boolean;
}

interface DisconnectionRequest {
  customerId: string;
  reasonId: string;
  notes?: string;
  disconnectionType: 'IMMEDIATE' | 'SCHEDULED';
  scheduledDate?: string;
  actionType: 'DISCONNECTION';
  actionSubtype: string;
}

const CustomerDisconnection: React.FC = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [showCustomerResults, setShowCustomerResults] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [disconnectionNotes, setDisconnectionNotes] = useState<string>('');
  const [disconnectionType, setDisconnectionType] = useState<'IMMEDIATE' | 'SCHEDULED'>('IMMEDIATE');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [activeTab, setActiveTab] = useState('disconnection');
  const queryClient = useQueryClient();

  // Fetch customer search results
  const { data: searchResults = [] } = useQuery({
    queryKey: ['/api/customer-search', customerSearch],
    enabled: customerSearch.length >= 2,
  });

  // Fetch disconnection reasons
  const { data: disconnectionReasons = [] } = useQuery<DisconnectionReason[]>({
    queryKey: ['/api/disconnection-reasons'],
    enabled: true,
  });

  // Fetch customer details
  const { data: customerData } = useQuery<CustomerData>({
    queryKey: ['/api/customer-details', selectedCustomer],
    enabled: !!selectedCustomer,
  });

  // Fetch disconnection history
  const { data: disconnectionHistory = [] } = useQuery({
    queryKey: ['/api/disconnection-history'],
    enabled: activeTab === 'history',
  });

  // Fetch auto disconnection queue
  const { data: autoDisconnectionQueue = [] } = useQuery({
    queryKey: ['/api/auto-disconnection-queue'],
    enabled: activeTab === 'auto-disconnection',
  });

  // Fetch FTA disconnection schedule
  const { data: ftaSchedule = [] } = useQuery({
    queryKey: ['/api/fta-disconnection-schedule'],
    enabled: activeTab === 'fta-schedule',
  });

  // Create disconnection mutation
  const disconnectionMutation = useMutation({
    mutationFn: (data: DisconnectionRequest) => apiRequest('/api/customer-disconnection', 'POST', data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer disconnection request submitted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/disconnection-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-disconnection-queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/customer-details'] });
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit disconnection request",
        variant: "destructive",
      });
    },
  });

  // Force disconnection mutation
  const forceDisconnectionMutation = useMutation({
    mutationFn: (customerId: string) => apiRequest(`/api/force-disconnection/${customerId}`, 'POST'),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Customer forcefully disconnected",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-disconnection-queue'] });
      queryClient.invalidateQueries({ queryKey: ['/api/disconnection-history'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to force disconnect customer",
        variant: "destructive",
      });
    },
  });

  // Handle customer selection
  const handleCustomerSelect = (customer: any) => {
    setSelectedCustomer(customer.id);
    setCustomerSearch(`${customer.name} - ${customer.phone}`);
    setShowCustomerResults(false);
  };

  // Clear customer selection
  const clearCustomerSelection = () => {
    setSelectedCustomer('');
    setCustomerSearch('');
    setShowCustomerResults(false);
  };

  const resetForm = () => {
    setSelectedCustomer('');
    setCustomerSearch('');
    setShowCustomerResults(false);
    setSelectedReason('');
    setDisconnectionNotes('');
    setDisconnectionType('IMMEDIATE');
    setScheduledDate('');
  };

  const handleSubmitDisconnection = () => {
    if (!selectedCustomer || !selectedReason) {
      toast({
        title: "Error",
        description: "Please select a customer and disconnection reason",
        variant: "destructive",
      });
      return;
    }

    if (disconnectionType === 'SCHEDULED' && !scheduledDate) {
      toast({
        title: "Error",
        description: "Please select a scheduled date for disconnection",
        variant: "destructive",
      });
      return;
    }

    const reasonData = disconnectionReasons.find(r => r.id === selectedReason);
    if (!reasonData) return;

    const requestData: DisconnectionRequest = {
      customerId: selectedCustomer,
      reasonId: selectedReason,
      notes: disconnectionNotes,
      disconnectionType,
      scheduledDate,
      actionType: 'DISCONNECTION',
      actionSubtype: reasonData.category,
    };

    disconnectionMutation.mutate(requestData);
  };

  const selectedReasonData = disconnectionReasons.find(r => r.id === selectedReason);
  const isCustomerConnected = customerData?.connectionStatus === 'CONNECTED';
  const isCustomerSuspended = customerData?.connectionStatus === 'SUSPENDED';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Power className="h-5 w-5 text-azam-blue" />
          <h1 className="text-2xl font-bold text-gray-900">Customer Disconnection</h1>
        </div>
        <p className="text-gray-600">
          Manage customer disconnections with automated CM workflow and FTA timeline management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="disconnection">Manual Disconnection</TabsTrigger>
          <TabsTrigger value="auto-disconnection">Auto Disconnection Queue</TabsTrigger>
          <TabsTrigger value="fta-schedule">FTA Schedule</TabsTrigger>
          <TabsTrigger value="history">Disconnection History</TabsTrigger>
        </TabsList>

        {/* Manual Disconnection Tab */}
        <TabsContent value="disconnection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Customer Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="customer">Search Customer</Label>
                  <div className="relative">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search by name, phone, email, SAP BP ID, or Smart Card..."
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value);
                          setShowCustomerResults(e.target.value.length >= 2);
                        }}
                        className="pl-10 pr-10"
                      />
                      {selectedCustomer && (
                        <button
                          onClick={clearCustomerSelection}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    {/* Search Results Dropdown */}
                    {showCustomerResults && customerSearch.length >= 2 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {searchResults.length > 0 ? (
                          searchResults.map((customer: any) => (
                            <div
                              key={customer.id}
                              onClick={() => handleCustomerSelect(customer)}
                              className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{customer.name}</div>
                              <div className="text-sm text-gray-500">{customer.phone}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                {customer.email} • {customer.sapBpId} • {customer.smartCardNo}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-gray-500 text-center">
                            No customers found matching "{customerSearch}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {customerSearch.length > 0 && customerSearch.length < 2 && (
                    <p className="text-sm text-gray-500">
                      Type at least 2 characters to search for customers
                    </p>
                  )}
                </div>

                {customerData && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Current Plan:</span>
                      <Badge variant="outline">{customerData.currentPlan.name}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Connection Status:</span>
                      <Badge variant={customerData.connectionStatus === 'CONNECTED' ? 'default' : 
                                   customerData.connectionStatus === 'DISCONNECTED' ? 'destructive' : 
                                   customerData.connectionStatus === 'SUSPENDED' ? 'secondary' : 'outline'}>
                        {customerData.connectionStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Plan End Date:</span>
                      <span>{new Date(customerData.currentPlan.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Wallet Balance:</span>
                      <span className={`font-semibold ${customerData.walletBalance > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        TZS {customerData.walletBalance.toLocaleString()}
                      </span>
                    </div>
                    
                    {customerData.scheduledPlanChange && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-900 mb-1">
                          Scheduled Plan Change
                        </div>
                        <div className="text-sm text-blue-700">
                          {customerData.scheduledPlanChange.planName} - {new Date(customerData.scheduledPlanChange.scheduledDate).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          {customerData.scheduledPlanChange.status}
                        </Badge>
                      </div>
                    )}
                    
                    {customerData.connectionStatus === 'DISCONNECTED' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Customer is already disconnected. Service was stopped on {customerData.ftaDisconnectionDate ? new Date(customerData.ftaDisconnectionDate).toLocaleDateString() : 'N/A'}.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Disconnection Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PowerOff className="h-5 w-5" />
                  Disconnection Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reason">Disconnection Reason</Label>
                  <Select value={selectedReason} onValueChange={setSelectedReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select disconnection reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {disconnectionReasons.map((reason) => (
                        <SelectItem key={reason.id} value={reason.id}>
                          {reason.name} {reason.isAutomatic && "(Auto)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedReasonData && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 mb-1">
                      {selectedReasonData.name}
                    </div>
                    <div className="text-sm text-blue-700">
                      {selectedReasonData.description}
                    </div>
                    <div className="text-xs text-blue-600 mt-2 flex items-center gap-2">
                      <span>Category: {selectedReasonData.category}</span>
                      {selectedReasonData.isAutomatic && (
                        <Badge variant="secondary" className="text-xs">Automatic</Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="type">Disconnection Type</Label>
                  <Select value={disconnectionType} onValueChange={(value: 'IMMEDIATE' | 'SCHEDULED') => setDisconnectionType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                      <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {disconnectionType === 'SCHEDULED' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                      type="datetime-local"
                      id="scheduledDate"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter any additional details about the disconnection..."
                    value={disconnectionNotes}
                    onChange={(e) => setDisconnectionNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {isCustomerConnected && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium">Disconnection Impact</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>• Service will be immediately stopped</div>
                      <div>• Customer status updated to DISCONNECTED</div>
                      <div>• FTA timeline will be activated (15 days)</div>
                      <div>• Auto renewal attempts will be stopped</div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitDisconnection}
                    disabled={!selectedCustomer || !selectedReason || customerData?.connectionStatus === 'DISCONNECTED' || disconnectionMutation.isPending}
                    className="bg-azam-blue hover:bg-azam-blue/90"
                  >
                    {disconnectionMutation.isPending ? 'Processing...' : 'Submit Disconnection'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Auto Disconnection Queue Tab */}
        <TabsContent value="auto-disconnection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Auto Disconnection Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {autoDisconnectionQueue.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No customers in auto disconnection queue
                  </div>
                ) : (
                  autoDisconnectionQueue.map((customer: any) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{customer.customerName}</div>
                        <div className="text-sm text-gray-600">
                          {customer.planName} • Expires: {new Date(customer.planEndDate).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          Failed Attempts: {customer.failedRenewalAttempts}/3
                        </div>
                        <div className="text-sm text-gray-500">
                          Last Attempt: {new Date(customer.lastRenewalAttempt).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          Wallet Balance: TZS {customer.walletBalance.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={customer.failedRenewalAttempts >= 3 ? 'destructive' : 'secondary'}>
                          {customer.failedRenewalAttempts >= 3 ? 'PENDING DISCONNECTION' : 'RETRY PENDING'}
                        </Badge>
                        {customer.failedRenewalAttempts >= 3 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => forceDisconnectionMutation.mutate(customer.customerId)}
                            disabled={forceDisconnectionMutation.isPending}
                          >
                            <PowerOff className="h-4 w-4 mr-1" />
                            Force Disconnect
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FTA Schedule Tab */}
        <TabsContent value="fta-schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                FTA Disconnection Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ftaSchedule.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No FTA disconnections scheduled
                  </div>
                ) : (
                  ftaSchedule.map((schedule: any) => (
                    <div key={schedule.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{schedule.customerName}</div>
                        <Badge variant={schedule.ftaType === 'FTA1' ? 'default' : 'secondary'}>
                          {schedule.ftaType}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Disconnection Date:</span>
                          <div className="font-medium">{new Date(schedule.disconnectionDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">FTA Date:</span>
                          <div className="font-medium">{new Date(schedule.ftaDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Days Remaining:</span>
                          <div className="font-medium">{schedule.daysRemaining}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <div className="font-medium">{schedule.status}</div>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        Smart Card: {schedule.smartCardNo} • SAP BP ID: {schedule.sapBpId}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Disconnection History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {disconnectionHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No disconnection history found
                  </div>
                ) : (
                  disconnectionHistory.map((record: any) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{record.customerName}</div>
                        <Badge 
                          variant={record.status === 'COMPLETED' ? 'default' : 
                                 record.status === 'FAILED' ? 'destructive' : 'secondary'}
                        >
                          {record.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Reason:</span>
                          <div className="font-medium">{record.reason}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Type:</span>
                          <div className="font-medium">{record.type}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Date:</span>
                          <div className="font-medium">{new Date(record.disconnectionDate).toLocaleDateString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Method:</span>
                          <div className="font-medium">{record.method}</div>
                        </div>
                      </div>
                      {record.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Notes:</span> {record.notes}
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        Request ID: {record.requestId} • CM Status: {record.cmStatus}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDisconnection;