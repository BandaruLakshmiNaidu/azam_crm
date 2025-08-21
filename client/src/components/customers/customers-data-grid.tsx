import { useState, useMemo } from "react";
import { getApiConfig } from "@/lib/config";
import { useAuthContext } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit,
  Eye,
  Download,
  RefreshCw,
  ShieldCheck,
  X
} from "lucide-react";
import type { Customer } from "@shared/schema";

import CustomerDetailsModal from "./customer-details-modal";
import { Label } from "../ui/label";



interface CustomersDataGridProps {
  customers: Customer[];
  isLoading: boolean;
  onRefresh?: () => void;
  onEdit?: (customer: Customer) => void;
  onView?: (customer: Customer) => void;
}

const getStatusColor = (accountClass: string) => {
  switch (accountClass?.toLowerCase()) {
    case "premium":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "family":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "basic":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getServiceTypeColor = (serviceType: string) => {
  switch (serviceType?.toLowerCase()) {
    case "residential":
      return "bg-green-100 text-green-800 border-green-200";
    case "commercial":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "corporate":
      return "bg-purple-100 text-purple-800 border-purple-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function CustomersDataGrid({ 
  customers, 
  isLoading, 
  onRefresh, 
  onEdit, 
  onView 
}: CustomersDataGridProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
const [approveCustomer, setApproveCustomer] = useState<Customer | null>(null);
const [approvalRemarks, setApprovalRemarks] = useState("");
const [approvalAction, setApprovalAction] = useState<"approve" | "reject" | null>(null);
const [approveLoading, setApproveLoading] = useState(false);
const { user } = useAuthContext();
const { toast } = useToast();
const [retryLoadingId, setRetryLoadingId] = useState<number | null>(null);
const [approveLoadingId, setApproveLoadingId] = useState<number | null>(null);
  const handleViewDetails = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowDetailsModal(true);
    onView?.(customer);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedCustomer(null);
  };

  const handleEditFromModal = (customer: Customer) => {
    setShowDetailsModal(false);
    setSelectedCustomer(null);
    onEdit?.(customer);
  };

  const handleRetry = async (custId: number) => {
  setRetryLoadingId(custId);
  try {
    const { baseUrl } = getApiConfig();
    const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/customer/${custId}/retry`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-username": user?.username || "hh",
      "Authorization": `Bearer ${user?.accessToken || ""}`,
    };
    await apiRequest(url, "POST", {}, headers);
    toast({
      title: "Retry triggered",
      description: `Retry request sent for customer ${custId}`,
    });
    queryClient.invalidateQueries({ queryKey: ["/crm/v1/get/Customer"] });
  } catch (error: any) {
    toast({
      title: "Retry failed",
      description: error?.message || "Failed to retry customer onboarding",
      variant: "destructive",
    });
  }
  setRetryLoadingId(null);
};

const handleApproveOrReject = async (action: "approve" | "reject") => {
  if (!approveCustomer) return;
  if (action === "reject" && !approvalRemarks.trim()) return;
  setApproveLoading(true);
  try {
    const { baseUrl } = getApiConfig();
    const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/customer/approve`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-username": user?.username || "hh",
      "Authorization": `Bearer ${user?.accessToken || ""}`,
    };
    const body = {
      custId: String(approveCustomer.custId),
      customerStage: action === "approve" ? "APPROVED" : "REJECTED",
      remark: approvalRemarks.trim() || (action === "approve" ? "Verified and approved by admin" : "Rejected by admin"),
    };
    await apiRequest(url, "POST", body, headers);
    toast({
      title: action === "approve" ? "Customer Approved" : "Customer Rejected",
      description: `Customer ${approveCustomer.custId} ${action === "approve" ? "approved" : "rejected"} successfully.`,
    });
    setShowApproveModal(false);
    setApproveCustomer(null);
    setApprovalRemarks("");
    setApprovalAction(null);
    setApproveLoading(false);
if (typeof onRefresh === "function") {
    onRefresh(); // <-- Refresh the list
  }  } catch (error: any) {
    toast({
      title: "Action failed",
      description: error?.message || "Failed to process approval/rejection",
      variant: "destructive",
    });
  }
  setApproveLoading(false);
};

const handleApprove = async (custId: number) => {
  setApproveLoadingId(custId);
  try {
    const { baseUrl } = getApiConfig();
    const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/customer/approve`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-username": user?.username || "hh",
      "Authorization": `Bearer ${user?.accessToken || ""}`,
    };
    const body = {
      custId: String(custId),
      customerStage: "APPROVED",
      remark: "Verified and approved by admin"
    };
    await apiRequest(url, "POST", body, headers);
    toast({
      title: "Customer Approved",
      description: `Customer ${custId} approved successfully.`,
    });
    queryClient.invalidateQueries({ queryKey: ["/crm/v1/get/Customer"] });
  } catch (error: any) {
    toast({
      title: "Approval failed",
      description: error?.message || "Failed to approve customer",
      variant: "destructive",
    });
  }
  setApproveLoadingId(null);
};

  const columnHelper = createColumnHelper<Customer>();

  const columns = useMemo<ColumnDef<Customer, any>[]>(
    () => [
      {
    header: "Onboarding ID",
    accessorKey: "onbId",
    cell: info => info.getValue() || "-",
  },
      columnHelper.accessor("firstName", {
        header: "Name",
        cell: (info) => (
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {info.row.original.firstName} {info.row.original.lastName}
            </span>
            <span className="text-sm text-gray-500">{info.row.original.email || "No email"}</span>
          </div>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("phone", {
        header: "Contact",
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">{info.getValue()}</span>
            <span className="text-xs text-gray-500">{info.row.original.mobile}</span>
          </div>
        ),
        enableSorting: true,
      }),
      // columnHelper.accessor("serviceType", {
      //   header: "Service Type",
      //   cell: (info) => (
      //     <Badge className={`${getServiceTypeColor(info.getValue())} text-xs`}>
      //       {info.getValue()}
      //     </Badge>
      //   ),
      //   enableSorting: true,
      // }),
      columnHelper.accessor("accountClass", {
        header: "Account Class",
        cell: (info) => (
          <Badge className={`${getStatusColor(info.getValue())} text-xs`}>
            {info.getValue()}
          </Badge>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("connectionType", {
        header: "Connection",
        cell: (info) => (
          <span className="text-sm text-gray-900">{info.getValue()}</span>
        ),
        enableSorting: true,
      }),
      columnHelper.accessor("region", {
        header: "Location",
        cell: (info) => (
          <div className="flex flex-col">
            <span className="text-sm text-gray-900">{info.row.original.city}</span>
            <span className="text-xs text-gray-500">{info.getValue()}, {info.row.original.country}</span>
          </div>
        ),
        enableSorting: true,
      }),
      
      {
    header: "Created Date",
    accessorKey: "createDt",
    cell: info => {
      const dateStr = info.getValue() as string;
      // Format date if needed
      return dateStr ? format(new Date(dateStr), "yyyy-MM-dd") : "-";
    },
  },
  {
    header: "Created By",
    accessorKey: "createId",
    cell: info => info.getValue() || "-",
  },
      columnHelper.accessor("customerStage", {
  header: "Status",
  cell: (info) => (
    <Badge className="text-xs">
      {info.getValue()}
    </Badge>
  ),
}),
      columnHelper.display({
  id: "actions",
  header: "Actions",
  cell: (info) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-blue-50"
        onClick={() => handleViewDetails(info.row.original)}
        title="View Details"
      >
        <Eye className="h-4 w-4 text-blue-600" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-green-50"
        onClick={() => onEdit?.(info.row.original)}
        title="Edit Customer"
      >
        <Edit className="h-4 w-4 text-green-600" />
      </Button>
      {info.row.original.customerStage === "RETRY" && (
        <Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 p-0 hover:bg-yellow-50"
  onClick={() => {
    if (info.row.original.custId !== undefined) {
      handleRetry(info.row.original.custId);
    }
  }}
  title="Retry"
  disabled={retryLoadingId === info.row.original.custId}
>
          <RefreshCw className={`h-4 w-4 text-yellow-600 ${retryLoadingId === info.row.original.custId ? "animate-spin" : ""}`} />
        </Button>
      )}
      {info.row.original.customerStage === "CAPTURED" && (
        <Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 p-0 hover:bg-green-50"
  onClick={() => {
    setApproveCustomer(info.row.original);
    setShowApproveModal(true);
    setApprovalRemarks("");
    setApprovalAction(null);
  }}
  title="Approve"
  disabled={approveLoadingId === info.row.original.custId}
>
  <ShieldCheck className={`h-4 w-4 text-green-600 ${approveLoadingId === info.row.original.custId ? "animate-spin" : ""}`} />
</Button>
      )}
    </div>
  ),
}),
    ],
    [onEdit, onView, handleViewDetails]
  );

  const table = useReactTable({
    data: customers || [],
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Get unique values for filters
  const uniqueServiceTypes = useMemo(() => 
    Array.from(new Set(customers?.map(customer => customer.serviceType).filter(Boolean))), 
    [customers]
  );
  
  const uniqueRegions = useMemo(() => 
    Array.from(new Set(customers?.map(customer => customer.region).filter(Boolean))), 
    [customers]
  );

  // Apply filters
  useMemo(() => {
    const filters = [];
    if (serviceTypeFilter && serviceTypeFilter !== "all") {
      filters.push({ id: "serviceType", value: serviceTypeFilter });
    }
    if (regionFilter && regionFilter !== "all") {
      filters.push({ id: "region", value: regionFilter });
    }
    setColumnFilters(filters);
  }, [serviceTypeFilter, regionFilter]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-azam-blue" />
            <span className="ml-2 text-gray-600">Loading customers...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <CardTitle className="text-lg">Registered Customers</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search customers by name, email, or phone..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                {uniqueServiceTypes.map((serviceType) => (
                  <SelectItem key={serviceType} value={serviceType}>
                    {serviceType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {uniqueRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center space-x-1 ${
                            header.column.getCanSort() ? "cursor-pointer select-none" : ""
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <span>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === "desc" ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : header.column.getIsSorted() === "asc" ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronsUpDown className="h-4 w-4" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border border-gray-200 px-4 py-3 whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 mt-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-700">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{" "}
              of {table.getFilteredRowModel().rows.length} results
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Customer Details Modal */}
    <CustomerDetailsModal
      customer={selectedCustomer}
      isOpen={showDetailsModal}
      onClose={handleCloseModal}
      onEdit={handleEditFromModal}
    />
    {showApproveModal && approveCustomer && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
        onClick={() => setShowApproveModal(false)}
      >
        <X className="h-6 w-6" />
      </button>
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-green-600" />
        <span className="text-xl font-bold">Customer Approval</span>
      </div>
      <div className="mb-4">
        <div className="font-medium text-gray-900">{approveCustomer.firstName} {approveCustomer.lastName}</div>
        <div className="text-xs text-gray-500">Customer ID: {approveCustomer.custId}</div>
        <div className="text-xs text-gray-500">Stage: {approveCustomer.customerStage}</div>
      </div>
      <div className="mb-4">
        <Label htmlFor="approvalRemarks" className="font-medium">Remarks {approvalAction === "reject" && <span className="text-red-500">*</span>}</Label>
        <textarea
          id="approvalRemarks"
          className="w-full border rounded p-2 mt-1 text-sm"
          rows={3}
          value={approvalRemarks}
          onChange={e => setApprovalRemarks(e.target.value)}
          placeholder="Enter remarks..."
        />
        {approvalAction === "reject" && !approvalRemarks.trim() && (
          <div className="text-xs text-red-500 mt-1">Remarks are required for rejection.</div>
        )}
      </div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setApprovalAction("reject");
            if (!approvalRemarks.trim()) return;
            handleApproveOrReject("reject");
          }}
          disabled={approveLoading || (approvalAction === "reject" && !approvalRemarks.trim())}
        >
          Reject
        </Button>
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => {
            setApprovalAction("approve");
            handleApproveOrReject("approve");
          }}
          disabled={approveLoading}
        >
          Approve
        </Button>
      </div>
    </div>
  </div>
)}
    </>
  );
}