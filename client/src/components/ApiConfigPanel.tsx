import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, Save, RotateCcw, Check, X } from 'lucide-react';
import { 
  getApiConfig, 
  setApiConfig, 
  resetApiConfig, 
  setEnvironment, 
  API_CONFIGS,
  Environment,
  ApiConfig
} from '@/lib/config';
import { useToast } from '@/hooks/use-toast';

interface ApiConfigPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ApiConfigPanel: React.FC<ApiConfigPanelProps> = ({ isOpen = false, onClose }) => {
  const [config, setConfig] = useState<ApiConfig>(getApiConfig());
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  useEffect(() => {
    const handleConfigChange = (event: CustomEvent) => {
      setConfig(event.detail);
    };

    window.addEventListener('apiConfigChanged', handleConfigChange as EventListener);
    return () => {
      window.removeEventListener('apiConfigChanged', handleConfigChange as EventListener);
    };
  }, []);

  const handleSaveConfig = () => {
    setApiConfig(config);
    toast({
      title: "Configuration Updated",
      description: "API configuration has been saved successfully.",
    });
    onClose?.();
  };

  const handleResetConfig = () => {
    resetApiConfig();
    setConfig(getApiConfig());
    setConnectionStatus('idle');
    toast({
      title: "Configuration Reset",
      description: "API configuration has been reset to defaults.",
    });
  };

  const handleEnvironmentChange = (env: Environment) => {
    setEnvironment(env);
    setConfig(getApiConfig());
    setConnectionStatus('idle');
    toast({
      title: "Environment Changed",
      description: `Switched to ${env} environment configuration.`,
    });
  };

  const testConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');

    try {
      // Test the connection by making a simple API call
      const testUrl = `${config.baseUrl}/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      const response = await fetch(testUrl, {
        method: 'GET',
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setConnectionStatus('success');
        toast({
          title: "Connection Successful",
          description: "Successfully connected to the API server.",
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: `Server responded with status: ${response.status}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Connection Failed",
        description: `Failed to connect: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <CardTitle>API Configuration</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Configure the API base URL and connection settings for the application.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Environment Quick Select */}
          <div className="space-y-2">
            <Label>Environment Presets</Label>
            <Select onValueChange={handleEnvironmentChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select an environment preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="development">Development (Local /api)</SelectItem>
                <SelectItem value="local">Local Server (localhost:5000)</SelectItem>
                <SelectItem value="staging">Staging Server</SelectItem>
                <SelectItem value="production">Production Server</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Configuration Status */}
          <div className="flex items-center space-x-2">
            <Label>Current Status:</Label>
            <Badge variant={connectionStatus === 'success' ? 'default' : connectionStatus === 'error' ? 'destructive' : 'secondary'}>
              {connectionStatus === 'success' && <Check className="h-3 w-3 mr-1" />}
              {connectionStatus === 'error' && <X className="h-3 w-3 mr-1" />}
              {connectionStatus === 'idle' ? 'Not Tested' : connectionStatus === 'success' ? 'Connected' : 'Failed'}
            </Badge>
          </div>

          {/* Manual Configuration */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="baseUrl">API Base URL</Label>
              <Input
                id="baseUrl"
                value={config.baseUrl}
                onChange={(e) => setConfig({ ...config, baseUrl: e.target.value })}
                placeholder="https://api.example.com/api or /api"
              />
              <p className="text-xs text-muted-foreground">
                Use absolute URL (https://...) for external APIs or relative path (/api) for same-origin.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Request Timeout (milliseconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={config.timeout}
                onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) || 30000 })}
                placeholder="30000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retries">Retry Attempts</Label>
              <Input
                id="retries"
                type="number"
                value={config.retries}
                onChange={(e) => setConfig({ ...config, retries: parseInt(e.target.value) || 3 })}
                placeholder="3"
              />
            </div>
          </div>

          {/* Example Configurations */}
          <div className="space-y-2">
            <Label>Example Configurations</Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong>Local Development:</strong> /api</div>
              <div><strong>Local Backend:</strong> http://localhost:5000/api</div>
              <div><strong>Remote Server:</strong> https://api.azamtv.com/api</div>
              <div><strong>Docker Container:</strong> http://backend:5000/api</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={testConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button variant="outline" onClick={handleResetConfig}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
            <Button onClick={handleSaveConfig}>
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiConfigPanel;