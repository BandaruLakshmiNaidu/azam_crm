import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Clock, Globe, Send, CheckCircle } from "lucide-react";

export default function RegionOSDTab() {
  const [region, setRegion] = useState("");
  const [message, setMessage] = useState("");
  const [duration, setDuration] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/provisioning/send-region-osd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, message, duration }),
      });
      toast({ 
        title: "Region OSD Sent", 
        description: `Region OSD message sent successfully to ${region}.`,
        duration: 4000
      });
      setRegion("");
      setMessage("");
      setDuration("");
    } catch {
      toast({ 
        title: "Error", 
        description: "Failed to send Region OSD. Please verify the region code and try again.", 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const regionPresets = [
    { code: "DAR", name: "Dar es Salaam", devices: "~15,000 devices" },
    { code: "ARU", name: "Arusha", devices: "~8,500 devices" },
    { code: "MWZ", name: "Mwanza", devices: "~6,200 devices" },
    { code: "DSM", name: "Dodoma", devices: "~4,800 devices" },
    { code: "ZNZ", name: "Zanzibar", devices: "~3,600 devices" },
    { code: "IRG", name: "Iringa", devices: "~2,900 devices" }
  ];

  const messageTemplates = [
    "Service maintenance scheduled for tonight from 11 PM to 3 AM. Services will resume automatically.",
    "New channels have been added to your package. Please restart your decoder to access them.",
    "Important: Payment reminder - Your subscription expires in 3 days. Please renew to continue enjoying AZAM TV.",
    "Weather Alert: Heavy rains expected. Signal interruptions may occur temporarily.",
    "System Update: New features available. Your decoder will update automatically during off-peak hours."
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
     

      {/* Main Form */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-green-600" />
            Regional Message Configuration
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSend} className="space-y-6">
            {/* Region Selection with Presets */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Target Region
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                {regionPresets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setRegion(preset.code)}
                    className={`text-left p-3 border rounded-lg transition-colors ${
                      region === preset.code 
                        ? 'bg-green-50 border-green-300 dark:bg-green-900/20' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{preset.code}</span>
                      <MapPin className="h-3 w-3 text-gray-400" />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{preset.name}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">{preset.devices}</div>
                  </button>
                ))}
              </div>
              <div className="relative">
                <Input 
                  value={region} 
                  onChange={e => setRegion(e.target.value)} 
                  placeholder="Enter region code (e.g., DAR, ARU, MWZ) or use presets above"
                  required 
                  className="pl-10" 
                />
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Regional code for mass broadcast delivery
              </p>
            </div>

            {/* Message Templates */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Message Templates
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {messageTemplates.map((template, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setMessage(template)}
                    className="w-full text-left p-2 text-xs border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600 transition-colors"
                  >
                    {template}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Regional Message Content
              </label>
              <Textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Enter your regional message here... (e.g., Service maintenance in your area tonight from 11 PM to 3 AM)"
                required
                rows={4}
                className="resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
              />
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <span>Message will be broadcast to all devices in the selected region</span>
                <span>{message.length}/800 characters</span>
              </div>
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
                  placeholder="60"
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Seconds (optional, defaults to 60 for regional messages)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRegion("");
                  setMessage("");
                  setDuration("");
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear Form
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading || !region || !message}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Region OSD
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