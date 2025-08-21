import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, Users, Server } from "lucide-react";

interface RealTimeMetricsProps {
  className?: string;
}

export default function RealTimeMetrics({ className }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState({
    activeConnections: 1247,
    serverLoad: 68,
    onlineAgents: 23,
    systemStatus: "operational"
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        activeConnections: prev.activeConnections + Math.floor(Math.random() * 10) - 5,
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + Math.floor(Math.random() * 6) - 3)),
        onlineAgents: Math.max(0, prev.onlineAgents + Math.floor(Math.random() * 4) - 2),
        systemStatus: prev.serverLoad > 85 ? "warning" : "operational"
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "bg-green-500";
      case "warning": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Real-Time System Metrics</CardTitle>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(metrics.systemStatus)} animate-pulse`} />
          <Badge variant="outline" className="text-xs">
            {metrics.systemStatus.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-gray-600">Active Connections</span>
            </div>
            <div className="text-2xl font-bold text-blue-600 font-mono">
              {metrics.activeConnections.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Server className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Server Load</span>
            </div>
            <div className="text-2xl font-bold text-green-600 font-mono">
              {metrics.serverLoad}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${metrics.serverLoad}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-gray-600">Online Agents</span>
            </div>
            <div className="text-2xl font-bold text-purple-600 font-mono">
              {metrics.onlineAgents}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Wifi className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-gray-600">Network Status</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}