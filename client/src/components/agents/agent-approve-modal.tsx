import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getApiConfig } from "@/lib/config";
import { useAuthContext } from "@/context/AuthProvider";

interface Agent {
  agentId: number;
  firstName?: string;
  lastName?: string;
  salutation?: string;
  email?: string;
  mobile?: string;
  agentStage?: string;
}

interface AgentApproveModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AgentApproveModal({ agent, isOpen, onClose, onSuccess }: AgentApproveModalProps) {
  const [remark, setRemark] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthContext();
  const { baseUrl } = getApiConfig();

  if (!agent) return null;

  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    if (action === "REJECTED" && !remark.trim()) {
      toast({ title: "Remark is required for rejection", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/agents/approve`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-auth-username": user?.username || "hh",
        "Authorization": `Bearer ${user?.accessToken || ""}`,
      };
      const body = {
        agentId: agent.agentId,
        agentStage: action,
        remark: action === "APPROVED" ? "Onboarding Approved" : remark,
      };
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error("Failed to update agent status");
      const result = await res.json();
      if (result.status !== "SUCCESS") throw new Error(result.statusMessage || "Failed to update agent status");
      toast({ title: "Success", description: result.statusMessage || "Agent status updated" });
      setIsLoading(false);
      onClose();
      onSuccess?.();
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update agent status", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-2 py-1">Approval Required</Badge>
          </DialogTitle>
          <DialogDescription>
            Please approve or reject the onboarding for this agent.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded p-3 mb-2">
            <div className="font-semibold text-gray-900 mb-1">
              {agent.salutation} {agent.firstName} {agent.lastName}
            </div>
            <div className="text-xs text-gray-500">Agent ID: {agent.agentId}</div>
            <div className="text-xs text-gray-500">Email: {agent.email}</div>
            <div className="text-xs text-gray-500">Mobile: {agent.mobile}</div>
            <div className="text-xs text-gray-500">Stage: {agent.agentStage}</div>
          </div>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center text-base font-semibold"
              disabled={isLoading}
              onClick={() => handleAction("APPROVED")}
            >
              <CheckCircle className="h-5 w-5 mr-2" />
              Approve
            </Button>
            <div className="space-y-2">
              <Input
                placeholder="Enter rejection remark (required)"
                value={remark}
                onChange={e => setRemark(e.target.value)}
                className="border-red-300"
                disabled={isLoading}
              />
              <Button
                className="w-full bg-red-600 hover:bg-red-700 flex items-center justify-center text-base font-semibold"
                disabled={isLoading}
                onClick={() => handleAction("REJECTED")}
              >
                <XCircle className="h-5 w-5 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}