// Environment-based configuration using .env
import { ENV_CONFIG } from '../config/env';

export const BASE_URL = ENV_CONFIG.API_BASE_URL;

// Helper functions
const endpoint = (path) => `${BASE_URL}${path}`;
const withId = (basePath) => (id) => endpoint(`${basePath}/${id}`);
const withParams = (basePath) => (params = {}) => {
  const query = new URLSearchParams(params).toString();
  return endpoint(`${basePath}${query ? `?${query}` : ''}`);
};

// Authentication Endpoints
export const AUTH_ENDPOINTS = {
  adminLogin: endpoint("/auth/admin/login"),
  adminProfile: endpoint("/admin/profile"),
  refreshToken: endpoint("/auth/refresh"),
  logout: endpoint("/auth/logout")
};

// Admin Management Endpoints
export const ADMIN_ENDPOINTS = {
  dashboard: endpoint("/admin/dashboard"),
  stats: endpoint("/admin/stats"),
  agents: {
    list: endpoint("/admin/agents"),
    getById: withId("/admin/agents"),
    create: endpoint("/admin/agents"),
    update: withId("/admin/agents"),
    delete: withId("/admin/agents")
  },
  users: {
    list: endpoint("/admin/users"),
    getById: withId("/admin/users"),
    create: endpoint("/admin/users"),
    update: withId("/admin/users"),
    delete: withId("/admin/users")
  },
  staff: {
    list: endpoint("/admin/staff"),
    create: endpoint("/admin/staff/add"),
    toggle: withId("/admin/staff/toggle")
  }
};

// Apartments Endpoints
export const APARTMENT_ENDPOINTS = {
  pending: {
    list: endpoint("/apartment/pending-apartments"),
    getById: withId("/apartment/pending-apartments"),
    approve: withId("/admin", "/approve"),
    reject: withId("/admin", "/reject")
  },
  approved: {
    list: endpoint("/admin/apartments/approved"),
    getById: withId("/admin/apartments/approved")
  },
  management: {
    list: endpoint("/admin/apartments"),
    create: endpoint("/admin/apartments/add"),
    getById: withId("/admin/apartments/details"),
    update: withId("/admin/apartments/details"),
    delete: withId("/admin/apartments/remove")
  },
  seasonalPricing: {
    list: (apartmentId) => endpoint(`/admin/apartments/${apartmentId}/seasonal-pricing`),
    create: (apartmentId) => endpoint(`/admin/apartments/${apartmentId}/seasonal-pricing`),
    update: (apartmentId, pricingId) => endpoint(`/admin/apartments/${apartmentId}/seasonal-pricing/${pricingId}`),
    delete: (apartmentId, pricingId) => endpoint(`/admin/apartments/${apartmentId}/seasonal-pricing/${pricingId}`)
  },
  bedroomPricing: {
    list: (apartmentId) => endpoint(`/admin/apartments/${apartmentId}/bedroom-pricing`),
    create: (apartmentId) => endpoint(`/admin/apartments/${apartmentId}/bedroom-pricing`),
    update: (apartmentId, pricingId) => endpoint(`/admin/apartments/${apartmentId}/bedroom-pricing/${pricingId}`),
    delete: (apartmentId, pricingId) => endpoint(`/admin/apartments/${apartmentId}/bedroom-pricing/${pricingId}`)
  }
};

// Bookings Endpoints
export const BOOKING_ENDPOINTS = {
  summary: endpoint("/admin/bookings"),
  list: withParams("/admin/bookings/all"),
  getById: withId("/admin/bookings/details"),
  create: endpoint("/admin/bookings"),
  update: withId("/admin/bookings"),
  delete: withId("/admin/bookings")
};

// Landlords Endpoints
export const LANDLORD_ENDPOINTS = {
  list: endpoint("/admin/landlords"),
  create: endpoint("/admin/landlords/add"),
  getById: withId("/admin/landlords/details"),
  update: withId("/admin/landlords/update")
};

// Reservation Endpoints
export const RESERVATION_ENDPOINTS = {
  accept: endpoint("/admin/reservation-requests/accept"),
  decline: endpoint("/admin/reservation-requests/decline")
};

// Notification Endpoints (for your notification system)
export const NOTIFICATION_ENDPOINTS = {
  list: withParams("/admin/notifications"),
  getById: withId("/admin/notifications"),
  markAsRead: withId("/admin/notifications", "/read"),
  markAllAsRead: endpoint("/admin/notifications/read-all"),
  getUnreadCount: endpoint("/admin/notifications/unread-count"),
  subscribe: endpoint("/admin/notifications/subscribe"),
  unsubscribe: endpoint("/admin/notifications/unsubscribe")
};

// Shop Endpoints
export const SHOP_ENDPOINTS = {
  products: {
    list: endpoint("/admin/shop/products"),
    create: endpoint("/admin/shop/products"),
    getById: withId("/admin/shop/products"),
    update: withId("/admin/shop/products"),
    delete: withId("/admin/shop/products"),
  },
  requests: {
    list: endpoint("/admin/shop/requests"),
    getById: withId("/admin/shop/requests"),
    approve: (requestId) => endpoint(`/admin/shop/requests/${requestId}/approve`),
    reject: (requestId) => endpoint(`/admin/shop/requests/${requestId}/reject`),
    fulfill: (requestId) => endpoint(`/admin/shop/requests/${requestId}/fulfill`),
    confirmPayment: (requestId) => endpoint(`/admin/shop/requests/${requestId}/confirm-payment`),
    pendingCount: endpoint("/admin/shop/requests/pending/count"),
  },
};

// Legacy support (to be removed after migration)
export const LEGACY_ENDPOINTS = {
  // Keep old exports for backward compatibility during transition
  AdminLoginAPI: AUTH_ENDPOINTS.adminLogin,
  AdminGetAgentAPI: ADMIN_ENDPOINTS.agents.list,
  AdminGetUsersAPI: ADMIN_ENDPOINTS.users.list,
  AdminGetStatsAPI: ADMIN_ENDPOINTS.stats,
  AdminGetPendingApartmentsAPI: APARTMENT_ENDPOINTS.pending.list,
  AdminGetPendingApartmentByIdAPI: APARTMENT_ENDPOINTS.pending.getById,
  AdminGetApprovedApartmentsAPI: APARTMENT_ENDPOINTS.approved.list,
  AdminGetApprovedApartmentByIdAPI: APARTMENT_ENDPOINTS.approved.getById,
  AdminApprovedApartment: APARTMENT_ENDPOINTS.pending.approve,
  AdminRejectApartment: APARTMENT_ENDPOINTS.pending.reject,
  AdminGetBookingsSummaryAPI: BOOKING_ENDPOINTS.summary,
  AdminGetAllBookingsAPI: BOOKING_ENDPOINTS.list,
  GetAdminProfile: AUTH_ENDPOINTS.adminProfile
};

// Export legacy for backward compatibility
export const {
  AdminLoginAPI,
  AdminGetAgentAPI,
  AdminGetUsersAPI,
  AdminGetStatsAPI,
  AdminGetPendingApartmentsAPI,
  AdminGetPendingApartmentByIdAPI,
  AdminGetApprovedApartmentsAPI,
  AdminGetApprovedApartmentByIdAPI,
  AdminApprovedApartment,
  AdminRejectApartment,
  AdminGetBookingsSummaryAPI,
  AdminGetAllBookingsAPI,
  GetAdminProfile
} = LEGACY_ENDPOINTS;