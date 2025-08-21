import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ListChecks, Monitor, MapPin, Clock, Send, CheckCircle, Target } from "lucide-react";

export default function FingerprintTab() {
  const [target, setTarget] = useState("");
  const [channelList, setChannelList] = useState("");
  const [xPos, setXPos] = useState("");
  const [yPos, setYPos] = useState("");
  const [duration, setDuration] = useState("");
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/provisioning/send-fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, channelList, xPos, yPos, duration }),
      });
      toast({ 
        title: "Fingerprint Sent", 
        description: `Fingerprint command sent successfully to ${target}.`,
        duration: 4000
      });
      setTarget("");
      setChannelList("");
      setXPos("");
      setYPos("");
      setDuration("");
    } catch {
      toast({ 
        title: "Error", 
        description: "Failed to send fingerprint. Please check your inputs and try again.", 
        variant: "destructive" 
      });
    }
    setLoading(false);
  };

  const channelPresets = [
    "1,2,3,4,5", // Basic package
    "10,11,12,13,14,15", // Sports package
    "20,21,22,23,24", // News package
    "30,31,32,33", // Movie package
  ];

  const positionPresets = [
    { label: "Top Left", x: "50", y: "50" },
    { label: "Top Right", x: "950", y: "50" },
    { label: "Bottom Left", x: "50", y: "650" },
    { label: "Bottom Right", x: "950", y: "650" },
    { label: "Center", x: "500", y: "350" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Main Form */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-purple-600" />
            Fingerprint Configuration
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSend} className="space-y-6">
            {/* Target Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Target Device or Region
              </label>
              <div className="relative">
                <Input 
                  value={target} 
                  onChange={e => setTarget(e.target.value)} 
                  placeholder="Enter SC/STB ID (e.g., STB123456) or Region Code (e.g., REG001)"
                  required 
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500" 
                />
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Smart Card ID, Set-Top Box ID, or Regional Code for fingerprinting
              </p>
            </div>

            {/* Channel List with Presets */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Channel Selection
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                {channelPresets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setChannelList(preset)}
                    className="text-left p-2 text-xs border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-200 dark:border-gray-600 transition-colors"
                  >
                    {preset.split(',').slice(0, 3).join(', ')}...
                  </button>
                ))}
              </div>
              <Input 
                value={channelList} 
                onChange={e => setChannelList(e.target.value)} 
                placeholder="Enter channel numbers separated by commas (e.g., 1,2,3,10,15)"
                required 
                className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Comma-separated list of channel numbers to track
              </p>
            </div>

            {/* Position Configuration */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Display Position
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                {positionPresets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setXPos(preset.x);
                      setYPos(preset.y);
                    }}
                    className="text-center p-2 text-xs border rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 border-gray-200 dark:border-gray-600 transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">X Position (pixels)</label>
                  <Input 
                    type="number"
                    value={xPos} 
                    onChange={e => setXPos(e.target.value)} 
                    placeholder="500"
                    required 
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">Y Position (pixels)</label>
                  <Input 
                    type="number"
                    value={yPos} 
                    onChange={e => setYPos(e.target.value)} 
                    placeholder="350"
                    required 
                    className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Duration Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Fingerprint Duration
              </label>
              <div className="relative">
                <Input 
                  type="number" 
                  value={duration} 
                  onChange={e => setDuration(e.target.value)} 
                  placeholder="3600"
                  required 
                  className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
                />
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Duration in seconds (e.g., 3600 for 1 hour, 86400 for 24 hours)
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setTarget("");
                  setChannelList("");
                  setXPos("");
                  setYPos("");
                  setDuration("");
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Clear Form
              </Button>
              
              <Button 
                type="submit" 
                disabled={loading || !target || !channelList || !xPos || !yPos || !duration}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 transition-colors duration-200"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Fingerprint
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