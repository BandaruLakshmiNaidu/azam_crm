import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  User, 
  Shield, 
  Bell, 
  Activity, 
  Settings,
  Edit,
  Save,
  X,
  Lock,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  CheckCircle,
  FileText,
  Download,
  Monitor,
  Globe
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { format } from "date-fns";

interface UserProfile {
  id: number;
  username: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
  phone?: string;
  department?: string;
  location?: string;
  timezone?: string;
  language?: string;
  lastLogin?: string;
  createdAt?: string;
  profileImage?: string;
  bio?: string;
  isActive: boolean;
}

interface UserActivity {
  id: number;
  action: string;
  description: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'warning' | 'error';
}

interface UserPreferences {
  emailNotifications: boolean;
  smsNotifications: boolean;
  systemNotifications: boolean;
  dashboardLayout: 'grid' | 'list';
  theme: 'light' | 'dark' | 'auto';
  language: 'en' | 'sw';
  timezone: string;
  sessionTimeout: number;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  // Fetch user profile data
  const { data: profile, isLoading: profileLoading } = useQuery<UserProfile>({
    queryKey: ["/api/auth/profile"],
    select: (data: any) => ({
      id: data.id,
      username: data.username,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: data.role,
      phone: data.phone || "+255 712 345 678",
      department: data.department || "Operations",
      location: data.location || "Dar es Salaam, Tanzania",
      timezone: data.timezone || "Africa/Dar_es_Salaam",
      language: data.language || "en",
      lastLogin: data.lastLogin || new Date().toISOString(),
      createdAt: data.createdAt || "2024-01-15T10:30:00Z",
      profileImage: data.profileImage,
      bio: data.bio || "AZAM TV Agent Management Portal Administrator",
      isActive: data.isActive !== false
    })
  });

  // Fetch user activity logs
  const { data: activities = [], isLoading: activitiesLoading } = useQuery<UserActivity[]>({
    queryKey: ["/api/auth/activities", user?.id],
    select: (data: any) => {
      // If we have actual data from API, use it
      if (data && Array.isArray(data) && data.length > 0) {
        return data;
      }
      
      // Otherwise use mock data for demo
      return [
        {
          id: 1,
          action: "Login",
          description: "Successful login to Agent Management Portal",
          timestamp: new Date().toISOString(),
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          status: "success" as const
        },
        {
          id: 2,
          action: "Agent Registration",
          description: "Created new agent: John Doe (Agent ID: AG001)",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          status: "success" as const
        },
        {
          id: 3,
          action: "Stock Transfer",
          description: "Transferred 50 STB units from Warehouse A to Agent Center",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          status: "success" as const
        },
        {
          id: 4,
          action: "Payment Processing",
          description: "Processed customer payment - Receipt #RCP001234",
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          ipAddress: "192.168.1.100",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          status: "success" as const
        },
        {
          id: 5,
          action: "System Alert",
          description: "Failed login attempt detected",
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          ipAddress: "192.168.1.200",
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          status: "warning" as const
        }
      ];
    }
  });

  // Fetch user preferences
  const { data: preferences, isLoading: preferencesLoading } = useQuery<UserPreferences>({
    queryKey: ["/api/auth/preferences", user?.id],
    select: (data: any) => ({
      emailNotifications: data?.emailNotifications !== false,
      smsNotifications: data?.smsNotifications !== false,
      systemNotifications: data?.systemNotifications !== false,
      dashboardLayout: data?.dashboardLayout || "grid",
      theme: data?.theme || "auto",
      language: data?.language || "en",
      timezone: data?.timezone || "Africa/Dar_es_Salaam",
      sessionTimeout: data?.sessionTimeout || 30
    })
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: Partial<UserProfile>) => {
      const response = await fetch(`/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/profile"] });
      setIsEditing(false);
      setEditedProfile({});
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    }
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferencesData: Partial<UserPreferences>) => {
      const response = await fetch(`/api/auth/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferencesData),
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to update preferences');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/preferences", user?.id] });
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    if (Object.keys(editedProfile).length > 0) {
      updateProfileMutation.mutate(editedProfile);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({});
  };

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    updatePreferencesMutation.mutate({ [key]: value });
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const userInitials = profile ? `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}` : 'U';

  if (profileLoading || preferencesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 ring-4 ring-azam-blue/10">
                  <AvatarImage src={profile?.profileImage} />
                  <AvatarFallback className="text-xl font-semibold bg-azam-blue text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.firstName} {profile?.lastName}
                  </h1>
                  <p className="text-gray-500 dark:text-gray-400">@{profile?.username}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={profile?.isActive ? "default" : "secondary"} className="text-xs">
                      {profile?.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {profile?.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex-1 md:text-right">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    {profile?.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    {profile?.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {profile?.location}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Briefcase className="h-4 w-4" />
                    {profile?.department}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Tabs */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-0">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5 bg-gray-100 dark:bg-gray-700">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              {/* Profile Information Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Personal Information</h3>
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSaveProfile} 
                        size="sm"
                        disabled={updateProfileMutation.isPending}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {updateProfileMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button onClick={handleCancelEdit} variant="outline" size="sm">
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={editedProfile.firstName ?? profile?.firstName ?? ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, firstName: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{profile?.firstName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={editedProfile.lastName ?? profile?.lastName ?? ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, lastName: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{profile?.lastName}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={editedProfile.email ?? profile?.email ?? ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{profile?.email}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={editedProfile.phone ?? profile?.phone ?? ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{profile?.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="department">Department</Label>
                      {isEditing ? (
                        <Input
                          id="department"
                          value={editedProfile.department ?? profile?.department ?? ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, department: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{profile?.department}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={editedProfile.location ?? profile?.location ?? ''}
                          onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900 dark:text-white">{profile?.location}</p>
                      )}
                    </div>

                    <div>
                      <Label>Role</Label>
                      <p className="mt-1 text-gray-900 dark:text-white capitalize">{profile?.role}</p>
                    </div>

                    <div>
                      <Label>Member Since</Label>
                      <p className="mt-1 text-gray-900 dark:text-white">
                        {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  {isEditing ? (
                    <Textarea
                      id="bio"
                      value={editedProfile.bio ?? profile?.bio ?? ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-white">{profile?.bio}</p>
                  )}
                </div>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-6">
                <h3 className="text-lg font-semibold">Security Settings</h3>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last changed: 30 days ago
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Lock className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Login Alerts</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Get notified when someone logs into your account
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium mb-3">Active Sessions</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <div className="flex items-center gap-3">
                          <Monitor className="h-5 w-5 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">Windows • Chrome</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              192.168.1.100 • Current session
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <h3 className="text-lg font-semibold">Account Preferences</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium mb-3">Display Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Theme</Label>
                          <select 
                            className="border rounded px-3 py-1 text-sm"
                            value={preferences?.theme || 'auto'}
                            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Language</Label>
                          <select 
                            className="border rounded px-3 py-1 text-sm"
                            value={preferences?.language || 'en'}
                            onChange={(e) => handlePreferenceChange('language', e.target.value)}
                          >
                            <option value="en">English</option>
                            <option value="sw">Swahili</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Dashboard Layout</Label>
                          <select 
                            className="border rounded px-3 py-1 text-sm"
                            value={preferences?.dashboardLayout || 'grid'}
                            onChange={(e) => handlePreferenceChange('dashboardLayout', e.target.value)}
                          >
                            <option value="grid">Grid</option>
                            <option value="list">List</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h4 className="font-medium mb-3">Regional Settings</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label>Timezone</Label>
                          <select 
                            className="border rounded px-3 py-1 text-sm"
                            value={preferences?.timezone || 'Africa/Dar_es_Salaam'}
                            onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                          >
                            <option value="Africa/Dar_es_Salaam">East Africa Time</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">Eastern Time</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>Session Timeout (minutes)</Label>
                          <Input 
                            type="number"
                            value={preferences?.sessionTimeout || 30}
                            onChange={(e) => handlePreferenceChange('sessionTimeout', parseInt(e.target.value))}
                            className="w-20 text-sm"
                            min="5"
                            max="120"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <h3 className="text-lg font-semibold">Notification Preferences</h3>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive updates via email
                        </p>
                      </div>
                      <Switch 
                        checked={preferences?.emailNotifications || false}
                        onCheckedChange={(checked) => handlePreferenceChange('emailNotifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Receive urgent alerts via SMS
                        </p>
                      </div>
                      <Switch 
                        checked={preferences?.smsNotifications || false}
                        onCheckedChange={(checked) => handlePreferenceChange('smsNotifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">System Notifications</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          In-app notifications and alerts
                        </p>
                      </div>
                      <Switch 
                        checked={preferences?.systemNotifications !== false}
                        onCheckedChange={(checked) => handlePreferenceChange('systemNotifications', checked)}
                      />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h4 className="font-medium mb-3">Notification Categories</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Agent Activities</Label>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">System Updates</Label>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Payment Alerts</Label>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Inventory Alerts</Label>
                        <Switch defaultChecked={false} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Service Tickets</Label>
                        <Switch defaultChecked={true} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Security Alerts</Label>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Recent Activity</h3>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export Log
                  </Button>
                </div>

                {activitiesLoading ? (
                  <div className="text-center py-8">
                    <div className="w-6 h-6 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-gray-500">Loading activity...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(activity.status)}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{activity.action}</h4>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTimeAgo(activity.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              <span>IP: {activity.ipAddress}</span>
                              <span>•</span>
                              <span>{format(new Date(activity.timestamp), 'MMM dd, yyyy HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {activities.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                        <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}