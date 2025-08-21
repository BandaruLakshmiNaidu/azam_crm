import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Upload, FileText, CheckCircle, AlertCircle, Clock, Package, Search, DollarSign, Calculator, User } from "lucide-react";
import type { AgentHardwareSale, AgentHardwareSaleItem } from "@shared/schema";

interface HardwareItem {
  materialCode: string;
  materialName: string;
  materialType: string;
  kitPrice?: number;
  individualPrice: number;
  availableStock: number;
  isKitItem: boolean;
}

interface Plant {
  plantId: string;
  plantName: string;
  country: string;
  region: string;
  isActive: boolean;
}

export default function AgentHardwareSalePage() {
  const [selectedTab, setSelectedTab] = useState("new-request");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<AgentHardwareSale | null>(null);
  const [uploadedSerials, setUploadedSerials] = useState<string>("");
  const [agentSearchTerm, setAgentSearchTerm] = useState("");
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const agentDropdownRef = useRef<HTMLDivElement>(null);
  const [currentRequest, setCurrentRequest] = useState({
    sapBpId: "",
    sapCaId: "",
    agentName: "",
    plantId: "",
    priceType: "INDIVIDUAL" as "KIT" | "INDIVIDUAL",
    currency: "TSH",
    salesOrg: "1000",
    division: "10",
    agentBalance: 0,
  });
  const [selectedItems, setSelectedItems] = useState<AgentHardwareSaleItem[]>([]);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // API Queries
  const { data: sales = [], isLoading: salesLoading } = useQuery<AgentHardwareSale[]>({
    queryKey: ["/api/agent-hardware-sales"],
  });

  const { data: hardwareItemsResponse } = useQuery<{success: boolean, data: HardwareItem[]}>({
    queryKey: ["/api/hardware-items"],
  });
  
  const hardwareItems = hardwareItemsResponse?.data || [];

  const { data: plants = [] } = useQuery<Plant[]>({
    queryKey: ["/api/plants"],
  });

  const { data: agentsResponse } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/agents"],
  });
  
  const agents = agentsResponse?.data || [];

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (agentDropdownRef.current && !agentDropdownRef.current.contains(event.target as Node)) {
        setShowAgentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter agents based on search term
  const filteredAgents = useMemo(() => {
    if (!agentSearchTerm.trim() || !agents || !Array.isArray(agents)) return [];
    const searchLower = agentSearchTerm.toLowerCase();
    return agents.filter((agent: any) => {
      if (!agent) return false;
      const firstName = agent.firstName || '';
      const lastName = agent.lastName || '';
      const sapBpId = agent.sapBpId || '';
      const sapCaId = agent.sapCaId || '';
      
      return `${firstName} ${lastName}`.toLowerCase().includes(searchLower) ||
             sapBpId.toLowerCase().includes(searchLower) ||
             sapCaId.toLowerCase().includes(searchLower);
    });
  }, [agents, agentSearchTerm]);

  // Mutations
  const createSaleMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/agent-hardware-sales", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-hardware-sales"] });
      toast({
        title: "Success",
        description: "Hardware sale request created successfully",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create hardware sale request",
        variant: "destructive",
      });
    },
  });

  const updateSaleMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/agent-hardware-sales/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-hardware-sales"] });
      toast({
        title: "Success",
        description: "Hardware sale status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update hardware sale status",
        variant: "destructive",
      });
    },
  });

  const assignSerialsMutation = useMutation({
    mutationFn: ({ id, serialNumbers }: { id: number; serialNumbers: string[] }) =>
      apiRequest(`/api/agent-hardware-sales/${id}/assign-serials`, "POST", { serialNumbers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-hardware-sales"] });
      toast({
        title: "Success",
        description: "Serial numbers assigned successfully",
      });
      setUploadedSerials("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign serial numbers",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const resetForm = () => {
    setCurrentRequest({
      sapBpId: "",
      sapCaId: "",
      agentName: "",
      plantId: "",
      priceType: "INDIVIDUAL",
      currency: "TSH",
      salesOrg: "1000",
      division: "10",
      agentBalance: 0,
    });
    setSelectedItems([]);
    setAgentSearchTerm("");
    setShowAgentDropdown(false);
  };

  const handleAgentSelect = (agent: any) => {
    setCurrentRequest({
      ...currentRequest,
      sapBpId: agent.sapBpId,
      sapCaId: agent.sapCaId,
      agentName: `${agent.firstName} ${agent.lastName}`,
      agentBalance: agent.creditLimit || 0,
    });
    setAgentSearchTerm(`${agent.firstName} ${agent.lastName} - ${agent.sapBpId}`);
    setShowAgentDropdown(false);
  };

  const addHardwareItem = () => {
    const newItem: AgentHardwareSaleItem = {
      materialCode: "",
      materialName: "",
      materialType: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      isKitItem: false,
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const removeHardwareItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateHardwareItem = (index: number, field: keyof AgentHardwareSaleItem, value: any) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-update pricing when material or quantity changes
    if (field === "materialCode" || field === "quantity") {
      const item = hardwareItems.find(h => h.materialCode === newItems[index].materialCode);
      if (item) {
        const price = currentRequest.priceType === "KIT" && item.kitPrice ? item.kitPrice : item.individualPrice;
        newItems[index].unitPrice = price;
        newItems[index].totalPrice = price * newItems[index].quantity;
        newItems[index].materialName = item.materialName;
        newItems[index].materialType = item.materialType;
        newItems[index].isKitItem = item.isKitItem;
        newItems[index].kitPrice = item.kitPrice;
        newItems[index].individualPrice = item.individualPrice;
      }
    }
    
    setSelectedItems(newItems);
  };

  const calculateTotals = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const total = subtotal;
    return { subtotal, total };
  };

  const handleSubmit = () => {
    if (!currentRequest.sapBpId || !currentRequest.plantId || selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please fill all required fields and add at least one item",
        variant: "destructive",
      });
      return;
    }

    const { total } = calculateTotals();
    
    const saleData = {
      ...currentRequest,
      items: selectedItems,
      totalAmount: total,
      vatAmount: 0, // VAT removed as requested
      transferFrom: plants.find(p => p.plantId === currentRequest.plantId)?.plantName || "",
      transferTo: `Agent_${currentRequest.sapBpId}`,
      createId: "current_user",
    };

    createSaleMutation.mutate(saleData);
  };

  const handleApproval = (sale: AgentHardwareSale, action: "approve" | "reject", reason?: string) => {
    const updateData = {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      approvedBy: action === "approve" ? "sales_manager" : undefined,
      rejectionReason: action === "reject" ? reason : undefined,
      cmStatus: action === "approve" ? "APPROVED" : "REJECTED",
      cmStatusMsg: action === "approve" ? "Request approved by sales manager" : `Request rejected: ${reason}`,
    };

    updateSaleMutation.mutate({ id: sale.id, data: updateData });
  };

  const handleSerialUpload = (sale: AgentHardwareSale) => {
    if (!uploadedSerials.trim()) {
      toast({
        title: "Error",
        description: "Please enter serial numbers",
        variant: "destructive",
      });
      return;
    }

    const serialNumbers = uploadedSerials.split('\n').map(s => s.trim()).filter(s => s);
    const totalQuantity = sale.items.reduce((sum, item) => sum + item.quantity, 0);

    if (serialNumbers.length !== totalQuantity) {
      toast({
        title: "Error",
        description: `Expected ${totalQuantity} serial numbers, but got ${serialNumbers.length}`,
        variant: "destructive",
      });
      return;
    }

    assignSerialsMutation.mutate({ id: sale.id, serialNumbers });
  };

  const filteredSales = sales.filter(sale =>
    sale.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      APPROVED: { variant: "secondary" as const, icon: CheckCircle, color: "text-green-600" },
      REJECTED: { variant: "destructive" as const, icon: AlertCircle, color: "text-red-600" },
      COMPLETED: { variant: "default" as const, icon: Package, color: "text-azam-blue" },
    };
    
    const config = variants[status as keyof typeof variants] || variants.PENDING;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Agent Hardware Sale</h1>
        <p className="text-gray-600">Manage agent hardware sale requests, approvals, and delivery process</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="new-request" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Request</span>
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Approval</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Delivery</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new-request" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-azam-blue" />
                Create Hardware Sale Request
              </CardTitle>
              <CardDescription>
                Agents can request hardware items for purchase with automatic pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent Selection */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative" ref={agentDropdownRef}>
                  <Label htmlFor="agent">Search Agent</Label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 h-4 w-4 text-gray-400">
                      <User className="h-4 w-4" />
                    </div>
                    <Input
                      placeholder="Search by name, BP ID, or CA ID..."
                      value={agentSearchTerm}
                      onChange={(e) => {
                        setAgentSearchTerm(e.target.value);
                        setShowAgentDropdown(e.target.value.length > 0);
                      }}
                      onFocus={() => {
                        if (agentSearchTerm.length > 0) {
                          setShowAgentDropdown(true);
                        }
                      }}
                      className="pl-10"
                    />
                  </div>
                  
                  {showAgentDropdown && agentSearchTerm && filteredAgents && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                      {filteredAgents.length > 0 ? (
                        filteredAgents.map((agent: any) => (
                          <div
                            key={agent.id}
                            className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b last:border-b-0 border-gray-100 dark:border-gray-600"
                            onClick={() => handleAgentSelect(agent)}
                          >
                            <div className="font-medium text-gray-900 dark:text-gray-100">{agent.firstName} {agent.lastName}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">BP: {agent.sapBpId} | CA: {agent.sapCaId}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">Credit Limit: TSH {(agent.creditLimit || 0).toLocaleString()}</div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No agents found</div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="plant">Select Plant/Warehouse</Label>
                  <Select value={currentRequest.plantId} onValueChange={(value) => 
                    setCurrentRequest({ ...currentRequest, plantId: value })
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plant" />
                    </SelectTrigger>
                    <SelectContent>
                      {plants.filter(p => p.isActive).map((plant) => (
                        <SelectItem key={plant.plantId} value={plant.plantId}>
                          {plant.plantName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priceType">Price Type</Label>
                  <Select value={currentRequest.priceType} onValueChange={(value: "KIT" | "INDIVIDUAL") => 
                    setCurrentRequest({ ...currentRequest, priceType: value })
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KIT">Kit Price</SelectItem>
                      <SelectItem value="INDIVIDUAL">Individual Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Agent Balance Display */}
              {currentRequest.agentBalance > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-azam-blue" />
                    <span className="font-medium">Agent Balance: {currentRequest.currency} {currentRequest.agentBalance.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Hardware Items Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Hardware Items</h3>
                  <Button onClick={addHardwareItem} size="sm" className="bg-azam-blue hover:bg-azam-blue/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>

                {selectedItems.map((item, index) => (
                  <Card key={index} className="border-l-4 border-l-azam-blue">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                        <div className="md:col-span-2">
                          <Label>Material</Label>
                          <Select 
                            value={item.materialCode} 
                            onValueChange={(value) => updateHardwareItem(index, "materialCode", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select material" />
                            </SelectTrigger>
                            <SelectContent>
                              {hardwareItems.map((hardware) => (
                                <SelectItem key={hardware.materialCode} value={hardware.materialCode}>
                                  {hardware.materialName} - {hardware.materialCode}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Quantity</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateHardwareItem(index, "quantity", parseInt(e.target.value) || 1)}
                          />
                        </div>

                        <div>
                          <Label>Unit Price</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>

                        <div>
                          <Label>Total Price</Label>
                          <Input
                            type="number"
                            value={item.totalPrice}
                            readOnly
                            className="bg-gray-50"
                          />
                        </div>

                        <div>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeHardwareItem(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Price Calculation */}
              {selectedItems.length > 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium">{currentRequest.currency} {calculateTotals().subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="font-semibold">Total:</span>
                        <span className="font-semibold text-azam-blue">{currentRequest.currency} {calculateTotals().total.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={handleSubmit} 
                  disabled={createSaleMutation.isPending || selectedItems.length === 0}
                  className="bg-azam-blue hover:bg-azam-blue/90"
                >
                  {createSaleMutation.isPending ? "Creating..." : "Submit Request"}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Reset Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-azam-blue" />
                Request Approval
              </CardTitle>
              <CardDescription>
                Review and approve agent hardware sale requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by request ID, agent name, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredSales.filter(sale => sale.status === "PENDING").map((sale) => (
                  <Card key={sale.id} className="border-l-4 border-l-yellow-400">
                    <CardContent className="pt-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sale.requestId}</span>
                            {getStatusBadge(sale.status)}
                          </div>
                          <p className="text-sm text-gray-600">Agent: {sale.agentName}</p>
                          <p className="text-sm text-gray-600">
                            Items: {sale.items.length} | Total: {sale.currency} {sale.totalAmount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Plant: {sale.transferFrom} → {sale.transferTo}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleApproval(sale, "approve")}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={updateSaleMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt("Reason for rejection:");
                              if (reason) handleApproval(sale, "reject", reason);
                            }}
                            disabled={updateSaleMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-azam-blue" />
                Serial Number Assignment
              </CardTitle>
              <CardDescription>
                Assign serial numbers to approved hardware sales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.filter(sale => sale.status === "APPROVED" && !sale.serialNumbersAssigned).map((sale) => (
                  <Card key={sale.id} className="border-l-4 border-l-green-400">
                    <CardContent className="pt-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{sale.requestId} - {sale.agentName}</h4>
                            <p className="text-sm text-gray-600">
                              Total Items: {sale.items.reduce((sum, item) => sum + item.quantity, 0)}
                            </p>
                          </div>
                          {getStatusBadge(sale.status)}
                        </div>

                        <div className="space-y-2">
                          <Label>Upload Serial Numbers (one per line)</Label>
                          <Textarea
                            placeholder="Enter serial numbers, one per line..."
                            value={uploadedSerials}
                            onChange={(e) => setUploadedSerials(e.target.value)}
                            rows={6}
                          />
                          <p className="text-sm text-gray-600">
                            Expected: {sale.items.reduce((sum, item) => sum + item.quantity, 0)} serial numbers
                          </p>
                        </div>

                        <Button 
                          onClick={() => handleSerialUpload(sale)}
                          disabled={assignSerialsMutation.isPending}
                          className="bg-azam-blue hover:bg-azam-blue/90"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {assignSerialsMutation.isPending ? "Assigning..." : "Assign Serial Numbers"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-azam-blue" />
                Sales History
              </CardTitle>
              <CardDescription>
                View all agent hardware sale requests and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by request ID, agent name, or status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredSales.map((sale) => (
                  <Card key={sale.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sale.requestId}</span>
                            {getStatusBadge(sale.status)}
                          </div>
                          <p className="text-sm text-gray-600">Agent: {sale.agentName}</p>
                          <p className="text-sm text-gray-600">
                            Date: {new Date(sale.createDt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            Items: {sale.items.length} | Total: {sale.currency} {sale.totalAmount.toLocaleString()}
                          </p>
                          {sale.cmStatusMsg && (
                            <p className="text-sm text-gray-600">Status: {sale.cmStatusMsg}</p>
                          )}
                        </div>

                        <div className="text-right space-y-1">
                          {sale.sapSoId && (
                            <p className="text-sm font-medium">SO: {sale.sapSoId}</p>
                          )}
                          {sale.deliveryNoteId && (
                            <p className="text-sm">DN: {sale.deliveryNoteId}</p>
                          )}
                          {sale.invoiceId && (
                            <p className="text-sm">Invoice: {sale.invoiceId}</p>
                          )}
                          {sale.serialNumbersAssigned && (
                            <Badge variant="default" className="bg-green-100 text-green-700">
                              Serials Assigned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}