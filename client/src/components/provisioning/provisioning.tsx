import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OSDTab from "@/components/provisioning/OSDTab";
import RegionOSDTab from "@/components/provisioning/RegionOSDTab";
import FingerprintTab from "@/components/provisioning/FingerprintTab";
import BlacklistTab from "@/components/provisioning/BlacklistTab";
import BMailTab from "@/components/provisioning/BMailTab";
import { 
  Mail, 
  Eye, 
  ListChecks, 
  ShieldAlert, 
  MapPin
} from "lucide-react";

export default function Provisioning() {
  const [activeTab, setActiveTab] = useState("osd");

  const tabConfig = [
    { id: "osd", label: "OSD Messages", icon: Eye, description: "Send on-screen display messages to specific devices", color: "from-blue-500 to-blue-600" },
    { id: "region-osd", label: "Region OSD", icon: MapPin, description: "Send regional on-screen display messages", color: "from-green-500 to-green-600" },
    { id: "fingerprint", label: "Fingerprint", icon: ListChecks, description: "Configure channel fingerprinting settings", color: "from-purple-500 to-purple-600" },
    { id: "blacklist", label: "Blacklist / Kill STB", icon: ShieldAlert, description: "Blacklist or disable set-top boxes", color: "from-red-500 to-red-600" },
    { id: "bmail", label: "B Mail", icon: Mail, description: "Send broadcast mail messages", color: "from-orange-500 to-orange-600" }
  ];

  const currentTab = tabConfig.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* This makes width always 90% of window size */}
      <div className="w-[90%] mx-auto space-y-6">
        
        <Card className="bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
          <CardHeader className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-gradient-to-r ${currentTab?.color} rounded-lg`}>
                  {currentTab?.icon && <currentTab.icon className="h-4 w-4 text-white" />}
                </div>
                <div>
                  <CardTitle className="text-lg font-medium text-gray-900 dark:text-white">
                    {currentTab?.label}
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentTab?.description}
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              {/* Tabs Navigation */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-1">
                  {tabConfig.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                          flex items-center gap-2 px-4 py-3 text-sm font-medium rounded-t-lg transition-colors
                          ${activeTab === tab.id 
                            ? 'text-azam-blue border-b-2 border-azam-blue bg-blue-50 dark:bg-gray-700 dark:text-azam-blue' 
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Tabs Content */}
              <div className="pt-6">
                <TabsContent value="osd" className="mt-0">
                  <OSDTab />
                </TabsContent>

                <TabsContent value="region-osd" className="mt-0">
                  <RegionOSDTab />
                </TabsContent>

                <TabsContent value="fingerprint" className="mt-0">
                  <FingerprintTab />
                </TabsContent>

                <TabsContent value="blacklist" className="mt-0">
                  <BlacklistTab />
                </TabsContent>

                <TabsContent value="bmail" className="mt-0">
                  <BMailTab />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
