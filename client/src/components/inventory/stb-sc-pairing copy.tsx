import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link2, Search, CheckCircle, AlertTriangle, Package, CreditCard, Unlink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function StbScPairing() {
  const [stbSmartCardPair, setStbSmartCardPair] = useState({ stbSerial: "", smartCardNo: "" });
  const [searchStb, setSearchStb] = useState("");
  const [searchSc, setSearchSc] = useState("");
  const [selectedStb, setSelectedStb] = useState<any>(null);
  const [selectedSc, setSelectedSc] = useState<any>(null);

  const { toast } = useToast();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // Filter STBs and Smart Cards
  const stbItems = (inventory as any)?.data?.filter((item: any) => 
    item.materialType === 'STB' || item.materialCode?.startsWith('STB')
  ) || [];

  const smartCardItems = (inventory as any)?.data?.filter((item: any) => 
    item.materialType === 'SMART_CARD' || item.materialCode?.startsWith('SC')
  ) || [];

  // Search filtered items
  const filteredStbs = stbItems.filter((item: any) =>
    item.serialNumber?.toLowerCase().includes(searchStb.toLowerCase()) ||
    item.materialName?.toLowerCase().includes(searchStb.toLowerCase())
  );

  const filteredScs = smartCardItems.filter((item: any) =>
    item.serialNumber?.toLowerCase().includes(searchSc.toLowerCase()) ||
    item.materialName?.toLowerCase().includes(searchSc.toLowerCase())
  );

  // Mutation for STB-Smart Card pairing
  const pairingMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/inventory/pairing", data),
    onSuccess: () => {
      toast({ title: "STB and Smart Card paired successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setStbSmartCardPair({ stbSerial: "", smartCardNo: "" });
      setSelectedStb(null);
      setSelectedSc(null);
    },
    onError: () => {
      toast({ title: "Failed to pair devices", variant: "destructive" });
    }
  });

  // Mutation for unpairing
  const unpairingMutation = useMutation({
    mutationFn: async (data: any) => apiRequest("POST", "/api/inventory/unpair", data),
    onSuccess: () => {
      toast({ title: "Devices unpaired successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
    },
    onError: () => {
      toast({ title: "Failed to unpair devices", variant: "destructive" });
    }
  });

  const handleDevicePairing = () => {
    if (!stbSmartCardPair.stbSerial || !stbSmartCardPair.smartCardNo) {
      toast({ title: "Please provide both STB Serial and Smart Card Number", variant: "destructive" });
      return;
    }
    pairingMutation.mutate(stbSmartCardPair);
  };

  const handleSelectStb = (item: any) => {
    setSelectedStb(item);
    setStbSmartCardPair({ ...stbSmartCardPair, stbSerial: item.serialNumber });
  };

  const handleSelectSc = (item: any) => {
    setSelectedSc(item);
    setStbSmartCardPair({ ...stbSmartCardPair, smartCardNo: item.serialNumber });
  };

  const handleUnpair = (stbSerial: string, scSerial: string) => {
    unpairingMutation.mutate({ stbSerial, smartCardNo: scSerial });
  };

  // Mock paired devices for demonstration
  const pairedDevices = [
    {
      id: 1,
      stbSerial: "STB001234567",
      stbModel: "HD Set-Top Box",
      scSerial: "SC001987654",
      scModel: "Smart Card Premium",
      pairedDate: "2024-01-15",
      pairedBy: "TECH_USER",
      status: "ACTIVE"
    },
    {
      id: 2,
      stbSerial: "STB001234568",
      stbModel: "4K Set-Top Box",
      scSerial: "SC001987655",
      scModel: "Smart Card Basic",
      pairedDate: "2024-01-20",
      pairedBy: "FIELD_TECH",
      status: "ACTIVE"
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 md:p-6 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">STB - Smart Card Pairing</h1>
            <p className="text-green-100 mt-1 text-sm md:text-base">Pair Set-Top Boxes with Smart Cards for Nagra system</p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white text-xs md:text-sm">
              <Link2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Nagra Integration
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Device Selection */}
        <div className="space-y-6">
          {/* STB Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                Select Set-Top Box
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  value={searchStb}
                  onChange={(e) => setSearchStb(e.target.value)}
                  placeholder="Search STB by serial number..."
                />
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredStbs.length > 0 ? (
                    filteredStbs.slice(0, 5).map((item: any) => (
                      <div 
                        key={item.id}
                        onClick={() => handleSelectStb(item)}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedStb?.id === item.id 
                            ? 'border-green-600 bg-green-50' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{item.materialName}</p>
                            <p className="text-xs text-gray-600 font-mono">{item.serialNumber}</p>
                            <p className="text-xs text-gray-500">Status: {item.state}</p>
                          </div>
                          {selectedStb?.id === item.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No STBs found</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Smart Card Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Select Smart Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  value={searchSc}
                  onChange={(e) => setSearchSc(e.target.value)}
                  placeholder="Search Smart Card by serial number..."
                />
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredScs.length > 0 ? (
                    filteredScs.slice(0, 5).map((item: any) => (
                      <div 
                        key={item.id}
                        onClick={() => handleSelectSc(item)}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedSc?.id === item.id 
                            ? 'border-green-600 bg-green-50' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-sm">{item.materialName}</p>
                            <p className="text-xs text-gray-600 font-mono">{item.serialNumber}</p>
                            <p className="text-xs text-gray-500">Status: {item.state}</p>
                          </div>
                          {selectedSc?.id === item.id && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No Smart Cards found</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pairing Form and Status */}
        <div className="space-y-6">
          {/* Pairing Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link2 className="w-5 h-5 mr-2 text-green-600" />
                Device Pairing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stbSerial">STB Serial Number</Label>
                <Input
                  id="stbSerial"
                  value={stbSmartCardPair.stbSerial}
                  onChange={(e) => setStbSmartCardPair({...stbSmartCardPair, stbSerial: e.target.value})}
                  placeholder="Enter STB serial number"
                  readOnly={!!selectedStb}
                  className={selectedStb ? "bg-gray-50" : ""}
                />
              </div>

              <div>
                <Label htmlFor="smartCardNo">Smart Card Number</Label>
                <Input
                  id="smartCardNo"
                  value={stbSmartCardPair.smartCardNo}
                  onChange={(e) => setStbSmartCardPair({...stbSmartCardPair, smartCardNo: e.target.value})}
                  placeholder="Enter smart card number"
                  readOnly={!!selectedSc}
                  className={selectedSc ? "bg-gray-50" : ""}
                />
              </div>

              {(selectedStb || selectedSc) && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Devices</h4>
                  {selectedStb && (
                    <div className="text-xs mb-2">
                      <p><span className="text-gray-600">STB:</span> {selectedStb.materialName}</p>
                      <p><span className="text-gray-600">Serial:</span> {selectedStb.serialNumber}</p>
                    </div>
                  )}
                  {selectedSc && (
                    <div className="text-xs">
                      <p><span className="text-gray-600">Smart Card:</span> {selectedSc.materialName}</p>
                      <p><span className="text-gray-600">Serial:</span> {selectedSc.serialNumber}</p>
                    </div>
                  )}
                </div>
              )}

              <Button 
                onClick={handleDevicePairing}
                disabled={pairingMutation.isPending || !stbSmartCardPair.stbSerial || !stbSmartCardPair.smartCardNo}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {pairingMutation.isPending ? "Pairing..." : "Pair Devices"}
              </Button>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="w-4 h-4 text-green-600 mt-0.5 mr-2" />
                  <div className="text-xs text-green-800">
                    <p className="font-medium mb-1">Pairing Requirements:</p>
                    <ul className="space-y-1">
                      <li>• Both devices must be in "Fresh" status</li>
                      <li>• STB must have valid CAS ID assigned</li>
                      <li>• Smart Card must be activated</li>
                      <li>• Pairing is validated with Nagra system</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Currently Paired Devices */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link2 className="w-5 h-5 mr-2 text-green-600" />
            Currently Paired Devices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pairedDevices.length > 0 ? (
              pairedDevices.map((pair) => (
                <div key={pair.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                      <div className="flex items-center mb-2">
                        <Package className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="font-medium text-sm">{pair.stbModel}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-mono">{pair.stbSerial}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center mb-2">
                        <CreditCard className="w-4 h-4 text-gray-600 mr-2" />
                        <span className="font-medium text-sm">{pair.scModel}</span>
                      </div>
                      <p className="text-xs text-gray-600 font-mono">{pair.scSerial}</p>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <Badge className="bg-green-100 text-green-800 text-xs mb-1">
                          {pair.status}
                        </Badge>
                        <p className="text-xs text-gray-500">
                          Paired: {new Date(pair.pairedDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">By: {pair.pairedBy}</p>
                      </div>
                      <Button
                        onClick={() => handleUnpair(pair.stbSerial, pair.scSerial)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                        disabled={unpairingMutation.isPending}
                      >
                        <Unlink className="w-4 h-4 mr-1" />
                        Unpair
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Link2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No paired devices found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}