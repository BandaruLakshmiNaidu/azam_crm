import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, Eye, Download, Calendar, Building, DollarSign, Package } from "lucide-react";

interface PurchaseOrder {
  id: number;
  poNumber: string;
  vendorName: string;
  vendorCode: string;
  vendorAddress: string;
  vendorContact: string;
  orderDate: Date;
  expectedDelivery: Date;
  actualDelivery?: Date;
  totalAmount: number;
  currency: string;
  status: "PENDING" | "PARTIALLY_RECEIVED" | "FULLY_RECEIVED" | "CANCELLED";
  createdBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  items: POItem[];
  terms: string;
  notes?: string;
}

interface POItem {
  id: number;
  materialCode: string;
  materialName: string;
  description: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: number;
  totalPrice: number;
  deliveryDate: Date;
  grnStatus: "PENDING" | "PARTIAL" | "COMPLETE";
}

export default function POView() {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const { data: purchaseOrders, isLoading } = useQuery<PurchaseOrder[]>({
    queryKey: ["/api/purchase-orders"],
  });

  const filteredPOs = purchaseOrders?.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         po.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "pending") return matchesSearch && po.status === "PENDING";
    if (selectedTab === "received") return matchesSearch && po.status === "FULLY_RECEIVED";
    if (selectedTab === "cancelled") return matchesSearch && po.status === "CANCELLED";
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PARTIALLY_RECEIVED": return "bg-blue-100 text-blue-800";
      case "FULLY_RECEIVED": return "bg-green-100 text-green-800";
      case "CANCELLED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getGRNStatusColor = (status: string) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "PARTIAL": return "bg-blue-100 text-blue-800";
      case "COMPLETE": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const calculateProgress = (items: POItem[]) => {
    const totalOrdered = items.reduce((sum, item) => sum + item.orderedQty, 0);
    const totalReceived = items.reduce((sum, item) => sum + item.receivedQty, 0);
    return totalOrdered > 0 ? Math.round((totalReceived / totalOrdered) * 100) : 0;
  };

  const handleViewPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
  };

  const handleDownloadPO = (po: PurchaseOrder) => {
    // Mock download functionality
    const blob = new Blob([JSON.stringify(po, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${po.poNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading purchase orders...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PO View</h1>
          <p className="text-gray-600">View and manage purchase orders</p>
        </div>
        <div className="flex items-center space-x-2">
          <FileText className="w-5 h-5 text-azam-blue" />
          <span className="text-sm text-gray-600">Purchase Orders</span>
        </div>
      </div>

      {!selectedPO ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Search Purchase Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="search">Search by PO Number or Vendor</Label>
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Enter PO number or vendor name"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All POs</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="received">Received</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="space-y-4">
              <div className="grid gap-4">
                {filteredPOs?.map((po) => (
                  <Card key={po.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-lg">{po.poNumber}</h3>
                            <Badge className={getStatusColor(po.status)}>
                              {po.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Building className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Vendor: {po.vendorName}</span>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  Order Date: {new Date(po.orderDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <DollarSign className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  Amount: {po.currency} {po.totalAmount.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 mb-1">
                                <Package className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">
                                  Items: {po.items.length} | Progress: {calculateProgress(po.items)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-azam-blue h-2 rounded-full transition-all duration-300"
                                style={{ width: `${calculateProgress(po.items)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="ml-4 space-y-2">
                          <Button
                            size="sm"
                            onClick={() => handleViewPO(po)}
                            className="w-full bg-azam-blue hover:bg-azam-blue/90"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadPO(po)}
                            className="w-full"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Purchase Order: {selectedPO.poNumber}</span>
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleDownloadPO(selectedPO)}
                  variant="outline"
                  size="sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={() => setSelectedPO(null)}
                  variant="outline"
                  size="sm"
                >
                  Back to List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Badge className={`${getStatusColor(selectedPO.status)} text-base px-3 py-1`}>
                {selectedPO.status}
              </Badge>
              <div className="text-right">
                <p className="text-lg font-semibold">
                  {selectedPO.currency} {selectedPO.totalAmount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Amount</p>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Vendor Information</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {selectedPO.vendorName}</p>
                  <p><strong>Code:</strong> {selectedPO.vendorCode}</p>
                  <p><strong>Address:</strong> {selectedPO.vendorAddress}</p>
                  <p><strong>Contact:</strong> {selectedPO.vendorContact}</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-3">Order Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Order Date:</strong> {new Date(selectedPO.orderDate).toLocaleDateString()}</p>
                  <p><strong>Expected Delivery:</strong> {new Date(selectedPO.expectedDelivery).toLocaleDateString()}</p>
                  {selectedPO.actualDelivery && (
                    <p><strong>Actual Delivery:</strong> {new Date(selectedPO.actualDelivery).toLocaleDateString()}</p>
                  )}
                  <p><strong>Created By:</strong> {selectedPO.createdBy}</p>
                  {selectedPO.approvedBy && (
                    <p><strong>Approved By:</strong> {selectedPO.approvedBy}</p>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Order Items</h4>
              <div className="space-y-3">
                {selectedPO.items.map((item) => (
                  <Card key={item.id} className="border-l-4 border-l-azam-blue">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium">{item.materialName}</h5>
                          <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                          <p className="text-sm text-gray-600">Material Code: {item.materialCode}</p>
                          
                          <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                            <div>
                              <p className="font-medium">Ordered Quantity</p>
                              <p className="text-gray-600">{item.orderedQty}</p>
                            </div>
                            <div>
                              <p className="font-medium">Received Quantity</p>
                              <p className="text-gray-600">{item.receivedQty}</p>
                            </div>
                            <div>
                              <p className="font-medium">Unit Price</p>
                              <p className="text-gray-600">{selectedPO.currency} {item.unitPrice.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <Badge className={getGRNStatusColor(item.grnStatus)}>
                            {item.grnStatus}
                          </Badge>
                          <p className="text-sm text-gray-600 mt-2">
                            <strong>Total: {selectedPO.currency} {item.totalPrice.toLocaleString()}</strong>
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Delivery: {new Date(item.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-3">Terms & Conditions</h4>
              <p className="text-sm text-gray-600 whitespace-pre-line">{selectedPO.terms}</p>
            </div>

            {selectedPO.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Notes</h4>
                  <p className="text-sm text-gray-600 whitespace-pre-line">{selectedPO.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}