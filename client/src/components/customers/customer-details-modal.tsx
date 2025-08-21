  import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
  import { Badge } from "@/components/ui/badge";
  import { Button } from "@/components/ui/button";
  import { User, Mail, Phone, MapPin, Building2, FileText, Calendar, CreditCard, Edit, X, Settings } from "lucide-react";
  import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
  import type { Customer } from "@shared/schema";



  interface CustomerDetailsModalProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onEdit?: (customer: Customer) => void;
  }

  export default function CustomerDetailsModal({ customer, isOpen, onClose, onEdit }: CustomerDetailsModalProps) {
    if (!customer) return null;

    const fullName = `${customer.title || ""} ${customer.firstName || ""} ${customer.lastName || ""}`.trim();

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-6 w-6 text-azam-blue" />
                Customer Details
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onEdit?.(customer)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
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
                  <User className="h-5 w-5 text-azam-blue" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="font-semibold text-gray-900 mb-1">{fullName}</div>
                <div className="text-xs text-gray-500">Customer Type: {customer.customerType}</div>
                <div className="text-xs text-gray-500">Account Class: {customer.accountClass}</div>
                <div className="text-xs text-gray-500">Gender: {customer.gender}</div>
                <div className="text-xs text-gray-500">Mobile: {customer.mobile}</div>
                <div className="text-xs text-gray-500">Phone: {customer.phone || "N/A"}</div>
                <div className="text-xs text-gray-500">Email: {customer.email || "N/A"}</div>
                <div className="text-xs text-gray-500">SAP BP ID: {customer.sapBpId || "N/A"}</div>
                <div className="text-xs text-gray-500">SAP CA ID: {customer.sapCaId || "N/A"}</div>

              </CardContent>
            </Card>
            {/* Address Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-azam-blue" />
                  Address Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-500">Country: {customer.country}</div>
                <div className="text-xs text-gray-500">Region: {customer.region}</div>
                <div className="text-xs text-gray-500">City: {customer.city}</div>
                <div className="text-xs text-gray-500">District: {customer.district}</div>
                <div className="text-xs text-gray-500">Ward: {customer.ward}</div>
                <div className="text-xs text-gray-500">Address 1: {customer.address1}</div>
                <div className="text-xs text-gray-500">Address 2: {customer.address2 || "N/A"}</div>
                <div className="text-xs text-gray-500">Postal Code: {customer.postalCode || "N/A"}</div>
              </CardContent>
            </Card>
            {/* Service & Financial */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-azam-blue" />
                  Service & Financial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-500">Service Type: {customer.serviceType}</div>
                <div className="text-xs text-gray-500">TIN Number: {customer.ctinNumber || "N/A"}</div>
                <div className="text-xs text-gray-500">VRN Number: {customer.cvrnNumber || "N/A"}</div>
                <div className="text-xs text-gray-500">Currency: {customer.currency}</div>
              </CardContent>
            </Card>
            {/* KYC Documents */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-azam-blue" />
                  KYC Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs text-gray-500">POI Doc No: {customer.kycDocNoPOI || "N/A"}</div>
                <div className="text-xs text-gray-500">POA Doc No: {customer.kycDocNoPOA || "N/A"}</div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }