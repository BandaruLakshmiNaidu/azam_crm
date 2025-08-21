import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BULK_TYPES = [
  { key: "bulk_payment", label: "Bulk Payment" },
  { key: "bulk_add_plan", label: "Bulk Add Plan" },
  { key: "bulk_disconnection", label: "Bulk Disconnection" },
  { key: "bulk_reconnection", label: "Bulk Reconnection" },
  { key: "bulk_retrack", label: "Bulk Retrack" },
  { key: "bulk_credit_limit", label: "Bulk Credit Limit" },
];

export default function BulkUploadTable() {
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Tell TypeScript this is an array
  const { data: uploads, isLoading: uploadsLoading } = useQuery<any[]>({
    queryKey: ["/api/bulk-uploads"],
  });

  // Mock data for demonstration if no uploads are present
  const mockUploads = [
    {
      id: 101,
      type: "bulk_payment",
      uploadedBy: "John Doe",
      date: new Date().toISOString(),
      status: "pending",
    },
    {
      id: 102,
      type: "bulk_add_plan",
      uploadedBy: "Jane Smith",
      date: new Date(Date.now() - 86400000).toISOString(),
      status: "approved",
    },
    {
      id: 103,
      type: "bulk_disconnection",
      uploadedBy: "Alice Brown",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: "rejected",
    },
    {
      id: 104,
      type: "bulk_reconnection",
      uploadedBy: "Mike Johnson",
      date: new Date(Date.now() - 3 * 86400000).toISOString(),
      status: "approved",
    },
    {
      id: 105,
      type: "bulk_retrack",
      uploadedBy: "Sarah Wilson",
      date: new Date(Date.now() - 4 * 86400000).toISOString(),
      status: "pending",
    },
    {
      id: 106,
      type: "bulk_credit_limit",
      uploadedBy: "Tom Anderson",
      date: new Date(Date.now() - 5 * 86400000).toISOString(),
      status: "approved",
    },
    {
      id: 107,
      type: "bulk_payment",
      uploadedBy: "Lisa Garcia",
      date: new Date(Date.now() - 6 * 86400000).toISOString(),
      status: "rejected",
    },
    {
      id: 108,
      type: "bulk_add_plan",
      uploadedBy: "David Martinez",
      date: new Date(Date.now() - 7 * 86400000).toISOString(),
      status: "approved",
    },
    {
      id: 109,
      type: "bulk_disconnection",
      uploadedBy: "Emily Davis",
      date: new Date(Date.now() - 8 * 86400000).toISOString(),
      status: "pending",
    },
    {
      id: 110,
      type: "bulk_reconnection",
      uploadedBy: "Chris Lee",
      date: new Date(Date.now() - 9 * 86400000).toISOString(),
      status: "approved",
    },
    {
      id: 111,
      type: "bulk_retrack",
      uploadedBy: "Anna Taylor",
      date: new Date(Date.now() - 10 * 86400000).toISOString(),
      status: "rejected",
    },
    {
      id: 112,
      type: "bulk_credit_limit",
      uploadedBy: "Robert Brown",
      date: new Date(Date.now() - 11 * 86400000).toISOString(),
      status: "approved",
    },
  ];

  // Approve uploads (for finance team)
  const handleApprove = (uploadId: number) => {
    toast({ title: "Approved", description: `Upload #${uploadId} approved.` });
  };

  // Reject uploads
  const handleReject = (uploadId: number) => {
    toast({ title: "Rejected", description: `Upload #${uploadId} rejected.`, variant: "destructive" });
  };

  // Pagination logic
  const allUploads = (uploads && uploads.length > 0) ? uploads : mockUploads;
  const totalPages = Math.ceil(allUploads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayUploads = allUploads.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Upload History & Management</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Review and manage bulk upload requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {allUploads.length} Total Uploads
          </Badge>
          <Badge variant="outline" className="border-orange-300 text-orange-700 dark:border-orange-600 dark:text-orange-300">
            {allUploads.filter(u => u.status === "pending").length} Pending
          </Badge>
        </div>
      </div>

      {uploadsLoading ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading upload history...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Upload ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Operation Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Uploaded By
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {displayUploads.map((upload: any, index: number) => (
                  <tr 
                    key={upload.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50/50 dark:bg-gray-700/25'
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                            #{upload.id}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {upload.id}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {BULK_TYPES.find(t => t.key === upload.type)?.label || upload.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {upload.uploadedBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(upload.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          upload.status === "pending"
                            ? "secondary"
                            : upload.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                        className={
                          upload.status === "pending"
                            ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                            : upload.status === "approved"
                            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        }
                      >
                        <div className="flex items-center gap-1">
                          {upload.status === "pending" && <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>}
                          {upload.status === "approved" && <CheckCircle className="h-3 w-3" />}
                          {upload.status === "rejected" && <XCircle className="h-3 w-3" />}
                          <span className="capitalize">{upload.status}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {upload.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleApprove(upload.id)}
                            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/20"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleReject(upload.id)}
                            className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-600 dark:text-red-300 dark:hover:bg-red-900/20"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500 italic text-xs">
                          {upload.status === "approved" ? "Processed" : "Declined"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayUploads.length === 0 && allUploads.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No uploads found</h3>
              <p className="text-gray-500 dark:text-gray-400">Upload your first bulk operation file to get started.</p>
            </div>
          )}

          {/* Pagination Footer */}
          {allUploads.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Record Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    Showing {startIndex + 1}-{Math.min(endIndex, allUploads.length)} of {allUploads.length} uploads
                  </span>
                </div>

                {/* Status Summary */}
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    {allUploads.filter(u => u.status === "approved").length} Approved
                  </span>
                  <span className="text-orange-600 dark:text-orange-400 font-medium">
                    {allUploads.filter(u => u.status === "pending").length} Pending
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    {allUploads.filter(u => u.status === "rejected").length} Rejected
                  </span>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="h-8 px-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => 
                          page === 1 || 
                          page === totalPages || 
                          Math.abs(page - currentPage) <= 1
                        )
                        .map((page, index, filteredPages) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && filteredPages[index - 1] !== page - 1 && (
                              <span className="px-2 py-1 text-sm text-gray-500">...</span>
                            )}
                            <Button
                              variant={page === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="h-8 w-8 p-0"
                            >
                              {page}
                            </Button>
                          </div>
                        ))
                      }
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="h-8 px-2"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}