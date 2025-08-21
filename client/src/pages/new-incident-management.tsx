import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { 
  ArrowLeft, 
  Mail, 
  RotateCcw, 
  Send, 
  Search, 
  BookOpen,
  Monitor,
  User,
  AlertTriangle,
  Info,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Schema based on UI specification
const newIncidentSchema = z.object({
  client: z.string().min(1, 'Client is required'),
  commonFaults: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subCategory: z.string().min(1, 'Sub Category is required'),
  status: z.string().default('OPEN'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  userId: z.string().min(1, 'User ID is required'),
  configurationItem: z.string().min(1, 'Configuration Item is required'),
  assignmentGroup: z.string().min(1, 'Assignment Group is required'),
  assignedTo: z.string().optional(),
  channel: z.string().default('Others'),
  alternateLocation: z.string().optional(),
  alternateContact: z.string().optional(),
  shortDescription: z.string().min(1, 'Short Description is required'),
  additionalComments: z.string().min(1, 'Additional Comments is required'),
});

type FormData = z.infer<typeof newIncidentSchema>;

// API response types
interface FormDataResponse {
  success: boolean;
  data: {
    clientOptions: Array<{ value: string; label: string }>;
    commonFaultsOptions: Array<{ value: string; label: string }>;
    categoryOptions: Array<{ value: string; label: string }>;
    subCategoryMap: Record<string, Array<{ value: string; label: string }>>;
    priorityOptions: Array<{ value: string; label: string; sla: string }>;
    channelOptions: Array<{ value: string; label: string }>;
    assignmentGroups: Array<{ value: string; label: string }>;
    defaultValues: any;
  };
}

export default function NewIncidentManagement() {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('network');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [assetSearchQuery, setAssetSearchQuery] = useState('');
  const [showKBSearch, setShowKBSearch] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('sla');
  const [isSlaOpen, setIsSlaOpen] = useState(true);
  const [isOlaOpen, setIsOlaOpen] = useState(true);
  const [isUpcOpen, setIsUpcOpen] = useState(true);

  // Fetch form configuration data
  const { data: formData, isLoading: isFormDataLoading } = useQuery({
    queryKey: ['/api/incident-form-data'],
    queryFn: async () => {
      const response = await fetch('/api/incident-form-data');
      if (!response.ok) throw new Error('Failed to fetch form data');
      return response.json() as Promise<FormDataResponse>;
    }
  });

  // Fetch current incident data
  const { data: currentData, isLoading: isCurrentDataLoading } = useQuery({
    queryKey: ['/api/incident-current-data'],
    queryFn: async () => {
      const response = await fetch('/api/incident-current-data');
      if (!response.ok) throw new Error('Failed to fetch current data');
      return response.json();
    }
  });

  const form = useForm<FormData>({
    resolver: zodResolver(newIncidentSchema),
    defaultValues: formData?.data?.defaultValues || {},
  });

  // Current user and timestamp from API
  const currentUser = currentData?.data?.currentUser;
  const openedTimestamp = currentData?.data?.openedTimestamp ? new Date(currentData.data.openedTimestamp) : new Date();

  // Calculate target resolve date based on priority
  const calculateTargetDate = (priority: string) => {
    const targetDate = new Date();
    switch (priority) {
      case 'Critical':
        targetDate.setHours(targetDate.getHours() + 4);
        break;
      case 'High':
        targetDate.setDate(targetDate.getDate() + 1);
        break;
      case 'Medium':
        targetDate.setDate(targetDate.getDate() + 3);
        break;
      case 'Low':
        targetDate.setDate(targetDate.getDate() + 7);
        break;
      default:
        targetDate.setDate(targetDate.getDate() + 3);
    }
    return targetDate;
  };

  const [targetResolveDate, setTargetResolveDate] = useState(calculateTargetDate('High'));

  // Incident number from API
  const incidentNumber = currentData?.data?.incidentNumber || 'INC0000426';

  // Fetch SLA data
  const { data: slaResponse, isLoading: isSlaLoading } = useQuery({
    queryKey: ['/api/incident-sla-data'],
    queryFn: async () => {
      const response = await fetch('/api/incident-sla-data');
      if (!response.ok) throw new Error('Failed to fetch SLA data');
      return response.json();
    }
  });

  const slaData = slaResponse?.data?.slaData || [];
  const olaData = slaResponse?.data?.olaData || [];
  const upcData = slaResponse?.data?.upcData || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />{status}</Badge>;
      case 'In Progress':
        return <Badge className="bg-orange-100 text-orange-800 border-orange-300"><Play className="h-3 w-3 mr-1" />{status}</Badge>;
      case 'Breached':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" />{status}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
    }
  };

  // User search API
  const { data: userSearchResponse, isLoading: isUserSearchLoading } = useQuery({
    queryKey: ['/api/users/search', userSearchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/users/search?query=${encodeURIComponent(userSearchQuery)}`);
      if (!response.ok) throw new Error('Failed to search users');
      return response.json();
    },
    enabled: userSearchQuery.length > 0
  });

  const userSearchResults = userSearchResponse?.data || [];

  // Asset search API
  const { data: assetSearchResponse, isLoading: isAssetSearchLoading } = useQuery({
    queryKey: ['/api/assets/search', assetSearchQuery],
    queryFn: async () => {
      const response = await fetch(`/api/assets/search?query=${encodeURIComponent(assetSearchQuery)}`);
      if (!response.ok) throw new Error('Failed to search assets');
      return response.json();
    },
    enabled: assetSearchQuery.length > 0
  });

  const assetSearchResults = assetSearchResponse?.data || [];

  // Create incident mutation
  const createIncidentMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          incidentNumber,
          openedBy: currentUser?.id || 'AGENT001',
          opened: openedTimestamp,
          targetResolveDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create incident');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Incident ${incidentNumber} has been created successfully.`,
      });
      form.reset();
      setHasUnsavedChanges(false);
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create incident. Please try again.',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormData) => {
    createIncidentMutation.mutate(data);
  };

  // Handle form reset
  const handleReset = () => {
    form.reset();
    setSelectedCategory('');
    setSelectedUser(null);
    setUserSearchQuery('');
    setAssetSearchQuery('');
    setHasUnsavedChanges(false);
  };

  // Watch for form changes to detect unsaved changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (type === 'change') {
        setHasUnsavedChanges(true);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Update target resolve date when priority changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'priority' && value.priority) {
        setTargetResolveDate(calculateTargetDate(value.priority));
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Bar - Consolidated Single Bar */}
      <div className="bg-white border-b border-gray-300 shadow-sm w-full">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm font-medium text-gray-700">
                AzamTV Service Desk - New Incident
              </div>
              <div className="text-sm text-gray-500 ml-4 flex items-center">
                Incident #: <strong>{incidentNumber}</strong>
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 ml-3">High Priority</Badge>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                type="submit" 
                disabled={createIncidentMutation.isPending}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white px-6 py-2 h-9 text-sm shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg font-semibold"
              >
                <Send className="h-3 w-3 mr-1" />
                {createIncidentMutation.isPending ? 'Submitting...' : 'Submit'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                className="border-gray-400 text-gray-700 px-6 py-2 h-9 text-sm shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold bg-white hover:bg-gray-50"
                onClick={handleReset}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Clear
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Form Container - Full width */}
      <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="w-full p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              {/* Toolbar */}


              {/* Form Content - Two Column Layout, compact */}
              <div className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column - Incident Details */}
                    <div className="space-y-3">
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-blue-900 mb-3 pb-2 border-b-2 border-blue-200 bg-gradient-to-r from-blue-100 to-white px-3 py-2 rounded-t-lg shadow-sm">
                          📋 Incident Details
                        </h3>
                      </div>

                      {/* Number */}
                      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Number</label>
                        <div>
                          <Input 
                            value={incidentNumber} 
                            disabled 
                            className="h-7 bg-gradient-to-r from-blue-50 to-white text-xs border border-gray-600 rounded-md text-black shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Client */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          Client
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="client"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm">
                                      <SelectValue placeholder="Please Specify" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {formData?.data?.clientOptions?.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Common Faults */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Common Faults</label>
                        <div>
                          <FormField
                            control={form.control}
                            name="commonFaults"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm">
                                      <SelectValue placeholder="Please Specify" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {formData?.data?.commonFaultsOptions?.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          Category
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value);
                                    setSelectedCategory(value);
                                    form.setValue('subCategory', '');
                                  }} 
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm">
                                      <SelectValue placeholder="Please Specify" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {formData?.data?.categoryOptions?.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Sub Category */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          Sub Category
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="subCategory"
                            render={({ field }) => (
                              <FormItem>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                  disabled={!selectedCategory}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm">
                                      <SelectValue placeholder="Please Specify" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {selectedCategory && formData?.data?.subCategoryMap?.[selectedCategory]?.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* State */}
                      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">State</label>
                        <div>
                          <Input 
                            value="OPEN" 
                            disabled 
                            className="h-7 bg-gradient-to-r from-blue-50 to-white text-xs border border-gray-600 rounded-md text-black shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Opened */}
                      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Opened</label>
                        <div>
                          <Input 
                            value={openedTimestamp.toLocaleDateString() + ' 16:17'} 
                            disabled 
                            className="h-7 bg-gradient-to-r from-blue-50 to-white text-xs border border-gray-600 rounded-md text-black shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Target Resolve Date */}
                      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Target Resolve Date</label>
                        <div>
                          <Input 
                            value={targetResolveDate.toLocaleDateString()} 
                            disabled 
                            className="h-7 bg-gradient-to-r from-blue-50 to-white text-xs border border-gray-600 rounded-md text-black shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Alternate Location */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Alternate Location</label>
                        <div>
                          <FormField
                            control={form.control}
                            name="alternateLocation"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* White Board ID */}
                      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">White Board ID</label>
                        <div>
                          <Input 
                            value="" 
                            disabled 
                            className="h-7 bg-gradient-to-r from-blue-50 to-white text-xs border border-gray-600 rounded-md text-black shadow-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Assignment & Contact */}
                    <div className="space-y-3">
                      <div className="mb-4">
                        <h3 className="text-base font-bold text-blue-900 mb-3 pb-2 border-b-2 border-gray-200 bg-gradient-to-r from-blue-100 to-white px-3 py-2 rounded-t-lg shadow-sm">
                          👥 Assignment & Contact
                        </h3>
                      </div>

                      {/* Opened by */}
                      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Opened by</label>
                        <div>
                          <Input 
                            value="User ID" 
                            disabled 
                            className="h-7 bg-gradient-to-r from-blue-50 to-white text-xs border border-gray-600 rounded-md text-black shadow-sm"
                          />
                        </div>
                      </div>

                      {/* User ID */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          User ID
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                              <FormItem>
                                <div className="relative">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="Search users..."
                                      className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm"
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        setUserSearchQuery(e.target.value);
                                      }}
                                    />
                                  </FormControl>
                                  <Search className="h-3 w-3 absolute right-2 top-2 text-gray-400" />
                                  {userSearchQuery && userSearchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-24 overflow-y-auto">
                                      {userSearchResults.map((user) => (
                                        <button
                                          key={user.id}
                                          type="button"
                                          className="w-full text-left px-2 py-1.5 hover:bg-gray-100 hover:shadow-md flex items-center text-xs transition-all duration-200"
                                          onClick={() => {
                                            field.onChange(user.id);
                                            setSelectedUser(user);
                                            setUserSearchQuery('');
                                          }}
                                        >
                                          <User className="h-3 w-3 mr-2" />
                                          <div>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-xs text-gray-500">{user.id}</div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Location</label>
                        <div>
                          <Input 
                            value={selectedUser?.location || currentUser?.location || ''} 
                            disabled 
                            className="h-7 bg-gradient-to-r from-blue-50 to-white text-xs border border-gray-600 rounded-md text-black shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Contact Number */}
                      <div className="grid gap-2 items-center" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Contact Number</label>
                        <div>
                          <Input 
                            value={selectedUser?.contact || currentUser?.contact || ''} 
                            disabled 
                            className="h-7 bg-gradient-to-r from-blue-50 to-white text-xs border border-gray-600 rounded-md text-black shadow-sm"
                          />
                        </div>
                      </div>

                      {/* Configuration Item */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          Configuration Item
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="configurationItem"
                            render={({ field }) => (
                              <FormItem>
                                <div className="relative">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="Search assets..."
                                      className="h-7 text-xs pr-8 border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm"
                                      onChange={(e) => {
                                        field.onChange(e.target.value);
                                        setAssetSearchQuery(e.target.value);
                                      }}
                                    />
                                  </FormControl>
                                  <Monitor className="h-3 w-3 absolute right-2 top-2 text-gray-400" />
                                  {assetSearchQuery && assetSearchResults.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-xl max-h-24 overflow-y-auto">
                                      {assetSearchResults.map((asset) => (
                                        <button
                                          key={asset.id}
                                          type="button"
                                          className="w-full text-left px-2 py-1.5 hover:bg-gray-100 hover:shadow-md flex items-center text-xs transition-all duration-200"
                                          onClick={() => {
                                            field.onChange(asset.id);
                                            setAssetSearchQuery('');
                                          }}
                                        >
                                          <Monitor className="h-3 w-3 mr-2" />
                                          <div>
                                            <div className="font-medium">{asset.name}</div>
                                            <div className="text-xs text-gray-500">{asset.id}</div>
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Priority */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          Priority
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm">
                                      <SelectValue placeholder="Please Specify" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {formData?.data?.priorityOptions?.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Assignment Group */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          Assignment Group
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="assignmentGroup"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm">
                                      <SelectValue placeholder="Please Specify" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {formData?.data?.assignmentGroups?.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Assigned To */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Assigned To</label>
                        <div>
                          <FormField
                            control={form.control}
                            name="assignedTo"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Channel */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Channel</label>
                        <div>
                          <FormField
                            control={form.control}
                            name="channel"
                            render={({ field }) => (
                              <FormItem>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {formData?.data?.channelOptions?.map((option) => (
                                      <SelectItem key={option.value} value={option.value} className="text-xs">
                                        {option.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Alternate Contact */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black bg-gradient-to-r from-blue-50 to-white px-3 py-2 rounded-lg shadow-sm">Alternate Contact</label>
                        <div>
                          <FormField
                            control={form.control}
                            name="alternateContact"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    className="h-7 text-xs border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm"
                                  />
                                </FormControl>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Full Width Description Fields */}
                  <div className="mt-6 pt-4 border-t border-gray-300 bg-gradient-to-r from-blue-50 to-white rounded-lg p-3 shadow-sm">
                    <div className="space-y-3">
                      {/* Short Description */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          Short Description
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="shortDescription"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex items-center space-x-2">
                                  <FormControl>
                                    <Input 
                                      {...field} 
                                      placeholder="Brief summary of the issue"
                                      className="h-7 text-xs flex-1 border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm"
                                    />
                                  </FormControl>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 shadow-md hover:shadow-lg transition-shadow duration-200"
                                    onClick={() => setShowKBSearch(!showKBSearch)}
                                  >
                                    <BookOpen className="h-3 w-3" />
                                  </Button>
                                </div>
                                {showKBSearch && (
                                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md shadow-md">
                                    <div className="text-sm text-blue-800">
                                      💡 Knowledge Base Suggestions: Network troubleshooting, Software issues, Hardware diagnostics
                                    </div>
                                  </div>
                                )}
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {/* Additional Comments */}
                      <div className="grid gap-2 items-start" style={{ gridTemplateColumns: '30% 70%' }}>
                        <label className="text-xs font-semibold text-black px-3 py-2 rounded-lg border-l-4 border-red-500 bg-gradient-to-r from-blue-50 to-white shadow-sm">
                          Additional Comments
                        </label>
                        <div>
                          <FormField
                            control={form.control}
                            name="additionalComments"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    rows={3}
                                    placeholder="Detailed description of the issue, steps to reproduce, error messages, etc."
                                    className="text-xs resize-none border border-gray-600 bg-gradient-to-r from-blue-50 to-white rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black shadow-sm"
                                  />
                                </FormControl>
                                <div className="text-right mt-1">
                                  <span className="text-xs text-blue-600">✓ Check Spelling</span>
                                </div>
                                <FormMessage className="text-xs" />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


            </form>
          </Form>

          {/* Additional Information Section */}
          <div className="bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden mt-6">
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-base font-bold text-blue-900 mb-3 pb-2 border-b-2 border-blue-200 bg-gradient-to-r from-blue-100 to-white px-3 py-2 rounded-t-lg shadow-sm">
                  📋 Additional Information
                </h3>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="sla" className="text-xs">SLA</TabsTrigger>
                  <TabsTrigger value="work-orders" className="text-xs">Work Orders</TabsTrigger>
                  <TabsTrigger value="activity-log" className="text-xs">Activity Log</TabsTrigger>
                  <TabsTrigger value="links" className="text-xs">Links</TabsTrigger>
                  <TabsTrigger value="resolution" className="text-xs">Resolution</TabsTrigger>
                </TabsList>

                <TabsContent value="sla" className="space-y-4">
                  {/* SLA Section */}
                  <Collapsible open={isSlaOpen} onOpenChange={setIsSlaOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-gray-200 hover:bg-blue-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        {isSlaOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="font-semibold text-sm text-blue-900">SLA (Service Level Agreement)</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="text-xs font-semibold">Milestone</TableHead>
                                <TableHead className="text-xs font-semibold">Target (Min)</TableHead>
                                <TableHead className="text-xs font-semibold">Start Time</TableHead>
                                <TableHead className="text-xs font-semibold">End Time</TableHead>
                                <TableHead className="text-xs font-semibold">Actual Elapsed Time (Min)</TableHead>
                                <TableHead className="text-xs font-semibold">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {slaData.map((row, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                  <TableCell className="text-xs font-medium">{row.milestone}</TableCell>
                                  <TableCell className="text-xs">{row.targetMin}</TableCell>
                                  <TableCell className="text-xs">{row.startTime}</TableCell>
                                  <TableCell className="text-xs">{row.endTime || '-'}</TableCell>
                                  <TableCell className="text-xs">{row.actualElapsedMin}</TableCell>
                                  <TableCell className="text-xs">{getStatusBadge(row.status)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* OLA Section */}
                  <Collapsible open={isOlaOpen} onOpenChange={setIsOlaOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-green-50 to-white rounded-lg border border-gray-200 hover:bg-green-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        {isOlaOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="font-semibold text-sm text-green-900">OLA (Operational Level Agreement)</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="text-xs font-semibold">Milestone</TableHead>
                                <TableHead className="text-xs font-semibold">Target (Min)</TableHead>
                                <TableHead className="text-xs font-semibold">Start Time</TableHead>
                                <TableHead className="text-xs font-semibold">End Time</TableHead>
                                <TableHead className="text-xs font-semibold">Actual Elapsed Time (Min)</TableHead>
                                <TableHead className="text-xs font-semibold">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {olaData.map((row, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                  <TableCell className="text-xs font-medium">{row.milestone}</TableCell>
                                  <TableCell className="text-xs">{row.targetMin}</TableCell>
                                  <TableCell className="text-xs">{row.startTime}</TableCell>
                                  <TableCell className="text-xs">{row.endTime || '-'}</TableCell>
                                  <TableCell className="text-xs">{row.actualElapsedMin}</TableCell>
                                  <TableCell className="text-xs">{getStatusBadge(row.status)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* UPC Section */}
                  <Collapsible open={isUpcOpen} onOpenChange={setIsUpcOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-gray-200 hover:bg-purple-100 transition-colors">
                      <div className="flex items-center space-x-2">
                        {isUpcOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        <span className="font-semibold text-sm text-purple-900">UPC (Underpinning Contract)</span>
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-gray-50">
                                <TableHead className="text-xs font-semibold">Milestone</TableHead>
                                <TableHead className="text-xs font-semibold">Target (Min)</TableHead>
                                <TableHead className="text-xs font-semibold">Start Time</TableHead>
                                <TableHead className="text-xs font-semibold">End Time</TableHead>
                                <TableHead className="text-xs font-semibold">Actual Elapsed Time (Min)</TableHead>
                                <TableHead className="text-xs font-semibold">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {upcData.map((row, index) => (
                                <TableRow key={index} className="hover:bg-gray-50">
                                  <TableCell className="text-xs font-medium">{row.milestone}</TableCell>
                                  <TableCell className="text-xs">{row.targetMin}</TableCell>
                                  <TableCell className="text-xs">{row.startTime}</TableCell>
                                  <TableCell className="text-xs">{row.endTime || '-'}</TableCell>
                                  <TableCell className="text-xs">{row.actualElapsedMin}</TableCell>
                                  <TableCell className="text-xs">{getStatusBadge(row.status)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  {/* SLA Response Button */}
                  <div className="mt-4">
                    <Button 
                      type="button"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-xs"
                    >
                      <Clock className="h-3 w-3 mr-2" />
                      SLA Response
                    </Button>
                  </div>

                  {/* Update and Cancel Buttons */}
                  <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                    <Button 
                      type="button" 
                      variant="outline"
                      className="border-gray-400 text-gray-700 px-6 py-2 text-xs"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button"
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-xs"
                    >
                      Update
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="work-orders" className="space-y-4">
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-sm">Work Orders content will be available here</div>
                  </div>
                </TabsContent>

                <TabsContent value="activity-log" className="space-y-4">
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-sm">Activity Log content will be available here</div>
                  </div>
                </TabsContent>

                <TabsContent value="links" className="space-y-4">
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-sm">Links content will be available here</div>
                  </div>
                </TabsContent>

                <TabsContent value="resolution" className="space-y-4">
                  <div className="p-8 text-center text-gray-500">
                    <div className="text-sm">Resolution content will be available here</div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Unsaved Changes Warning */}
          {hasUnsavedChanges && (
            <div className="fixed bottom-4 right-4 bg-amber-100 border border-amber-400 rounded-lg p-3 shadow-lg z-50">
              <div className="text-sm text-amber-800 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2" />
                You have unsaved changes
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}