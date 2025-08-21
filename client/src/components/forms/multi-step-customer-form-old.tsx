import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCustomerSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CloudUpload, User, MapPin, Settings, CreditCard, Upload, FileText, Building, Banknote, Hash } from "lucide-react";
import type { z } from "zod";

type CustomerFormData = z.infer<typeof insertCustomerSchema>;

interface MultiStepCustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<CustomerFormData>;
}

const tabs = [
  { id: "general", name: "General Data", icon: User },
  { id: "personal", name: "Personal Details", icon: FileText },
  { id: "address", name: "Address Details", icon: MapPin },
  { id: "service", name: "Service Settings", icon: Settings },
  { id: "financial", name: "Financial & Tax", icon: Banknote },
  { id: "kyc", name: "KYC Documents", icon: Upload }
];

export default function MultiStepCustomerForm({ onSubmit, isLoading, defaultValues }: MultiStepCustomerFormProps) {
  const [activeTab, setActiveTab] = useState("general");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(insertCustomerSchema),
    defaultValues: {
      customerType: "Individual",
      addressType: "Billing",
      currency: "TSH",
      smsFlag: true,
      connectionType: "Prepaid",
      ...defaultValues,
    },
    mode: "onChange"
  });

  const watchedFields = watch();

  const handleFormSubmit = async (data: CustomerFormData) => {
    onSubmit(data);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            {/* Personal Details Section */}
            <div className="border-b pb-6">
              <h3 className="text-lg font-medium mb-4">Personal Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="title">Title *</Label>
                  <Select value={watchedFields.title} onValueChange={(value) => setValue("title", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr">Mr</SelectItem>
                      <SelectItem value="Mrs">Mrs</SelectItem>
                      <SelectItem value="Ms">Ms</SelectItem>
                      <SelectItem value="Dr">Dr</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    placeholder="Enter first name"
                    className="mt-1"
                  />
                  {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="middleName">Middle Name</Label>
                  <Input
                    id="middleName"
                    {...register("middleName")}
                    placeholder="Enter middle name"
                    className="mt-1"
                  />
                  {errors.middleName && <p className="text-sm text-red-500 mt-1">{errors.middleName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className="mt-1"
                  />
                  {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select value={watchedFields.gender} onValueChange={(value) => setValue("gender", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-sm text-red-500 mt-1">{errors.gender.message}</p>}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className="mt-1"
                  />
                  {errors.dateOfBirth && <p className="text-sm text-red-500 mt-1">{errors.dateOfBirth.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="race">Race *</Label>
                  <Select value={watchedFields.race} onValueChange={(value) => setValue("race", value)}>
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

                <div>
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Select value={watchedFields.orgName} onValueChange={(value) => setValue("orgName", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JIPE RAHA">JIPE RAHA</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.orgName && <p className="text-sm text-red-500 mt-1">{errors.orgName.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
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
                  <Label htmlFor="altPhone">Alternative Phone</Label>
                  <Input
                    id="altPhone"
                    type="tel"
                    {...register("altPhone")}
                    placeholder="+255 xxx xxx xxx"
                    className="mt-1"
                  />
                  {errors.altPhone && <p className="text-sm text-red-500 mt-1">{errors.altPhone.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="mobile">Mobile *</Label>
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
                  <Label htmlFor="fax">Fax</Label>
                  <Input
                    id="fax"
                    {...register("fax")}
                    placeholder="Enter fax number"
                    className="mt-1"
                  />
                  {errors.fax && <p className="text-sm text-red-500 mt-1">{errors.fax.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="customer@example.com"
                    className="mt-1"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="altEmail">Alternative Email</Label>
                  <Input
                    id="altEmail"
                    type="email"
                    {...register("altEmail")}
                    placeholder="alternative@example.com"
                    className="mt-1"
                  />
                  {errors.altEmail && <p className="text-sm text-red-500 mt-1">{errors.altEmail.message}</p>}
                </div>
              </div>
            </div>

            {/* Address Details Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">Address Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="addressType">Address Type *</Label>
                  <Select value={watchedFields.addressType} onValueChange={(value) => setValue("addressType", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Address Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Billing">Billing</SelectItem>
                      <SelectItem value="Installation">Installation</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.addressType && <p className="text-sm text-red-500 mt-1">{errors.addressType.message}</p>}
                </div>

                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Select value={watchedFields.country} onValueChange={(value) => setValue("country", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tanzania">Tanzania</SelectItem>
                      <SelectItem value="Kenya">Kenya</SelectItem>
                      <SelectItem value="Uganda">Uganda</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.country && <p className="text-sm text-red-500 mt-1">{errors.country.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Select value={watchedFields.region} onValueChange={(value) => setValue("region", value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dar es Salaam">Dar es Salaam</SelectItem>
                      <SelectItem value="Arusha">Arusha</SelectItem>
                      <SelectItem value="Mwanza">Mwanza</SelectItem>
                      <SelectItem value="Dodoma">Dodoma</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.region && <p className="text-sm text-red-500 mt-1">{errors.region.message}</p>}
                </div>

                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Enter city"
                    className="mt-1"
                  />
                  {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="district">District *</Label>
                  <Input
                    id="district"
                    {...register("district")}
                    placeholder="Enter district"
                    className="mt-1"
                  />
                  {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district.message}</p>}
                </div>

                <div>
                  <Label htmlFor="ward">Ward *</Label>
                  <Input
                    id="ward"
                    {...register("ward")}
                    placeholder="Enter ward"
                    className="mt-1"
                  />
                  {errors.ward && <p className="text-sm text-red-500 mt-1">{errors.ward.message}</p>}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="address1">Address 1 *</Label>
                  <Input
                    id="address1"
                    {...register("address1")}
                    placeholder="Enter primary address"
                    className="mt-1"
                  />
                  {errors.address1 && <p className="text-sm text-red-500 mt-1">{errors.address1.message}</p>}
                </div>

                <div>
                  <Label htmlFor="address2">Address 2</Label>
                  <Input
                    id="address2"
                    {...register("address2")}
                    placeholder="Enter secondary address (optional)"
                    className="mt-1"
                  />
                  {errors.address2 && <p className="text-sm text-red-500 mt-1">{errors.address2.message}</p>}
                </div>

                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
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

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerType">Customer Type *</Label>
                <Select value={watchedFields.customerType} onValueChange={(value) => setValue("customerType", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Customer Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Individual">Individual</SelectItem>
                    <SelectItem value="Organization">Organization</SelectItem>
                  </SelectContent>
                </Select>
                {errors.customerType && <p className="text-sm text-red-500 mt-1">{errors.customerType.message}</p>}
              </div>

              <div>
                <Label htmlFor="serviceType">Service Type *</Label>
                <Select value={watchedFields.serviceType} onValueChange={(value) => setValue("serviceType", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Service Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DTT">DTT (Digital Terrestrial TV)</SelectItem>
                    <SelectItem value="DTH">DTH (Direct to Home)</SelectItem>
                    <SelectItem value="OTT">OTT (Azam Max)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.serviceType && <p className="text-sm text-red-500 mt-1">{errors.serviceType.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="accountClass">Account Class *</Label>
                <Select value={watchedFields.accountClass} onValueChange={(value) => setValue("accountClass", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Account Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Residential">Residential</SelectItem>
                    <SelectItem value="VIP">VIP</SelectItem>
                    <SelectItem value="Hotels">Hotels</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Demo">Demo</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
                {errors.accountClass && <p className="text-sm text-red-500 mt-1">{errors.accountClass.message}</p>}
              </div>

              <div>
                <Label htmlFor="connectionType">Connection Type *</Label>
                <Select value={watchedFields.connectionType} onValueChange={(value) => setValue("connectionType", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Connection Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Postpaid">Postpaid</SelectItem>
                    <SelectItem value="Prepaid">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
                {errors.connectionType && <p className="text-sm text-red-500 mt-1">{errors.connectionType.message}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Switch
                id="smsFlag"
                checked={watchedFields.smsFlag}
                onCheckedChange={(checked) => setValue("smsFlag", checked)}
              />
              <Label htmlFor="smsFlag">Enable SMS notifications</Label>
            </div>

            <div>
              <Label htmlFor="parentCustomerId">Parent Customer (Optional)</Label>
              <Input
                id="parentCustomerId"
                type="number"
                {...register("parentCustomerId", { valueAsNumber: true })}
                placeholder="Enter parent customer ID if applicable"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">For child accounts, enter the parent BP ID</p>
              {errors.parentCustomerId && <p className="text-sm text-red-500 mt-1">{errors.parentCustomerId.message}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="currency">Currency *</Label>
                <Select value={watchedFields.currency} onValueChange={(value) => setValue("currency", value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select Currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TSH">Tanzanian Shilling (TSH)</SelectItem>
                    <SelectItem value="USD">US Dollar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.currency && <p className="text-sm text-red-500 mt-1">{errors.currency.message}</p>}
              </div>

              <div>
                <Label htmlFor="tinNumber">TIN Number</Label>
                <Input
                  id="tinNumber"
                  {...register("tinNumber")}
                  placeholder="Enter TIN number (optional)"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Tax Identification Number if available</p>
                {errors.tinNumber && <p className="text-sm text-red-500 mt-1">{errors.tinNumber.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="vrnNumber">VRN Number</Label>
                <Input
                  id="vrnNumber"
                  {...register("vrnNumber")}
                  placeholder="Enter VRN number (optional)"
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">Required for Commercial/Hotel customers</p>
                {errors.vrnNumber && <p className="text-sm text-red-500 mt-1">{errors.vrnNumber.message}</p>}
              </div>

              <div>
                <Label htmlFor="azamPayId">Azam Pay ID</Label>
                <Input
                  id="azamPayId"
                  {...register("azamPayId")}
                  placeholder="Enter Azam Pay ID (optional)"
                  className="mt-1"
                />
                {errors.azamPayId && <p className="text-sm text-red-500 mt-1">{errors.azamPayId.message}</p>}
              </div>
            </div>

            <div>
              <Label htmlFor="azamMaxTvId">Azam MAX TV ID</Label>
              <Input
                id="azamMaxTvId"
                {...register("azamMaxTvId")}
                placeholder="Enter registered mobile/email (optional)"
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">If already registered with Azam MAX TV</p>
              {errors.azamMaxTvId && <p className="text-sm text-red-500 mt-1">{errors.azamMaxTvId.message}</p>}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">KYC Document Upload</h3>
              <p className="text-gray-600 mb-6">Upload relevant KYC documents with reference numbers</p>
            </div>

            <Card className="border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors cursor-pointer">
              <CardContent className="p-8 text-center">
                <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">Drop files here or click to upload</p>
                <p className="text-sm text-gray-500 mb-4">Supported formats: PDF, JPG, PNG (max 10MB each)</p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>• National ID / Passport</p>
                  <p>• Proof of Address</p>
                  <p>• Business Registration (for Organizations)</p>
                  <p>• VAT Certificate (if applicable)</p>
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> After submission, your application will be processed and you'll receive an onboarding reference number. 
                The system will create your business partner account and contract details automatically.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = currentStep === step.id;
            const isAccessible = step.id <= currentStep || isCompleted;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center cursor-pointer ${
                    isAccessible ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                  onClick={() => isAccessible && goToStep(step.id)}
                >
                  <div
                    className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 border-blue-500 text-white'
                        : isAccessible
                        ? 'border-gray-300 text-gray-500 hover:border-blue-500'
                        : 'border-gray-200 text-gray-300'
                    }`}
                  >
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-700'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-gray-500 max-w-32">{step.description}</p>
                  </div>
                </div>
                
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    completedSteps.includes(step.id) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Badge variant="outline">Step {currentStep} of {steps.length}</Badge>
            <span>{steps[currentStep - 1].name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <div className="space-x-3">
                <Button type="button" variant="outline">
                  Save as Draft
                </Button>

                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Registering..." : "Submit Request"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}