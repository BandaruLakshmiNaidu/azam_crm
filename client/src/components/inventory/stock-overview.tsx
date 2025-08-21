import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Search,
  Building,
  Users,
  Wrench,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Filter,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from "recharts";

export default function StockOverview() {
  const [scope, setScope] = useState<"all" | "warehouse" | "otc" | "agent" | "repair">("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [materialType, setMaterialType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [serialSearchTerm, setSerialSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<keyof any>("materialCode");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { data: inventoryResponse, isLoading, refetch } = useQuery<any>({
    queryKey: ["/api/inventory"],
  });

  // Extract data from API response format {success: true, data: [...]}
  const inventory = inventoryResponse?.success ? inventoryResponse.data : [];
  const safeInventory = Array.isArray(inventory) ? inventory : [];

  // Helpers
  const getScopeFromOwner = (owner?: string) => {
    const o = owner?.toLowerCase() || "";
    if (o.startsWith("warehouse")) return "warehouse" as const;
    if (o.startsWith("otc")) return "otc" as const;
    if (o.startsWith("agent")) return "agent" as const;
    if (o.includes("service") || o.includes("repair")) return "repair" as const;
    return "warehouse" as const;
  };

  const isFresh = (item: any) =>
    ["available"].includes(String(item.state || "").toLowerCase()) ||
    ["new"].includes(String(item.status || "").toLowerCase());
  const isUsed = (item: any) =>
    ["allocated"].includes(String(item.state || "").toLowerCase()) ||
    ["used"].includes(String(item.status || "").toLowerCase());
  const isFaulty = (item: any) =>
    ["faulty"].includes(String(item.state || "").toLowerCase()) ||
    ["damaged"].includes(String(item.status || "").toLowerCase());

  const scopeCounts = useMemo(() => {
    const base = { warehouse: 0, otc: 0, agent: 0, repair: 0 } as Record<string, number>;
    for (const it of safeInventory) {
      const s = getScopeFromOwner(it.owner);
      base[s]++;
    }
    return base;
  }, [safeInventory]);

  const uniqueMaterialTypes = useMemo(
    () => Array.from(new Set(safeInventory.map((i: any) => i.materialType).filter(Boolean))).sort(),
    [safeInventory]
  );

  const uniqueOwnersForScope = useMemo(() => {
    const owners = Array.from(
      new Set(
        safeInventory
          .filter((i: any) => (scope === "all" ? true : getScopeFromOwner(i.owner) === scope))
          .map((i: any) => i.owner)
          .filter(Boolean)
      )
    );
    owners.sort();
    return owners;
  }, [safeInventory, scope]);

  const overviewForScope = useMemo(() => {
    const items = safeInventory.filter((i: any) => (scope === "all" ? true : getScopeFromOwner(i.owner) === scope));
    const total = items.length;
    const fresh = items.filter(isFresh).length;
    const used = items.filter(isUsed).length;
    const faulty = items.filter(isFaulty).length;
    return { total, fresh, used, faulty };
  }, [safeInventory, scope]);

  const filteredInventory = useMemo(() => {
    let items = safeInventory.filter((item: any) => (scope === "all" ? true : getScopeFromOwner(item.owner) === scope));
    if (selectedLocation !== "all") items = items.filter((i: any) => i.owner === selectedLocation);
    if (materialType !== "all") items = items.filter((i: any) => String(i.materialType) === materialType);
    if (statusFilter !== "all") {
      const val = statusFilter.toLowerCase();
      items = items.filter((i: any) => String(i.state || i.status || "").toLowerCase().includes(val));
    }
    if (serialSearchTerm) {
      const q = serialSearchTerm.toLowerCase();
      items = items.filter(
        (i: any) =>
          i.serialNumber?.toLowerCase().includes(q) ||
          i.materialCode?.toLowerCase().includes(q) ||
          i.materialName?.toLowerCase().includes(q)
      );
    }
    items.sort((a: any, b: any) => {
      const av = String(a[sortBy] ?? "").toLowerCase();
      const bv = String(b[sortBy] ?? "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return items;
  }, [safeInventory, scope, selectedLocation, materialType, statusFilter, serialSearchTerm, sortBy, sortDir]);

  // Pagination
  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

  const pieData = useMemo(() => {
    return [
      { name: "Fresh", value: overviewForScope.fresh, color: "#10B981" },
      { name: "Used", value: overviewForScope.used, color: "#F59E0B" },
      { name: "Faulty", value: overviewForScope.faulty, color: "#EF4444" },
    ];
  }, [overviewForScope]);

  // Handlers
  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setCurrentPage(1);
  };

  const handleScopeChange = (value: typeof scope) => {
    setScope(value);
    setSelectedLocation("all");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSerialSearchTerm(value);
    setCurrentPage(1);
  };

  const toggleSort = (column: keyof any) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const exportCsv = (rows: any[]) => {
    if (!rows?.length) return;
    const headers = [
      "Material Code",
      "Material Name",
      "Material Type",
      "Serial Number",
      "Status",
      "State",
      "Owner",
      "CAS ID",
    ];
    const lines = rows
      .map((r) =>
        [
          r.materialCode,
          r.materialName,
          r.materialType,
          r.serialNumber,
          r.status,
          r.state,
          r.owner,
          r.casId,
        ]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      );
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `stock_overview_${scope}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fresh":
      case "available":
      case "new":
        return "bg-green-100 text-green-800";
      case "used":
      case "allocated":
        return "bg-yellow-100 text-yellow-800";
      case "faulty":
      case "damaged":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLocationIcon = (owner: string) => {
    const o = owner || "";
    if (o.includes("Warehouse")) return <Building className="w-4 h-4" />;
    if (o.includes("OTC")) return <Package className="w-4 h-4" />;
    if (o.toLowerCase().includes("agent")) return <Users className="w-4 h-4" />;
    if (o.toLowerCase().includes("service") || o.toLowerCase().includes("repair")) return <Wrench className="w-4 h-4" />;
    return <Package className="w-4 h-4" />;
  };

  return (
    <div className="p-2 sm:p-3 space-y-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-azam-blue to-blue-800 text-white p-2 md:p-3 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Stock Overview</h1>
            <p className="text-blue-100 mt-1 text-sm md:text-base">Comprehensive inventory status across all locations</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" className="bg-white/20 text-white hover:bg-white/30" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
           
          </div>
        </div>
      </div>

      {/* Scope Tabs */}
      <Tabs value={scope} className="w-full">
        <TabsList className="grid grid-cols-5 gap-2">
          <TabsTrigger value="all" onClick={() => handleScopeChange("all")}>
            All ({safeInventory.length})
          </TabsTrigger>
          <TabsTrigger value="warehouse" onClick={() => handleScopeChange("warehouse")}>
            Warehouse ({scopeCounts.warehouse})
          </TabsTrigger>
          <TabsTrigger value="otc" onClick={() => handleScopeChange("otc")}>
            OTC ({scopeCounts.otc})
          </TabsTrigger>
          <TabsTrigger value="agent" onClick={() => handleScopeChange("agent")}>
            Agent ({scopeCounts.agent})
          </TabsTrigger>
          <TabsTrigger value="repair" onClick={() => handleScopeChange("repair")}>
            Repair ({scopeCounts.repair})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search serial/material..."
                className="pl-9"
                value={serialSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            <Select value={selectedLocation} onValueChange={handleLocationChange}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueOwnersForScope.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={materialType} onValueChange={(v) => { setMaterialType(v); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Material Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueMaterialTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="available">Available/Fresh</SelectItem>
                <SelectItem value="allocated">Allocated/Used</SelectItem>
                <SelectItem value="faulty">Faulty/Damaged</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="default" 
              className="h-10 bg-azam-blue hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium" 
              onClick={() => exportCsv(filteredInventory)}
            >
              <Download className="w-4 h-4 mr-2" /> 
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-azam-blue" />
              Inventory Items ({totalItems})
            </div>
            <div className="text-sm font-normal text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading inventory...</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th onClick={() => toggleSort("materialCode")} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Material Code</th>
                      <th onClick={() => toggleSort("materialName")} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Material Name</th>
                      <th onClick={() => toggleSort("materialType")} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Type</th>
                      <th onClick={() => toggleSort("serialNumber")} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Serial Number</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th onClick={() => toggleSort("owner")} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CAS ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedInventory.map((item: any) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.materialCode}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.materialName}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{item.materialType}</td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.serialNumber}</td>
                        <td className="px-4 py-3">
                          <Badge className={getStatusColor(item.state || item.status)} variant="secondary">
                            {item.state || item.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <div className="flex items-center">
                            {getLocationIcon(item.owner)}
                            <span className="ml-2">{item.owner}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{item.casId || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {paginatedInventory.map((item: any) => (
                  <div key={item.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm">{item.materialName}</p>
                        <p className="text-xs text-gray-600">{item.materialCode}</p>
                      </div>
                      <Badge className={getStatusColor(item.state || item.status)} variant="secondary">
                        {item.state || item.status}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Serial:</span>
                        <span className="font-mono">{item.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span>{item.materialType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner:</span>
                        <span className="flex items-center">
                          {getLocationIcon(item.owner)}
                          <span className="ml-1">{item.owner}</span>
                        </span>
                      </div>
                      {item.casId && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">CAS ID:</span>
                          <span className="font-mono">{item.casId}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {totalItems === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No inventory items found</p>
                </div>
              )}

              {/* Pagination Controls */}
              {totalItems > 0 && totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
                    <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> results
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      Rows per page:
                      <Select value={String(itemsPerPage)} onValueChange={(v) => { setItemsPerPage(parseInt(v)); setCurrentPage(1); }}>
                        <SelectTrigger className="h-8 w-[80px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[10, 20, 50, 100].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}