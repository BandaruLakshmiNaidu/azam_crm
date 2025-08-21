import { useMemo } from "react";
import { useLocation } from "wouter";
import { Monitor, ChevronRight, User } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

interface BreadcrumbItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function Breadcrumbs() {
  const [location, setLocation] = useLocation();
  const { t } = useTranslation();

  // Define the hierarchical structure of all pages
  const pageHierarchy = useMemo(() => {
    const hierarchy: Record<string, BreadcrumbItem[]> = {
      // Dashboard (now the root)
      "/": [
        { name: t('nav.dashboard'), path: "/", icon: Monitor }
      ],

      "/dashboard": [
        { name: t('nav.dashboard'), path: "/", icon: Monitor }
      ],

      // Onboarding Section
      // "/onboarding": [
      //   { name: t('nav.dashboard'), path: "/" },
      //   { name: t('nav.onboarding'), path: "/onboarding" }
      // ],
      "/agent-onboarding": [
        { name: t('nav.dashboard'), path: "/" },
        //{ name: t('nav.onboarding'), path: "/onboarding" },
        { name: "Agent Onboarding", path: "/agent-onboarding" }
      ],
      "/kyc-approval": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "KYC Approval", path: "/kyc-approval" }
      ],
      "/customer-registration": [
        { name: t('nav.dashboard'), path: "/" },
       // { name: t('nav.onboarding'), path: "/onboarding" },
        { name: "Customer Registration", path: "/customer-registration" }
      ],
      "/profile": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Profile", path: "/profile", icon: User }
      ],

      // Inventory Section


      "/stock-overview": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Stock Overview", path: "/stock-overview" }
      ],
      "/stock-request": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Stock Request", path: "/stock-request" }
      ],
      "/stock-approval": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Stock Approval", path: "/stock-approval" }
      ],
      "/stock-transfer": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Stock Transfer", path: "/stock-transfer" }
      ],
      "/track-serial": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Track Serial", path: "/track-serial" }
      ],
      "/cas-id-change": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "CAS ID Change", path: "/cas-id-change" }
      ],
      "/stb-sc-pairing": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "STB-SC Pairing", path: "/stb-sc-pairing" }
      ],
      "/warehouse-transfer": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Warehouse Transfer", path: "/warehouse-transfer" }
      ],
      "/block-unblock-agent": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Block/Unblock Agent", path: "/block-unblock-agent" }
      ],
      "/block-unblock-center": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Block/Unblock Center", path: "/block-unblock-center" }
      ],
      "/po-grn-update": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "PO GRN Update", path: "/po-grn-update" }
      ],
      "/po-view": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "PO View", path: "/po-view" }
      ],
      "/customer-hardware-return": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Customer Hardware Return", path: "/customer-hardware-return" }
      ],
      "/agent-replacement": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Agent Replacement", path: "/agent-replacement" }
      ],
      "/agent-faulty-repair": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Agent Faulty Repair", path: "/agent-faulty-repair" }
      ],

        // Payments Section
      "/agent-payment-hw": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Agent Payment HW", path: "/agent-payment-hw" }
      ],
      "/agent-hardware-sale": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Agent Hardware Sale", path: "/agent-hardware-sale" }
      ],
      "/customer-hardware-sale": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Customer Hardware Sale", path: "/customer-hardware-sale" }
      ],
      "/customer-payment-hw": [
        { name: t('nav.dashboard'), path: "/" },

        { name: "Customer Payment HW", path: "/customer-payment-hw" }
      ],



      // Subscriptions Section

      "/subscription-purchase": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Subscription Purchase", path: "/subscription-purchase" }
      ],
      "/subscription-renewal": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Subscription Renewal", path: "/subscription-renewal" }
      ],
      "/plan-change": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Plan Change", path: "/plan-change" }
      ],
      "/offer-change": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Offer Change", path: "/offer-change" }
      ],
      "/plan-validity-extension": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Plan Validity Extension", path: "/plan-validity-extension" }
      ],
      "/add-addon-packs": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Add Addon Packs", path: "/add-addon-packs" }
      ],
      "/customer-suspension": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Customer Suspension", path: "/customer-suspension" }
      ],
      "/customer-disconnection": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Customer Disconnection", path: "/customer-disconnection" }
      ],
      "/termination": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Termination", path: "/termination" }
      ],
      "/replacement": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Replacement", path: "/replacement" }
      ],
      "/reconnection": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Reconnection", path: "/reconnection" }
      ],
      "/search-subscriber": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Search Subscriber", path: "/search-subscriber" }
      ],
      "/subscriber-view": [
        { name: t('nav.dashboard'), path: "/" },
        { name: "Search Subscriber", path: "/search-subscriber" },
        { name: "Subscriber View", path: "/subscriber-view" }
      ],

      // Operations Section
      "/service-ticketing": [
        { name: t('nav.dashboard'), path: "/" },
        { name: t('nav.serviceTicketing'), path: "/service-ticketing" }
      ],
      "/bulk-provision": [
        { name: t('nav.dashboard'), path: "/" },
        { name: t('nav.bulkProvision'), path: "/bulk-provision" }
      ],
      "/provisioning": [
        { name: t('nav.dashboard'), path: "/" },
        { name: t('nav.provisioning'), path: "/provisioning" }
      ],
      "/reports": [
        { name: t('nav.dashboard'), path: "/" },
        { name: t('nav.reports'), path: "/reports" }
      ]
    };

    return hierarchy;
  }, [t]);

  const currentBreadcrumbs = pageHierarchy[location] || [
    { name: t('nav.dashboard'), path: "/", icon: Monitor }
  ];

  // Don't show breadcrumbs for home page
  if (location === "/" || currentBreadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-azam-blue/30 px-3 sm:px-4 py-2">
      <nav className="flex items-center text-xs text-gray-600 overflow-x-auto">
        {currentBreadcrumbs.map((crumb, index) => {
          const Icon = crumb.icon;
          const isLast = index === currentBreadcrumbs.length - 1;
          return (
            <div
              key={crumb.path}
              className={`relative flex items-center ${!isLast ? 'mr-2' : ''}`}
              style={{ zIndex: currentBreadcrumbs.length - index }}
            >
              <div
                className={`flex items-center px-4 py-1 chevron-shape ${isLast ? 'text-orange-600 font-bold bg-orange-100' : 'bg-gray-700 text-white hover:bg-gray-800 cursor-pointer border border-gray-300'}`}
                onClick={() => !isLast && setLocation(crumb.path)}
                style={{
                  clipPath: !isLast
                    ? 'polygon(0 0, calc(100% - 12px) 0, 100% 50%, calc(100% - 12px) 100%, 0 100%, 12px 50%)'
                    : 'none',
                  minWidth: '90px',
                  transition: 'background 0.2s',
                  border: isLast ? 'none' : undefined,
                }}
              >
                {index === 0 && Icon && (
                  <Icon className="h-4 w-4 text-azam-blue mr-1" />
                )}
                {crumb.name}
              </div>
            </div>
          );
        })}
      </nav>
      <style>{`
        .chevron-shape:not(:last-child) {
          margin-right: -12px;
          box-shadow: 2px 0 8px -2px rgba(0,0,0,0.04);
        }
        .chevron-shape:last-child {
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}