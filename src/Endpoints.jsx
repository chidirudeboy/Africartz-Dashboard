// Base API URL (environment configurable)
import { ENV_CONFIG } from './config/env';
export const baseUrl = ENV_CONFIG.API_BASE_URL;

// Helper to generate full endpoint paths
const endpoint = (path) => `${baseUrl}${path}`;

// ------------------ AFRI Booking Dashboard API ENDPOINTS -----------------------------

export const AdminLoginAPI = endpoint("/auth/admin/login");
export const AdminGetAgentAPI = endpoint("/admin/agents");
export const AdminGetUsersAPI = endpoint("/admin/users");
export const AdminGetStatsAPI = endpoint("/admin/stats");



export const AdminGetPendingApartmentsAPI = endpoint("/apartment/pending-apartments");
export const AdminGetPendingApartmentByIdAPI = (APARTMENT_ID) => endpoint(`/apartment/pending-apartments/${APARTMENT_ID}`);
export const AdminGetApprovedApartmentsAPI = endpoint("/admin/apartments/approved");
export const AdminGetApprovedApartmentByIdAPI = (APARTMENT_ID) => endpoint(`/admin/apartments/approved/${APARTMENT_ID}`);
export const AdminApprovedApartment = (APARTMENT_ID) => endpoint(`/admin/apartments/${APARTMENT_ID}/status`);
export const AdminRejectApartment = (APARTMENT_ID) => endpoint(`/admin/${APARTMENT_ID}/reject`);

export const AdminGetBookingsSummaryAPI = endpoint("/admin/bookings");
export const AdminGetAllBookingsAPI = endpoint("/admin/bookings/all");

// Reservations Endpoints
export const AdminGetAllReservationsAPI = endpoint("/admin/reservations/all-agents");


// ≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠OLD≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠≠
// Dashboard Endpoints
export const DashboardAPI = endpoint("/admin/dashboard");
export const GetAdminProfile = endpoint("/admin/profile");

// Bookings Endpoints
export const BookingsAPI = endpoint("/admin/bookings");
export const ViewBookingsAPI = endpoint("/admin/bookings/details/");

// Apartments Endpoints
export const ApartmentsAPI = endpoint("/admin/apartments");
export const AddApartmentsAPI = endpoint("/admin/apartments/add");
export const ViewApartmentsAPI = endpoint("/admin/apartments/details/");
export const updateApartmentsAPI = endpoint("/admin/apartments/details/");
export const deleteApartmentsAPI = endpoint("/admin/apartments/remove/");

// Landlords Endpoints
export const LandlordsAPI = endpoint("/admin/landlords");
export const AddLandlordsAPI = endpoint("/admin/landlords/add");
export const ViewLandlordDetailsAPI = endpoint("/admin/landlords/details/");
export const UpdateLandlordDetailsAPI = endpoint("/admin/landlords/update/");

// Reservation Request Endpoints
export const AcceptRequests = endpoint("/admin/reservation-requests/accept");
export const DeclinedRequests = endpoint("/admin/reservation-requests/decline");

// Users Endpoint
export const UsersAPI = endpoint("/admin/users");

// Staff Endpoints
export const StaffAPI = endpoint("/admin/staff");
export const AddStaffAPI = endpoint("/admin/staff/add");
export const ToggleStaffAPI = endpoint("/admin/staff/toggle/");
