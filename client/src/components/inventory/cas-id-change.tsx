import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCcw, Search, CheckCircle, AlertTriangle, Barcode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function CasIdChange() {
  const [casIdUpdate, setCasIdUpdate] = useState({ serialNo: "", casId: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const { toast } = useToast();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // Filter STBs (Set-Top Boxes) only
  const stbItems = (inventory as any)?.data?.filter((item: any) => 
    item.materialType === 'STB' || item.materialCode?.startsWith('STB')
  ) || [];

  // Search filtered items
  const filteredItems = stbItems.filter((item: any) =>
    item.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.materialName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mutation for CAS ID updates
  const casIdUpdateMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("PATCH", `/api/inventory/${data.serialNo}/cas-id`, data),
    onSuccess: () => {
      toast({ title: "CAS ID updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setCasIdUpdate({ serialNo: "", casId: "" });
      setSelectedItem(null);
    },
    onError: () => {
      toast({ title: "Failed to update CAS ID", variant: "destructive" });
    }
  });

  const handleCasIdUpdate = () => {
    if (!casIdUpdate.serialNo || !casIdUpdate.casId) {
      toast({ title: "Please provide both Serial Number and CAS ID", variant: "destructive" });
      return;
    }
    casIdUpdateMutation.mutate(casIdUpdate);
  };

  const handleSelectItem = (item: any) => {
    setSelectedItem(item);
    setCasIdUpdate({ 
      serialNo: item.serialNumber, 
      casId: item.casId || "" 
    });
  };

  const generateCasId = () => {
    // Generate a realistic CAS ID format
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    const newCasId = `CAS${timestamp}${random}`;
    setCasIdUpdate({ ...casIdUpdate, casId: newCasId });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-azam-blue to-blue-800 text-white p-2 md:p-3 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">CAS ID Management</h1>
            <p className="text-blue-100 mt-1 text-sm md:text-base">Update CAS IDs for STB provisioning and Nagra integration</p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white text-xs md:text-sm">
              <RefreshCcw className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Nagra System
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* STB Search and Selection */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2 text-azam-blue" />
                Select STB for CAS ID Update
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Search STB</Label>
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by serial number or model..."
                    className="mb-3"
                  />
                </div>

                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading STB items...</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item: any) => (
                        <div 
                          key={item.id}
                          onClick={() => handleSelectItem(item)}
                          className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                            selectedItem?.id === item.id 
                              ? 'border-azam-blue bg-azam-blue/5' 
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center mb-1">
                                <p className="font-medium text-sm">{item.materialName}</p>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {item.materialCode}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 font-mono mb-1">
                                Serial: {item.serialNumber}
                              </p>
                              {item.casId && (
                                <p className="text-xs text-gray-600 font-mono">
                                  Current CAS ID: {item.casId}
                                </p>
                              )}
                              <p className="text-xs text-gray-500">
                                Owner: {item.owner} | Status: {item.state}
                              </p>
                            </div>
                            {selectedItem?.id === item.id && (
                              <CheckCircle className="w-5 h-5 text-azam-blue" />
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Barcode className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                        <p>No STB items found</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CAS ID Update Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <RefreshCcw className="w-5 h-5 mr-2 text-azam-blue" />
                Update CAS ID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="serialNo">Serial Number</Label>
                <Input
                  id="serialNo"
                  value={casIdUpdate.serialNo}
                  onChange={(e) => setCasIdUpdate({...casIdUpdate, serialNo: e.target.value})}
                  placeholder="Enter STB serial number"
                  readOnly={!!selectedItem}
                  className={selectedItem ? "bg-gray-50" : ""}
                />
              </div>

              <div>
                <Label htmlFor="casId">New CAS ID</Label>
                <div className="flex gap-2">
                  <Input
                    id="casId"
                    value={casIdUpdate.casId}
                    onChange={(e) => setCasIdUpdate({...casIdUpdate, casId: e.target.value})}
                    placeholder="Enter new CAS ID"
                  />
                  <Button
                    onClick={generateCasId}
                    variant="outline"
                    size="sm"
                    title="Generate CAS ID"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Format: CAS + 12 digits (e.g., CAS123456789012)
                </p>
              </div>

              {selectedItem && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Selected STB Details</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span>{selectedItem.materialName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Code:</span>
                      <span>{selectedItem.materialCode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span>{selectedItem.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Current CAS:</span>
                      <span className="font-mono">{selectedItem.casId || 'Not assigned'}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleCasIdUpdate}
                disabled={casIdUpdateMutation.isPending || !casIdUpdate.serialNo || !casIdUpdate.casId}
                className="w-full bg-azam-blue hover:bg-azam-blue/90"
              >
                {casIdUpdateMutation.isPending ? "Updating..." : "Update CAS ID"}
              </Button>

              
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent CAS ID Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCcw className="w-5 h-5 mr-2 text-azam-blue" />
            Recent CAS ID Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stbItems.filter((item: any) => item.casId).slice(0, 6).map((item: any) => (
              <div key={item.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{item.materialName}</p>
                    <p className="text-xs text-gray-600 font-mono">{item.serialNumber}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {item.state}
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">CAS ID:</span>
                    <span className="font-mono">{item.casId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span>{item.updateTs ? new Date(item.updateTs).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}