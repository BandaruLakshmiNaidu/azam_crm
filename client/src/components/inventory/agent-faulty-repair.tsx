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
import { 
  AlertTriangle, 
  Package, 
  User, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Wrench,
  Settings,
  FileText,
  ArrowRight,
  RefreshCw,
  Shield
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AgentFaultyRepair } from "@shared/schema";

export default function AgentFaultyRepairPage() {
  const [selectedTab, setSelectedTab] = useState("faulty-items");
  const [searchSerial, setSearchSerial] = useState("");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [repairData, setRepairData] = useState({
    repairCenter: "",
    repairNotes: "",
    processedBy: "current_user",
  });

  const queryClient = useQueryClient();

  const { data: faultyInventory, isLoading: faultyLoading } = useQuery<any[]>({
    queryKey: ["/api/agent-faulty-inventory"],
  });

  const { data: repairHistory, isLoading: historyLoading } = useQuery<AgentFaultyRepair[]>({
    queryKey: ["/api/agent-faulty-repairs"],
  });

  const transferToRepairMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/agent-faulty-repairs", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-faulty-repairs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/agent-faulty-inventory"] });
      toast({
        title: "Success",
        description: "Items transferred to repair status successfully",
      });
      setSelectedItems([]);
      setRepairData({
        repairCenter: "",
        repairNotes: "",
        processedBy: "current_user",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to transfer items to repair status",
        variant: "destructive",
      });
    },
  });

  const updateRepairMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest(`/api/agent-faulty-repairs/${id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent-faulty-repairs"] });
      toast({
        title: "Success",
        description: "Repair status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update repair status",
        variant: "destructive",
      });
    },
  });

  const repairCenters = [
    { id: "REPAIR_CENTER_DAR", name: "Repair Center - Dar es Salaam" },
    { id: "REPAIR_CENTER_MWANZA", name: "Repair Center - Mwanza" },
    { id: "REPAIR_CENTER_ARUSHA", name: "Repair Center - Arusha" },
    { id: "REPAIR_CENTER_DODOMA", name: "Repair Center - Dodoma" },
    { id: "REPAIR_CENTER_MBEYA", name: "Repair Center - Mbeya" },
  ];

  const handleItemSelect = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleTransferToRepair = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one item to transfer",
        variant: "destructive",
      });
      return;
    }

    if (!repairData.repairCenter) {
      toast({
        title: "Error",
        description: "Please select a repair center",
        variant: "destructive",
      });
      return;
    }

    const selectedItemsData = faultyInventory?.filter(item => selectedItems.includes(item.id));
    
    selectedItemsData?.forEach(item => {
      const transferData = {
        itemId: item.id,
        materialCode: item.materialCode,
        materialName: item.materialName,
        materialType: item.materialType,
        serialNumber: item.serialNumber,
        casId: item.casId || "",
        agentId: item.owner,
        agentName: item.agentName,
        agentBpId: item.agentBpId,
        currentStatus: "FAULTY",
        newStatus: "REPAIR",
        faultyReason: item.faultyReason,
        repairNotes: repairData.repairNotes,
        repairCenter: repairData.repairCenter,
        processedBy: repairData.processedBy,
        createId: repairData.processedBy,
      };

      transferToRepairMutation.mutate(transferData);
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "FAULTY":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Faulty</Badge>;
      case "REPAIR":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200"><Wrench className="w-3 h-3 mr-1" />In Repair</Badge>;
      case "REPAIRED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Repaired</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><Package className="w-3 h-3 mr-1" />Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "STB":
        return <Package className="w-4 h-4 text-blue-500" />;
      case "SMART_CARD":
        return <Shield className="w-4 h-4 text-purple-500" />;
      case "REMOTE":
        return <Settings className="w-4 h-4 text-gray-500" />;
      case "CABLE":
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      default:
        return <Package className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredFaultyInventory = faultyInventory?.filter(item => {
    if (!searchSerial) return true;
    return item.serialNumber.toLowerCase().includes(searchSerial.toLowerCase()) ||
           item.materialName.toLowerCase().includes(searchSerial.toLowerCase()) ||
           item.agentName.toLowerCase().includes(searchSerial.toLowerCase());
  });

  const filteredRepairHistory = repairHistory?.filter(repair => {
    if (!searchSerial) return true;
    return repair.serialNumber.toLowerCase().includes(searchSerial.toLowerCase()) ||
           repair.materialName.toLowerCase().includes(searchSerial.toLowerCase()) ||
           repair.agentName.toLowerCase().includes(searchSerial.toLowerCase());
  });

  if (faultyLoading || historyLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading faulty inventory...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h1 className="text-xl font-semibold text-gray-900">Agent Faulty to Repair Change</h1>
        </div>
        <p className="text-sm text-gray-600">
          Update agent faulty stocks to repair status and manage repair workflow
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faulty-items" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Faulty Items
          </TabsTrigger>
          <TabsTrigger value="repair-transfer" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Transfer to Repair
          </TabsTrigger>
          <TabsTrigger value="repair-history" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Repair History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faulty-items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Agent Faulty Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by serial number, material name, or agent name"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                  {filteredFaultyInventory?.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleItemSelect(item.id)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(item.materialType)}
                              <span className="font-medium">{item.materialName}</span>
                              {getStatusBadge(item.state)}
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Serial:</span> {item.serialNumber}
                              </div>
                              <div>
                                <span className="text-gray-600">Agent:</span> {item.agentName}
                              </div>
                              <div>
                                <span className="text-gray-600">Material Code:</span> {item.materialCode}
                              </div>
                              <div>
                                <span className="text-gray-600">Date:</span> {new Date(item.createDt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-600">Faulty Reason:</span> {item.faultyReason}
                            </div>
                            {item.casId && (
                              <div className="text-sm">
                                <span className="text-gray-600">CAS ID:</span> {item.casId}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedItems.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">
                          {selectedItems.length} item(s) selected
                        </p>
                        <p className="text-sm text-blue-700">
                          Click "Transfer to Repair" tab to process these items
                        </p>
                      </div>
                      <Button
                        onClick={() => setSelectedTab("repair-transfer")}
                        className="bg-azam-blue hover:bg-azam-blue/90"
                      >
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Transfer to Repair
                      </Button>
                    </div>
                  </div>
                )}

                {filteredFaultyInventory?.length === 0 && (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No faulty items found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repair-transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Transfer Items to Repair
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No items selected for repair transfer</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Go to "Faulty Items" tab to select items for repair
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Selected Items for Repair</h4>
                      <div className="space-y-2">
                        {faultyInventory?.filter(item => selectedItems.includes(item.id)).map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-white p-3 rounded border">
                            <div className="flex items-center gap-3">
                              {getTypeIcon(item.materialType)}
                              <div>
                                <div className="font-medium">{item.materialName}</div>
                                <div className="text-sm text-gray-600">{item.serialNumber} - {item.agentName}</div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleItemSelect(item.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="repairCenter">Repair Center *</Label>
                        <Select
                          value={repairData.repairCenter}
                          onValueChange={(value) => setRepairData({...repairData, repairCenter: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select repair center" />
                          </SelectTrigger>
                          <SelectContent>
                            {repairCenters.map(center => (
                              <SelectItem key={center.id} value={center.id}>
                                {center.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="processedBy">Processed By</Label>
                        <Input
                          id="processedBy"
                          value={repairData.processedBy}
                          onChange={(e) => setRepairData({...repairData, processedBy: e.target.value})}
                          placeholder="Enter processor name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repairNotes">Repair Notes</Label>
                      <Textarea
                        id="repairNotes"
                        value={repairData.repairNotes}
                        onChange={(e) => setRepairData({...repairData, repairNotes: e.target.value})}
                        placeholder="Enter repair notes and instructions"
                        rows={3}
                      />
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Transfer Process</h4>
                      <ul className="text-sm text-yellow-800 space-y-1">
                        <li>1. Items will be updated from FAULTY to REPAIR status</li>
                        <li>2. Inventory records will be updated with repair center assignment</li>
                        <li>3. Repair tracking will be initiated for selected items</li>
                        <li>4. Agent stock will be updated to reflect repair status</li>
                      </ul>
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedItems([]);
                          setRepairData({
                            repairCenter: "",
                            repairNotes: "",
                            processedBy: "current_user",
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleTransferToRepair}
                        disabled={transferToRepairMutation.isPending}
                        className="bg-azam-blue hover:bg-azam-blue/90"
                      >
                        {transferToRepairMutation.isPending ? "Processing..." : "Transfer to Repair"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repair-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Repair Transfer History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by serial number, material name, or agent name"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    className="max-w-md"
                  />
                </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  {filteredRepairHistory?.map((repair) => (
                    <div key={repair.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(repair.materialType)}
                            <span className="font-medium">{repair.materialName}</span>
                            {getStatusBadge(repair.newStatus)}
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Serial:</span> {repair.serialNumber}
                            </div>
                            <div>
                              <span className="text-gray-600">Agent:</span> {repair.agentName}
                            </div>
                            <div>
                              <span className="text-gray-600">Repair Center:</span> {repair.repairCenter}
                            </div>
                            <div>
                              <span className="text-gray-600">Transfer Date:</span> {repair.transferDate ? new Date(repair.transferDate).toLocaleDateString() : 'N/A'}
                            </div>
                            <div>
                              <span className="text-gray-600">Processed By:</span> {repair.processedBy}
                            </div>
                            <div>
                              <span className="text-gray-600">Process Date:</span> {repair.processedDate ? new Date(repair.processedDate).toLocaleDateString() : 'N/A'}
                            </div>
                          </div>
                          <div className="text-sm">
                            <span className="text-gray-600">Faulty Reason:</span> {repair.faultyReason}
                          </div>
                          {repair.repairNotes && (
                            <div className="text-sm">
                              <span className="text-gray-600">Repair Notes:</span> {repair.repairNotes}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <div>{repair.currentStatus} → {repair.newStatus}</div>
                          <div className="text-xs mt-1">
                            {new Date(repair.createDt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredRepairHistory?.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No repair transfer history found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}