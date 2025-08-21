import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, CreditCard, TrendingUp, FileText, Users, DollarSign } from "lucide-react";
import LedgerTable from "@/components/agent-commission/LedgerTable";
import { useAuth } from "@/hooks/use-auth";

export default function AgentCommission() {
  const [activeTab, setActiveTab] = useState("payment");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { user } = useAuth();

  // Fetch payment ledger
  const { data: paymentLedger = [], isLoading: loadingPayments } = useQuery<any[]>({
    queryKey: ["/api/agent/ledger", user?.id, dateFrom, dateTo],
  });

  const { data: commissionLedger = [], isLoading: loadingCommissions } = useQuery<any[]>({
    queryKey: ["/api/agent/commission-ledger", user?.id, dateFrom, dateTo],
  });

  // Calculate summary stats
  const paymentTotal = paymentLedger.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const commissionTotal = commissionLedger.reduce((sum, item) => sum + (parseFloat(item.net) || 0), 0);
  const currentBalance = paymentLedger.length > 0 ? parseFloat(paymentLedger[paymentLedger.length - 1]?.balance) || 0 : 0;
  const pendingCommissions = commissionLedger.filter(item => item.status === 'Pending').length;

  // Export handlers
  const handleExport = (type: "payment" | "commission", format: "excel" | "pdf") => {
    alert(`Exporting ${type} ledger as ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 p-6">
      <div className="w-[90%] mx-auto space-y-8">
        
       
        {/* Main Content Card */}
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border shadow-xl">
          <CardHeader className="border-b bg-white/50 dark:bg-gray-800/50">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900 dark:text-white">
              <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              Financial Records & Statements
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Detailed view of payments and commission transactions
            </p>
          </CardHeader>
          
          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              
              {/* Enhanced Tab Navigation */}
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <TabsList className="grid grid-cols-2 w-full lg:w-auto bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                  <TabsTrigger 
                    value="payment"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-6 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">Payment Ledger</span>
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100">
                        {paymentLedger.length}
                      </Badge>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="commission"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md transition-all duration-200 rounded-lg px-6 py-3"
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span className="font-medium">Commission Ledger</span>
                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100">
                        {commissionLedger.length}
                      </Badge>
                    </div>
                  </TabsTrigger>
                </TabsList>

                {/* Export Controls */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(activeTab as any, "excel")}
                    className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(activeTab as any, "pdf")}
                    className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border">
                <div className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      From Date
                    </label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1 min-w-[140px]">
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      To Date
                    </label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setDateFrom("");
                        setDateTo("");
                      }}
                      className="text-gray-600 border-gray-300 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              </div>

              {/* Payment Ledger Tab */}
              <TabsContent value="payment" className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Payment Ledger Overview</h3>
                  <p className="text-blue-700 dark:text-blue-300 text-sm">
                    Track all payment transactions, balances, and transaction history for your agent account.
                  </p>
                </div>
                <LedgerTable
                  type="payment"
                  data={paymentLedger}
                  isLoading={loadingPayments}
                />
              </TabsContent>

              {/* Commission Ledger Tab */}
              <TabsContent value="commission" className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">Commission Ledger Overview</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    Detailed breakdown of commission earnings, withholding tax, VAT calculations, and net payouts.
                  </p>
                </div>
                <LedgerTable
                  type="commission"
                  data={commissionLedger}
                  isLoading={loadingCommissions}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}