import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Edit,Edit2 , Download, RefreshCw, Search, ShieldCheck, Info } from "lucide-react";
import { getApiConfig } from "@/lib/config";
import { useAuthContext } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
export interface Agent {
  createDt: string;
  createId: string;
  agentId: number;
  onbId?:string;
  firstName?: string;
  lastName?: string;
  salutation?: string;
  gender?: string;
  mobile?: string;
  phone?: string;
  fax?: string;
  email?: string;
  type?: string;
  region?: string;
  status?: string;
  agentStage?: string;
  addressOne?: string;
  addressTwo?: string;
  ward?: string;
  sapBpId?: string;
  sapCaId?: string | null;
  division?: string;
  country?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  tinNo?: string;
  vrnNo?: string;
  currency?: string;
  commission?: string;
  kycDocNoPOI?: string;
  kycDocNoPOA?: string;
  kycPoiFileName?: string;
  kycPoaFileName?: string;
  kycPoi?: FileList | File | null;
  kycPoa?: FileList | File | null;
}

interface AgentsDataGridProps {
  agents: Agent[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  statusFilter: string;
  onStatusFilter: (status: string) => void;
  regionFilter: string;
  onRegionFilter: (region: string) => void;
  onRefresh?: () => void;
  onExport?: () => void;
  onEdit?: (agent: Agent) => void;
  onView?: (agent: Agent) => void;
  onApproveReject?: (agent: Agent) => void;
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "success":
    case "active":
      return "bg-green-100 text-green-800 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "inactive":
      return "bg-gray-100 text-gray-800 border-gray-200";
    case "suspended":
    case "rejected":
      return "bg-red-100 text-red-800 border-red-200";
    case "retry":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const regionOptions = [
  { value: "all", label: "All Regions" },
  { value: "Central", label: "Central" },
  { value: "Coastal", label: "Coastal" },
  // ...add more as needed
];

const statusOptions = [
{ value: "all", label: "All Statuses" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CAPTURED", label: "Captured" },
  { value: "RETRY", label: "Retry" },
  { value: "FAILED", label: "Failed" },
  { value: "RELEASE_TO_CM", label: "Release to CM" },
  { value: "COMPLETED", label: "Completed" },
  { value: "APPROVED", label: "Approved" },
  { value: "PENDING", label: "Pending" },
];

export default function AgentsDataGrid({
  agents,
  isLoading,
  total,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchTerm,
  onSearch,
  statusFilter,
  onStatusFilter,
  regionFilter,
  onRegionFilter,
  onRefresh,
  onExport,
  onEdit,
  onApproveReject,
  onView,
}: AgentsDataGridProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [searchInput, setSearchInput] = useState(searchTerm);
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [retryLoadingId, setRetryLoadingId] = useState<number | null>(null);
const statusInfo: Record<string, { title: string; desc: string }> = {
  REJECTED: { title: "Rejected", desc: "This agent was rejected during onboarding." },
  CAPTURED: { title: "Captured", desc: "Agent data captured, pending approval." },
  RETRY: { title: "Retry", desc: "Retry onboarding due to previous failure." },
  FAILED: { title: "Failed", desc: "Onboarding failed due to an error." },
  RELEASE_TO_CM: { title: "Release to CM", desc: "Released to Contract Management." },
  COMPLETED: { title: "Completed", desc: "Onboarding completed successfully." },
  APPROVED: { title: "Approved", desc: "Agent has been approved." },
  PENDING: { title: "Pending", desc: "Onboarding is pending." },
};

  useEffect(() => {
    const timeout = setTimeout(() => onSearch(searchInput), 400);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  // Retry handler
  const handleRetry = async (agentId: number) => {
    setRetryLoadingId(agentId);
    try {
      const { baseUrl } = getApiConfig();
      const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/agents/${agentId}/retry`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-auth-username": user?.username || "hh",
        "Authorization": `Bearer ${user?.accessToken || ""}`,
      };
      await apiRequest(url, "POST", {}, headers);
      toast({
        title: "Retry triggered",
        description: `Retry request sent for agent ${agentId}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/crm/v1/fetch/agents"] });
    } catch (error: any) {
      toast({
        title: "Retry failed",
        description: error?.message || "Failed to retry agent onboarding",
        variant: "destructive",
      });
    }
    setRetryLoadingId(null);
  };

  const filteredAgents = agents.filter(agent => {
    const statusMatch = statusFilter === "all" || (agent.agentStage && agent.agentStage.toUpperCase() === statusFilter.toUpperCase());
    const regionMatch = regionFilter === "all" || (agent.region && agent.region === regionFilter);
    return statusMatch && regionMatch;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle className="text-lg">Registered Agents</CardTitle>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Button variant="outline" size="sm" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search agents by name, email, or phone..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={onStatusFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={onRegionFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {regionOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Agent ID</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CreatedDate</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="border border-gray-200 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.agentId} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3 text-sm">{agent.onbId}</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    {agent.salutation ? agent.salutation + " " : ""}
                    {agent.firstName} {agent.lastName}
                  </td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">{agent.email}</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">{agent.mobile}</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">{agent.type}</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">{agent.region}</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">{agent.createDt}</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">{agent.createId}</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
  <div className="flex items-center gap-1">
    <Badge className={`${getStatusColor(agent.agentStage || "")} text-xs`}>
      {agent.agentStage}
    </Badge>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0}>
            <Info className="h-4 w-4 text-blue-400 cursor-pointer" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3 bg-white border border-blue-200 shadow-lg rounded-lg">
          <div className="font-semibold text-blue-700 mb-1">
            {statusInfo[agent.agentStage?.toUpperCase() || ""]?.title || "Status Info"}
          </div>
          <div className="text-xs text-gray-700">
            {statusInfo[agent.agentStage?.toUpperCase() || ""]?.desc || "No info available for this status."}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
</td>
                  <td className="border border-gray-200 px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        onClick={() => onView?.(agent)}
                        title="View Details"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
  variant="ghost"
  size="sm"
  className="h-8 w-8 p-0 hover:bg-green-50"
  onClick={() => onEdit?.(agent)}
  title="Edit Agent"
>
  {["RELEASE_TO_CM", "COMPLETED"].includes(agent.agentStage || "") ? (
    <Edit className="h-4 w-4 text-green-600" />
  ) : (
    <Edit2 className="h-4 w-4 text-orange-600" /> // Different icon/color for other statuses
  )}
</Button>
                      {agent.agentStage?.toUpperCase() === "CAPTURED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-yellow-50"
                          onClick={() => onApproveReject?.(agent)}
                          title="Approve/Reject"
                        >
                          <ShieldCheck className="h-4 w-4 text-yellow-600" />
                        </Button>
                      )}
                      {agent.agentStage?.toUpperCase() === "RETRY" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-yellow-50"
                          onClick={() => handleRetry(agent.agentId)}
                          title="Retry"
                          disabled={retryLoadingId === agent.agentId}
                        >
                          <RefreshCw className={`h-4 w-4 text-yellow-600 ${retryLoadingId === agent.agentId ? "animate-spin" : ""}`} />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No agents found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-700">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} results
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={page === 1}>
              &laquo;
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>
              &lsaquo;
            </Button>
            <span className="text-sm text-gray-700">
              Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === Math.max(1, Math.ceil(total / pageSize))}>
              &rsaquo;
            </Button>
            <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, Math.ceil(total / pageSize)))} disabled={page === Math.max(1, Math.ceil(total / pageSize))}>
              &raquo;
            </Button>
            <Select value={String(pageSize)} onValueChange={v => onPageSizeChange(Number(v))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}