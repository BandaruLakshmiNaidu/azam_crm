import { useState } from "react";
import { ChevronDown, User, Settings, LogOut, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import AdvancedSearch from "@/components/ui/advanced-search";
import ApiConfigPanel from "@/components/ApiConfigPanel";
import { NotificationCenter } from "@/components/notifications/notification-center";
import TanzaniaTime from "@/components/ui/tanzania-time";
import logo from "@/assets/logo.png";

export default function TopHeader() {
  const [, setLocation] = useLocation();
  const [isApiConfigOpen, setIsApiConfigOpen] = useState(false);
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  // Comprehensive page structure with categories and sub-pages
  const allPages = [
    // Core Modules
    { name: t('navigation.dashboard'), path: "/dashboard", category: t('search.categories.core') },

    // Onboarding
    { name: t('search.pages.agentOnboarding'), path: "/agent-onboarding", category: t('search.categories.onboarding') },
    { name: t('search.pages.customerRegistration'), path: "/customer-registration", category: t('search.categories.onboarding') },

    // Inventory Management
    { name: t('search.pages.stockOverview'), path: "/stock-overview", category: t('search.categories.inventory') },
    { name: t('search.pages.stockRequest'), path: "/stock-request", category: t('search.categories.inventory') },
    { name: t('search.pages.stockApproval'), path: "/stock-approval", category: t('search.categories.inventory') },
    { name: t('search.pages.stockTransfer'), path: "/stock-transfer", category: t('search.categories.inventory') },
    { name: t('search.pages.serialTracking'), path: "/serial-tracking", category: t('search.categories.inventory') },
    { name: t('search.pages.casIdChange'), path: "/cas-id-change", category: t('search.categories.inventory') },
    { name: t('search.pages.stbSmartCardPairing'), path: "/stb-smart-card-pairing", category: t('search.categories.inventory') },
    { name: t('search.pages.warehouseTransfer'), path: "/warehouse-transfer", category: t('search.categories.inventory') },
    { name: t('search.pages.blockStbAgent'), path: "/block-stb-agent", category: t('search.categories.inventory') },
    { name: t('search.pages.blockStbCenter'), path: "/block-stb-center", category: t('search.categories.inventory') },
    { name: t('search.pages.unblockStbAgent'), path: "/unblock-stb-agent", category: t('search.categories.inventory') },
    { name: t('search.pages.unblockStbCenter'), path: "/unblock-stb-center", category: t('search.categories.inventory') },
    { name: t('search.pages.poGrnUpdate'), path: "/po-grn-update", category: t('search.categories.inventory') },
    { name: t('search.pages.poView'), path: "/po-view", category: t('search.categories.inventory') },
    { name: t('search.pages.customerHardwareReturn'), path: "/customer-hardware-return", category: t('search.categories.inventory') },
    { name: t('search.pages.agentFaultyRepair'), path: "/agent-faulty-repair", category: t('search.categories.inventory') },

    // Payment Management
    { name: t('search.pages.agentPaymentHardware'), path: "/agent-payment-hw", category: t('search.categories.payments') },
    { name: t('search.pages.agentPaymentSubscription'), path: "/agent-payment-sub", category: t('search.categories.payments') },
    { name: t('search.pages.customerPaymentHardware'), path: "/customer-payment-hw", category: t('search.categories.payments') },
    { name: t('search.pages.customerPaymentSubscription'), path: "/customer-payment-sub", category: t('search.categories.payments') },
    { name: t('search.pages.receiptCancellation'), path: "/receipt-cancellation", category: t('search.categories.payments') },
    { name: t('search.pages.customerTransfer'), path: "/customer-transfer", category: t('search.categories.payments') },

    // Subscription Management
    { name: t('search.pages.searchSubscriber'), path: "/search-subscriber", category: t('search.categories.subscribers') },

    // Operations
    { name: t('search.pages.createAdjustment'), path: "/adjustment", category: t('search.categories.adjustment') },
    { name: t('search.pages.adjustment'), path: "/adjustment", category: t('search.categories.adjustment') },
    { name: t('search.pages.newServiceTicketing'), path: "/new-service-ticketing", category: t('search.categories.serviceTicketing') },
    { name: t('search.pages.newIncidentManagement'), path: "/new-incident-management", category: t('search.categories.serviceTicketing') },
    { name: t('search.pages.bulkProvision'), path: "/bulk-provision", category: t('search.categories.operations') },
    { name: t('search.pages.agentCommission'), path: "/agent-commission", category: t('search.categories.operations') },
    { name: t('search.pages.provisioning'), path: "/provisioning", category: t('search.categories.operations') },

    // Reports & Analytics
    { name: t('search.pages.reports'), path: "/reports", category: t('search.categories.reports') },
    { name: t('search.pages.analyticsDashboard'), path: "/analytics", category: t('search.categories.reports') },

    // Administration
    //{ name: "User Management", path: "/user-management", category: "Administration" },
    //{ name: "System Settings", path: "/system-settings", category: "Administration" },
    //{ name: "Audit Logs", path: "/audit-logs", category: "Administration" },
  ];

  // Hot keys for popular searches
  const hotKeys = [
    t('navigation.dashboard'),
    t('inventory.title'),
    t('nav.payments'), 
    t('nav.subscriptions'),
    t('home.agentManagement'),
    t('home.customerManagement'),
    t('searchSubscriber.title'),
    t('inventory.stockOverview')
  ];

  // All page names for search suggestions
  const tipKeys = allPages.map(page => page.name);

  const handleSearch = (searchValue: string) => {
    // Find matching page
    const matchedPage = allPages.find(page => 
      page.name.toLowerCase() === searchValue.toLowerCase()
    );

    if (matchedPage) {
      setLocation(matchedPage.path);
    } else {
      // Fallback to search subscriber page with search term
      setLocation(`/search-subscriber?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const handlePageSelect = (path: string) => {
    setLocation(path);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="bg-azam-header shadow-sm border-b border-azam-header-dark">
      {/* SAP Fiori Shell Bar */}
      <div className="flex items-center justify-between h-14 px-3 sm:px-4">
        {/* Left side - Logo and Product Title */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <img
              src={logo}
              alt="AZAM TV Logo"
              className="h-11 w-auto object-contain"
            />


            {/* Mobile Menu Button - SAP Fiori Style */}
            <div className="hidden sm:block h-5 w-px bg-white/20"></div>
            <span className="hidden sm:inline text-white text-sm font-medium">VAI</span>


          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Advanced Search Bar (Desktop) - SAP Fiori styled */}
          <div className="hidden sm:flex relative">
            <div className="bg-white rounded border border-white">
              <AdvancedSearch
                hotKeys={hotKeys}
                tipKeys={tipKeys}
                allPages={allPages}
                onSearch={handleSearch}
                placeholder={t('common.search') + " " + t('nav.dashboard').toLowerCase() + "..."}
                className="w-[400px] bg-transparent border-none text-black placeholder:text-gray-700"
              />
            </div>
          </div>

          {/* Tanzania Time and Date */}
          <TanzaniaTime />

          {/* Language Switcher - SAP Fiori Style */}
          <div className="text-white">
            <LanguageSwitcher variant="minimal" />
          </div>

          {/* Notifications - Enhanced with NotificationCenter */}
          <NotificationCenter />

          {/* User Menu - SAP Fiori Style */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-white hover:bg-azam-header-light px-2 h-8">
                <div className="w-6 h-6 bg-azam-orange rounded-full flex items-center justify-center border border-azam-orange">
                  <User className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="hidden sm:inline text-xs text-white font-medium">{user?.firstName || "Admin User"}</span>
                <ChevronDown className="h-3 w-3 text-white/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 mt-1 bg-white border border-gray-200 shadow-lg">
              <DropdownMenuItem 
                className="cursor-pointer text-sm"
                onClick={() => setLocation('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                {t('common.profile')}
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-sm">
                <Settings className="mr-2 h-4 w-4" />
                {t('common.settings')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-sm"
                onClick={() => setIsApiConfigOpen(true)}
              >
                <Settings className="mr-2 h-4 w-4" />
                API Configuration
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-sm text-[#d53835] hover:bg-red-50" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                {t('navigation.logout')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Advanced Search Bar - SAP Fiori Style */}
      <div className="sm:hidden border-t border-azam-header-dark bg-azam-header">
        <div className="p-3">
          <div className="bg-white rounded border border-white">
            <AdvancedSearch
              hotKeys={hotKeys}
              tipKeys={tipKeys}
              allPages={allPages}
              onSearch={handleSearch}
              placeholder={t('common.search') + " " + t('nav.dashboard').toLowerCase() + "..."}
              className="w-full bg-transparent border-none text-black placeholder:text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* API Configuration Panel */}
      <ApiConfigPanel 
        isOpen={isApiConfigOpen} 
        onClose={() => setIsApiConfigOpen(false)} 
      />
    </div>
  );
}