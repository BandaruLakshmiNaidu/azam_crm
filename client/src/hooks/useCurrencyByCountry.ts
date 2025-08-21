import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/context/AuthProvider";
import { getApiConfig } from "@/lib/config";
import { apiRequest } from "@/lib/queryClient";

export interface CurrencyData {
  currencyID: number;
  currencyName: string;
  currencySym: string;
  currencyCode: string;
  countryCode: string;
  countryName: string;
}

export const useCurrencyByCountry = (countryName?: string) => {
  const { user } = useAuthContext();
  const { baseUrl } = getApiConfig();

  return useQuery<CurrencyData | null>({
    queryKey: ["currency", countryName],
    queryFn: async () => {
      if (!countryName) return null;

      const url = `${baseUrl.replace(/\/$/, "")}/crm/v1/get/Currency`;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-auth-username": user?.username || "hh",
        "Authorization": `Bearer ${user?.accessToken || ""}`,
      };
      const body = {
        countryName,
        status: "",
        currencyCode: ""
      };

      const response = await apiRequest(url, "POST", body, headers);
      return response.data?.data?.[0] ?? null;
    },
    enabled: !!countryName,
    staleTime: 1000 * 60 * 60, // cache for 1 hour
  });
};