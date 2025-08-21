import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import MultiStepAgentForm from "@/components/forms/multi-step-agent-form";
import AgentsDataGrid from "@/components/agents/agents-data-grid";
import AgentDetailsModal from "@/components/agents/agent-details-modal";
import { useAuthContext } from "@/context/AuthProvider";
import { getApiConfig } from "@/lib/config";
import type { Agent }   from "@/components/agents/agents-data-grid"; // or wherever your Agent type is
import AgentApproveModal from "@/components/agents/agent-approve-modal";

export default function AgentOnboarding() {
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  
const [originalAgent, setOriginalAgent] = useState<Agent | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [approveAgent, setApproveAgent] = useState<Agent | null>(null);
const [showApproveModal, setShowApproveModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const { baseUrl } = getApiConfig();

  // Fetch agents (list or search)
  const { data, isLoading ,refetch } = useQuery({
    queryKey: ["/crm/v1/fetch/agents", searchTerm, statusFilter, regionFilter, page, pageSize],
    queryFn: async () => {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${user?.accessToken || ""}`,
      };
      if (searchTerm.trim()) {
        // Search API
        const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/agents/search`;
        const body = {
          search: searchTerm,
          offSet: ((page - 1) * pageSize).toString(),
          limit: pageSize.toString(),
        };
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error("Failed to search agents");
        const result = await res.json();
        if (result.status !== "SUCCESS") throw new Error(result.statusMessage || "Failed to search agents");
        return result.data;
      } else {
        // List API
        const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/fetch/agents`;
        const body = {
          ipuserId: "",
          ipRegion: regionFilter === "all" ? "" : regionFilter,
          agentId: 0,
          offSet: ((page - 1) * pageSize).toString(),
          limit: pageSize.toString(),
          ipRoleType:"ADMIN",
          status: statusFilter === "all" ? "" : statusFilter,
        };
        const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
        if (!res.ok) throw new Error("Failed to fetch agents");
        const result = await res.json();
        if (result.status !== "SUCCESS") throw new Error(result.statusMessage || "Failed to fetch agents");
        return result.data;
      }
    },
    
  });

  const agents = data?.data || [];
  const total = data?.totalRecordCount || 0;

  // --- API Integration for Onboarding ---
  const createAgentMutation = useMutation({
    mutationFn: async (agentData: any) => {
      const apiPayload = {
        parentId: agentData.parentId || null,
        salutation: agentData.salutation || agentData.title || "",
        firstName: agentData.firstName,
        lastName: agentData.lastName,
        gender: agentData.gender || "",
        mobile: agentData.mobile,
        email: agentData.email,
        country: agentData.country,
        region: agentData.region,
        city: agentData.city,
        district: agentData.district,
        ward: agentData.ward,
        address1: agentData.address1,
        address2: agentData.address2,
        tinNo: agentData.tinNumber,
        vrnNo: agentData.vrnNumber,
        currency: agentData.currency,
        type: agentData.type,
        remark: agentData.remark || "New agent onboarding",
        salesOrg: agentData.salesOrg || "TZ10",
        compCode: agentData.compCode || "COMP001",
        division: agentData.division || "11",
        commType: agentData.commType || "Percentage",
        commValue: agentData.commValue || "5",
        pinCode: agentData.postalCode || "",
      };

      const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/agents/registration`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-auth-username": user?.username || "hh",
        "Authorization": `Bearer ${user?.accessToken || ""}`,
      };

      return await apiRequest(url, "POST", apiPayload, headers);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/crm/v1/fetch/agents"] });
      toast({
        title: "Success",
        description: editingAgent
          ? "Agent has been updated successfully"
          : result?.statusMessage || "Agent has been onboarded successfully",
      });
      setShowForm(false);
      setEditingAgent(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: editingAgent
          ? "Failed to update agent"
          : error?.message || "Failed to onboard agent",
        variant: "destructive",
      });
    },
  });

  const handleApproveReject = (agent: Agent) => {
  setApproveAgent(agent);
  setShowApproveModal(true);
};

  const updateAgentMutation = useMutation({
  mutationFn: async ({ newData, oldData }: { newData: any; oldData: Agent }) => {
    const urlBase = baseUrl.replace(/\/$/, "");
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-auth-username": user?.username || "hh",
      "Authorization": `Bearer ${user?.accessToken || ""}`,
    };

    // Choose API endpoint based on agentStage
    const url =
      ["RELEASE_TO_CM", "COMPLETED"].includes(oldData.agentStage || "")
        ? `${urlBase}/crm/v1/agents/update`
        : `${urlBase}/crm/v1/agents/registration/update`;

    // Build payload (adjust if APIs differ)
    const payload = {
      agentId: oldData.agentId,
      sapBpId: oldData.sapBpId,
      sapCaId: oldData.sapCaId,
      ...newData,
    };

    return await apiRequest(url, "POST", payload, headers);
  },
  onSuccess: (result) => {
    queryClient.invalidateQueries({ queryKey: ["/crm/v1/fetch/agents"] });
    toast({
      title: "Success",
      description: "Agent has been updated successfully",
    });
    setShowForm(false);
    setEditingAgent(null);
    setOriginalAgent(null);
  },
  onError: (error: any) => {
    toast({
      title: "Error",
      description: error?.message || "Failed to update agent",
      variant: "destructive",
    });
  },
});

  if (showForm || editingAgent) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingAgent
              ? `Edit Agent - ${editingAgent.firstName} ${editingAgent.lastName}`
              : "New Agent Registration"}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingAgent(null);
            }}
            className="text-sm w-full sm:w-auto"
          >
            Back to List
          </Button>
        </div>

        <MultiStepAgentForm
          onSubmit={(data) => {
    if (editingAgent) {
      updateAgentMutation.mutate({ newData: data, oldData: editingAgent });
    } else {
      createAgentMutation.mutate(data);
    }
  }}
  isEdit={!!editingAgent}
  isLoading={createAgentMutation.isPending || updateAgentMutation.isPending}
  defaultValues={editingAgent || undefined}
  key={editingAgent?.agentId}
        />
      </div>
    );
  }

  const handleRefresh = () => {
  refetch();
    toast({ title: "Refreshing...", description: "Fetching latest agents list." });
    queryClient.invalidateQueries({ queryKey: ["/crm/v1/fetch/agents"] });
  };

  const handleEditAgent = (agent: Agent) => {
  setEditingAgent(agent);
  setOriginalAgent(agent); // Store the original agent for comparison
  setShowForm(true);
};

  const handleViewAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowDetails(true);
  };

  // Export to CSV
  const handleExport = () => {
    if (!agents || agents.length === 0) return;
    const csv = [
      ["Agent ID", "Name", "Email", "Mobile", "Type", "Region", "Status"].join(","),
      ...agents.map((a: Agent) =>
        [
          a.agentId,
          `"${a.salutation || ""} ${a.firstName || ""} ${a.lastName || ""}"`,
          a.email,
          a.mobile,
          a.type,
          a.region,
          a.status,
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "agents.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-lg font-semibold text-gray-900">Registered Agents</h2>
        <Button className="btn-primary w-full sm:w-auto" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Agent
        </Button>
      </div>
      {/* --- Add this loading block --- */}
      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Loading agents...</p>
        </div>
      ) : (
      <AgentsDataGrid
        agents={agents}
        isLoading={isLoading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        regionFilter={regionFilter}
        onRegionFilter={setRegionFilter}
        onRefresh={handleRefresh}
        onExport={handleExport}
        onEdit={handleEditAgent}
        onApproveReject={handleApproveReject}
        onView={agent => {
    setSelectedAgent(agent);
    setShowDetails(true);
  }}
      />
       )}
      <AgentDetailsModal
        agent={selectedAgent}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
      <AgentApproveModal
  agent={approveAgent}
  isOpen={showApproveModal}
  onClose={() => setShowApproveModal(false)}
  onSuccess={handleRefresh}
/>
    </div>
  );
}