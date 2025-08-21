import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Mock data for pending approvals
const mockApprovals = [
  {
    id: 1,
    bpId: "BP1001",
    scId: "SC2001",
    name: "John Doe",
    type: "CREDIT",
    invoice: "INV-12345",
    reason: "Overcharge Correction",
    comments: "Customer complaint",
    amount: 50000,
    walletType: "HW",
    vatType: "vat",
    status: "PENDING",
    date: "2024-07-20",
  },
  {
    id: 2,
    bpId: "BP1002",
    scId: "SC2002",
    name: "Jane Smith",
    type: "DEBIT",
    invoice: "INV-54321",
    reason: "Service Fee",
    comments: "",
    amount: 20000,
    walletType: "SUBSCRIPTION",
    vatType: "no_vat",
    status: "PENDING",
    date: "2024-07-19",
  },
];

export default function ApprovalAdjustmentTab() {
  const [approvals, setApprovals] = useState(mockApprovals);
  const { toast } = useToast();

  const handleApprove = (id: number) => {
    setApprovals(prev =>
      prev.map(a => a.id === id ? { ...a, status: "APPROVED" } : a)
    );
    toast({ title: "Approved", description: `Adjustment #${id} approved and posted to CM.` });
  };

  const handleReject = (id: number) => {
    setApprovals(prev =>
      prev.map(a => a.id === id ? { ...a, status: "REJECTED" } : a)
    );
    toast({ title: "Rejected", description: `Adjustment #${id} rejected.`, variant: "destructive" });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-xs">
        <thead>
          <tr>
            <th className="px-2 py-2">Date</th>
            <th className="px-2 py-2">BP ID</th>
            <th className="px-2 py-2">SC ID</th>
            <th className="px-2 py-2">Name</th>
            <th className="px-2 py-2">Type</th>
            <th className="px-2 py-2">Invoice</th>
            <th className="px-2 py-2">Reason</th>
            <th className="px-2 py-2">Comments</th>
            <th className="px-2 py-2">Amount</th>
            <th className="px-2 py-2">Wallet</th>
            <th className="px-2 py-2">VAT</th>
            <th className="px-2 py-2">Status</th>
            <th className="px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvals.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center py-8 text-gray-500">
                No pending approvals
              </td>
            </tr>
          ) : (
            approvals.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-2 py-2">{a.date}</td>
                <td className="px-2 py-2">{a.bpId}</td>
                <td className="px-2 py-2">{a.scId}</td>
                <td className="px-2 py-2">{a.name}</td>
                <td className="px-2 py-2">{a.type}</td>
                <td className="px-2 py-2">{a.invoice}</td>
                <td className="px-2 py-2">{a.reason}</td>
                <td className="px-2 py-2">{a.comments}</td>
                <td className="px-2 py-2">{a.amount.toLocaleString()}</td>
                <td className="px-2 py-2">{a.walletType}</td>
                <td className="px-2 py-2">{a.vatType === "vat" ? "With VAT" : "Without VAT"}</td>
                <td className="px-2 py-2">
                  <Badge
                    variant={
                      a.status === "PENDING"
                        ? "secondary"
                        : a.status === "APPROVED"
                        ? "default"
                        : "destructive"
                    }
                  >
                    {a.status}
                  </Badge>
                </td>
                <td className="px-2 py-2">
                  {a.status === "PENDING" && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleApprove(a.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleReject(a.id)} className="ml-2">
                        Reject
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}