import { useLocation } from "wouter";
import { 
  Users, 
  UserPlus, 
  Plus,
  Edit3,
  Eye,
} from "lucide-react";

const onboardingModules = [
  {
    title: "New Agent Registration",
    subtitle: "Register a new agent",
    icon: UserPlus,
    path: "/agent-onboarding?mode=new",
    category: "Agent Management",
    color: "azam-blue"
  },
  {
    title: "View Registered Agents",
    subtitle: "View and manage",
    icon: Users,
    path: "/agent-onboarding",
    category: "Agent Management",
    color: "green"
  },
  {
    title: "New Customer Registration",
    subtitle: "Register a new customer",
    icon: UserPlus,
    path: "/customer-registration?mode=new",
    category: "Customer Management",
    color: "azam-blue"
  },
  {
    title: "View Registered Customers",
    subtitle: "View and manage",
    icon: Users,
    path: "/customer-registration",
    category: "Customer Management",
    color: "green"
  },
];

export default function Onboarding() {
  const [, navigate] = useLocation();

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  const ModuleTile = ({ module }: { module: any }) => {
    const Icon = module.icon;
    const colorClasses = {
      "azam-blue": "bg-azam-orange group-hover:bg-azam-orange-dark text-white",
      "green": "bg-azam-orange group-hover:bg-azam-orange-dark text-white",
      "purple": "bg-azam-orange group-hover:bg-azam-orange-dark text-white",
      "yellow": "bg-azam-orange group-hover:bg-azam-orange-dark text-white",
      "red": "bg-azam-orange group-hover:bg-azam-orange-dark text-white"
    };

    return (
      <div
        onClick={() => handleModuleClick(module.path)}
        className="bg-white rounded-lg shadow-sm border border-azam-orange/30 p-4 hover:shadow-lg hover:border-azam-orange transition-all cursor-pointer group"
      >
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 transition-colors ${colorClasses[module.color as keyof typeof colorClasses] || colorClasses["azam-blue"]}`}>
            <Icon className="h-6 w-6" />
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
        

        {/* Agent Management */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Agent Management</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {onboardingModules.filter(module => module.category === "Agent Management").map((module, index) => (
              <ModuleTile key={index} module={module} />
            ))}
          </div>
        </div>

        {/* Customer Management */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Management</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {onboardingModules.filter(module => module.category === "Customer Management").map((module, index) => (
              <ModuleTile key={index} module={module} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}