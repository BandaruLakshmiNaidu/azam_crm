import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCcw, Package, User, Search, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HardwareReturn {
  id: number;
  returnId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  agentId: string;
  agentName: string;
  returnDate: Date;
  expectedRefund?: number;
  actualRefund?: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PROCESSED" | "COMPLETED";
  items: ReturnItem[];
  reason: string;
  notes?: string;
  processedBy?: string;
  processedDate?: Date;
}

interface ReturnItem {
  id: number;
  materialCode: string;
  materialName: string;
  serialNumber: string;
  condition: "GOOD" | "DAMAGED" | "FAULTY" | "MISSING_ACCESSORIES";
  purchaseDate: Date;
  warrantyStatus: "ACTIVE" | "EXPIRED" | "VOID";
  returnReason: string;
  refundAmount: number;
  approved: boolean;
}

export default function CustomerHardwareReturn() {
  const [selectedTab, setSelectedTab] = useState("create");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [returnData, setReturnData] = useState<Partial<HardwareReturn>>({
    items: [],
    reason: "",
    notes: "",
    status: "PENDING",
  });
  const [currentItem, setCurrentItem] = useState<Partial<ReturnItem>>({
    condition: "GOOD",
    warrantyStatus: "ACTIVE",
    approved: false,
  });

  const queryClient = useQueryClient();

  const { data: returns, isLoading } = useQuery<HardwareReturn[]>({
    queryKey: ["/api/hardware-returns"],
  });

  const { data: customers } = useQuery<any[]>({
    queryKey: ["/api/customers"],
  });

  const searchCustomerMutation = useMutation({
    mutationFn: async (phone: string) => {
      const response = await fetch(`/api/customers/search?phone=${phone}`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        setSelectedCustomer(data);
        setReturnData(prev => ({
          ...prev,
          customerId: data.id,
          customerName: data.firstName + " " + data.lastName,
          customerPhone: data.phone,
        }));
      } else {
        toast({ title: "Customer not found", variant: "destructive" });
      }
    },
  });

  const createReturnMutation = useMutation({
    mutationFn: async (data: Partial<HardwareReturn>) => {
      const response = await fetch("/api/hardware-returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Hardware return created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/hardware-returns"] });
      resetForm();
    },
  });

  const updateReturnMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: number; status: string; notes?: string }) => {
      const response = await fetch(`/api/hardware-returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Return status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/hardware-returns"] });
    },
  });

  const handleSearchCustomer = () => {
    if (searchCustomer.trim()) {
      searchCustomerMutation.mutate(searchCustomer.trim());
    }
  };

  const handleAddItem = () => {
    if (currentItem.materialCode && currentItem.serialNumber) {
      const newItem: ReturnItem = {
        id: Date.now(),
        materialCode: currentItem.materialCode!,
        materialName: currentItem.materialName!,
        serialNumber: currentItem.serialNumber!,
        condition: currentItem.condition as any,
        purchaseDate: currentItem.purchaseDate!,
        warrantyStatus: currentItem.warrantyStatus as any,
        returnReason: currentItem.returnReason!,
        refundAmount: currentItem.refundAmount || 0,
        approved: currentItem.approved!,
      };

      setReturnData(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem],
      }));

      setCurrentItem({
        condition: "GOOD",
        warrantyStatus: "ACTIVE",
        approved: false,
      });
    }
  };

  const handleSubmitReturn = () => {
    if (returnData.items && returnData.items.length > 0) {
      createReturnMutation.mutate({
        ...returnData,
        returnId: `HR${Date.now()}`,
        returnDate: new Date(),
        expectedRefund: returnData.items.reduce((sum, item) => sum + item.refundAmount, 0),
      });
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSearchCustomer("");
    setReturnData({
      items: [],
      reason: "",
      notes: "",
      status: "PENDING",
    });
    setCurrentItem({
      condition: "GOOD",
      warrantyStatus: "ACTIVE",
      approved: false,
    });
  };

  const removeItem = (index: number) => {
    setReturnData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index),
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "APPROVED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      case "PROCESSED": return "bg-blue-100 text-blue-800";
      case "COMPLETED": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "GOOD": return "bg-green-100 text-green-800";
      case "DAMAGED": return "bg-orange-100 text-orange-800";
      case "FAULTY": return "bg-red-100 text-red-800";
      case "MISSING_ACCESSORIES": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getWarrantyColor = (warranty: string) => {
    switch (warranty) {
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "EXPIRED": return "bg-red-100 text-red-800";
      case "VOID": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4" />;
      case "APPROVED": return <CheckCircle className="w-4 h-4" />;
      case "REJECTED": return <XCircle className="w-4 h-4" />;
      case "PROCESSED": return <Package className="w-4 h-4" />;
      case "COMPLETED": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading hardware returns...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Hardware Return</h1>
          <p className="text-gray-600">Process customer hardware returns and refunds</p>
        </div>
        <div className="flex items-center space-x-2">
          <RotateCcw className="w-5 h-5 text-azam-blue" />
          <span className="text-sm text-gray-600">Return Management</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create">Create Return</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Customer Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="searchCustomer">Customer Phone Number</Label>
                  <Input
                    id="searchCustomer"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    placeholder="Enter customer phone number"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearchCustomer} className="bg-azam-blue hover:bg-azam-blue/90">
                    Search
                  </Button>
                </div>
              </div>

              {selectedCustomer && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-azam-blue/10 rounded-lg">
                        <User className="w-5 h-5 text-azam-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                        <p className="text-sm text-gray-600">Phone: {selectedCustomer.phone}</p>
                        <p className="text-sm text-gray-600">ID: {selectedCustomer.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {selectedCustomer && (
            <Card>
              <CardHeader>
                <CardTitle>Return Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reason">Return Reason</Label>
                    <Select value={returnData.reason} onValueChange={(value) => setReturnData(prev => ({ ...prev, reason: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select return reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DEFECTIVE">Defective Product</SelectItem>
                        <SelectItem value="WRONG_ITEM">Wrong Item Received</SelectItem>
                        <SelectItem value="DAMAGED_SHIPPING">Damaged During Shipping</SelectItem>
                        <SelectItem value="NOT_AS_DESCRIBED">Not As Described</SelectItem>
                        <SelectItem value="CUSTOMER_CHANGE_MIND">Customer Changed Mind</SelectItem>
                        <SelectItem value="UPGRADE">Upgrade Request</SelectItem>
                        <SelectItem value="OTHER">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="agentId">Agent ID</Label>
                    <Input
                      id="agentId"
                      value={returnData.agentId || ""}
                      onChange={(e) => setReturnData(prev => ({ ...prev, agentId: e.target.value }))}
                      placeholder="Enter agent ID"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={returnData.notes || ""}
                    onChange={(e) => setReturnData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Enter any additional notes"
                    rows={2}
                  />
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Add Return Items</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="materialCode">Material Code</Label>
                      <Select value={currentItem.materialCode} onValueChange={(value) => setCurrentItem(prev => ({ ...prev, materialCode: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select material" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STB001">Set Top Box HD</SelectItem>
                          <SelectItem value="STB002">Set Top Box 4K</SelectItem>
                          <SelectItem value="SC001">Smart Card</SelectItem>
                          <SelectItem value="RC001">Remote Control</SelectItem>
                          <SelectItem value="PWR001">Power Adapter</SelectItem>
                          <SelectItem value="HDMI001">HDMI Cable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="serialNumber">Serial Number</Label>
                      <Input
                        id="serialNumber"
                        value={currentItem.serialNumber || ""}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, serialNumber: e.target.value }))}
                        placeholder="Enter serial number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select value={currentItem.condition} onValueChange={(value: any) => setCurrentItem(prev => ({ ...prev, condition: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GOOD">Good</SelectItem>
                          <SelectItem value="DAMAGED">Damaged</SelectItem>
                          <SelectItem value="FAULTY">Faulty</SelectItem>
                          <SelectItem value="MISSING_ACCESSORIES">Missing Accessories</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="refundAmount">Refund Amount (TSH)</Label>
                      <Input
                        id="refundAmount"
                        type="number"
                        value={currentItem.refundAmount || ""}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, refundAmount: parseFloat(e.target.value) }))}
                        placeholder="Enter refund amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="purchaseDate">Purchase Date</Label>
                      <Input
                        id="purchaseDate"
                        type="date"
                        value={currentItem.purchaseDate ? new Date(currentItem.purchaseDate).toISOString().split('T')[0] : ""}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, purchaseDate: new Date(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="returnReason">Item Return Reason</Label>
                      <Input
                        id="returnReason"
                        value={currentItem.returnReason || ""}
                        onChange={(e) => setCurrentItem(prev => ({ ...prev, returnReason: e.target.value }))}
                        placeholder="Enter specific reason for this item"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddItem}
                    disabled={!currentItem.materialCode || !currentItem.serialNumber}
                    className="mt-4 bg-azam-blue hover:bg-azam-blue/90"
                  >
                    Add Item
                  </Button>
                </div>

                {returnData.items && returnData.items.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-4">Return Items</h4>
                      <div className="space-y-2">
                        {returnData.items.map((item, index) => (
                          <Card key={index} className="border-l-4 border-l-azam-blue">
                            <CardContent className="pt-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{item.materialName}</p>
                                  <p className="text-sm text-gray-600">Serial: {item.serialNumber}</p>
                                  <div className="flex space-x-2 mt-2">
                                    <Badge className={getConditionColor(item.condition)}>
                                      {item.condition}
                                    </Badge>
                                    <Badge className={getWarrantyColor(item.warrantyStatus)}>
                                      {item.warrantyStatus}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">TSH {item.refundAmount.toLocaleString()}</p>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeItem(index)}
                                    className="mt-2"
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="font-medium text-green-800">
                          Total Expected Refund: TSH {returnData.items.reduce((sum, item) => sum + item.refundAmount, 0).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={handleSubmitReturn}
                        disabled={!returnData.reason}
                        className="w-full mt-4 bg-azam-blue hover:bg-azam-blue/90"
                      >
                        Submit Return Request
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid gap-4">
            {returns?.filter(r => r.status === "PENDING").map((returnItem) => (
              <Card key={returnItem.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        {getStatusIcon(returnItem.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{returnItem.returnId}</h3>
                        <p className="text-sm text-gray-600">Customer: {returnItem.customerName}</p>
                        <p className="text-sm text-gray-600">Items: {returnItem.items.length}</p>
                        <p className="text-sm text-gray-600">Reason: {returnItem.reason}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        TSH {returnItem.expectedRefund?.toLocaleString()}
                      </p>
                      <div className="space-x-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateReturnMutation.mutate({ id: returnItem.id, status: "REJECTED" })}
                        >
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-azam-blue hover:bg-azam-blue/90"
                          onClick={() => updateReturnMutation.mutate({ id: returnItem.id, status: "APPROVED" })}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          <div className="grid gap-4">
            {returns?.filter(r => r.status === "APPROVED").map((returnItem) => (
              <Card key={returnItem.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        {getStatusIcon(returnItem.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{returnItem.returnId}</h3>
                        <p className="text-sm text-gray-600">Customer: {returnItem.customerName}</p>
                        <p className="text-sm text-gray-600">Items: {returnItem.items.length}</p>
                        <p className="text-sm text-gray-600">
                          Approved: {returnItem.processedDate ? new Date(returnItem.processedDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        TSH {returnItem.expectedRefund?.toLocaleString()}
                      </p>
                      <Button
                        size="sm"
                        className="mt-2 bg-azam-blue hover:bg-azam-blue/90"
                        onClick={() => updateReturnMutation.mutate({ id: returnItem.id, status: "PROCESSED" })}
                      >
                        Process Return
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {returns?.filter(r => r.status === "COMPLETED" || r.status === "PROCESSED").map((returnItem) => (
              <Card key={returnItem.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        {getStatusIcon(returnItem.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{returnItem.returnId}</h3>
                        <p className="text-sm text-gray-600">Customer: {returnItem.customerName}</p>
                        <p className="text-sm text-gray-600">Items: {returnItem.items.length}</p>
                        <p className="text-sm text-gray-600">
                          Completed: {returnItem.processedDate ? new Date(returnItem.processedDate).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(returnItem.status)}>
                        {returnItem.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        Refund: TSH {returnItem.actualRefund?.toLocaleString() || returnItem.expectedRefund?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}