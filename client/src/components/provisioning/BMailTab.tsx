import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Monitor, Send, CheckCircle, Radio } from "lucide-react";

export default function BMailTab() {
  const [scId, setScId] = useState("");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/provisioning/send-bmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scId, message }),
      });
      toast({ 
        title: "B-Mail Sent", 
        description: `Broadcast mail sent successfully to device ${scId}.`,
        duration: 4000
      });
      setScId(""); 
      setMessage("");
    } catch {
      toast({ 
        title: "Error", 
        description: "Failed to send B-Mail. Please check the device ID and try again.", 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      

      {/* Main Form */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Radio className="h-5 w-5 text-orange-600" />
            Broadcast Message Configuration
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
                  placeholder="Enter SC/STB ID (e.g., STB123456)"
                  required 
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500" 
                />
                <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Smart Card or Set-Top Box identifier for broadcast mail delivery
              </p>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Broadcast Message Content
              </label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter your broadcast message here... (e.g., System Update: New channels have been added to your package)"
                required
                rows={5}
                className="resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500"
              />
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Message will be stored in device mailbox until read</span>
                <span>{message.length}/1000 characters</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setScId("");
                  setMessage("");
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear Form
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading || !scId || !message}
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-2 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send B-Mail
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