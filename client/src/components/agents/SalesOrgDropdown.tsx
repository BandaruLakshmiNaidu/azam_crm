// src/components/agents/SalesOrgDropdown.tsx
import { useMemo, useEffect } from "react";
import { Controller } from "react-hook-form";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useOnboardingDropdowns } from "@/hooks/useOnboardingDropdowns";

interface SalesOrgDropdownProps {
  control: any;
  watch: any;
  setValue: any;
  errors: any;
}

export default function SalesOrgDropdown({ control, watch, setValue, errors }: SalesOrgDropdownProps) {
  const { data: dropdowns, isLoading } = useOnboardingDropdowns();
  const selectedCountry = watch("country");

  // Extract salesOrg options safely
  const salesOrgOptions = useMemo(() => {
    if (!dropdowns?.salesOrg) return [];
    return dropdowns.salesOrg;
  }, [dropdowns]);

  // Filter salesOrg by selected country
  const filteredSalesOrg = useMemo(() => {
    if (!selectedCountry) return salesOrgOptions;
    return salesOrgOptions.filter(org => org.country === selectedCountry);
  }, [salesOrgOptions, selectedCountry]);

  // Auto-select if only one option
  useEffect(() => {
    if (filteredSalesOrg.length === 1) {
      setValue("salesOrg", filteredSalesOrg[0].value);
    }
  }, [filteredSalesOrg, setValue]);

  return (
    <Controller
      name="salesOrg"
      control={control}
      render={({ field }) => (
        <div>
          <Label htmlFor="salesOrg">Sales Org</Label>
          <Select
            {...field}
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={isLoading || filteredSalesOrg.length === 0}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select Sales Org" />
            </SelectTrigger>
            <SelectContent>
              {filteredSalesOrg.length === 0 && (
                <SelectItem value="" disabled>
                  No Sales Org available
                </SelectItem>
              )}
              {filteredSalesOrg.map(org => (
                <SelectItem key={org.value} value={org.value}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.salesOrg && (
            <p className="text-sm text-red-500 mt-1">{errors.salesOrg.message}</p>
          )}
        </div>
      )}
    />
  );
}