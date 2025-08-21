// /client/src/utils/data-mappers.ts

import type { AgentFormData } from "@/components/forms/multi-step-agent-form";

export interface AgentApiData {
  tinNo?: string | null;
  vrnNo?: string | null;
  addressOne?: string | null;
  addressTwo?: string | null;
  pincode?: string | null;
  type?: string | null;
  division?: string | null;
  salutation?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  mobile?: string | null;
  phone?: string | null;
  fax?: string | null;
  gender?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
  district?: string | null;
  ward?: string | null;
  commission?: string | null;
  currency?: string | null;
  [key: string]: any;
}

export function mapApiToFormData(apiData: AgentApiData): AgentFormData {
  return {
    ...apiData,
    tinNumber: apiData.tinNo ?? "",
    vrnNumber: apiData.vrnNo ?? "",
    address1: apiData.addressOne ?? "",
    address2: apiData.addressTwo ?? "",
    postalCode: apiData.pincode ?? "",
    title: apiData.salutation ?? "",
    firstName: apiData.firstName ?? "",
    lastName: apiData.lastName ?? "",
    email: apiData.email ?? "",
    mobile: apiData.mobile ?? "",
    type: apiData.type ?? "",
    phone: apiData.phone ?? "",
    fax: apiData.fax ?? "",
    country: apiData.country ?? "",
    region: apiData.region ?? "",
    city: apiData.city ?? "",
    district:apiData.district ?? "",
    ward: apiData.ward ?? "",   
    currency: apiData.currency ?? "", 
    commission: apiData.commValue ?? "",
    gender: apiData.gender ?? "",
    division: apiData.division ?? "",
    salesOrg: ""
};
}