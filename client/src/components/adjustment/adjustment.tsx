import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import CreateAdjustmentForm from "@/components/adjustment/CreateAdjustmentForm";
import AdjustmentApprovalTable from "@/components/adjustment/AdjustmentApprovalTable";
import AdjustmentHistoryTable from "@/components/adjustment/AdjustmentHistoryTable";

export default function Adjustment() {
  const [activeTab, setActiveTab] = useState("create");

  // Fetch adjustment statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/adjustments/stats'],
    queryFn: async () => {
      const response = await fetch('/api/adjustments/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    }
  });

  // Fetch pending adjustments count
  const { data: pendingCount } = useQuery({
    queryKey: ['/api/adjustments/pending'],
    queryFn: async () => {
      const response = await fetch('/api/adjustments/pending');
      if (!response.ok) throw new Error('Failed to fetch pending adjustments');
      const data = await response.json();
      return data.length;
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full p-6 space-y-6">
        
        {/* Main Content */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <TabsTrigger 
                  value="create" 
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                >
                  <DollarSign className="h-4 w-4" />
                  Create Adjustment
                </TabsTrigger>
                <TabsTrigger 
                  value="approval" 
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approval Queue
                  {pendingCount > 0 && (
                    <Badge variant="destructive" className="ml-2 text-xs h-5 px-1.5">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="flex items-center gap-2 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white"
                >
                  <Clock className="h-4 w-4" />
                  History
                </TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="create" className="mt-0 space-y-6">
                <div className="w-full">
                
                  <CreateAdjustmentForm />
                </div>
              </TabsContent>

              <TabsContent value="approval" className="mt-0 space-y-6">
                <div className="w-full">
                  
                  <AdjustmentApprovalTable />
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-0 space-y-6">
                <div className="w-full">
                  <AdjustmentHistoryTable />
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}