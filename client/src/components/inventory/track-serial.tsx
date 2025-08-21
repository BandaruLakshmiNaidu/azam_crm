import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Barcode, MapPin, Clock, Package, AlertCircle } from "lucide-react";

export default function TrackSerial() {
  const [serialSearchTerm, setSerialSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: inventoryRequests } = useQuery({
    queryKey: ["/api/inventory-requests"],
  });

  const { data: serialMovements } = useQuery({
    queryKey: serialSearchTerm.trim()
      ? ["/api/inventory/serial", serialSearchTerm.trim(), "movements"]
      : ["/api/inventory/serial", "", "movements"],
    enabled: !!serialSearchTerm.trim(),
  });

  const handleSearch = () => {
    if (!serialSearchTerm.trim()) return;
    
    setIsSearching(true);
    
    // Search in inventory
    const inventoryResults = (inventory as any)?.data?.filter((item: any) => 
      item.serialNumber?.toLowerCase().includes(serialSearchTerm.toLowerCase())
    ) || [];
    
    // Search in requests/transfers
    const requestResults = (inventoryRequests as any)?.data?.filter((req: any) => 
      req.itemSerialNo?.toLowerCase().includes(serialSearchTerm.toLowerCase())
    ) || [];
    
    // Use portal-only movement history from backend if available
    const movementEvents = (serialMovements as any)?.data?.events || [];
    const currentInfo = (serialMovements as any)?.data?.current || null;
    
    setSearchResults([
      ...inventoryResults.map((item: any) => ({
        ...item,
        type: 'inventory',
        trackingHistory: movementEvents,
      })),
      ...requestResults.map((req: any) => ({
        ...req,
        type: 'request',
        trackingHistory: movementEvents,
      })),
      ...(currentInfo
        ? [{
            ...currentInfo,
            type: 'current',
            trackingHistory: movementEvents,
          }]
        : [])
    ]);
    
    setTimeout(() => setIsSearching(false), 500);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fresh': return 'bg-green-100 text-green-800';
      case 'used': return 'bg-yellow-100 text-yellow-800';
      case 'faulty': return 'bg-red-100 text-red-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'transferred': return 'bg-purple-100 text-purple-800';
      case 'assigned': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'fresh': return <Package className="w-4 h-4" />;
      case 'used': return <Clock className="w-4 h-4" />;
      case 'faulty': return <AlertCircle className="w-4 h-4" />;
      case 'received': return <Package className="w-4 h-4" />;
      case 'transferred': return <MapPin className="w-4 h-4" />;
      case 'assigned': return <MapPin className="w-4 h-4" />;
      default: return <Barcode className="w-4 h-4" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-2 md:p-3 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Serial Number Tracking</h1>
            <p className="text-yellow-100 mt-1 text-sm md:text-base">Track inventory items and their movement history</p>
          </div>
          <div className="flex space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white text-xs md:text-sm">
              <Barcode className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Real-time Tracking
            </Badge>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2 text-yellow-600" />
            Search Serial Number
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="serialSearch">Serial Number</Label>
              <Input
                id="serialSearch"
                value={serialSearchTerm}
                onChange={(e) => setSerialSearchTerm(e.target.value)}
                placeholder="Enter serial number to track..."
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch}
                disabled={isSearching || !serialSearchTerm.trim()}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isSearching ? "Searching..." : "Track"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-6">
          {searchResults.map((result, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      <Barcode className="w-5 h-5 mr-2 text-yellow-600" />
                      {result.serialNumber || result.itemSerialNo}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {result.materialName || result.itemType} - {result.materialCode || 'N/A'}
                    </p>
                  </div>
                  <Badge className={getStatusColor(result.state || result.status)}>
                    {getStatusIcon(result.state || result.status)}
                    <span className="ml-1">{result.state || result.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Current Information */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Current Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Owner:</span>
                        <span className="font-medium">{result.owner || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="font-medium">{result.state || result.status}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">
                          {result.updateTs || result.createDt ? 
                            new Date(result.updateTs || result.createDt).toLocaleString() : 
                            'N/A'
                          }
                        </span>
                      </div>
                      {result.casId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">CAS ID:</span>
                          <span className="font-medium font-mono">{result.casId}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Movement History */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Movement History</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {result.trackingHistory?.map((history: any, historyIndex: number) => (
                        <div key={historyIndex} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex-shrink-0 mt-1">
                            {getStatusIcon(history.status)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{history.location}</p>
                                <p className="text-xs text-gray-600">{history.notes}</p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {history.status}
                              </Badge>
                            </div>
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              <span>{history.timestamp}</span>
                              <span>by {history.operator}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {serialSearchTerm && searchResults.length === 0 && !isSearching && (
        <Card>
          <CardContent className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              No inventory items found with serial number "{serialSearchTerm}"
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Items Overview */}
      {!serialSearchTerm && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-yellow-600" />
              Recent Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading inventory...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(inventory as any)?.data?.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{item.materialName}</p>
                        <p className="text-xs text-gray-600 font-mono">{item.serialNumber}</p>
                      </div>
                      <Badge className={getStatusColor(item.state)} variant="secondary">
                        {item.state}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">Owner: {item.owner}</p>
                    <Button
                      onClick={() => {
                        setSerialSearchTerm(item.serialNumber);
                        handleSearch();
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-xs"
                    >
                      Track This Item
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}