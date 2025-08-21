import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Users, Calendar, Package, DollarSign, TrendingUp, Activity, 
  Zap, Globe, Target, Star, ArrowUpRight, ArrowDownRight,
  Monitor, Signal, AlertTriangle, CheckCircle, Clock,
  BarChart3, PieChart, LineChart, Eye, Settings
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, LineChart as RechartsLineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Mock data for the redesigned dashboard
  const kpiData = [
    { title: t('dashboard.totalSubscribers'), value: "24,567", change: "+12.5%", trend: "up", icon: Users, color: "bg-blue-500" },
    { title: t('dashboard.monthlyRevenue'), value: "TSH 1.2M", change: "+8.3%", trend: "up", icon: DollarSign, color: "bg-green-500" },
    { title: t('dashboard.totalAgents'), value: "89", change: "+5.2%", trend: "up", icon: Target, color: "bg-purple-500" },
    { title: t('dashboard.systemHealth'), value: "98.7%", change: "+0.3%", trend: "up", icon: Activity, color: "bg-orange-500" },
  ];

  const revenueData = [
    { month: 'Jan', revenue: 890000, subscriptions: 1200 },
    { month: 'Feb', revenue: 950000, subscriptions: 1350 },
    { month: 'Mar', revenue: 1020000, subscriptions: 1480 },
    { month: 'Apr', revenue: 1180000, subscriptions: 1620 },
    { month: 'May', revenue: 1250000, subscriptions: 1780 },
    { month: 'Jun', revenue: 1320000, subscriptions: 1950 },
  ];

  const packageDistribution = [
    { name: t('dashboard.azamPremium'), value: 45, color: '#0ea5e9' },
    { name: t('dashboard.azamPlus'), value: 30, color: '#8b5cf6' },
    { name: t('dashboard.azamLite'), value: 20, color: '#10b981' },
    { name: t('dashboard.azamUltra'), value: 5, color: '#f59e0b' },
  ];

  const regionalData = [
    { region: 'Dar es Salaam', subscribers: 8500, revenue: 450000 },
    { region: 'Arusha', subscribers: 4200, revenue: 230000 },
    { region: 'Mwanza', subscribers: 3800, revenue: 210000 },
    { region: 'Dodoma', subscribers: 2900, revenue: 160000 },
    { region: 'Mbeya', subscribers: 2600, revenue: 140000 },
    { region: 'Morogoro', subscribers: 2568, revenue: 130000 },
  ];

  const activityData = [
    { time: '06:00', new_subs: 12, payments: 35, support: 8 },
    { time: '09:00', new_subs: 28, payments: 67, support: 15 },
    { time: '12:00', new_subs: 45, payments: 89, support: 23 },
    { time: '15:00', new_subs: 38, payments: 76, support: 18 },
    { time: '18:00', new_subs: 52, payments: 94, support: 12 },
    { time: '21:00', new_subs: 31, payments: 58, support: 7 },
  ];

  const recentActivities = [
    { id: 1, user: "John Mwangi", action: t('dashboard.newPremiumSubscription'), time: `2 ${t('dashboard.minAgo')}`, type: "success" },
    { id: 2, user: "Sarah Kimani", action: `${t('dashboard.paymentReceived')} - TSH 45,000`, time: `5 ${t('dashboard.minAgo')}`, type: "payment" },
    { id: 3, user: `${t('dashboard.agent')} Mike`, action: t('dashboard.hardwareDeliveryCompleted'), time: `8 ${t('dashboard.minAgo')}`, type: "delivery" },
    { id: 4, user: t('dashboard.system'), action: `${t('dashboard.autoRenewalProcessed')} - 15 ${t('dashboard.customers')}`, time: `12 ${t('dashboard.minAgo')}`, type: "system" },
    { id: 5, user: "Anna Mushi", action: `${t('dashboard.planChange')}: ${t('dashboard.liteToPlus')}`, time: `15 ${t('dashboard.minAgo')}`, type: "change" },
  ];

  const quickActions = [
    { title: t('dashboard.newCustomer'), subtitle: t('dashboard.registerSubscriber'), icon: Users, path: "/customer-registration", color: "bg-blue-500" },
    { title: t('dashboard.processPayment'), subtitle: t('dashboard.handlePayment'), icon: DollarSign, path: "/payments", color: "bg-green-500" },
    { title: t('dashboard.viewReports'), subtitle: t('dashboard.analyticsInsights'), icon: BarChart3, path: "/reports", color: "bg-purple-500" },
    { title: t('dashboard.manageInventory'), subtitle: t('dashboard.stockControl'), icon: Package, path: "/inventory", color: "bg-orange-500" },
    { title: t('dashboard.systemMonitor'), subtitle: t('dashboard.healthStatus'), icon: Monitor, path: "/system-health", color: "bg-red-500" },
    { title: t('dashboard.customerSupport'), subtitle: t('dashboard.helpTickets'), icon: Settings, path: "/support", color: "bg-teal-500" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-6">
        <div className="w-full space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-xl"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-300 rounded-xl"></div>
              <div className="h-96 bg-gray-300 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 px-6 py-6">
      <div className="w-full space-y-8">
        {/* System Status Footer */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-azam-blue to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Signal className="w-5 h-5" />
                          <span className="font-medium">{t('dashboard.networkStatus')}: {t('dashboard.excellent')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-5 h-5" />
                          <span className="font-medium">{t('dashboard.coverage')}: 98.7%</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                          {t('dashboard.lastUpdated')}: {new Date().toLocaleTimeString()}
                        </Badge>
                        <Button variant="outline" size="sm" className="border-white/30 text-white" style={{ backgroundColor: '#5418c3' }}
                          onMouseOver={e => e.currentTarget.style.backgroundColor = '#6a2be6'}
                          onMouseOut={e => e.currentTarget.style.backgroundColor = '#5418c3'}
                        >
                          {t('dashboard.refreshData')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>



        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {kpiData.map((kpi, index) => {
            const Icon = kpi.icon;
            const TrendIcon = kpi.trend === 'up' ? ArrowUpRight : ArrowDownRight;
            return (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                      <div className={`flex items-center space-x-1 text-sm ${kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        <TrendIcon className="w-4 h-4" />
                        <span>{kpi.change}</span>
                      </div>
                    </div>
                    <div className={`${kpi.color} p-3 rounded-lg shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className={`absolute bottom-0 left-0 right-0 h-1 ${kpi.color} opacity-20`}></div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Revenue & Subscription Trends */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">{t('dashboard.revenueSubscriptionTrends')}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">6 {t('dashboard.months')}</Badge>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="subscriptionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#0ea5e9" 
                    strokeWidth={2}
                    fill="url(#revenueGradient)" 
                    name={`${t('dashboard.revenue')} (TSH)`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="subscriptions" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    fill="url(#subscriptionGradient)" 
                    name={t('dashboard.newSubscriptions')}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200 hover:border-azam-orange/50 group"
                      onClick={() => setLocation(action.path)}
                    >
                      <div className={`${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500">{action.subtitle}</p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Secondary Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Regional Performance */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">{t('dashboard.regionalPerformance')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regionalData.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{region.region}</p>
                      <p className="text-sm text-gray-600">{region.subscribers.toLocaleString()} {t('dashboard.subscribers')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">TSH {(region.revenue / 1000).toFixed(0)}K</p>
                      <Progress value={(region.subscribers / 8500) * 100} className="w-20 h-2 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">{t('dashboard.dailyActivityOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: 'none', 
                      borderRadius: '8px', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                    }} 
                  />
                  <Bar dataKey="new_subs" fill="#0ea5e9" name={t('dashboard.newSubs')} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="payments" fill="#10b981" name={t('dashboard.payments')} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="support" fill="#f59e0b" name={t('dashboard.support')} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

        </div>

        {/* Package Distribution & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Package Distribution */}
          <Card className="lg:col-span-1 border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">{t('dashboard.packageDistribution')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={packageDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {packageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {packageDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-900">{t('dashboard.recentActivities')}</CardTitle>
                <Button variant="ghost" size="sm" className="text-azam-blue hover:text-azam-orange">
                  {t('dashboard.viewAll')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
                      case 'payment': return <DollarSign className="w-4 h-4 text-blue-500" />;
                      case 'delivery': return <Package className="w-4 h-4 text-purple-500" />;
                      case 'system': return <Zap className="w-4 h-4 text-orange-500" />;
                      case 'change': return <TrendingUp className="w-4 h-4 text-teal-500" />;
                      default: return <Activity className="w-4 h-4 text-gray-500" />;
                    }
                  };

                  return (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{activity.user}</p>
                        <p className="text-sm text-gray-600">{activity.action}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <p className="text-xs text-gray-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

        </div>



      </div>
    </div>
  );
}