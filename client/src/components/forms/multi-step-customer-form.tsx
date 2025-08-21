import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertCustomer, insertCustomerSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudUpload, User, MapPin, Settings, CreditCard, Upload, FileText, Building, Banknote, Hash, FileTextIcon, X } from "lucide-react";
import type { z } from "zod";
import { registerCustomer } from "@/lib/api-customer-onboarding";
import { toast } from "@/hooks/use-toast";
import { useAuthContext } from "@/context/AuthProvider";
import { useCountries, useRegions, useCities, useDistricts, useWards } from "@/hooks/use-center-data";
import { useOnboardingDropdowns } from "@/hooks/useOnboardingDropdowns";


type CustomerFormData = z.infer<typeof insertCustomerSchema>;

interface MultiStepCustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CustomerFormData>;
  isEdit?: boolean;
}

const tabs = [
  { id: "general", name: "General Data", icon: User },
  { id: "personal", name: "Personal Details", icon: FileText },
  { id: "address", name: "Address Details", icon: MapPin },
  { id: "service", name: "Service Settings", icon: Settings },
  { id: "financial", name: "Financial & Tax", icon: Banknote },
  { id: "kyc", name: "KYC Documents", icon: Upload }
];

const divisionOptions = [
  { value: "11", label: "DTH" },
  { value: "12", label: "DTT" },
  { value: "13", label: "OTT" },
  { value: "14", label: "Advertisement" },
  { value: "15", label: "Network" },
  { value: "16", label: "Others" },
];

const salesOrgOptions = [
  { value: "TZ10", label: "Tanzania" },
  { value: "MU20", label: "Mauritius" },
  { value: "KE30", label: "Kenya" },
  { value: "UG40", label: "Uganda" },
  { value: "RW50", label: "Rwanda" },
  { value: "BI60", label: "Burundi" },
  { value: "MW70", label: "Malawi" },
  { value: "ZW80", label: "Zimbabwe" },
  { value: "ZM90", label: "Zambia" },
];

const tabFields: Record<string, Array<keyof InsertCustomer>> = {
  general: ["customerType","newOrExisting","accountClass", "division","smsFlag"],
  personal: ["title","firstName","email", "altEmail", "fax", "orgName","lastName", "gender", "race", "phone", "mobile","dateOfBirth","altPhone","middleName","mobile",],
  address: ["countryInst", "regionInst", "cityInst", "districtInst", "wardInst", "address1Inst", "address2Inst", "postalCodeInst","addressType","sameAsInstallation","billingCountry","billingRegion","billingCity","billingDistrict","billingWard","billingWard","billingPostalCode","billingAddress1","billingAddress2"],
  service: ["salesOrg","azamPayId","azamMaxTvId"],
  financial: ["currency","ctinNumber", "cvrnNumber"],
  kyc: ["kycDocNoPOI", "kycDocNoPOA"],
};

const getFirstTabWithError = (errors: Record<string, any>) => {
  for (const tab of tabs.map((s) => s.id)) {
    if (tabFields[tab]?.some((field) => errors[field])) {
      return tab;
    }
  }
  return null;
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

export default function MultiStepCustomerForm({ onSubmit, isLoading, defaultValues,isEdit }: MultiStepCustomerFormProps) {
  const [activeTab, setActiveTab] = useState("general");
  const [showPreview, setShowPreview] = useState(false);
  const { user } = useAuthContext();
  const { data: dropdowns, isLoading: dropdownsLoading, isError: dropdownsError } = useOnboardingDropdowns();
  const customerTypeOptions = dropdowns?.customerType || [];
  const customerStatusOptions = dropdowns?.customerStatus || [];
  const divisionOptions = dropdowns?.division || [];
  const accountClassOptions = dropdowns?.accountClass || [];
  const salutationOptions = dropdowns?.salutationType || [];
  const genderOptions = dropdowns?.genderType || [];
  const salesOrgOptions = dropdowns?.salesOrg || [];

  const renderPreview = () => {
  const data = getValues();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-azam-blue" />
          Customer Details Preview
        </h2>
        <Badge variant="outline" className="text-xs">
          Preview
        </Badge>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-azam-blue" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="font-semibold text-gray-900 mb-1">
              {data.title} {data.firstName} {data.lastName}
            </div>
            <div className="text-xs text-gray-500">Customer Type: {data.customerType}</div>
            <div className="text-xs text-gray-500">Account Class: {data.accountClass}</div>
            <div className="text-xs text-gray-500">Gender: {data.gender}</div>
            <div className="text-xs text-gray-500">DOB: {data.dateOfBirth || "N/A"}</div>
            <div className="text-xs text-gray-500">Mobile: {data.mobile}</div>
            <div className="text-xs text-gray-500">Phone: {data.phone || "N/A"}</div>
            <div className="text-xs text-gray-500">Email: {data.email || "N/A"}</div>
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
            <div className="text-xs text-gray-500">Country: {data.countryInst}</div>
            <div className="text-xs text-gray-500">Region: {data.regionInst}</div>
            <div className="text-xs text-gray-500">City: {data.cityInst}</div>
            <div className="text-xs text-gray-500">District: {data.districtInst}</div>
            <div className="text-xs text-gray-500">Ward: {data.wardInst}</div>
            <div className="text-xs text-gray-500">Address 1: {data.address1Inst}</div>
            <div className="text-xs text-gray-500">Address 2: {data.address2Inst || "N/A"}</div>
            <div className="text-xs text-gray-500">Postal Code: {data.postalCodeInst || "N/A"}</div>
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
            <div className="text-xs text-gray-500">Service Type: {data.salesOrg}</div>
            <div className="text-xs text-gray-500">TIN Number: {data.ctinNumber || "N/A"}</div>
            <div className="text-xs text-gray-500">VRN Number: {data.cvrnNumber || "N/A"}</div>
            <div className="text-xs text-gray-500">Currency: {data.currency}</div>
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
            <div className="text-xs text-gray-500">POI Doc No: {data.kycDocNoPOI || "N/A"}</div>
            <div className="text-xs text-gray-500">POA Doc No: {data.kycDocNoPOA || "N/A"}</div>
            <div className="text-xs text-gray-500">
              POI File: {data.kycPoi ? <span className="text-green-700">{data.kycPoi.name}</span> : <span className="text-gray-400">N/A</span>}
            </div>
            <div className="text-xs text-gray-500">
              POA File: {data.kycPoa ? <span className="text-green-700">{data.kycPoa.name}</span> : <span className="text-gray-400">N/A</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const handleCustomerSubmit = async (formData: any) => {
    console.log("Submitting formData:", formData); // <-- Add this

  try {
    const result = await registerCustomer(formData, user);
    toast({
      title: "Success",
      description: result?.statusMessage || "Customer registered successfully",
    });
    reset(); 
    setActiveTab("general");
    if (typeof window !== "undefined") {
      // If this form is in a modal or controlled by parent, call onSubmit to close form
      onSubmit(formData); // This should set showForm(false) in parent
    }
    // Optionally reset form or redirect
  }catch (error: any) {
  let errorMsg = "Failed to register customer";

  // If error is an object and has statusMessage, use it
  if (error && typeof error === "object") {
    if (error.statusMessage) {
      errorMsg = error.statusMessage;
    } else if (error.message) {
      // Try to parse error.message if it's a JSON string
      try {
        const parsed = JSON.parse(error.message);
        errorMsg = parsed.statusMessage || parsed.message || error.message;
      } catch {
        errorMsg = error.message;
      }
    }
  } else if (typeof error === "string") {
    // If error is a string, try to parse it
    try {
      const parsed = JSON.parse(error);
      errorMsg = parsed.statusMessage || parsed.message || error;
    } catch {
      errorMsg = error;
    }
  }

  toast({
    title: "Error",
    description: errorMsg,
    variant: "destructive",
  });
}
};

  const handleTabChange = async (tabId: string) => {
  const targetTabIndex = tabs.findIndex(tab => tab.id === tabId);
  for (let i = 0; i < targetTabIndex; i++) {
    const fields = tabFields[tabs[i].id];
    const valid = await trigger(fields as any);
    if (!valid) {
      setActiveTab(tabs[i].id);
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

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    getValues,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      customerType: "Individual",
      addressType: "Installation",
      accountClass:"",
      newOrExisting:"",
      salesOrg:"",
      division:"",
      title:"",
      gender:"",
      race:"",
      countryInst:"",
      regionInst:undefined,
      cityInst:"",
      districtInst:"",
      wardInst:"",
      billingCountry:"",
      billingRegion:"",
      billingCity:"",
      billingDistrict:"",
      billingWard:"",          
      currency: "TZS",      
      smsFlag: true,   
      azamPayId: "",
  azamMaxTvId: "",
  ctinNumber: "",
  cvrnNumber: "",  
      ...defaultValues,
    },
    mode: "onChange"
  });

  const handleNext = async () => {
  const fieldsToValidate = tabFields[activeTab];
  const isValid = await trigger(fieldsToValidate);
  if (isValid) {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1].id);
    }
  } else {
    // Focus first invalid field
    for (const field of fieldsToValidate) {
      if (errors[field]) {
        setFocus(field);
        break;
      }
    }
  }
};

  const watchedFields = watch();
const selectedCountry = watch("countryInst");

const filteredSalesOrg = useMemo(() => {
  if (!selectedCountry) return salesOrgOptions;
  return salesOrgOptions.filter(org => org.country === selectedCountry);
}, [salesOrgOptions, selectedCountry]);
  // Installation address fields
  const instCountry = watch("countryInst");
  const instRegion = watch("regionInst");
  const instCity = watch("cityInst");
  const instDistrict = watch("districtInst");

  // Billing address fields
  const billCountry = watch("billingCountry");
  const billRegion = watch("billingRegion");
  const billCity = watch("billingCity");
  const billDistrict = watch("billingDistrict");

  // Fetch location data for installation address
  const { data: instCountries, isLoading: instCountriesLoading, isError: instCountriesError } = useCountries();
  const { data: instRegions, isLoading: instRegionsLoading, isError: instRegionsError } = useRegions(instCountry);
  const { data: instCities, isLoading: instCitiesLoading, isError: instCitiesError } = useCities(instCountry, instRegion);
  const { data: instDistricts, isLoading: instDistrictsLoading, isError: instDistrictsError } = useDistricts(instCountry, instRegion, instCity);
  const { data: instWards, isLoading: instWardsLoading, isError: instWardsError } = useWards(instCountry, instRegion, instCity, instDistrict);

  // Fetch location data for billing address
  const { data: billCountries, isLoading: billCountriesLoading, isError: billCountriesError } = useCountries();
  const { data: billRegions, isLoading: billRegionsLoading, isError: billRegionsError } = useRegions(billCountry);
  const { data: billCities, isLoading: billCitiesLoading, isError: billCitiesError } = useCities(billCountry, billRegion);
  const { data: billDistricts, isLoading: billDistrictsLoading, isError: billDistrictsError } = useDistricts(billCountry, billRegion, billCity);
  const { data: billWards, isLoading: billWardsLoading, isError: billWardsError } = useWards(billCountry, billRegion, billCity, billDistrict);

  // Refs to skip initial reset on mount
  const instInitialMount = useRef(true);
  const billInitialMount = useRef(true);

  // Reset dependent installation fields on parent change
  useEffect(() => {
    if (instInitialMount.current) return;
    setValue("regionInst", "");
    setValue("cityInst", "");
    setValue("districtInst", "");
    setValue("wardInst", "");
  }, [instCountry, setValue]);

  useEffect(() => {
    if (instInitialMount.current) return;
    setValue("cityInst", "");
    setValue("districtInst", "");
    setValue("wardInst", "");
  }, [instRegion, setValue]);

  useEffect(() => {
    if (instInitialMount.current) return;
    setValue("districtInst", "");
    setValue("wardInst", "");
  }, [instCity, setValue]);

  useEffect(() => {
    if (instInitialMount.current) return;
    setValue("wardInst", "");
  }, [instDistrict, setValue]);

  useEffect(() => {
    instInitialMount.current = false;
  }, []);

  // Reset dependent billing fields on parent change
  useEffect(() => {
    if (billInitialMount.current) return;
    setValue("billingRegion", "");
    setValue("billingCity", "");
    setValue("billingDistrict", "");
    setValue("billingWard", "");
  }, [billCountry, setValue]);

  useEffect(() => {
    if (billInitialMount.current) return;
    setValue("billingCity", "");
    setValue("billingDistrict", "");
    setValue("billingWard", "");
  }, [billRegion, setValue]);

  useEffect(() => {
    if (billInitialMount.current) return;
    setValue("billingDistrict", "");
    setValue("billingWard", "");
  }, [billCity, setValue]);

  useEffect(() => {
    if (billInitialMount.current) return;
    setValue("billingWard", "");
  }, [billDistrict, setValue]);

  useEffect(() => {
    billInitialMount.current = false;
  }, []);

  const handleFormSubmit = async (data: CustomerFormData) => {
    onSubmit(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Customer Registration Form</h3>
              <p className="text-sm text-blue-800">
                Complete the customer registration process by filling in all required information across the tabs below.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                {/* <div>
                  <Label htmlFor="customerId" className="text-sm font-medium text-gray-700">Customer ID</Label>
                  <Input
                    id="customerId"
                    value="AUTO-GENERATED"
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div> */}

                <div>
                 <Controller
  name="customerType"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="customerType">Customer Type <span className="text-red-500">*</span></Label>
      <Select
        {...field}
        value={field.value || ""}
        onValueChange={field.onChange}
        disabled={dropdownsLoading || dropdownsError}
      >
         <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Customer Type" />
                      </SelectTrigger>
        <SelectContent>
          {dropdownsLoading && (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          )}
          {dropdownsError && (
            <SelectItem value="error" disabled>Error loading options</SelectItem>
          )}
          {!dropdownsLoading && !dropdownsError && customerTypeOptions.length === 0 && (
            <SelectItem value="empty" disabled>No options available</SelectItem>
          )}
          {customerTypeOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.customerType && (
        <p className="text-sm text-red-500 mt-1">{errors.customerType.message}</p>
      )}
    </div>
  )}
/>
                </div>

                <div>
                 <Controller
  name="newOrExisting"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="newOrExisting">Customer Status <span className="text-red-500">*</span></Label>
      <Select
        {...field}
        value={field.value || ""}
        onValueChange={field.onChange}
        disabled={dropdownsLoading || dropdownsError}
      >
         <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Customer Status" />
                      </SelectTrigger>
        <SelectContent>
          {/* Placeholder */}
       

          {/* Options */}
          {customerStatusOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.newOrExisting && (
        <p className="text-sm text-red-500 mt-1">{errors.newOrExisting.message}</p>
      )}
    </div>
  )}
/>
                </div>
                <div>
                   <Controller
  name="division"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="division">Division <span className="text-red-500">*</span></Label>
      <Select
        {...field}
        value={field.value || ""}
        onValueChange={field.onChange}
        disabled={dropdownsLoading || dropdownsError}
      >
       <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Division" />
                      </SelectTrigger>
        <SelectContent>
          {/* Placeholder */}       

          {/* Options */}
          {divisionOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.division && (
        <p className="text-sm text-red-500 mt-1">{errors.division.message}</p>
      )}
    </div>
  )}
/>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="registrationDate" className="text-sm font-medium text-gray-700">Registration Date</Label>
                  <Input
                    id="registrationDate"
                    value={new Date().toLocaleDateString()}
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>

                {/* <div>
                  <Label htmlFor="onboardingRefNo" className="text-sm font-medium text-gray-700">Onboarding Reference No</Label>
                  <Input
                    id="onboardingRefNo"
                    value="AUTO-GENERATED"
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div> */}

                {watchedFields.newOrExisting === "Existing" && (
                  <div>
                    <Label htmlFor="parentCustomerId" className="text-sm font-medium text-gray-700">Parent Customer ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="parentCustomerId"
                        type="number"
                        {...register("parentCustomerId")}
                        placeholder="Enter parent customer ID"
                        className="mt-1"
                      />
                      <Button type="button" variant="outline" className="mt-1">
                        Validate
                      </Button>
                    </div>
                    {errors.parentCustomerId && <p className="text-sm text-red-500 mt-1">{errors.parentCustomerId.message}</p>}
                  </div>
                )}
                
              </div>

              <div className="space-y-4">
                <div>
                 <Controller
  name="accountClass"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="accountClass">Account Class <span className="text-red-500">*</span></Label>
      <Select
        {...field}
        value={field.value || ""}
        onValueChange={field.onChange}
        disabled={dropdownsLoading || dropdownsError}
      >
        <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Account Class" />
                      </SelectTrigger>
        <SelectContent>
          {/* Placeholder */}        

          {/* Options */}
          {accountClassOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.accountClass && (
        <p className="text-sm text-red-500 mt-1">{errors.accountClass.message}</p>
      )}
    </div>
  )}
/>
                </div>

                

                <div className="flex items-center space-x-2">
                  <Switch
                    id="smsFlag"
                    checked={watchedFields.smsFlag}
                    onCheckedChange={(checked) => setValue("smsFlag", checked)}
                  />
                  <Label htmlFor="smsFlag" className="text-sm font-medium text-gray-700">Enable SMS Notifications</Label>
                </div>
              </div>
             
            </div>
          </div>
        );

      case "personal":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                <Controller
  name="title"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
      <Select
        {...field}
        value={field.value || ""}
        onValueChange={field.onChange}
        disabled={dropdownsLoading || dropdownsError}
      >
       <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Title" />
                      </SelectTrigger>
        <SelectContent>
          {/* Placeholder */}
         

          {/* Options */}
          {salutationOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.title && (
        <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
      )}
    </div>
  )}
/>
                </div>

                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Enter first name"
                    className="mt-1"
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="middleName" className="text-sm font-medium text-gray-700">Middle Name</Label>
                  <Input
                    id="middleName"
                    {...register("middleName")}
                    placeholder="Enter middle name"
                    className="mt-1"
                  />
                  {errors.middleName && <p className="text-sm text-red-500 mt-1">{errors.middleName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className="mt-1"
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="altEmail" className="text-sm font-medium text-gray-700">Alternative Email</Label>
                  <Input
                    id="altEmail"
                    type="email"
                    {...register("altEmail")}
                    placeholder="alternate@example.com"
                    className="mt-1"
                  />
                  {errors.altEmail && <p className="text-sm text-red-500 mt-1">{errors.altEmail.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Controller
  name="gender"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="gender">Gender <span className="text-red-500">*</span></Label>
      <Select
        {...field}
        value={field.value || ""}
        onValueChange={field.onChange}
        disabled={dropdownsLoading || dropdownsError}
      >
        <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
        <SelectContent>
          {/* Placeholder */}         

          {/* Options */}
          {genderOptions.map(opt => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors.gender && (
        <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>
      )}
    </div>
  )}
/>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className="mt-1"
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
                </div>

                <div>
                  <Controller
  name="race"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="race" className="text-sm font-medium text-gray-700">
        Race <span className="text-red-500">*</span>
      </Label>
      <Select value={field.value || ""} onValueChange={field.onChange}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select Race" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="African">African</SelectItem>
          <SelectItem value="Asian">Asian</SelectItem>
          <SelectItem value="European">European</SelectItem>
          <SelectItem value="Mixed">Mixed</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>
      {errors.race && <p className="text-sm text-red-500 mt-1">{errors.race.message}</p>}
    </div>
  )}
/>
                </div>

                <div>
                  <Label htmlFor="orgName" className="text-sm font-medium text-gray-700">Organization Name</Label>
                  <Input
                    id="orgName"
                    {...register("orgName")}
                    placeholder="Enter organization name"
                    className="mt-1"
                  />
                  {errors.orgName && <p className="text-sm text-red-500 mt-1">{errors.orgName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="fax" className="text-sm font-medium text-gray-700">Fax Number</Label>
                  <Input
                    id="fax"
                    {...register("fax")}
                    placeholder="Enter fax number"
                    className="mt-1"
                  />
                  {errors.fax && <p className="text-sm text-red-500 mt-1">{errors.fax.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+255 xxx xxx xxx"
                    className="mt-1"
                  />
                  {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>}
                </div>

                <div>
                  <Label htmlFor="altPhone" className="text-sm font-medium text-gray-700">Alternative Phone</Label>
                  <Input
                    id="altPhone"
                    type="tel"
                    {...register("altPhone")}
                    placeholder="+255 xxx xxx xxx"
                    className="mt-1"
                  />
                  {errors.altPhone && <p className="text-sm text-red-500 mt-1">{errors.altPhone.message}</p>}
                </div>

                <div>
                  <Label htmlFor="mobile" className="text-sm font-medium text-gray-700">Mobile Number <span className="text-red-500">*</span></Label>
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
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="customer@example.com"
                    className="mt-1"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                

                
              </div>
            </div>
          </div>
        );

      case "address":
        return (
          <div className="space-y-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Installation Address</h3>
              <p className="text-sm text-blue-800">
                Enter the installation address details where the service will be installed.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="addressType" className="text-sm font-medium text-gray-700">Address Type <span className="text-red-500">*</span></Label>
                  <Select value={watchedFields.addressType} onValueChange={(value) => setValue("addressType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Address Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Installation">Installation</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.addressType && <p className="text-sm text-red-500 mt-1">{errors.addressType.message}</p>}
                </div>

                <div>
                <Controller
  name="countryInst"
  control={control}
  render={({ field }) => (
    <div>
      <Controller
              name="countryInst"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="countryInst">Country <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={instCountriesLoading}
                  >
                    <SelectTrigger className="mt-1 text-gray-900">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectOptions
    isLoading={instCountriesLoading}
    isError={instCountriesError}
    data={instCountries}
    placeholder="Select Country"
    valueKey="country"
    labelKey="country"
  />
</SelectContent>
                  </Select>
                  {errors.countryInst && <p className="text-sm text-red-500 mt-1">{errors.countryInst.message}</p>}
                </div>
              )}
            />
    </div>
  )}
/>
                </div>

                <div>
                  <Controller
              name="regionInst"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="regionInst">Region <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    disabled={!instCountry || instRegionsLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectOptions
    isLoading={instRegionsLoading}
    isError={instRegionsError}
    data={instRegions}
    placeholder="Select Region"
    valueKey="region"
    labelKey="region"
  />
</SelectContent>
                  </Select>
                  {errors.regionInst &&  <p className="text-sm text-red-500 mt-1">{errors.regionInst.message}</p>}
                </div>
              )}
            />
   
                </div>

                <div>
                  <Controller
              name="cityInst"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="cityInst">City <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!instRegion || instCitiesLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                   <SelectContent>
  {instCitiesLoading && (
    <SelectItem value="loading" disabled>Loading...</SelectItem>
  )}
  {instCitiesError && (
    <SelectItem value="error" disabled>Error loading options</SelectItem>
  )}
  {!instCitiesLoading && !instCitiesError && (!instCities || instCities.length === 0) && (
    <SelectItem value="empty" disabled>No cities found</SelectItem>
  )}
  {instCities?.map(city => (
    <SelectItem key={city.city + "_" + city.cityCode} value={city.city + "_" + city.cityCode}>
      {city.city}
    </SelectItem>
  ))}
</SelectContent>
                  </Select>
                  {errors.cityInst && <p className="text-sm text-red-500 mt-1">{errors.cityInst.message}</p>}
                </div>
              )}
            />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Controller
              name="districtInst"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="districtInst">District <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!instCity || instDistrictsLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectOptions
    isLoading={instDistrictsLoading}
    isError={instDistrictsError}
    data={instDistricts}
    placeholder="Select District"
    valueKey="district"
    labelKey="district"
  />
</SelectContent>
                  </Select>
                  {errors.districtInst && <p className="text-sm text-red-500 mt-1">{errors.districtInst.message}</p>}
                </div>
              )}
            />
                </div>

                <div>
                <Controller
              name="wardInst"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="wardInst">Ward <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!instDistrict || instWardsLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Ward" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectOptions
    isLoading={instWardsLoading}
    isError={instWardsError}
    data={instWards}
    placeholder="Select Ward"
    valueKey="ward"
    labelKey="ward"
  />
</SelectContent>
                  </Select>
                  {errors.wardInst && <p className="text-sm text-red-500 mt-1">{errors.wardInst.message}</p>}
                </div>
              )}
            />
                </div>

                <div>
                  <Label htmlFor="postalCodeInst" className="text-sm font-medium text-gray-700">Postal Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="postalCodeInst"
                    {...register("postalCodeInst")}
                    placeholder="Enter postal code"
                    className="mt-1"
                  />
                  {errors.postalCodeInst && <p className="text-sm text-red-500 mt-1">{errors.postalCodeInst.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address1" className="text-sm font-medium text-gray-700">Address Line 1 <span className="text-red-500">*</span></Label>
                  <Input
                    id="address1Inst"
                    {...register("address1Inst")}
                    placeholder="Enter primary address"
                    className="mt-1"
                  />
                  {errors.address1Inst && <p className="text-sm text-red-500 mt-1">{errors.address1Inst.message}</p>}
                </div>

                <div>
                  <Label htmlFor="address2Inst" className="text-sm font-medium text-gray-700">Address Line 2 <span className="text-red-500">*</span></Label>
                  <Input
                    id="address2Inst"
                    {...register("address2Inst")}
                    placeholder="Enter secondary address (optional)"
                    className="mt-1"
                  />
                  {errors.address2Inst && <p className="text-sm text-red-500 mt-1">{errors.address2Inst.message}</p>}
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-amber-900 mb-2">Billing Address</h3>
              <p className="text-sm text-amber-800">
                Enter the billing address details where invoices will be sent.
              </p>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Switch
                id="sameAsInstallation"
                checked={watchedFields.sameAsInstallation}
                onCheckedChange={(checked) => setValue("sameAsInstallation", checked)}
              />
              <Label htmlFor="sameAsInstallation" className="text-sm font-medium text-gray-700">
                Same as Installation Address
              </Label>
            </div>

            {!watchedFields.sameAsInstallation && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <Controller
              name="billingCountry"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="billingCountry">Country <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={billCountriesLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectOptions
    isLoading={billCountriesLoading}
    isError={billCountriesError}
    data={billCountries}
    placeholder="Select Billing Country"
    valueKey="country"
    labelKey="country"
  />
</SelectContent>
                  </Select>
                  {errors.billingCountry && <p className="text-sm text-red-500 mt-1">{errors.billingCountry.message}</p>}
                </div>
              )}
            />
                  </div>

                  <div>
                    <Controller
              name="billingRegion"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="billingRegion">Region <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!billCountry || billRegionsLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectOptions
    isLoading={billRegionsLoading}
    isError={billRegionsError}
    data={billRegions}
    placeholder="Select Billing Region"
    valueKey="region"
    labelKey="region"
  />
</SelectContent>
                  </Select>
                  {errors.billingRegion && <p className="text-sm text-red-500 mt-1">{errors.billingRegion.message}</p>}
                </div>
              )}
            />
                  </div>

                  <div>
                   <Controller
              name="billingCity"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="billingCity">City <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!billRegion || billCitiesLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select City" />
                    </SelectTrigger>
                    <SelectContent>
  {billCitiesLoading && (
    <SelectItem value="loading" disabled>Loading...</SelectItem>
  )}
  {billCitiesError && (
    <SelectItem value="error" disabled>Error loading options</SelectItem>
  )}
  {!billCitiesLoading && !billCitiesError && (!billCities || billCities.length === 0) && (
    <SelectItem value="empty" disabled>No cities found</SelectItem>
  )}
  {instCities?.map(city => (
    <SelectItem key={city.city + "_" + city.cityCode} value={city.city + "_" + city.cityCode}>
      {city.city}
    </SelectItem>
  ))}
</SelectContent>
                  </Select>
                  {errors.billingCity && <p className="text-sm text-red-500 mt-1">{errors.billingCity.message}</p>}
                </div>
              )}
            />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                   <Controller
              name="billingDistrict"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="billingDistrict">District <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!billCity || billDistrictsLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select District" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectOptions
    isLoading={billDistrictsLoading}
    isError={billDistrictsError}
    data={billDistricts}
    placeholder="Select Billing District"
    valueKey="district"
    labelKey="district"
  />
</SelectContent>
                  </Select>
                  {errors.billingDistrict && <p className="text-sm text-red-500 mt-1">{errors.billingDistrict.message}</p>}
                </div>
              )}
            />
                  </div>

                  <div>
                    <Controller
              name="billingWard"
              control={control}
              render={({ field }) => (
                <div>
                  <Label htmlFor="billingWard">Ward <span className="text-red-500">*</span></Label>
                  <Select
                    value={field.value || ""}
                    onValueChange={field.onChange}
                    disabled={!billDistrict || billWardsLoading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Ward" />
                    </SelectTrigger>
                    <SelectContent>
  <SelectOptions
    isLoading={billWardsLoading}
    isError={billWardsError}
    data={billWards}
    placeholder="Select Billing Ward"
    valueKey="ward"
    labelKey="ward"
  />
</SelectContent>
                  </Select>
                  {errors.billingWard && <p className="text-sm text-red-500 mt-1">{errors.billingWard.message}</p>}
                </div>
              )}
            />
                  </div>

                  <div>
                    <Label htmlFor="billingPostalCode" className="text-sm font-medium text-gray-700">Postal Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="billingPostalCode"
                      {...register("billingPostalCode")}
                      placeholder="Enter postal code"
                      className="mt-1"
                    />
                    {errors.billingPostalCode && <p className="text-sm text-red-500 mt-1">{errors.billingPostalCode.message}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="billingAddress1" className="text-sm font-medium text-gray-700">Address Line 1 <span className="text-red-500">*</span></Label>
                    <Input
                      id="billingAddress1"
                      {...register("billingAddress1")}
                      placeholder="Enter primary address"
                      className="mt-1"
                    />
                    {errors.billingAddress1 && <p className="text-sm text-red-500 mt-1">{errors.billingAddress1.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="billingAddress2" className="text-sm font-medium text-gray-700">Address Line 2 <span className="text-red-500">*</span></Label>
                    <Input
                      id="billingAddress2"
                      {...register("billingAddress2")}
                      placeholder="Enter secondary address (optional)"
                      className="mt-1"
                    />
                    {errors.billingAddress2 && <p className="text-sm text-red-500 mt-1">{errors.billingAddress2.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case "service":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Controller
  name="salesOrg"
  control={control}
  render={({ field }) => (
    <div>
      <Label htmlFor="salesOrg">Sales Org <span className="text-red-500">*</span></Label>
      <Select
        {...field}
        value={field.value || ""}
        onValueChange={field.onChange}
        disabled={dropdownsLoading || dropdownsError || filteredSalesOrg.length === 0}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select Sales Org" />
        </SelectTrigger>
        <SelectContent>
          {dropdownsLoading && (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          )}
          {dropdownsError && (
            <SelectItem value="error" disabled>Error loading options</SelectItem>
          )}
          {!dropdownsLoading && !dropdownsError && filteredSalesOrg.length === 0 && (
            <SelectItem value="empty" disabled>No Sales Org available</SelectItem>
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
                </div>

                

                

                <div>
                  <Label htmlFor="azamPayId" className="text-sm font-medium text-gray-700">Azam Pay ID</Label>
                  
<Input
  id="azamPayId"
  {...register("azamPayId")}
  placeholder="Enter Azam Pay ID"
  className="mt-1"
/>
                  {errors.azamPayId && <p className="text-sm text-red-500 mt-1">{errors.azamPayId.message}</p>}
                </div>

                <div>
                  <Label htmlFor="azamMaxTvId" className="text-sm font-medium text-gray-700">Azam Max TV ID</Label>
                  
 <Input
  id="azamMaxTvId"
  {...register("azamMaxTvId")}
  placeholder="Enter Azam Max TV ID"
  className="mt-1"
/>
                  {errors.azamMaxTvId && <p className="text-sm text-red-500 mt-1">{errors.azamMaxTvId.message}</p>}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3">Service Information</h4>
                <div className="text-sm text-blue-800 space-y-2">
                  <p><strong>DTT:</strong> Digital Terrestrial Television service</p>
                  <p><strong>DTH:</strong> Direct to Home satellite service</p>
                  <p><strong>OTT:</strong> Over-the-Top streaming service (Azam Max)</p>
                  <hr className="my-3 border-blue-200" />
                  <p><strong>Account Classes:</strong></p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Residential: Home users</li>
                    <li>Commercial: Business customers</li>
                    <li>VIP: Premium service customers</li>
                    <li>Corporate: Large enterprise customers</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case "financial":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">Currency <span className="text-red-500">*</span></Label>
                  <Select value={watchedFields.currency} onValueChange={(value) => setValue("currency", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TZS">Tanzanian Shilling (TSH)</SelectItem>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.currency && <p className="text-sm text-red-500 mt-1">{errors.currency.message}</p>}
                </div>

                <div>
                  <Label htmlFor="ctinNumber" className="text-sm font-medium text-gray-700">TIN Number <span className="text-red-500">*</span></Label>
                  <Input
  id="ctinNumber"
  {...register("ctinNumber")}
  placeholder="Enter TIN Number"
  className="mt-1"
/>

                  <p className="text-xs text-gray-500 mt-1">Tax Identification Number</p>
                  {errors.ctinNumber && <p className="text-sm text-red-500 mt-1">{errors.ctinNumber.message}</p>}
                </div>

                <div>
                  <Label htmlFor="cvrnNumber" className="text-sm font-medium text-gray-700">VRN Number <span className="text-red-500">*</span></Label>
                  <Input
  id="cvrnNumber"
  {...register("cvrnNumber")}
  placeholder="Enter VRN number"
  className="mt-1"
/>
                  <p className="text-xs text-gray-500 mt-1">VAT Registration Number</p>
                  {errors.cvrnNumber && <p className="text-sm text-red-500 mt-1">{errors.cvrnNumber.message}</p>}
                </div>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-medium text-amber-900 mb-3">Financial Information</h4>
                <div className="text-sm text-amber-800 space-y-2">
                  <p><strong>Currency:</strong> All transactions will be processed in the selected currency</p>
                  <p><strong>TIN Number:</strong> Required for business customers and large transactions</p>
                  <p><strong>VRN Number:</strong> Required for VAT-registered customers</p>
                  <p><strong>Payment Methods:</strong> Mobile money, bank transfer, cash, credit card</p>
                </div>
              </div>
            </div>
          </div>
        );

      case "kyc":
  return (
    <div className="w-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload required documents for identity verification and SAP Business Partner creation approval
        </h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form Fields */}
        <div className="space-y-6">
          {/* KYC Document Numbers */}
          <div>
            <Label htmlFor="kycDocNoPOI" className="font-medium">KYC Document Number (POI)</Label>
            <Input
              id="kycDocNoPOI"
              value={watchedFields.kycDocNoPOI || ""}
              onChange={e => setValue("kycDocNoPOI", e.target.value)}
              placeholder="e.g., NIDA-123456789, PP-A12345"
            />
            <p className="text-xs text-gray-500 mt-1">Official document number from government ID/passport</p>
            {errors.kycDocNoPOI && <p className="text-xs text-red-500">{errors.kycDocNoPOI.message}</p>}
          </div>
          <div>
            <Label htmlFor="kycDocNoPOA" className="font-medium">KYC Document Number (POA)</Label>
            <Input
              id="kycDocNoPOA"
              value={watchedFields.kycDocNoPOA || ""}
              onChange={e => setValue("kycDocNoPOA", e.target.value)}
              placeholder="e.g., Utility Bill-12345"
            />
            <p className="text-xs text-gray-500 mt-1">Official document number from proof of address</p>
            {errors.kycDocNoPOA && <p className="text-xs text-red-500">{errors.kycDocNoPOA.message}</p>}
          </div>

          {/* File Uploads */}
          <div>
            <Label className="font-medium">POA (Proof of Address) Documents</Label>
            <div className="border-2 border-dashed border-gray-300 hover:border-azam-blue transition-colors rounded-lg p-6 text-center cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="kycPoa"
                onChange={e => setValue("kycPoa", e.target.files?.[0])}
              />
              <label htmlFor="kycPoa" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="font-medium">Upload POA Documents</span>
                <span className="text-xs text-gray-500">Utility bill, bank statement, etc.</span>
                {watchedFields.kycPoa && (
                  <span className="text-xs text-green-700 mt-2">
                    Selected: {watchedFields.kycPoa.name}
                  </span>
                )}
              </label>
            </div>
          </div>
          <div>
            <Label className="font-medium">POI (Proof of Identity) Documents</Label>
            <div className="border-2 border-dashed border-gray-300 hover:border-azam-blue transition-colors rounded-lg p-6 text-center cursor-pointer">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="kycPoi"
                onChange={e => setValue("kycPoi", e.target.files?.[0])}
              />
              <label htmlFor="kycPoi" className="cursor-pointer flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="font-medium">Upload POI Documents</span>
                <span className="text-xs text-gray-500">National ID, passport, driver's license</span>
                {watchedFields.kycPoi && (
                  <span className="text-xs text-green-700 mt-2">
                    Selected: {watchedFields.kycPoi.name}
                  </span>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Right: Info Panels */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Document Number Info</h4>
            <div className="text-sm text-blue-800">
              <div><strong>POI:</strong> National ID, Passport, Driver's License</div>
              <div><strong>POA:</strong> Utility Bill, Bank Statement, Rental Agreement</div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">Required Documents</h4>
            <div className="text-sm text-green-800">
              <div className="mb-1"><strong>POA (Proof of Address):</strong></div>
              <ul className="ml-4 list-disc">
                <li>Utility Bill</li>
                <li>Bank Statement</li>
                <li>Rental Agreement</li>
              </ul>
              <div className="mt-2 mb-1"><strong>POI (Proof of Identity):</strong></div>
              <ul className="ml-4 list-disc">
                <li>National ID (NIDA)</li>
                <li>Passport</li>
                <li>Driver's License</li>
              </ul>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Preview Feature</h4>
            <p className="text-sm text-yellow-800 mb-3">
              Before final submission, you can preview your application and all uploaded documents to ensure accuracy.
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full font-semibold flex items-center justify-center"
              onClick={() => setShowPreview(true)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Preview Application
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

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
              <span className="text-sm font-medium text-gray-700">Customer Registration:</span>
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
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card className="shadow-sm">
          <CardContent className="p-0">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
             <div className="border-b border-gray-200 bg-gray-50 w-full">
  <TabsList>
    {tabs.map((tab) => {
      const Icon = tab.icon;
      return (
        <TabsTrigger key={tab.id} value={tab.id}>
          {Icon && <Icon className="h-4 w-4 md:mr-2" />}
          <span className="hidden md:inline">{tab.name}</span>
        </TabsTrigger>
      );
    })}
  </TabsList>
  </div>
  <TabsContent value={activeTab} className="p-6 m-0">
    {renderTabContent()}
  </TabsContent>
</Tabs>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between items-center bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex space-x-3">
            <Button type="button" variant="outline" size="sm">
              Save as Draft
            </Button>
            {/* <Button type="button" variant="outline" size="sm">
              Preview
            </Button> */}
          </div>
          
          <div className="flex space-x-3">
            <Button type="button" variant="outline" size="sm">
              Cancel
            </Button>
            {activeTab !== 'kyc' ? (
  <Button type="button" onClick={handleNext}>Next</Button>
) : (
  <Button
  type="button"
  disabled={isLoading}
  size="sm"
  className="bg-blue-600 hover:bg-blue-700 flex-1 sm:flex-none"
  onClick={() => handleSubmit(handleFormSubmit)()}
>
  {isLoading
    ? "Processing..."
    : isEdit
    ? "Update Application"
    : "Submit Application"}
</Button>
)}
          </div>
        </div>
        {showPreview && (
  <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg p-8 max-w-2xl w-full shadow-lg relative">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-900"
        onClick={() => setShowPreview(false)}
      >
        <X className="h-6 w-6" />
      </button>
      {renderPreview()}
    </div>
  </div>
)}
      </form>
    </div>
  );
}