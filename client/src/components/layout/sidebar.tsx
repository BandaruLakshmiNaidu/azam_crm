import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Users, 
  Package, 
  UserPlus, 
  CreditCard, 
  Calendar, 
  FileText,
  Tv
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  { name: "Agent Onboarding", href: "/agents", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Customer Registration", href: "/customers", icon: UserPlus },
  { name: "Payments", href: "/payments", icon: CreditCard },
  { name: "Subscriptions", href: "/subscriptions", icon: Calendar },
  { name: "Reports", href: "/reports", icon: FileText },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg flex-shrink-0">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-azam-blue rounded-lg flex items-center justify-center">
            <Tv className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-azam-dark">AZAM TV</h1>
            <p className="text-sm text-gray-500">Portal</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "nav-link flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                      isActive && "active"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
