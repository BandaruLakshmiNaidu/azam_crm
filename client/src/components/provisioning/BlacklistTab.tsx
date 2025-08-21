import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Monitor, AlertTriangle, Lock, CheckCircle } from "lucide-react";

export default function BlacklistTab() {
  const [scId, setScId] = useState("");
  const [reason, setReason] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/provisioning/blacklist-stb", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scId, reason }),
      });
      toast({ 
        title: "Device Blacklisted", 
        description: `STB/Smart Card ${scId} has been successfully blacklisted.`,
        duration: 4000
      });
      setScId(""); 
      setReason("");
    } catch {
      toast({ 
        title: "Error", 
        description: "Failed to blacklist device. Please verify the device ID and try again.", 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const reasonTemplates = [
    "Payment overdue - service suspended",
    "Fraudulent activity detected", 
    "Multiple failed authentication attempts",
    "Unauthorized device modification",
    "Service abuse violation",
    "Customer request for device deactivation"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Main Form */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-5 w-5 text-red-600" />
            Device Blacklist Configuration
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSend} className="space-y-6">
            {/* Device ID Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Target Device
              </label>
              <div className="relative">
                <Input 
                  value={scId} 
                  onChange={e => setScId(e.target.value)} 
                  placeholder="Enter SC/STB ID to blacklist (e.g., STB123456)"
                  required 
                  className="pl-10" 
                />
                <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Smart Card or Set-Top Box identifier to be blacklisted
              </p>
            </div>

            {/* Reason Templates */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Quick Reason Templates
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {reasonTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setReason(template)}
                    className="text-left p-2 text-xs border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Blacklist Reason
              </label>
              <Textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Enter detailed reason for blacklisting this device..."
                required
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Reason will be logged for audit and compliance purposes</span>
                <span>{reason.length}/500 characters</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setScId("");
                  setReason("");
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear Form
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading || !scId || !reason}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Blacklist Device
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      
    </div>
  );
}