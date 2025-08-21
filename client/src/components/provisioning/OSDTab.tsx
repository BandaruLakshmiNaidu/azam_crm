import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Eye, Clock, Monitor, Send, CheckCircle } from "lucide-react";

export default function OSDTab() {
  const [scId, setScId] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/provisioning/send-osd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scId, message, duration }),
      });
      toast({ 
        title: "OSD Message Sent", 
        description: `Message sent successfully to device ${scId}.`,
        duration: 4000
      });
      setScId(""); 
      setMessage(""); 
      setDuration("");
    } catch {
      toast({ 
        title: "Error", 
        description: "Failed to send OSD message. Please try again.", 
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
            <Monitor className="h-5 w-5 text-blue-600" />
            Message Configuration
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSend} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="pl-10" 
                  />
                  <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Smart Card or Set-Top Box identifier
                </p>
              </div>

              {/* Duration Input */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Display Duration
                </label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={duration} 
                    onChange={e => setDuration(e.target.value)} 
                    placeholder="30"
                    className="pl-10"
                  />
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Seconds (optional, defaults to 30)
                </p>
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Message Content
              </label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter your message here... (e.g., Important: Service maintenance scheduled for tonight at 11 PM)"
                required
                rows={4}
                className="resize-none"
              />
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Message will appear as overlay on subscriber screens</span>
                <span>{message.length}/500 characters</span>
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
                  setDuration("");
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear Form
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading || !scId || !message}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send OSD Message
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