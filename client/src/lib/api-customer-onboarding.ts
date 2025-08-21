// src/lib/api-customer-onboarding.ts

import { getApiConfig } from "@/lib/config";
import { apiRequest } from "@/lib/queryClient";
import { useAuthContext } from "@/context/AuthProvider";

// Utility to map your form data to the API payload
export function mapCustomerFormToApiPayload(formData: any) {
  return {
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
    country: formData.country,
    region: formData.region,
    city: formData.city,
    district: formData.district,
    ward: formData.ward,
    address1: formData.address1,
    address2: formData.address2 || null,
    pinCode: formData.postalCode,
    azamPesaId: formData.azamPayId,
    azamMaxTv: formData.azamMaxTvId,
    tinNo: formData.ctinNumber ?? "",
    vrnNo: formData.cvrnNumber ?? "",
    remark: formData.remark || "",
    poiDocId: null, // You can update if you have file upload logic
    poiDocNo: formData.kycDocNoPOI || null,
    poaDocId: null, // You can update if you have file upload logic
    poaDocNo: formData.kycDocNoPOA || null,
    parentBpId: formData.parentCustomerId || null,
    serviceType: formData.serviceType,
    accountClass: formData.accountClass,
    isChild: formData.isChild || false,
  };
}

// Main function to call the API
export async function registerCustomer(formData: any, user: any) {
  const { baseUrl } = getApiConfig();
  const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/customer/registration`;

  const payload = mapCustomerFormToApiPayload(formData);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-username": user?.username || "hh",
    "Authorization": `Bearer ${user?.accessToken || ""}`,
  };

  return await apiRequest(url, "POST", payload, headers);
}