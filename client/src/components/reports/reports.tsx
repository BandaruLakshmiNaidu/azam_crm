import { useLocation } from "wouter";
import { 
  Calendar, 
  FileText,
  Shield,
  Settings,
  BarChart3
} from "lucide-react";

const reportModules = [
  {
    title: "Daily Reports",
    subtitle: "Generate daily operational reports",
    icon: Calendar,
    path: "/reports-daily"
  },
  {
    title: "TRA Reports",
    subtitle: "Tanzania Revenue Authority reports",
    icon: FileText,
    path: "/reports-tra"
  },
  {
    title: "TCRA Reports",
    subtitle: "Tanzania Communications Regulatory Authority reports",
    icon: Shield,
    path: "/reports-tcra"
  }
];

export default function Reports() {
  const [, navigate] = useLocation();

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  const ModuleTile = ({ module }: { module: any }) => {
    const Icon = module.icon;
    return (
      <div
        onClick={() => handleModuleClick(module.path)}
        className="bg-white rounded-lg shadow-sm border border-azam-orange/30 p-4 hover:shadow-lg hover:border-azam-orange transition-all cursor-pointer group"
      >
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-azam-orange rounded-lg mb-3 group-hover:bg-azam-orange-dark transition-colors">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <h3 className="font-medium text-gray-900 text-sm mb-1">{module.title}</h3>
          <p className="text-xs text-gray-500 leading-tight">{module.subtitle}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="space-y-6">
        

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Report Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {reportModules.map((module, index) => (
              <ModuleTile key={index} module={module} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}