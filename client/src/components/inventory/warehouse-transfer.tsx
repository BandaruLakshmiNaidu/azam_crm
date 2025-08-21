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
import { Truck, Package, MapPin, Clock, CheckCircle, AlertCircle, Plus, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WarehouseTransfer {
  id: number;
  transferId: string;
  fromLocation: string;
  toLocation: string;
  materialType: string;
  quantity: number;
  serialNumbers: string[];
  reason: string;
  status: "PENDING" | "IN_TRANSIT" | "DELIVERED" | "REJECTED";
  requestedBy: string;
  requestDate: Date;
  approvedBy?: string;
  approvedDate?: Date;
  trackingNumber?: string;
}

export default function WarehouseTransfer() {
  const [selectedTab, setSelectedTab] = useState("create");
  const [formData, setFormData] = useState({
    fromLocation: "",
    toLocation: "",
    materialType: "",
    quantity: "",
    reason: "",
  });
  
  const [serialNumbers, setSerialNumbers] = useState<string[]>([""]);

  const queryClient = useQueryClient();

  const { data: transfers, isLoading } = useQuery<WarehouseTransfer[]>({
    queryKey: ["/api/warehouse-transfers"],
  });

  const createTransferMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/warehouse-transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Transfer request created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse-transfers"] });
      setFormData({
        fromLocation: "",
        toLocation: "",
        materialType: "",
        quantity: "",
        reason: "",
      });
      setSerialNumbers([""]);
    },
  });

  const updateTransferMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/warehouse-transfers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Transfer status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse-transfers"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const serialNumbersArray = serialNumbers.filter(s => s.trim());
    
    createTransferMutation.mutate({
      ...formData,
      quantity: parseInt(formData.quantity),
      serialNumbers: serialNumbersArray,
      transferId: `WT${Date.now()}`,
      status: "PENDING",
      requestedBy: "current_user",
      requestDate: new Date(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "IN_TRANSIT": return "bg-blue-100 text-blue-800";
      case "DELIVERED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock className="w-4 h-4" />;
      case "IN_TRANSIT": return <Truck className="w-4 h-4" />;
      case "DELIVERED": return <CheckCircle className="w-4 h-4" />;
      case "REJECTED": return <AlertCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading warehouse transfers...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Transfer</h1>
          <p className="text-gray-600">Manage inter-warehouse stock transfers and logistics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Truck className="w-5 h-5 text-azam-blue" />
          <span className="text-sm text-gray-600">Transfer Management</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Transfer</TabsTrigger>
          <TabsTrigger value="active">Active Transfers</TabsTrigger>
          <TabsTrigger value="history">Transfer History</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>New Warehouse Transfer Request</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fromLocation">From Location</Label>
                    <Select value={formData.fromLocation} onValueChange={(value) => setFormData({...formData, fromLocation: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WH_DAR">Warehouse Dar es Salaam</SelectItem>
                        <SelectItem value="WH_MWANZA">Warehouse Mwanza</SelectItem>
                        <SelectItem value="WH_ARUSHA">Warehouse Arusha</SelectItem>
                        <SelectItem value="WH_DODOMA">Warehouse Dodoma</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="toLocation">To Location</Label>
                    <Select value={formData.toLocation} onValueChange={(value) => setFormData({...formData, toLocation: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="WH_DAR">Warehouse Dar es Salaam</SelectItem>
                        <SelectItem value="WH_MWANZA">Warehouse Mwanza</SelectItem>
                        <SelectItem value="WH_ARUSHA">Warehouse Arusha</SelectItem>
                        <SelectItem value="WH_DODOMA">Warehouse Dodoma</SelectItem>
                        <SelectItem value="OTC_MWANZA">OTC Mwanza</SelectItem>
                        <SelectItem value="OTC_ARUSHA">OTC Arusha</SelectItem>
                        <SelectItem value="REPAIR_CENTER">Repair Center</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="materialType">Material Type</Label>
                    <Select value={formData.materialType} onValueChange={(value) => setFormData({...formData, materialType: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material type" />
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
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      placeholder="Enter quantity"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label>Serial Numbers</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSerialNumbers([...serialNumbers, ""])}
                        className="h-8 px-3"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Serial Number
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {serialNumbers.map((serialNumber, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={serialNumber}
                            onChange={(e) => {
                              const newSerialNumbers = [...serialNumbers];
                              newSerialNumbers[index] = e.target.value;
                              setSerialNumbers(newSerialNumbers);
                            }}
                            placeholder={`Serial number ${index + 1}`}
                            className="flex-1"
                          />
                          {serialNumbers.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const newSerialNumbers = serialNumbers.filter((_, i) => i !== index);
                                setSerialNumbers(newSerialNumbers);
                              }}
                              className="h-10 w-10 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="reason">Transfer Reason</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Enter reason for transfer"
                    rows={2}
                  />
                </div>

                <Button type="submit" className="w-full bg-azam-blue hover:bg-azam-blue/90">
                  Create Transfer Request
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {transfers?.filter(t => t.status !== "DELIVERED").map((transfer) => (
              <Card key={transfer.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-azam-blue/10 rounded-lg">
                        {getStatusIcon(transfer.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{transfer.transferId}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{transfer.fromLocation} → {transfer.toLocation}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {transfer.materialType} • Qty: {transfer.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(transfer.status)}>
                        {transfer.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(transfer.requestDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm"><strong>Requested by:</strong> {transfer.requestedBy}</p>
                      <p className="text-sm text-gray-600">{transfer.reason}</p>
                    </div>
                    <div className="space-x-2">
                      {transfer.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTransferMutation.mutate({ id: transfer.id, status: "REJECTED" })}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-azam-blue hover:bg-azam-blue/90"
                            onClick={() => updateTransferMutation.mutate({ id: transfer.id, status: "IN_TRANSIT" })}
                          >
                            Approve
                          </Button>
                        </>
                      )}
                      {transfer.status === "IN_TRANSIT" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => updateTransferMutation.mutate({ id: transfer.id, status: "DELIVERED" })}
                        >
                          Mark Delivered
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {transfers?.filter(t => t.status === "DELIVERED" || t.status === "REJECTED").map((transfer) => (
              <Card key={transfer.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getStatusIcon(transfer.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{transfer.transferId}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{transfer.fromLocation} → {transfer.toLocation}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {transfer.materialType} • Qty: {transfer.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(transfer.status)}>
                        {transfer.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(transfer.requestDate).toLocaleDateString()}
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