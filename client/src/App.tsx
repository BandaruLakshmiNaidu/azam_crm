import { AuthProvider, useAuthContext } from "@/context/AuthProvider";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import Dashboard from "@/components/dashboard/dashboard";
import AgentOnboarding from "@/components/agents/agent-onboarding";
import StockOverview from "@/components/inventory/stock-overview";
import StockRequest from "@/components/inventory/stock-request";
import StockApproval from "@/components/inventory/stock-approval";
import StockTransfer from "@/components/inventory/stock-transfer";
import TrackSerial from "@/components/inventory/track-serial";
import CasIdChange from "@/components/inventory/cas-id-change";
import StbScPairing from "@/components/inventory/stb-sc-pairing";
import WarehouseTransfer from "@/components/inventory/warehouse-transfer";
import BlockUnblockAgent from "@/components/inventory/block-unblock-agent";
import BlockUnblockCenter from "@/components/inventory/block-unblock-center";
import POGRNUpdate from "@/components/inventory/po-grn-update";
import POView from "@/components/inventory/po-view";
import CustomerHardwareReturn from "@/components/inventory/customer-hardware-return";
import AgentReplacement from "@/components/inventory/agent-replacement";
import AgentFaultyRepair from "@/components/inventory/agent-faulty-repair";
import AgentPaymentHW from "@/components/payments/agent-payment-hw";
import AgentHardwareSale from "@/components/inventory/agent-hardware-sale";
import CustomerHardwareSale from "@/components/inventory/customer-hardware-sale";
import CustomerPaymentHW from "@/components/payments/customer-payment-hw";
import CustomerPaymentSubscription from "@/components/payments/customer-payment-subscription";
import CustomerRegistration from "@/components/customers/customer-registration";
import SubscriptionPurchase from "@/components/subscriptions/subscription-purchase";
import SubscriptionRenewal from "@/components/subscriptions/subscription-renewal";
import PlanChange from "@/components/subscriptions/plan-change";
import OfferChange from "@/components/subscriptions/offer-change";
import PlanValidityExtension from "@/components/subscriptions/plan-validity-extension";
import AddAddonPacks from "@/components/subscriptions/add-addon-packs";
import CustomerSuspension from "@/components/subscriptions/customer-suspension";
import CustomerDisconnection from "@/components/subscriptions/customer-disconnection";
import Termination from "@/components/subscriptions/termination";
import Replacement from "@/components/subscriptions/replacement";
import Reconnection from "@/components/subscriptions/reconnection";
import SearchSubscriber from "@/components/subscriptions/search-subscriber";
import SubscriberView from "@/components/subscriptions/subscriber-view-new";
import UnifiedReports from "@/components/reports/reports-unified";
import Adjustment from "@/components/adjustment/adjustment";
import ServiceTicketing from "@/pages/new-service-ticketing";
import IncidentManagement from "@/pages/new-incident-management";
import BulkProvision from "@/components/bulk-provision/bulk-provision";
import Provisioning from "@/components/provisioning/provisioning";
import KYCApproval from "@/pages/kyc-approval";
import KYCVerification from "@/pages/kyc-verification";
import TopHeader from "@/components/layout/top-header";
import NavHeader from "@/components/layout/nav-header";
import Breadcrumbs from "@/components/layout/breadcrumbs";
import Footer from "@/components/layout/footer";
import AgentCommission from "@/components/agent-commission/agent-commission";
import AgentPaymentSubscription from "@/components/payments/agent-payment-subscription";
import ReceiptCancellation from "@/components/payments/receipt-cancellation";
import CustomerTransfer from "@/components/payments/customer-transfer";
import NotificationsPage from "@/components/notifications/notifications";
import Profile from "@/components/profile/profile";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopHeader />
      <NavHeader />
      <Breadcrumbs />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-azam-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={() => (
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      )} />
      <Route path="/dashboard" component={() => (
        <ProtectedLayout>
          <Dashboard />
        </ProtectedLayout>
      )} />
      <Route path="/agent-onboarding" component={() => (
        <ProtectedLayout>
          <AgentOnboarding />
        </ProtectedLayout>
      )} />
      <Route path="/kyc-approval" component={() => (
        <ProtectedLayout>
          <KYCApproval />
        </ProtectedLayout>
      )} />
      <Route path="/kyc-verification" component={() => (
        <ProtectedLayout>
          <KYCVerification />
        </ProtectedLayout>
      )} />
      <Route path="/stock-overview" component={() => (
        <ProtectedLayout>
          <StockOverview />
        </ProtectedLayout>
      )} />
      <Route path="/stock-request" component={() => (
        <ProtectedLayout>
          <StockRequest />
        </ProtectedLayout>
      )} />
      <Route path="/stock-approval" component={() => (
        <ProtectedLayout>
          <StockApproval />
        </ProtectedLayout>
      )} />
      <Route path="/stock-transfer" component={() => (
        <ProtectedLayout>
          <StockTransfer />
        </ProtectedLayout>
      )} />
      <Route path="/track-serial" component={() => (
        <ProtectedLayout>
          <TrackSerial />
        </ProtectedLayout>
      )} />
      <Route path="/cas-id-change" component={() => (
        <ProtectedLayout>
          <CasIdChange />
        </ProtectedLayout>
      )} />
      <Route path="/stb-sc-pairing" component={() => (
        <ProtectedLayout>
          <StbScPairing />
        </ProtectedLayout>
      )} />
      <Route path="/warehouse-transfer" component={() => (
        <ProtectedLayout>
          <WarehouseTransfer />
        </ProtectedLayout>
      )} />
      <Route path="/block-unblock-agent" component={() => (
        <ProtectedLayout>
          <BlockUnblockAgent />
        </ProtectedLayout>
      )} />
      <Route path="/block-unblock-center" component={() => (
        <ProtectedLayout>
          <BlockUnblockCenter />
        </ProtectedLayout>
      )} />
      <Route path="/po-grn-update" component={() => (
        <ProtectedLayout>
          <POGRNUpdate />
        </ProtectedLayout>
      )} />
      <Route path="/po-view" component={() => (
        <ProtectedLayout>
          <POView />
        </ProtectedLayout>
      )} />
      <Route path="/customer-hardware-return" component={() => (
        <ProtectedLayout>
          <CustomerHardwareReturn />
        </ProtectedLayout>
      )} />
      <Route path="/agent-replacement" component={() => (
        <ProtectedLayout>
          <AgentReplacement />
        </ProtectedLayout>
      )} />
      <Route path="/agent-faulty-repair" component={() => (
        <ProtectedLayout>
          <AgentFaultyRepair />
        </ProtectedLayout>
      )} />
      <Route path="/agent-payment-hw" component={() => (
        <ProtectedLayout>
          <AgentPaymentHW />
        </ProtectedLayout>
      )} />
      <Route path="/agent-payment-subscription" component={() => (
        <ProtectedLayout>
          <AgentPaymentSubscription />
        </ProtectedLayout>
      )} />
      <Route path="/agent-hardware-sale" component={() => (
        <ProtectedLayout>
          <AgentHardwareSale />
        </ProtectedLayout>
      )} />
      <Route path="/customer-hardware-sale" component={() => (
        <ProtectedLayout>
          <CustomerHardwareSale />
        </ProtectedLayout>
      )} />
      <Route path="/customer-payment-hw" component={() => (
        <ProtectedLayout>
          <CustomerPaymentHW />
        </ProtectedLayout>
      )} />
      <Route path="/customer-payment-subscription" component={() => (
        <ProtectedLayout>
          <CustomerPaymentSubscription />
        </ProtectedLayout>
      )} />
      <Route path="/customer-registration" component={() => (
        <ProtectedLayout>
          <CustomerRegistration />
        </ProtectedLayout>
      )} />
      <Route path="/receipt-cancellation" component={() => (
        <ProtectedLayout>
          <ReceiptCancellation />
        </ProtectedLayout>
      )} />
      <Route path="/customer-transfer" component={() => (
        <ProtectedLayout>
          <CustomerTransfer />
        </ProtectedLayout>
      )} />
      
      <Route path="/subscription-purchase" component={() => (
        <ProtectedLayout>
          <SubscriptionPurchase />
        </ProtectedLayout>
      )} />
      <Route path="/subscription-renewal" component={() => (
        <ProtectedLayout>
          <SubscriptionRenewal />
        </ProtectedLayout>
      )} />
      <Route path="/plan-change" component={() => (
        <ProtectedLayout>
          <PlanChange />
        </ProtectedLayout>
      )} />
      <Route path="/offer-change" component={() => (
        <ProtectedLayout>
          <OfferChange />
        </ProtectedLayout>
      )} />
      <Route path="/plan-validity-extension" component={() => (
        <ProtectedLayout>
          <PlanValidityExtension />
        </ProtectedLayout>
      )} />
      <Route path="/add-addon-packs" component={() => (
        <ProtectedLayout>
          <AddAddonPacks />
        </ProtectedLayout>
      )} />
      <Route path="/customer-suspension" component={() => (
        <ProtectedLayout>
          <CustomerSuspension />
        </ProtectedLayout>
      )} />
      <Route path="/customer-disconnection" component={() => (
        <ProtectedLayout>
          <CustomerDisconnection />
        </ProtectedLayout>
      )} />
      <Route path="/termination" component={() => (
        <ProtectedLayout>
          <Termination />
        </ProtectedLayout>
      )} />
      <Route path="/replacement" component={() => (
        <ProtectedLayout>
          <Replacement />
        </ProtectedLayout>
      )} />
      <Route path="/reconnection" component={() => (
        <ProtectedLayout>
          <Reconnection />
        </ProtectedLayout>
      )} />
      <Route path="/search-subscriber" component={() => (
        <ProtectedLayout>
          <SearchSubscriber />
        </ProtectedLayout>
      )} />
      <Route path="/subscriber-view" component={() => (
        <ProtectedLayout>
          <SubscriberView />
        </ProtectedLayout>
      )} />
      <Route path="/reports" component={() => (
        <ProtectedLayout>
          <UnifiedReports />
        </ProtectedLayout>
      )} />
      <Route path="/adjustment" component={() => (
        <ProtectedLayout>
          <Adjustment />
        </ProtectedLayout>
      )} />
      <Route path="/new-service-ticketing" component={() => (
        <ProtectedLayout>
          <ServiceTicketing />
        </ProtectedLayout>
      )} />
      <Route path="/incident-management" component={() => (
        <ProtectedLayout>
          <IncidentManagement />
        </ProtectedLayout>
      )} />
      <Route path="/new-incident-management" component={() => (
        <ProtectedLayout>
          <IncidentManagement />
        </ProtectedLayout>
      )} />
      <Route path="/bulk-provision" component={() => (
        <ProtectedLayout>
          <BulkProvision />
        </ProtectedLayout>
      )} />
      <Route path="/agent-commission" component={() => (
        <ProtectedLayout>
          <AgentCommission />
        </ProtectedLayout>
      )} />
      <Route path="/provisioning" component={() => (
        <ProtectedLayout>
          <Provisioning />
        </ProtectedLayout>
      )} />
      <Route path="/notifications" component={() => (
        <ProtectedLayout>
          <NotificationsPage />
        </ProtectedLayout>
      )} />
      <Route path="/profile" component={() => (
        <ProtectedLayout>
          <Profile />
        </ProtectedLayout>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
	  <AuthProvider>
          <Router />
	  </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
