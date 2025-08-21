import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Mail, Phone, MapPin, Building2, CreditCard, FileText, Calendar, Globe, Banknote, Shield, Edit, X, UserCheck, MessageSquare, Hash, Upload
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export interface Agent {
  agentId: number;
  onbId?: string;
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
  kycPoi?: FileList | File | null; // <-- add if you want to preview file name
  kycPoa?: FileList | File | null; // <-- add if you want to preview file name
}

interface AgentDetailsModalProps {
  agent: Agent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (agent: Agent) => void;
}

const getStatusColor = (agentStage: string) => {
  switch (agentStage?.toUpperCase()) {
    case "RELEASE_TO_CM":
    case "RELEASED":
    case "RELEASED_TO_CM":
      return "bg-yellow-100 text-yellow-800 border-yellow-200"; // Yellow
    case "COMPLETED":
      return "bg-green-100 text-green-800 border-green-200"; // Green
    case "APPROVED":
      return "bg-teal-100 text-teal-800 border-teal-200"; // Teal
    case "PENDING":
      return "bg-blue-100 text-blue-800 border-blue-200"; // Blue
    case "REJECTED":
      return "bg-red-100 text-red-800 border-red-200"; // Red
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-800 border-purple-200"; // Purple
    case "SUSPENDED":
      return "bg-orange-100 text-orange-800 border-orange-200"; // Orange
    case "INACTIVE":
      return "bg-pink-100 text-pink-800 border-pink-200"; // Pink
    case "SUCCESS":
      return "bg-lime-100 text-lime-800 border-lime-200"; // Lime
    case "FAILED":
      return "bg-rose-100 text-rose-800 border-rose-200"; // Rose
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"; // Gray
  }
};

export default function AgentDetailsModal({ agent, isOpen, onClose, onEdit }: AgentDetailsModalProps) {
  if (!agent) return null;

  const fullName = `${agent.salutation || ""} ${agent.firstName || ""} ${agent.lastName || ""}`.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="h-6 w-6 text-azam-blue" />
              Agent Details
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(agent.agentStage || "")} text-sm px-3 py-1`}>
                {agent.agentStage}
              </Badge>
              {/* <Button variant="outline" size="sm" onClick={() => onEdit?.(agent)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button> */}
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5 text-azam-blue" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{fullName}</p>
                  <p className="text-sm text-gray-500">Agent ID: {agent.agentId}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.email}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.mobile}</p>
                  <p className="text-sm text-gray-500">Mobile</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.phone || "N/A"}</p>
                  <p className="text-sm text-gray-500">Phone</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.fax || "N/A"}</p>
                  <p className="text-sm text-gray-500">Fax</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.gender}</p>
                  <p className="text-sm text-gray-500">Gender</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.division || "N/A"}</p>
                  <p className="text-sm text-gray-500">Division</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
  <FileText className="h-4 w-4 text-gray-500" />
  <div>
    <p className="font-medium text-gray-900">{agent.sapBpId || "N/A"}</p>
    <p className="text-sm text-gray-500">SAP BP ID</p>
  </div>
</div>
<div className="flex items-center gap-3">
  <FileText className="h-4 w-4 text-gray-500" />
  <div>
    <p className="font-medium text-gray-900">{agent.sapCaId || "N/A"}</p>
    <p className="text-sm text-gray-500">SAP CA ID</p>
  </div>
</div>
            </CardContent>
          </Card>

          {/* Business/Address Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-azam-blue" />
                Business & Address Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.country || "N/A"}</p>
                  <p className="text-sm text-gray-500">Country</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.city || "N/A"}</p>
                  <p className="text-sm text-gray-500">City</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.district || "N/A"}</p>
                  <p className="text-sm text-gray-500">District</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.region || "N/A"}</p>
                  <p className="text-sm text-gray-500">Region</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.ward || "N/A"}</p>
                  <p className="text-sm text-gray-500">Ward</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.addressOne || "N/A"}</p>
                  <p className="text-sm text-gray-500">Address 1</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.addressTwo || "N/A"}</p>
                  <p className="text-sm text-gray-500">Address 2</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.postalCode || "N/A"}</p>
                  <p className="text-sm text-gray-500">Postal Code</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax/Financial Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Hash className="h-5 w-5 text-azam-blue" />
                Tax & Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.tinNo || "N/A"}</p>
                  <p className="text-sm text-gray-500">TIN No</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.vrnNo || "N/A"}</p>
                  <p className="text-sm text-gray-500">VRN</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Banknote className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.currency || "N/A"}</p>
                  <p className="text-sm text-gray-500">Currency</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Banknote className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.commission !== undefined ? agent.commission : "N/A"}</p>
                  <p className="text-sm text-gray-500">Commission Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Documents */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="h-5 w-5 text-azam-blue" />
                KYC Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.kycDocNoPOA || "N/A"}</p>
                  <p className="text-sm text-gray-500">POA Document Number</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.kycDocNoPOI || "N/A"}</p>
                  <p className="text-sm text-gray-500">POI Document Number</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.kycPoaFileName || "N/A"}</p>
                  <p className="text-sm text-gray-500">POA File</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Upload className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">{agent.kycPoiFileName || "N/A"}</p>
                  <p className="text-sm text-gray-500">POI File</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}