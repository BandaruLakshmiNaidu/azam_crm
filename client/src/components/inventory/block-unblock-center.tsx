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
import { Shield, ShieldOff, Building, Search, AlertTriangle, CheckCircle, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CenterSTBStatus {
  id: number;
  serialNumber: string;
  centerId: string;
  centerName: string;
  centerType: "WAREHOUSE" | "OTC" | "REPAIR_CENTER";
  location: string;
  status: "ACTIVE" | "BLOCKED" | "SUSPENDED";
  blockReason?: string;
  blockedBy?: string;
  blockDate?: Date;
  lastActivity: Date;
  model: string;
  casId: string;
  assignedTo?: string;
}

export default function BlockUnblockCenter() {
  const [selectedTab, setSelectedTab] = useState("search");
  const [searchSerial, setSearchSerial] = useState("");
  const [selectedSTB, setSelectedSTB] = useState<CenterSTBStatus | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [actionType, setActionType] = useState<"BLOCK" | "UNBLOCK" | null>(null);

  const queryClient = useQueryClient();

  const { data: centerSTBList, isLoading } = useQuery<CenterSTBStatus[]>({
    queryKey: ["/api/center-stb-status"],
  });

  const searchCenterSTBMutation = useMutation({
    mutationFn: async (serialNumber: string) => {
      const response = await fetch(`/api/center-stb-status/search?serial=${serialNumber}`);
      return response.json();
    },
    onSuccess: (data) => {
      if (data) {
        setSelectedSTB(data);
      } else {
        toast({ title: "STB not found in center inventory", variant: "destructive" });
      }
    },
  });

  const updateCenterSTBStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number; status: string; reason?: string }) => {
      const response = await fetch(`/api/center-stb-status/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Center STB status updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/center-stb-status"] });
      setSelectedSTB(null);
      setBlockReason("");
      setActionType(null);
      setSearchSerial("");
    },
  });

  const handleSearch = () => {
    if (searchSerial.trim()) {
      searchCenterSTBMutation.mutate(searchSerial.trim());
    }
  };

  const handleStatusUpdate = () => {
    if (selectedSTB && actionType) {
      const newStatus = actionType === "BLOCK" ? "BLOCKED" : "ACTIVE";
      updateCenterSTBStatusMutation.mutate({
        id: selectedSTB.id,
        status: newStatus,
        reason: actionType === "BLOCK" ? blockReason : undefined,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-800";
      case "BLOCKED": return "bg-red-100 text-red-800";
      case "SUSPENDED": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE": return <CheckCircle className="w-4 h-4" />;
      case "BLOCKED": return <ShieldOff className="w-4 h-4" />;
      case "SUSPENDED": return <AlertTriangle className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getCenterTypeColor = (type: string) => {
    switch (type) {
      case "WAREHOUSE": return "bg-blue-100 text-blue-800";
      case "OTC": return "bg-green-100 text-green-800";
      case "REPAIR_CENTER": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading center STB data...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Block / Unblock STB - Center / WH</h1>
          <p className="text-gray-600">Manage STB device access control for centers and warehouses</p>
        </div>
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5 text-azam-blue" />
          <span className="text-sm text-gray-600">Center STB Control</span>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search STB</TabsTrigger>
          <TabsTrigger value="active">Active STBs</TabsTrigger>
          <TabsTrigger value="blocked">Blocked STBs</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Search Center STB Device</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Label htmlFor="searchSerial">STB Serial Number</Label>
                  <Input
                    id="searchSerial"
                    value={searchSerial}
                    onChange={(e) => setSearchSerial(e.target.value)}
                    placeholder="Enter STB serial number"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleSearch} className="bg-azam-blue hover:bg-azam-blue/90">
                    Search
                  </Button>
                </div>
              </div>

              {selectedSTB && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="p-2 bg-azam-blue/10 rounded-lg">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{selectedSTB.serialNumber}</h3>
                          <p className="text-sm text-gray-600">{selectedSTB.model}</p>
                          <p className="text-sm text-gray-600">CAS ID: {selectedSTB.casId}</p>
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge className={getStatusColor(selectedSTB.status)}>
                          {getStatusIcon(selectedSTB.status)}
                          <span className="ml-1">{selectedSTB.status}</span>
                        </Badge>
                        <div>
                          <Badge className={getCenterTypeColor(selectedSTB.centerType)}>
                            {selectedSTB.centerType}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Center Information</p>
                        <p className="text-sm text-gray-600">ID: {selectedSTB.centerId}</p>
                        <p className="text-sm text-gray-600">Name: {selectedSTB.centerName}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <p className="text-sm text-gray-600">{selectedSTB.location}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Assignment</p>
                        <p className="text-sm text-gray-600">Assigned to: {selectedSTB.assignedTo || "Unassigned"}</p>
                        <p className="text-sm text-gray-600">
                          Last Activity: {new Date(selectedSTB.lastActivity).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {selectedSTB.blockReason && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm font-medium text-red-800">Block Reason:</p>
                        <p className="text-sm text-red-700">{selectedSTB.blockReason}</p>
                        <p className="text-xs text-red-600 mt-1">
                          Blocked by: {selectedSTB.blockedBy} on {selectedSTB.blockDate ? new Date(selectedSTB.blockDate).toLocaleString() : "N/A"}
                        </p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="space-y-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => setActionType("BLOCK")}
                          disabled={selectedSTB.status === "BLOCKED"}
                          variant={actionType === "BLOCK" ? "default" : "outline"}
                          className="flex-1"
                        >
                          <ShieldOff className="w-4 h-4 mr-2" />
                          Block STB
                        </Button>
                        <Button
                          onClick={() => setActionType("UNBLOCK")}
                          disabled={selectedSTB.status === "ACTIVE"}
                          variant={actionType === "UNBLOCK" ? "default" : "outline"}
                          className="flex-1"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Unblock STB
                        </Button>
                      </div>

                      {actionType === "BLOCK" && (
                        <div>
                          <Label htmlFor="blockReason">Block Reason</Label>
                          <Textarea
                            id="blockReason"
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                            placeholder="Enter reason for blocking this STB"
                            rows={3}
                          />
                        </div>
                      )}

                      {actionType && (
                        <Button
                          onClick={handleStatusUpdate}
                          disabled={actionType === "BLOCK" && !blockReason.trim()}
                          className="w-full bg-azam-blue hover:bg-azam-blue/90"
                        >
                          {actionType === "BLOCK" ? "Block STB" : "Unblock STB"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {centerSTBList?.filter(stb => stb.status === "ACTIVE").map((stb) => (
              <Card key={stb.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{stb.serialNumber}</h3>
                        <p className="text-sm text-gray-600">{stb.model}</p>
                        <p className="text-sm text-gray-600">Center: {stb.centerName}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <p className="text-sm text-gray-600">{stb.location}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(stb.status)}>
                        {stb.status}
                      </Badge>
                      <div>
                        <Badge className={getCenterTypeColor(stb.centerType)}>
                          {stb.centerType}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Last Activity: {new Date(stb.lastActivity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <div className="grid gap-4">
            {centerSTBList?.filter(stb => stb.status === "BLOCKED").map((stb) => (
              <Card key={stb.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <ShieldOff className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{stb.serialNumber}</h3>
                        <p className="text-sm text-gray-600">{stb.model}</p>
                        <p className="text-sm text-gray-600">Center: {stb.centerName}</p>
                        <div className="flex items-center space-x-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          <p className="text-sm text-gray-600">{stb.location}</p>
                        </div>
                        {stb.blockReason && (
                          <p className="text-sm text-red-600 mt-1">Reason: {stb.blockReason}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getStatusColor(stb.status)}>
                        {stb.status}
                      </Badge>
                      <div>
                        <Badge className={getCenterTypeColor(stb.centerType)}>
                          {stb.centerType}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        Blocked: {stb.blockDate ? new Date(stb.blockDate).toLocaleDateString() : "N/A"}
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