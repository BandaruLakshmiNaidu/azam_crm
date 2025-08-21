// src/hooks/useOnboardingDropdowns.ts
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import { getApiConfig } from "@/lib/config";
import { apiRequest } from "@/lib/queryClient";

export interface OnboardingDropdowns {
  accountClass: { name: string; value: string }[];
  division: { name: string; value: string }[];
  salesOrg: { name: string; value: string; country: string }[];
  customerType: { name: string; value: string }[];
  agentType: { name: string; value: string }[];
  salutationType: { name: string; value: string }[];
  customerStatus: { name: string; value: string }[];
  genderType: { name: string; value: string }[];
}

export const useOnboardingDropdowns = () => {
  const { user } = useAuthContext();
  const { baseUrl } = getApiConfig();

  return useQuery<OnboardingDropdowns>({
    queryKey: ["onboarding-dropdowns"],
    queryFn: async () => {
      const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/onboarding/dropdowns`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-auth-username": user?.username || "hh",
        "Authorization": `Bearer ${user?.accessToken || ""}`,
      };
      const response = await apiRequest(url, "GET", undefined, headers);
      console.log("API response from onboarding dropdowns:", response);  // <-- Add this line
      return response.data;
    },
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });
};