import React, { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import MultiStepCustomerForm from "@/components/forms/multi-step-customer-form";
import CustomersDataGrid from "@/components/customers/customers-data-grid";
import { getApiConfig } from "@/lib/config";
import { apiRequest } from "@/lib/queryClient";
import CustomerDetailsModal from "@/components/customers/customer-details-modal";

// --- API Integration for Customer List ---
async function fetchCustomerList(user: any) {
  const { baseUrl } = getApiConfig();
  const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/get/Customer`;
  const payload = {
    customerId: 0,
    userName: "",
    userType: "",
    sapBpId: "",
    firstName: "",
    offSet: "0",
    limit: "100"
  };
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-username": user?.username || "hh",
    "Authorization": `Bearer ${user?.accessToken || ""}`,
  };
  return await apiRequest(url, "POST", payload, headers);
}

// --- API Integration for Customer Registration ---
async function registerCustomer(formData: any, user: any) {
  const { baseUrl } = getApiConfig();
  const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/customer/registration`;

  // Map formData to API payload as per your backend requirements
  const payload = {
    salutation: formData.title,
    firstName: formData.firstName,
    middleName: formData.middleName || null,
    lastName: formData.lastName,
    phone: formData.phone || null,
    mobile: formData.mobile,
    email: formData.email,
    fax: formData.fax || null,
    currency: formData.currency || "TZS",
    customerType: formData.customerType,
    division: formData.division,
    salesOrg: formData.salesOrg,
    dob: formData.dateOfBirth ? formData.dateOfBirth.replace(/-/g, "") : null, // "YYYYMMDD"
    gender: formData.gender,
    race: formData.race || null,
    countryInst: formData.countryInst,
    regionInst: formData.regionInst,
    cityInst: formData.cityInst,
    districtInst: formData.districtInst,
    wardInst: formData.wardInst,
    address1Inst: formData.address1Inst,
    address2Inst: formData.address2Inst || null,
    pinCodeInst: formData.postalCodeInst,

    country: formData.billingCountry,
    region: formData.billingRegion,
    city: formData.billingCity,
    district: formData.billingDistrict,
    ward: formData.billingWard,
    address1: formData.billingAddress1,
    address2: formData.billingAddress2 || null,
    pinCode: formData.billingPostalCode,
    azamPesaId: formData.azamPayId,
    azamMaxTv: formData.azamMaxTvId,
    tinNo: formData.ctinNumber,
    vrnNo: formData.cvrnNumber,
    remark: formData.remark || "",
    poiDocId: null,
    poiDocNo: formData.kycDocNoPOI || null,
    poaDocId: null,
    poaDocNo: formData.kycDocNoPOA || null,
    parentBpId: formData.parentCustomerId || null,
    serviceType: formData.serviceType,
    accountClass: formData.accountClass,
    isChild: formData.isChild || false,
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-username": user?.username || "hh",
    "Authorization": `Bearer ${user?.accessToken || ""}`,
  };

  return await apiRequest(url, "POST", payload, headers);
}

export default function CustomerRegistration() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
const [viewCustomer, setViewCustomer] = useState<any>(null);
const [showViewModal, setShowViewModal] = useState(false);
  // Fetch customers from real API
  const getCustomers = async () => {
  setIsLoading(true);
  try {
    const result = await fetchCustomerList(user);
    // Defensive: result?.data?.data is the array
    setCustomers(Array.isArray(result?.data?.data) ? result.data.data : []);
  } catch (error: any) {
    toast({
      title: "Error",
      description: error?.message || "Failed to fetch customers",
      variant: "destructive",
    });
  }
  setIsLoading(false);
};

  // Fetch on mount
  useEffect(() => {
    if (user) getCustomers();
    // eslint-disable-next-line
  }, [user]);

  // --- Customer Registration Handler ---
  const handleCustomerSubmit = async (formData: any) => {
    setIsLoading(true);
    try {
      const result = await registerCustomer(formData, user);
      toast({
        title: "Success",
        description: result?.statusMessage || "Customer registered successfully",
      });
      setShowForm(false);
      setEditingCustomer(null);
      getCustomers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.statusMessage || "Failed to register customer",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  if (showForm || editingCustomer) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingCustomer
              ? `Edit Customer - ${editingCustomer.firstName} ${editingCustomer.lastName}`
              : "New Customer Registration"}
          </h2>
          <Button
            variant="outline"
            onClick={() => {
              setShowForm(false);
              setEditingCustomer(null);
            }}
            className="text-sm w-full sm:w-auto"
          >
            Back to List
          </Button>
        </div>

        <MultiStepCustomerForm
          onSubmit={handleCustomerSubmit}
          isLoading={isLoading}
          defaultValues={editingCustomer || undefined}
          isEdit={!!editingCustomer}
        />
      </div>
    );
  }

  const handleView = (customer: any) => {
setViewCustomer(customer);
  setShowViewModal(true);
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
  setShowForm(true);
  };

  const handleRefresh = () => {
    getCustomers();
  };

  const handleExport = () => {
  if (!customers || customers.length === 0) return;
  const csv = [
    [
      "Customer ID",
      "Name",
      "Email",
      "Mobile",
      "Type",
      "Region",
      "Account Class",
      "Status"
    ].join(","),
    ...customers.map((c: any) =>
      [
        c.id,
        `"${c.firstName || ""} ${c.lastName || ""}"`,
        c.email || "",
        c.mobile || "",
        c.customerType || "",
        c.region || "",
        c.accountClass || "",
        c.status || ""
      ].join(",")
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "customers.csv";
  a.click();
  URL.revokeObjectURL(url);
};

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-lg font-semibold text-gray-900">Registered Customers</h2>
        <Button className="btn-primary w-full sm:w-auto" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Customer
        </Button>
        
      </div>

      {isLoading ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">Loading customers...</p>
        </div>
      ) : !customers || customers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">No customers registered yet</p>
          <Button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Customer
          </Button>
        </div>
      ) : (
        <CustomersDataGrid
 customers={customers}
  isLoading={isLoading}
  onRefresh={handleRefresh}
  onView={handleView}
  onEdit={handleEdit}
/>

      )}
    </div>
  );
  <CustomerDetailsModal
  customer={viewCustomer}
  isOpen={showViewModal}
  onClose={() => setShowViewModal(false)}
  onEdit={(customer) => {
    setShowViewModal(false);
    setEditingCustomer(customer);
    setShowForm(true);
  }}
/>
}