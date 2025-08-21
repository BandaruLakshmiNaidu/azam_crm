// === API CLIENT SERVICE ===
// Centralized API client for better organization and error handling

import { ApiResponse, PaginatedResponse, FilterOptions } from '@shared/types';
import { apiRequest } from './queryClient';
import { buildApiUrl, getApiConfig } from './config';

// === BASE API CLIENT ===
class BaseApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Use provided baseUrl or get from config
    this.baseUrl = baseUrl || getApiConfig().baseUrl;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    // Build the full URL using the configurable system
    let fullUrl = buildApiUrl(endpoint, this.baseUrl);
    
    if (params) {
      const url = new URL(fullUrl);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
      fullUrl = url.toString();
    }

    const response = await apiRequest(method, fullUrl, data);
    return response.json();
  }

  protected async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, params);
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, data);
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, data);
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }
}

// === AUTH API CLIENT ===
export class AuthApiClient extends BaseApiClient {
  async login(credentials: { email: string; password: string }) {
    return this.post('/auth/login', credentials);
  }

  async demoLogin(credentials: { username: string; password: string }) {
    return this.post('/auth/demo-login', credentials);
  }

  async logout() {
    return this.post('/auth/logout');
  }

  async forgotPassword(email: string) {
    return this.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string) {
    return this.post('/auth/reset-password', { token, newPassword });
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }
}

// === DASHBOARD API CLIENT ===
export class DashboardApiClient extends BaseApiClient {
  async getStats() {
    return this.get('/dashboard/stats');
  }

  async getChartData(type: string, period?: string) {
    return this.get(`/dashboard/charts/${type}`, { period });
  }

  async getActivities(limit?: number) {
    return this.get('/dashboard/activities', { limit });
  }

  async getSystemStatus() {
    return this.get('/dashboard/system-status');
  }
}

// === AGENT API CLIENT ===
export class AgentApiClient extends BaseApiClient {
  async getAgents(filters?: FilterOptions): Promise<PaginatedResponse<any>> {
    return this.get('/agents', filters);
  }

  async getAgent(id: number) {
    return this.get(`/agents/${id}`);
  }

  async createAgent(agent: any) {
    return this.post('/agents', agent);
  }

  async updateAgent(id: number, agent: any) {
    return this.put(`/agents/${id}`, agent);
  }

  async deleteAgent(id: number) {
    return this.delete(`/agents/${id}`);
  }

  async getAgentBalance(agentId: string) {
    return this.get(`/agents/${agentId}/balance`);
  }

  async updateAgentStatus(id: number, status: string, message?: string) {
    return this.patch(`/agents/${id}/status`, { status, message });
  }
}

// === CUSTOMER API CLIENT ===
export class CustomerApiClient extends BaseApiClient {
  async getCustomers(filters?: FilterOptions): Promise<PaginatedResponse<any>> {
    return this.get('/customers', filters);
  }

  async getCustomer(id: number) {
    return this.get(`/customers/${id}`);
  }

  async createCustomer(customer: any) {
    return this.post('/customers', customer);
  }

  async updateCustomer(id: number, customer: any) {
    return this.put(`/customers/${id}`, customer);
  }

  async searchCustomers(query: string) {
    return this.get('/customers/search', { q: query });
  }

  async getCustomerSubscriptions(customerId: number) {
    return this.get(`/customers/${customerId}/subscriptions`);
  }

  async getCustomerPayments(customerId: number) {
    return this.get(`/customers/${customerId}/payments`);
  }
}

// === INVENTORY API CLIENT ===
export class InventoryApiClient extends BaseApiClient {
  async getInventoryItems(filters?: FilterOptions): Promise<PaginatedResponse<any>> {
    return this.get('/inventory', filters);
  }

  async getInventoryItem(id: number) {
    return this.get(`/inventory/${id}`);
  }

  async createInventoryRequest(request: any) {
    return this.post('/inventory/requests', request);
  }

  async getInventoryRequests(filters?: FilterOptions) {
    return this.get('/inventory/requests', filters);
  }

  async updateInventoryRequest(id: number, request: any) {
    return this.put(`/inventory/requests/${id}`, request);
  }

  async getStockOverview(filters?: any) {
    return this.get('/inventory/stock/overview', filters);
  }

  async transferStock(transfer: any) {
    return this.post('/inventory/stock/transfer', transfer);
  }

  async updateCasId(serialNumber: string, casId: string) {
    return this.post('/inventory/cas-id/update', { serialNumber, casId });
  }

  async pairStbSmartCard(stbSerial: string, smartCardNumber: string) {
    return this.post('/inventory/stb-sc-pairing', { stbSerial, smartCardNumber });
  }
}

// === PAYMENT API CLIENT ===
export class PaymentApiClient extends BaseApiClient {
  async getPayments(filters?: FilterOptions): Promise<PaginatedResponse<any>> {
    return this.get('/payments', filters);
  }

  async createPayment(payment: any) {
    return this.post('/payments', payment);
  }

  async getPayment(id: number) {
    return this.get(`/payments/${id}`);
  }

  async processPayment(paymentId: number, method: string) {
    return this.post(`/payments/${paymentId}/process`, { method });
  }

  async cancelPayment(paymentId: number, reason: string) {
    return this.post(`/payments/${paymentId}/cancel`, { reason });
  }

  async generateReceipt(paymentId: number) {
    return this.get(`/payments/${paymentId}/receipt`);
  }
}

// === SUBSCRIPTION API CLIENT ===
export class SubscriptionApiClient extends BaseApiClient {
  async getSubscriptions(filters?: FilterOptions): Promise<PaginatedResponse<any>> {
    return this.get('/subscriptions', filters);
  }

  async createSubscription(subscription: any) {
    return this.post('/subscriptions', subscription);
  }

  async getSubscription(id: number) {
    return this.get(`/subscriptions/${id}`);
  }

  async renewSubscription(id: number, data: any) {
    return this.post(`/subscriptions/${id}/renew`, data);
  }

  async changePlan(subscriptionId: number, planData: any) {
    return this.post(`/subscriptions/${subscriptionId}/change-plan`, planData);
  }

  async suspendSubscription(id: number, reason: string) {
    return this.post(`/subscriptions/${id}/suspend`, { reason });
  }

  async reactivateSubscription(id: number) {
    return this.post(`/subscriptions/${id}/reactivate`);
  }

  async terminateSubscription(id: number, data: any) {
    return this.post(`/subscriptions/${id}/terminate`, data);
  }

  async getSubscriptionPlans() {
    return this.get('/subscriptions/plans');
  }

  async getAddOnPacks() {
    return this.get('/subscriptions/addons');
  }

  async purchaseAddOn(data: any) {
    return this.post('/subscriptions/addons/purchase', data);
  }
}

// === REPORT API CLIENT ===
export class ReportApiClient extends BaseApiClient {
  async getReports(type?: string, filters?: any) {
    return this.get('/reports', { type, ...filters });
  }

  async generateReport(type: string, parameters: any) {
    return this.post('/reports/generate', { type, parameters });
  }

  async getReportStatus(reportId: string) {
    return this.get(`/reports/${reportId}/status`);
  }

  async downloadReport(reportId: string, format: string = 'pdf') {
    return this.get(`/reports/${reportId}/download`, { format });
  }
}

// === HARDWARE SALE API CLIENT ===
export class HardwareSaleApiClient extends BaseApiClient {
  async getAgentHardwareSales(filters?: FilterOptions) {
    return this.get('/hardware-sales/agent', filters);
  }

  async createAgentHardwareSale(sale: any) {
    return this.post('/hardware-sales/agent', sale);
  }

  async updateAgentHardwareSale(id: number, sale: any) {
    return this.put(`/hardware-sales/agent/${id}`, sale);
  }

  async getCustomerHardwareSales(filters?: FilterOptions) {
    return this.get('/hardware-sales/customer', filters);
  }

  async createCustomerHardwareSale(sale: any) {
    return this.post('/hardware-sales/customer', sale);
  }

  async updateCustomerHardwareSale(id: number, sale: any) {
    return this.put(`/hardware-sales/customer/${id}`, sale);
  }

  async getHardwareItems(filters?: any) {
    return this.get('/hardware-sales/items', filters);
  }

  async getHardwarePricing(itemId: string, planType?: string) {
    return this.get(`/hardware-sales/items/${itemId}/pricing`, { planType });
  }
}

// === API CLIENT INSTANCES ===
export const authApi = new AuthApiClient();
export const dashboardApi = new DashboardApiClient();
export const agentApi = new AgentApiClient();
export const customerApi = new CustomerApiClient();
export const inventoryApi = new InventoryApiClient();
export const paymentApi = new PaymentApiClient();
export const subscriptionApi = new SubscriptionApiClient();
export const reportApi = new ReportApiClient();
export const hardwareSaleApi = new HardwareSaleApiClient();

// === DEFAULT EXPORT ===
export const apiClient = {
  auth: authApi,
  dashboard: dashboardApi,
  agents: agentApi,
  customers: customerApi,
  inventory: inventoryApi,
  payments: paymentApi,
  subscriptions: subscriptionApi,
  reports: reportApi,
  hardwareSales: hardwareSaleApi,
};