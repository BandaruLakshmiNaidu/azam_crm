import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, Clock, CheckCircle, XCircle, AlertTriangle, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StockRequest() {
  const [stockRequest, setStockRequest] = useState({
    module: "OTC",
    requestType: "STOCK_REQUEST",
    itemType: "",
    itemQty: "1",
    warehouseId: "",
    reason: ""
  });

  const { toast } = useToast();

  const { data: inventoryRequestsResponse, isLoading: requestsLoading } = useQuery<any>({
    queryKey: ["/api/inventory-requests"],
  });

  // Extract data from API response format {success: true, data: [...]}
  const inventoryRequests = inventoryRequestsResponse?.success ? inventoryRequestsResponse.data : [];

  // Ensure inventoryRequests is always an array
  const safeInventoryRequests = Array.isArray(inventoryRequests) ? inventoryRequests : [];

  const materialTypes = [
    { code: "STB001", name: "HD Set-Top Box", type: "STB" },
    { code: "STB002", name: "4K Set-Top Box", type: "STB" },
    { code: "SC001", name: "Smart Card Basic", type: "SMART_CARD" },
    { code: "SC002", name: "Smart Card Premium", type: "SMART_CARD" },
    { code: "CBL001", name: "HDMI Cable", type: "CABLE" },
    { code: "RMT001", name: "Remote Control", type: "REMOTE" }
  ];

  const warehouses = [
    { id: "WH_DAR", name: "Warehouse - Dar es Salaam" },
    { id: "WH_MWANZA", name: "Warehouse - Mwanza" },
    { id: "WH_ARUSHA", name: "Warehouse - Arusha" },
    { id: "WH_DODOMA", name: "Warehouse - Dodoma" },
    { id: "WH_MBEYA", name: "Warehouse - Mbeya" }
  ];

  // Mutation for stock requests
  const stockRequestMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/inventory-requests", data),
    onSuccess: () => {
      toast({ title: "Stock request submitted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-requests"] });
      setStockRequest({
        module: "OTC",
        requestType: "STOCK_REQUEST",
        itemType: "",
        itemQty: "1",
        warehouseId: "",
        reason: ""
      });
    },
    onError: () => {
      toast({ title: "Failed to submit stock request", variant: "destructive" });
    }
  });

  const handleStockRequest = () => {
    if (!stockRequest.itemType || !stockRequest.reason) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const warehouseName = warehouses.find(w => w.id === stockRequest.warehouseId)?.name || stockRequest.warehouseId;
    const transferTo = stockRequest.module === "OTC"
      ? "OTC Center"
      : stockRequest.module === "REPAIR"
        ? "Repair Center"
        : stockRequest.module;

    stockRequestMutation.mutate({
      ...stockRequest,
      requestId: `REQ${Date.now()}`,
      createId: "current_user_id",
      status: "pending",
      transferFrom: warehouseName,
      transferTo,
      createDt: new Date().toISOString(),
      createTs: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <Package className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-2 sm:p-3 space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-azam-blue to-blue-800 text-white p-2 md:p-3 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Stock Request Management</h1>
            <p className="text-blue-100 mt-1 text-sm md:text-base">Submit and track inventory stock requests</p>
          </div>
          <div className="flex space-x-2">
            
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Stock Request Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="w-5 h-5 mr-2 text-azam-blue" />
              New Stock Request
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module">Module</Label>
                <Select 
                  value={stockRequest.module} 
                  onValueChange={(value) => setStockRequest({...stockRequest, module: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OTC">OTC</SelectItem>
                    <SelectItem value="REPAIR">Repair Center</SelectItem>
                    <SelectItem value="WAREHOUSE">Warehouse</SelectItem>
                    <SelectItem value="AGENT">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requestType">Request Type</Label>
                <Select 
                  value={stockRequest.requestType} 
                  onValueChange={(value) => setStockRequest({...stockRequest, requestType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STOCK_REQUEST">Stock Request</SelectItem>
                    <SelectItem value="EMERGENCY_REQUEST">Emergency Request</SelectItem>
                    <SelectItem value="REPLENISHMENT">Replenishment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="itemType">Item Type</Label>
                <Select 
                  value={stockRequest.itemType} 
                  onValueChange={(value) => setStockRequest({...stockRequest, itemType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialTypes.map((material) => (
                      <SelectItem key={material.code} value={material.code}>
                        {material.name} ({material.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="itemQty">Quantity</Label>
                <Input
                  type="number"
                  value={stockRequest.itemQty}
                  onChange={(e) => setStockRequest({...stockRequest, itemQty: e.target.value})}
                  min="1"
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            {/* Warehouse Selection */}
            <div>
              <Label htmlFor="warehouseId">From Warehouse</Label>
              <Select 
                value={stockRequest.warehouseId} 
                onValueChange={(value) => setStockRequest({...stockRequest, warehouseId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                value={stockRequest.reason}
                onChange={(e) => setStockRequest({...stockRequest, reason: e.target.value})}
                placeholder="Enter reason for request"
              />
            </div>

            <Button 
              onClick={handleStockRequest}
              disabled={stockRequestMutation.isPending}
              className="w-full bg-azam-blue hover:bg-azam-blue/90"
            >
              {stockRequestMutation.isPending ? "Submitting..." : "Submit Request"}
            </Button>
          </CardContent>
        </Card>

        {/* Request History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-azam-blue" />
              Request History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requestsLoading ? (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading requests...</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {inventoryRequests?.length > 0 ? (
                  inventoryRequests.map((request: any) => (
                    <div key={request.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <Badge className={`${getStatusColor(request.status)} text-xs`}>
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">#{request.requestId}</span>
                          </div>
                          <p className="font-medium text-sm">{request.itemType}</p>
                          <p className="text-xs text-gray-600">Qty: {request.itemQty} | To: {request.transferTo}</p>
                        </div>
                        <div className="text-xs text-gray-500">
                          {request.createDt ? new Date(request.createDt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      {request.transferFrom && (
                        <p className="text-xs text-gray-500">From: {request.transferFrom}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <ClipboardList className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No stock requests found</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}