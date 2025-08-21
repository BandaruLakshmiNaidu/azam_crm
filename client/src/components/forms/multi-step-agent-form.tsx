import { useState, useRef, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAgentSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudUpload, FileText, User, MapPin, Hash, Upload, Building, Banknote, ChevronLeft, ChevronRight, FileText as FileTextIcon, X } from "lucide-react";
import type { z } from "zod";
import { Agent } from "../agents/agents-data-grid";
import AgentDetailsModal from "../agents/agent-details-modal";
import { trimAllStrings } from "@shared/utils";
import { useCities, useCountries, useDistricts, useRegions, useWards } from "@/hooks/use-center-data";
import { useOnboardingDropdowns } from "@/hooks/useOnboardingDropdowns";
import SalesOrgDropdown from "../agents/SalesOrgDropdown";
import { useCurrencyByCountry } from "@/hooks/useCurrencyByCountry";
import { AgentApiData, mapApiToFormData } from "@/utils/data-mappers";


export type AgentFormData = z.infer<typeof insertAgentSchema>;

interface MultiStepAgentFormProps {
  onSubmit: (data: AgentFormData) => void;
  isEdit?: boolean;
  isLoading?: boolean;
  defaultValues?: Partial<AgentFormData>;
}



const divisionOptions = [
  { value: "11", label: "DTH" },
  { value: "12", label: "DTT" },
  { value: "13", label: "OTT" },
  { value: "14", label: "Advertisement" },
  { value: "15", label: "Network" },
  { value: "16", label: "Others" },
];

const regionOptions = [
  { value: "Central", label: "Central" },
  { value: "Coastal", label: "Coastal" },
];

const cityOptions = [
  { value: "01", label: "Arusha" },
  { value: "02", label: "Dar es Salaam" },
  { value: "03", label: "Dodoma" },
  { value: "04", label: "Iringa" },
  { value: "05", label: "Kagera" },
];
const districtOptions = [
  { value: "Bahi", label: "Bahi" },
  { value: "Kinondoni", label: "Kinondoni" },
];
const wardOptions = [
  { value: "Babayu", label: "Babayu" },
  { value: "Kigogo", label: "Kigogo" },
];
const tabs = [
  { id: "general", name: "General Data", icon: User },
  { id: "personal", name: "Personal Details", icon: FileText },
  { id: "address", name: "Address Details", icon: MapPin },
  { id: "tax", name: "Tax Information", icon: Hash },
  { id: "financial", name: "Financial Settings", icon: Banknote },
  { id: "kyc", name: "KYC Documents", icon: Upload }
];

// Map each tab to its field names for validation
const tabFields: Record<string, (keyof AgentFormData)[]> = {
  general: ["type", "division", "parentId"],
  personal: ["title", "firstName", "lastName", "email", "mobile", "phone", "fax", "gender"],
  address: ["country", "region", "city", "district", "ward", "address1", "address2", "postalCode"],
  tax: ["tinNumber", "vrnNumber"],
  financial: ["currency", "commission"],
  kyc: ["kycDocNoPOI", "kycDocNoPOA"], // not required, so form only submits on click
};

interface SelectOptionsProps<T> {
  isLoading: boolean;
  isError: boolean;
  data?: T[];
  placeholder: string;
  valueKey: keyof T;
  labelKey: keyof T;
}

export function SelectOptions<T>({
  isLoading,
  isError,
  data,
  placeholder,
  valueKey,
  labelKey,
}: SelectOptionsProps<T>) {
  if (isLoading) return <SelectItem value="loading" disabled>Loading...</SelectItem>;
  if (isError) return <SelectItem value="error" disabled>Error loading options</SelectItem>;
  if (!data || data.length === 0) return <SelectItem value="empty" disabled>{placeholder}</SelectItem>;

  return data.map(item => {
    const value = String(item[valueKey]);
    const label = String(item[labelKey]);
    return (
      <SelectItem key={value} value={value}>
        {label}
      </SelectItem>
    );
  });
}

export default function MultiStepAgentForm({ onSubmit, isLoading, isEdit,defaultValues }: MultiStepAgentFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [showPreview, setShowPreview] = useState(false);
const [previewAgent, setPreviewAgent] = useState<Agent | null>(null);
const [showPreviewModal, setShowPreviewModal] = useState(false);
const { data: dropdowns, isLoading: dropdownsLoading, isError: dropdownsError } = useOnboardingDropdowns();


// Use dropdown data or fallback to empty arrays
  const divisionOptions = dropdowns?.division || [];
  const agentTypeOptions = dropdowns?.agentType || [];
  const salutationOptions = dropdowns?.salutationType || [];
  const genderOptions = dropdowns?.genderType || [];
  // Refs for focusing fields
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLSelectElement | null>>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    control,
    formState: { errors },
    clearErrors,
    setFocus,
  } = useForm<AgentFormData>({
    resolver: zodResolver(insertAgentSchema),
    defaultValues:{
      currency: "TZS",
      type:"",
      division:"",
      title:"",
      gender:"",
      phone:"",
      region:"",
      city:"",
      district:"",
      ward:"",
      parentId: "",
      commission: "5.00",
      country: "",
      address1: "",
      ...defaultValues,
    },
    mode: "onBlur"
  });

  const watchedFields = watch();

   // Fetching location data
  const { data: countries, isLoading: countriesLoading, isError: countriesError } = useCountries();
  const { data: regions, isLoading: regionsLoading, isError: regionsError } = useRegions(watchedFields.country);
  const { data: cities, isLoading: citiesLoading, isError: citiesError } = useCities(watchedFields.country, watchedFields.region);
  const { data: districts, isLoading: districtsLoading, isError: districtsError } = useDistricts(watchedFields.country, watchedFields.region, watchedFields.city);
  const { data: wards, isLoading: wardsLoading, isError: wardsError } = useWards(watchedFields.country, watchedFields.region, watchedFields.city, watchedFields.district);
const selectedCountry = watch("country");



  // Fetch currency info for selected country
  const { data: currencyData, isLoading: currencyLoading } = useCurrencyByCountry(selectedCountry);
  
  useEffect(() => {
    if (currencyData?.currencyCode) {
      setValue("currency", currencyData.currencyCode);
    }
  }, [currencyData, setValue]);

useEffect(() => {
  if (defaultValues) {
    // Cast defaultValues to AgentApiData to satisfy TypeScript
    const apiData = defaultValues as AgentApiData;
    const normalizedDefaults = mapApiToFormData(apiData);
    reset(normalizedDefaults);
  }
}, [defaultValues, reset]);

  useEffect(() => {
  console.log("Form defaultValues:", defaultValues);
  console.log("Form current values:", watch());
  
}, [defaultValues, watch(),]);
  
  // Navigation helpers
  const tabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const isFirstTab = tabIndex === 0;
  const isLastTab = tabIndex === tabs.length - 1;

  // Focus the first invalid field on Next/Submit or tab click
  const focusFirstError = (fields: string[]) => {
    for (const field of fields) {
      if (errors[field as keyof AgentFormData]) {
        const ref = fieldRefs.current[field];
        if (ref && typeof ref.focus === "function") {
          ref.focus();
        }
        break;
      }
    }
  };

  // Validate all previous tabs before allowing navigation
  const canGoToTab = async (targetTabIndex: number) => {
    for (let i = 0; i < targetTabIndex; i++) {
      const fields = tabFields[tabs[i].id];
      const valid = await trigger(fields as any);
      if (!valid) {
        setActiveTab(tabs[i].id);
        focusFirstError(fields as string[]);
        return false;
      }
    }
    return true;
  };

  // Handle tab click
  const handleTabChange = async (tabId: string) => {
  const currentTabIndex = tabs.findIndex(tab => tab.id === activeTab);
  const targetTabIndex = tabs.findIndex(tab => tab.id === tabId);

  // Only allow moving forward if current tab is valid
  if (targetTabIndex > currentTabIndex) {
    const fields = tabFields[activeTab];
    const isValid = await trigger(fields as any);
    if (!isValid) {
      // Focus first invalid field
      for (const field of fields) {
        if (errors[field]) {
          setFocus(field);
          break;
        }
      }
      return;
    }
  }
  setActiveTab(tabId);
};

  // Handle "Next" button: validate current tab fields, then move to next tab if valid
  const handleNext = async () => {
  const fieldsToValidate = tabFields[activeTab];
  const isValid = await trigger(fieldsToValidate);
  console.log("Validation result:", isValid);
  console.log("Validation errors:", errors);
  if (isValid) {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  } else {
    for (const field of fieldsToValidate) {
      if (errors[field]) {
        setFocus(field);
        break;
      }
    }
  }
};

  // Handle "Previous" button
  const handlePrev = () => {
    if (!isFirstTab) {
      setActiveTab(tabs[tabIndex - 1].id);
    }
  };

  // Only allow submit on last tab
  const handleFormSubmit = (data: AgentFormData) => {
  if (isLastTab) {  
      const trimmedData = trimAllStrings(data);  
      onSubmit(trimmedData);
  }
};

  // Prevent Enter from submitting except on last tab
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (activeTab !== "kyc" && e.key === "Enter") {
      e.preventDefault();
    }
  };

  // Hide validation message as soon as value is selected/entered
  useEffect(() => {
    Object.keys(errors).forEach((field) => {
      if (watchedFields[field as keyof AgentFormData]) {
        clearErrors(field as keyof AgentFormData);
      }
    });
    // eslint-disable-next-line
  }, [watchedFields]);

  // User-friendly preview for the modal
  const renderPreview = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-bold mb-2">Agent Onboarding Preview</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold mb-1">General</h4>
          <p><b>Agent Type:</b> {watchedFields.type}</p>
          <p><b>Division:</b> {divisionOptions.find(opt => opt.value === watchedFields.division)?.name}</p>
          {watchedFields.parentId && <p><b>Parent Agent ID:</b> {watchedFields.parentId}</p>}
        </div>
        <div>
          <h4 className="font-semibold mb-1">Personal</h4>
          <p><b>Title:</b> {watchedFields.title}</p>
          <p><b>First Name:</b> {watchedFields.firstName}</p>
          <p><b>Last Name:</b> {watchedFields.lastName}</p>
          <p><b>Email:</b> {watchedFields.email}</p>
          <p><b>Mobile:</b> {watchedFields.mobile}</p>
          <p><b>Phone:</b> {watchedFields.phone}</p>
          <p><b>Gender:</b> {watchedFields.gender}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-1">Address</h4>
          <p><b>Country:</b> {watchedFields.country}</p>
          <p><b>Region:</b> {regionOptions.find(opt => opt.value === watchedFields.region)?.label}</p>
          <p><b>City:</b> {watchedFields.city}</p>
          <p><b>District:</b> {watchedFields.district}</p>
          <p><b>Ward:</b> {watchedFields.ward}</p>
          <p><b>Address 1:</b> {watchedFields.address1}</p>
          <p><b>Address 2:</b> {watchedFields.address2}</p>
          <p><b>Postal Code:</b> {watchedFields.postalCode}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-1">Tax & Financial</h4>
          <p><b>TIN Number:</b> {watchedFields.tinNumber}</p>
          <p><b>VRN Number:</b> {watchedFields.vrnNumber}</p>
          <p><b>Currency:</b> {watchedFields.currency}</p>
          <p><b>Commission:</b> {watchedFields.commission}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-1">KYC</h4>
          <p><b>KYC Doc No (POI):</b> {watchedFields.kycDocNoPOI}</p>
          <p><b>KYC Doc No (POA):</b> {watchedFields.kycDocNoPOA}</p>
        </div>
      </div>
    </div>
  );

 const renderTabContent = () => {
  switch (activeTab) {
    case "general":
      return (
        <div className="space-y-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Agent Onboarding - SAP BRIM Integration</h3>
            <p className="text-sm text-blue-800">
              Complete the agent onboarding process. After submission, the system will generate an onboarding reference number and initiate SAP Business Partner creation for contract management.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Controller
  name="type"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="type">Agent Type <span className="text-red-500">*</span></Label>
      <Select
        value={field.value || ""}
         onValueChange={(val) => {
    console.log("Agent Type selected:", val);
    field.onChange(val);
  }}
        disabled={dropdownsLoading || dropdownsError}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select Agent Type" />
        </SelectTrigger>
        <SelectContent>
          {dropdownsLoading && (
            <SelectItem value="loading" disabled>
              Loading...
            </SelectItem>
          )}
          {dropdownsError && (
            <SelectItem value="error" disabled>
              Error loading options
            </SelectItem>
          )}
          {!dropdownsLoading && !dropdownsError && agentTypeOptions.length === 0 && (
            <SelectItem value="empty" disabled>
              No options available
            </SelectItem>
          )}
          {agentTypeOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.type && (
        <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
      )}
    </div>
  )}
/>           {(watchedFields.type === "Sub Agent" || watchedFields.type === "Agent Employee") && (
                <div>
                  <Label htmlFor="parentId" className="text-sm font-medium text-gray-700">
                    Parent Agent ID
                  </Label>
                  <Input
                    id="parentId"
                    {...register("parentId")}
                    placeholder="Parent Agent ID"
                    className="mt-1"
                  />
                  {errors.parentId && <p className="text-sm text-red-500 mt-1">{errors.parentId.message}</p>}
                </div>
              )}
            </div>
            <div className="space-y-4">
              <Controller
                name="division"
                control={control}
                render={({ field }) => (
                  <div>
                    <Label htmlFor="division" className="text-sm font-medium text-gray-700">
                      Division <span className="text-red-500">*</span>
                    </Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
                      <SelectContent>
                        {divisionOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.division && <p className="text-sm text-red-500 mt-1">{errors.division.message}</p>}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      );

    case "personal":
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <Controller
  name="title"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
      <Select value={field.value || ""} onValueChange={field.onChange} disabled={dropdownsLoading || dropdownsError}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select Title" />
        </SelectTrigger>
        <SelectContent>
          {dropdownsLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
          {dropdownsError && <SelectItem value="error" disabled>Error loading options</SelectItem>}
          {salutationOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
    </div>
  )}
/>
              <div>
                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  {...register("firstName")}
                  placeholder="Enter first name"
                  className="mt-1"
                />
                {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  {...register("lastName")}
                  placeholder="Enter last name"
                  className="mt-1"
                />
                {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="agent@example.com"
                  className="mt-1"
                />
                {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">
                  Mobile Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  {...register("mobile")}
                  placeholder="+255 xxx xxx xxx"
                  className="mt-1"
                />
                {errors.mobile && <p className="text-sm text-red-500 mt-1">{errors.mobile.message}</p>}
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register("phone")}
                  placeholder="+255 xxx xxx xxx"
                  className="mt-1"
                />
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fax" className="text-sm font-medium text-gray-700">
                  Fax Number
                </Label>
                <Input
                  id="fax"
                  {...register("fax")}
                  placeholder="Enter fax number"
                  className="mt-1"
                />
                {errors.fax && <p className="text-sm text-red-500 mt-1">{errors.fax.message}</p>}
              </div>
              <Controller
  name="gender"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
      <Select value={field.value || ""} onValueChange={field.onChange} disabled={dropdownsLoading || dropdownsError}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select Gender" />
        </SelectTrigger>
        <SelectContent>
          {dropdownsLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
          {dropdownsError && <SelectItem value="error" disabled>Error loading options</SelectItem>}
          {genderOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>{opt.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>}
    </div>
  )}
/>
            </div>
          </div>
        </div>
      );

    case "address":
      return (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
             <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                        Country <span className="text-red-500">*</span>
                      </Label>
                <Controller
  name="country"
  control={control}
  render={({ field }) => {
    console.log("Countries options:", countries);
    console.log("Selected country value:", field.value);
    return (
      <Select
        value={field.value || ""}
        onValueChange={(value) => {
          field.onChange(value);
          setValue("region", "");
          setValue("city", "");
          setValue("district", "");
          setValue("ward", "");
        }}
        disabled={countriesLoading}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select Country" />
        </SelectTrigger>
          <SelectContent>
          <SelectOptions
            isLoading={countriesLoading}
            isError={countriesError}
            data={countries}
            placeholder="Select Country"
            valueKey="country"
            labelKey="country"
          />
        </SelectContent>
      </Select>
    );
  }}
/>
              <Controller
                  name="region"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="region" className="text-sm font-medium text-gray-700">
                        Region <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                           // ** FIX: Reset child fields directly on change **
                          setValue("city", "");
                          setValue("district", "");
                          setValue("ward", "");
                        }}
                        disabled={!watchedFields.country || regionsLoading}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Region" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectOptions
                            isLoading={regionsLoading}
                            isError={regionsError}
                            data={regions}
                            placeholder="Select Region"
                            valueKey="region"
                            labelKey="region"
                          />
                        </SelectContent>
                      </Select>
                      {errors.region && <p className="text-sm text-red-500 mt-1">{errors.region.message}</p>}
                    </div>
                  )}
                />
              <Controller
                  name="city"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                           // ** FIX: Reset child fields directly on change **
                          setValue("district", "");
                          setValue("ward", "");
                        }}
                        disabled={!watchedFields.region || citiesLoading}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select City" />
                        </SelectTrigger>
                        <SelectContent>
  {citiesLoading && (
    <SelectItem value="loading" disabled>Loading...</SelectItem>
  )}
  {citiesError && (
    <SelectItem value="error" disabled>Error loading options</SelectItem>
  )}
  {!citiesLoading && !citiesError && (!cities || cities.length === 0) && (
    <SelectItem value="empty" disabled>No cities found</SelectItem>
  )}
  {cities?.map(city => (
    <SelectItem key={city.city + "_" + city.cityCode} value={city.city + "_" + city.cityCode}>
      {city.city}
    </SelectItem>
  ))}
</SelectContent>
                      </Select>
                      {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
                    </div>
                  )}
                />
              </div>
              <div className="space-y-4">
                <Controller
                  name="district"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                        District <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={field.value || ""}
                        onValueChange={(value) => {
                          field.onChange(value);
                           // ** FIX: Reset child fields directly on change **
                          setValue("ward", "");
                        }}
                        disabled={!watchedFields.city || districtsLoading}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select District" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectOptions
                            isLoading={districtsLoading}
                            isError={districtsError}
                            data={districts}
                            placeholder="Select District"
                            valueKey="district"
                            labelKey="district"
                          />
                        </SelectContent>
                      </Select>
                      {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district.message}</p>}
                    </div>
                  )}
                />
                <Controller
                  name="ward"
                  control={control}
                  render={({ field }) => (
                    <div>
                      <Label htmlFor="ward" className="text-sm font-medium text-gray-700">
                        Ward <span className="text-red-500">*</span>
                      </Label>
                      <Select value={field.value || ""} onValueChange={field.onChange} disabled={!watchedFields.district || wardsLoading}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select Ward" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectOptions
                            isLoading={wardsLoading}
                            isError={wardsError}
                            data={wards}
                            placeholder="Select Ward"
                            valueKey="ward"
                            labelKey="ward"
                          />
                        </SelectContent>
                      </Select>
                      {errors.ward && <p className="text-sm text-red-500 mt-1">{errors.ward.message}</p>}
                    </div>
                  )}
                />
              </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address1" className="text-sm font-medium text-gray-700">
                  Address Line 1 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="address1"
                  {...register("address1")}
                  placeholder="Enter primary address"
                  className="mt-1"
                />
                {errors.address1 && <p className="text-sm text-red-500 mt-1">{errors.address1.message}</p>}
              </div>
              <div>
                <Label htmlFor="address2" className="text-sm font-medium text-gray-700">
                  Address Line 2
                </Label>
                <Input
                  id="address2"
                  {...register("address2")}
                  placeholder="Enter secondary address (optional)"
                  className="mt-1"
                />
                {errors.address2 && <p className="text-sm text-red-500 mt-1">{errors.address2.message}</p>}
              </div>
              <div>
                <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                  Postal Code
                </Label>
                <Input
                  id="postalCode"
                  {...register("postalCode")}
                  placeholder="Enter postal code"
                  className="mt-1"
                />
                {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode.message}</p>}
              </div>
            </div>
          </div>
        </div>
      );

      case "tax":
  return (
    <div className="space-y-8">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-amber-900 mb-2">Tax Information</h3>
        <p className="text-sm text-amber-800">
          <strong>TIN Number:</strong> Tax Identification Number is mandatory for agent registration. 
          Non-TIN agents will be tagged as NON-REGISTERED and may have limited functionality.
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="tinNumber" className="text-sm font-medium text-gray-700">
              TIN Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="tinNumber"
              {...register("tinNumber")}
              placeholder="Enter TIN number"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Required for tax compliance</p>
            {errors.tinNumber && <p className="text-sm text-red-500 mt-1">{errors.tinNumber.message}</p>}
          </div>
          <div>
            <Label htmlFor="vrnNumber" className="text-sm font-medium text-gray-700">
              VRN Number
            </Label>
            <Input
              id="vrnNumber"
              {...register("vrnNumber")}
              placeholder="Enter VRN number (optional)"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">VAT Registration Number - provide if available</p>
            {errors.vrnNumber && <p className="text-sm text-red-500 mt-1">{errors.vrnNumber.message}</p>}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Tax Requirements</h4>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• TIN Number is mandatory for all agents</li>
            <li>• VRN Number required for VAT-registered businesses</li>
            <li>• Tax certificates may be required for verification</li>
            <li>• Commission payments will be subject to applicable taxes</li>
          </ul>
        </div>
      </div>
    </div>
  );

case "financial":
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Controller
        name="currency"
        control={control}
        render={({ field }) => (
          <div>
            <Label htmlFor="currency">Currency <span className="text-red-500">*</span></Label>
            <Select
              {...field}
              value={field.value || ""}
              onValueChange={field.onChange}
              disabled={currencyLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyLoading && (
                  <SelectItem value="" disabled>Loading...</SelectItem>
                )}
                {!currencyLoading && currencyData && (
                  <SelectItem value={currencyData.currencyCode}>
                    {currencyData.currencyName}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {errors.currency && (
              <p className="text-sm text-red-500 mt-1">{errors.currency.message}</p>
            )}
          </div>
        )}
      />
          <div>
            <Label htmlFor="commission" className="text-sm font-medium text-gray-700">
              Commission Rate (%)
            </Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...register("commission")}
              placeholder="5.00"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Default commission rate (can be adjusted per agreement)</p>
            {errors.commission && <p className="text-sm text-red-500 mt-1">{errors.commission.message}</p>}
          </div>
          <div>
        {/* Other financial fields */}

        <SalesOrgDropdown
          control={control}
          watch={watch}
          setValue={setValue}
          errors={errors}
        />
      </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-3">SAP BRIM Integration</h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>Business Partner Creation:</strong> Automatic SAP BP creation after approval</p>
            <p><strong>Contract Account:</strong> System will create Contract Account for billing</p>
            <p><strong>Role Assignments:</strong> FLCU01 (Customer), FLCU00 (FI Customer), MKK (Contract Partner)</p>
            <p><strong>Commission Structure:</strong> Configurable rate with default 5%</p>
            <p><strong>Financial Management:</strong> Payment terms applied to commission processing</p>
          </div>
        </div>
      </div>
    </div>
  );

case "kyc":
  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">KYC Document Upload & Approval Process</h3>
        <p className="text-gray-600">Upload required documents for identity verification and SAP Business Partner creation approval</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <Controller
            name="kycDocNoPOI"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="kycDocNoPOI" className="text-sm font-medium text-gray-700">
                  KYC Document Number (POI)
                </Label>
                <Input
                  id="kycDocNoPOI"
                  {...field}
                  placeholder="e.g., NIDA-123456789, PP-A12345"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Official document number from government ID/passport</p>
                {errors.kycDocNoPOI && <p className="text-sm text-red-500 mt-1">{errors.kycDocNoPOI.message}</p>}
              </div>
            )}
          />
          <Controller
            name="kycDocNoPOA"
            control={control}
            render={({ field }) => (
              <div>
                <Label htmlFor="kycDocNoPOA" className="text-sm font-medium text-gray-700">
                  KYC Document Number (POA)
                </Label>
                <Input
                  id="kycDocNoPOA"
                  {...field}
                  placeholder="e.g., Utility Bill-12345"
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Official document number from proof of address</p>
                {errors.kycDocNoPOA && <p className="text-sm text-red-500 mt-1">{errors.kycDocNoPOA.message}</p>}
              </div>
            )}
          />
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Document Number Info</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>POI:</strong> National ID, Passport, Driver's License</p>
            <p><strong>POA:</strong> Utility Bill, Bank Statement, Rental Agreement</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              POA (Proof of Address) Documents
            </Label>
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <CloudUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">Upload POA Documents</p>
                <p className="text-xs text-gray-500">Utility bill, bank statement, etc.</p>
              </CardContent>
            </Card>
          </div>
          <div>
            <Label className="text-sm font-medium text-gray-700">
              POI (Proof of Identity) Documents
            </Label>
            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
              <CardContent className="p-6 text-center">
                <CloudUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">Upload POI Documents</p>
                <p className="text-xs text-gray-500">National ID, passport, driver's license</p>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Required Documents</h4>
            <div className="text-sm text-green-800 space-y-2">
              <p><strong>POA (Proof of Address):</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• Utility Bill</li>
                <li>• Bank Statement</li>
                <li>• Rental Agreement</li>
              </ul>
              <p><strong>POI (Proof of Identity):</strong></p>
              <ul className="ml-4 space-y-1">
                <li>• National ID (NIDA)</li>
                <li>• Passport</li>
                <li>• Driver's License</li>
              </ul>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <h4 className="font-medium text-amber-900 mb-2">Preview Feature</h4>
  <p className="text-sm text-amber-800 mb-3">
    Before final submission, you can preview your application and all uploaded documents to ensure accuracy.
  </p>
<Button
  type="button"
  variant="outline"
  size="sm"
  className="w-full mt-2 font-semibold flex items-center justify-center"
  onClick={() => {
    const agentData = {
      agentId: 0,
      onbId:watchedFields.onbId,
      salutation: watchedFields.title,
      firstName: watchedFields.firstName,
      lastName: watchedFields.lastName,
      gender: watchedFields.gender,
      mobile: watchedFields.mobile,
      phone: watchedFields.phone,
      fax: watchedFields.fax,
      email: watchedFields.email,
      type: watchedFields.type,
      region: watchedFields.region,
      status: "",
      agentStage: "",
      addressOne: watchedFields.address1,
      addressTwo: watchedFields.address2,
      ward: watchedFields.ward,
      division: watchedFields.division,
      country: watchedFields.country,
      city: watchedFields.city,
      district: watchedFields.district,
      postalCode: watchedFields.postalCode,
      tinNo: watchedFields.tinNumber,
      vrnNo: watchedFields.vrnNumber,
      currency: watchedFields.currency,
      commission: watchedFields.commission,
      kycDocNoPOI: watchedFields.kycDocNoPOI,
      kycDocNoPOA: watchedFields.kycDocNoPOA,
      kycPoiFileName: watchedFields.kycPoi?.name,
      kycPoaFileName: watchedFields.kycPoa?.name,
      createDt: new Date().toISOString(), // Add default create date
    createId: "", // Add default or empty userName
    };
    setPreviewAgent(agentData);
    setShowPreviewModal(true);
    console.log("Preview button clicked", agentData);

  }}
>
  <FileTextIcon className="h-4 w-4 mr-2" />
  Preview Application
</Button>
</div>
        </div>
      </div>
    </div>
  );

    // Repeat for tax, financial, and kyc tabs as needed, using Controller for all Selects

    default:
      return null;
  }
};

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6 bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Agent Registration:</span>
              <span className="text-sm text-gray-900">General Data</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              Status: Draft
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={e => e.preventDefault()} onKeyDown={handleKeyDown}>
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="border-b border-gray-200 bg-gray-50">
                <TabsList className="h-auto p-0 bg-transparent w-full justify-start">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="px-2 md:px-4 py-3 text-sm font-medium text-gray-600 bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:bg-white rounded-none"
                      >
                        <Icon className="h-4 w-4 md:mr-2" />
                        <span className="hidden md:inline">{tab.name}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="p-6 m-0">
                  {renderTabContent()}
                 
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Navigation and Submit Buttons */}
        <div className="mt-6 flex justify-between items-center bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex space-x-3">
            <Button type="button" variant="outline" size="sm" onClick={handlePrev} disabled={isFirstTab}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
          </div>
          <div className="flex space-x-3">
    {!isLastTab ? (
      <Button type="button" size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleNext}>
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    ) : (
      <Button
        type="button"
        disabled={isLoading}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700"
        onClick={() => handleSubmit(handleFormSubmit)()}
      >
        {isLoading
      ? "Processing..."
      : isEdit
      ? "Update Agent Details"
      : "Submit for SAP BP Creation"}
      </Button>
    )}
  </div>
        </div>      
      </form>
  <AgentDetailsModal
  agent={previewAgent}
  isOpen={showPreviewModal}
  onClose={() => setShowPreviewModal(false)}
/>
      
    </div>
  );
  
}


