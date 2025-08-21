// client/src/hooks/use-center-data.ts
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import { getApiConfig } from "@/lib/config";
import { apiRequest } from "@/lib/queryClient";

interface CenterAPIParams {
  distinctType: "country" | "region" | "city" | "district" | "ward";
  country?: string;
  region?: string;
  city?: string;
  district?: string;
  status?: "ACTIVE";
}

const fetchCenterData = async (user: any, params: CenterAPIParams) => {
  console.log(`[CenterData] Fetching: ${params.distinctType}`, params);

  const { baseUrl } = getApiConfig();
  const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/get/Center`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-auth-username": user?.username || "hh",
    "Authorization": `Bearer ${user?.accessToken || ""}`,
  };

  const body = {
    distinctType: params.distinctType,
    status: "ACTIVE",
    country: params.country || "",
    region: params.region || "",
    city: params.city || "",
    district: params.district || "",
    centerId: "",
    countryId: "",
    countryCode: "",
    zone: "",
    ward: "",
  };

  try {
    const result = await apiRequest(url, "POST", body, headers);

    console.log("[CenterData] Raw API Response:", result);

    if (result.status !== "SUCCESS" || !result.data || !Array.isArray(result.data.data)) {
      console.error("[CenterData] API response structure is invalid or not successful.", result);
      throw new Error(result.statusMessage || `Failed to fetch ${params.distinctType}`);
    }

    const dataArray = result.data.data;
    console.log("[CenterData] Found data array:", dataArray);

    const extractedData = dataArray.filter((item: any) => item && typeof item === 'object');


    console.log(`[CenterData] Extracted data for ${params.distinctType}:`, extractedData);

    if (extractedData.length === 0 && dataArray.length > 0) {
        console.warn(`[CenterData] Warning: Extracted data is empty, but the source array was not. This might indicate a key mismatch. The key used was '${params.distinctType}'. Check the objects in the "Found data array" log above.`);
    }

    return extractedData;
  } catch (error) {
    console.error(`[CenterData] An error occurred during fetch for ${params.distinctType}:`, error);
    throw error;
  }
};

export const useCountries = () => {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: ["center-data", "countries"],
    queryFn: () => fetchCenterData(user, { distinctType: "country" }),
    enabled: !!user,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

export const useRegions = (country?: string) => {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: ["center-data", "regions", country],
    queryFn: () => fetchCenterData(user, { distinctType: "region", country }),
    enabled: !!user && !!country,
    staleTime: 1000 * 60 * 60,
  });
};

interface City {
  cityCode: string;
  city: string;
  // other fields if needed
}

export const useCities = (country?: string, region?: string) => {
  const { user } = useAuthContext();
  return useQuery<City[]>({
    queryKey: ["center-data", "cities", country, region],
    queryFn: () => fetchCenterData(user, { distinctType: "city", country, region }),
    enabled: !!user && !!country && !!region,
    staleTime: 1000 * 60 * 60,
  });
};

export const useDistricts = (country?: string, region?: string, city?: string) => {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: ["center-data", "districts", country, region, city],
    queryFn: () => fetchCenterData(user, { distinctType: "district", country, region, city }),
    enabled: !!user && !!country && !!region && !!city,
    staleTime: 1000 * 60 * 60,
  });
};

export const useWards = (country?: string, region?: string, city?: string, district?: string) => {
  const { user } = useAuthContext();
  return useQuery({
    queryKey: ["center-data", "wards", country, region, city, district],
    queryFn: () => fetchCenterData(user, { distinctType: "ward", country, region, city, district }),
    enabled: !!user && !!country && !!region && !!city && !!district,
    staleTime: 1000 * 60 * 60,
  });
};