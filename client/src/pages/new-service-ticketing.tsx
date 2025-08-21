import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { ArrowLeft, Upload, X, AlertCircle, Clock, CheckCircle, User, MapPin, Calendar, Users, MessageSquare, Link, Mail, Bell } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { TicketType, TicketPriority, TicketChannel, TicketStatus, TicketAssignmentGroup } from '../../../shared/schema';

// Form validation schema with all enhanced fields
const createTicketSchema = z.object({
  ticketType: z.enum([
    TicketType.HARDWARE,
    TicketType.SUBSCRIPTION,
    TicketType.BILLING,
    TicketType.TECHNICAL,
  ] as [string, ...string[]]),
  smartCardNumber: z.string().optional(),
  customerId: z.string().optional(),
  issueDescription: z.string().min(10, 'Issue description must be at least 10 characters'),
  priority: z.enum([
    TicketPriority.LOW,
    TicketPriority.MEDIUM,
    TicketPriority.HIGH,
  ] as [string, ...string[]]),
  channel: z.enum([
    TicketChannel.PORTAL,
    TicketChannel.OTC,
    TicketChannel.CALL_CENTER,
  ] as [string, ...string[]]),
  
  // Assignment fields
  assignmentGroup: z.string().optional(),
  assignee: z.string().optional(),
  
  // Status tracking
  status: z.enum([
    TicketStatus.NEW,
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ] as [string, ...string[]]).default(TicketStatus.NEW),
  
  // Work notes and comments
  workNotes: z.string().optional(),
  
  // Incident linking
  linkedIncidentIds: z.array(z.string()).optional(),
  
  // Notification settings
  emailAlerts: z.boolean().default(true),
  smsAlerts: z.boolean().default(false),
  notifyOnUpdate: z.boolean().default(true),
  stakeholderEmails: z.string().optional(), // Comma-separated email list
});

type FormData = z.infer<typeof createTicketSchema>;

export default function ServiceTicketing() {
  const [, setLocation] = useLocation();
  const [attachments, setAttachments] = useState<File[]>([]);
  const [availableIncidents, setAvailableIncidents] = useState<string[]>(['SYS-2025-001', 'SYS-2025-002']);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock current user info (in real app, get from auth context)
  const currentUser = {
    name: 'John Doe',
    email: 'john.doe@azamtv.co.tz',
    location: 'Dar es Salaam Office',
    role: 'Agent'
  };

  const form = useForm<FormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      ticketType: TicketType.HARDWARE,
      smartCardNumber: '',
      customerId: '',
      issueDescription: '',
      priority: TicketPriority.MEDIUM,
      channel: TicketChannel.PORTAL,
      assignmentGroup: '',
      assignee: '',
      status: TicketStatus.NEW,
      workNotes: '',
      linkedIncidentIds: [],
      emailAlerts: true,
      smsAlerts: false,
      notifyOnUpdate: true,
      stakeholderEmails: '',
    },
  });

  // Create ticket mutation with enhanced data
  const createTicketMutation = useMutation({
    mutationFn: async (data: FormData & { attachments?: string[] }) => {
      const response = await fetch('/api/service-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          userInfo: currentUser.name,
          userLocation: currentUser.location,
          createdOn: new Date(),
          linkedIncidentIds: data.linkedIncidentIds || [],
          notificationSettings: {
            emailAlerts: data.emailAlerts,
            smsAlerts: data.smsAlerts,
            notifyOnUpdate: data.notifyOnUpdate,
            stakeholders: data.stakeholderEmails ? data.stakeholderEmails.split(',').map(e => e.trim()) : []
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create service ticket');
      }
      
      return response.json();
    },
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-tickets'] });
      toast({
        title: 'Success',
        description: `Service ticket ${ticket.ticketId} created successfully`,
      });
      setLocation('/service-ticketing');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create service ticket',
        variant: 'destructive',
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, 5 - attachments.length);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: FormData) => {
    const attachmentUrls = attachments.map(file => `attachment_${file.name}`);
    createTicketMutation.mutate({
      ...data,
      attachments: attachmentUrls,
    });
  };

  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Form */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Create Service Ticket</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="basic">Basic Info</TabsTrigger>
                      <TabsTrigger value="assignment">Assignment</TabsTrigger>
                      <TabsTrigger value="linking">Linking</TabsTrigger>
                      <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>
                    
                    {/* Basic Information Tab */}
                    <TabsContent value="basic" className="space-y-6 mt-4">
                      {/* Ticket Type and Channel */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="ticketType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ticket Type *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select ticket type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={TicketType.HARDWARE}>Hardware</SelectItem>
                                  <SelectItem value={TicketType.SUBSCRIPTION}>Subscription</SelectItem>
                                  <SelectItem value={TicketType.BILLING}>Billing</SelectItem>
                                  <SelectItem value={TicketType.TECHNICAL}>Technical</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="channel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Channel *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select channel" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={TicketChannel.PORTAL}>Portal</SelectItem>
                                  <SelectItem value={TicketChannel.OTC}>OTC</SelectItem>
                                  <SelectItem value={TicketChannel.CALL_CENTER}>Call Center</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Priority and Status */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Priority *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select priority" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={TicketPriority.LOW}>Low</SelectItem>
                                  <SelectItem value={TicketPriority.MEDIUM}>Medium</SelectItem>
                                  <SelectItem value={TicketPriority.HIGH}>High</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status *</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={TicketStatus.NEW}>New</SelectItem>
                                  <SelectItem value={TicketStatus.IN_PROGRESS}>In Progress</SelectItem>
                                  <SelectItem value={TicketStatus.RESOLVED}>Resolved</SelectItem>
                                  <SelectItem value={TicketStatus.CLOSED}>Closed</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Customer Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="smartCardNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Smart Card Number</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter smart card number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Customer ID</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter customer ID" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Issue Description */}
                      <FormField
                        control={form.control}
                        name="issueDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Provide detailed description of the issue..."
                                className="min-h-32"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Work Notes */}
                      <FormField
                        control={form.control}
                        name="workNotes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Notes / Internal Comments</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Internal updates or agent remarks..."
                                className="min-h-24"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* File Attachments */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Attachments (Optional)</label>
                          <div className="mt-2">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">Screenshots, Error Logs, Receipts (Max 5 files)</p>
                              </div>
                              <input
                                type="file"
                                className="hidden"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.txt,.log"
                                onChange={handleFileUpload}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Attached Files */}
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium">Attached Files:</p>
                            {attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* Assignment Tab */}
                    <TabsContent value="assignment" className="space-y-6 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="assignmentGroup"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assignment Group</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select assignment group" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value={TicketAssignmentGroup.TECHNICAL_SUPPORT}>Technical Support</SelectItem>
                                  <SelectItem value={TicketAssignmentGroup.HARDWARE_TEAM}>Hardware Team</SelectItem>
                                  <SelectItem value={TicketAssignmentGroup.BILLING_TEAM}>Billing Team</SelectItem>
                                  <SelectItem value={TicketAssignmentGroup.SUBSCRIPTION_TEAM}>Subscription Team</SelectItem>
                                  <SelectItem value={TicketAssignmentGroup.FIELD_OPERATIONS}>Field Operations</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="assignee"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assignee (Individual)</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter assignee name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>

                    {/* Linking Tab */}
                    <TabsContent value="linking" className="space-y-6 mt-4">
                      <FormField
                        control={form.control}
                        name="linkedIncidentIds"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Link to Related Incidents</FormLabel>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600">
                                Select system incidents that are related to this ticket:
                              </p>
                              {availableIncidents.map((incidentId) => (
                                <div key={incidentId} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={incidentId}
                                    checked={field.value?.includes(incidentId) || false}
                                    onChange={(e) => {
                                      const current = field.value || [];
                                      if (e.target.checked) {
                                        field.onChange([...current, incidentId]);
                                      } else {
                                        field.onChange(current.filter(id => id !== incidentId));
                                      }
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <label htmlFor={incidentId} className="text-sm">
                                    {incidentId} - System outage affecting Portal services
                                  </label>
                                </div>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>

                    {/* Notifications Tab */}
                    <TabsContent value="notifications" className="space-y-6 mt-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-medium">Notification Settings</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <FormField
                            control={form.control}
                            name="emailAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Email Alerts</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Receive email notifications on updates
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="smsAlerts"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">SMS Alerts</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Receive SMS notifications on updates
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="notifyOnUpdate"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">Update Notifications</FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    Get notified on any ticket updates
                                  </p>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="stakeholderEmails"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stakeholder Email List</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter email addresses separated by commas" 
                                  {...field} 
                                />
                              </FormControl>
                              <p className="text-sm text-muted-foreground">
                                Additional email addresses to notify on ticket updates
                              </p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex gap-4 pt-6">
                    <Button 
                      type="submit" 
                      disabled={createTicketMutation.isPending}
                      className="flex-1"
                    >
                      {createTicketMutation.isPending ? 'Creating Ticket...' : 'Create Service Ticket'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setLocation('/dashboard')}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Auto-filled Information Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Auto-filled Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">User Information</span>
                </div>
                <div className="pl-6 space-y-1">
                  <p className="text-sm"><span className="font-medium">Name:</span> {currentUser.name}</p>
                  <p className="text-sm"><span className="font-medium">Email:</span> {currentUser.email}</p>
                  <p className="text-sm"><span className="font-medium">Role:</span> {currentUser.role}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm">{currentUser.location}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium">Timestamp</span>
                </div>
                <div className="pl-6">
                  <p className="text-sm">{new Date().toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auto-assignment Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium">Hardware Issues</p>
                  <p className="text-gray-600">→ Hardware Team</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Subscription Issues</p>
                  <p className="text-gray-600">→ Subscription Team</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                <div>
                  <p className="font-medium">Billing Issues</p>
                  <p className="text-gray-600">→ Billing Team</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}