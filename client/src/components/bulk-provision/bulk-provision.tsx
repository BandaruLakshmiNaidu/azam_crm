import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, History, TrendingUp } from "lucide-react";
import BulkUploadTab from "@/components/bulk-provision/BulkUploadTab";
import BulkUploadTable from "@/components/bulk-provision/BulkUploadTable";

export default function BulkProvision() {
  const [activeTab, setActiveTab] = useState("new");

  // Statistics for display
  const stats = {
    totalUploads: 156,
    pendingApproval: 8,
    successfulUploads: 142,
    rejectedUploads: 6
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Simple Page Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-6 w-6 text-azam-blue" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Bulk Provisioning</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upload and manage bulk operations for devices and customers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab("new")}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                      ${activeTab === "new" 
                        ? 'text-azam-blue border-b-2 border-azam-blue bg-blue-50 dark:bg-gray-700 dark:text-azam-blue' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <Upload className="h-4 w-4" />
                    New Upload
                    <Badge variant="secondary" className="ml-2 text-xs">
                      Create
                    </Badge>
                  </button>
                  <button
                    onClick={() => setActiveTab("view")}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                      ${activeTab === "view" 
                        ? 'text-azam-blue border-b-2 border-azam-blue bg-blue-50 dark:bg-gray-700 dark:text-azam-blue' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <History className="h-4 w-4" />
                    Upload History
                    {stats.pendingApproval > 0 && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        {stats.pendingApproval}
                      </Badge>
                    )}
                  </button>
                </nav>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <TabsContent value="new" className="mt-0 space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Upload Excel files for bulk operations. Download templates to ensure correct formatting and data validation.
                  </p>
                  <BulkUploadTab />
                </div>
              </TabsContent>

              <TabsContent value="view" className="mt-0 space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Review uploaded files, track processing status, and manage approval workflow for bulk operations.
                  </p>
                  <BulkUploadTable />
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}