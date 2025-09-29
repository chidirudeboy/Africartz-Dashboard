import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GlobalContext from './Context';

import AppLayout from './Layouts/App';
import AuthLayout from './Layouts/Auth'; // optional, if you use it for login page

// Admin Pages
import Login from "./Pages/Admin/Auth/Login";
import Dashboard from "./Pages/Admin/Dashboard/Index";
import Users from "./Pages/Admin/Users/Index";
import Apartments from "./Pages/Admin/Apartments/Index";
import ApprovedApartments from "./Pages/Admin/ApprovedApartments/Index";
import ResubmittedApartments from "./Pages/Admin/ResubmittedApartments/Index";
import Bookings from "./Pages/Admin/Bookings/Index";
import Reservations from "./Pages/Admin/Reservations/Index";
import Agent from "./Pages/Admin/Agents/Index";
import Statistics from "./Pages/Admin/Statistics/Index";

const Authorize = () => {
	const { isLoggedIn, isLoading } = useContext(GlobalContext);

	// Show loading while checking authentication
	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<Routes>
			{isLoggedIn ? (
				// ✅ Protected Routes (user is logged in)
				<>
					<Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
					<Route element={<AppLayout />}>
						<Route path="/admin/dashboard" element={<Dashboard />} />
						<Route path="/admin/users" element={<Users />} />
						<Route path="/admin/apartments" element={<Apartments />} />
						<Route path="/admin/approved-apartments" element={<ApprovedApartments />} />
						<Route path="/admin/review-resubmitted" element={<ResubmittedApartments />} />
						<Route path="/admin/bookings" element={<Bookings />} />
						<Route path="/admin/reservations" element={<Reservations />} />
						<Route path="/admin/agents" element={<Agent />} />
						<Route path="/admin/statistics" element={<Statistics />} />
						{/* Add more protected routes here */}
					</Route>
					{/* Redirect any login attempts to dashboard when already logged in */}
					<Route path="/admin/login" element={<Navigate to="/admin/dashboard" replace />} />
					{/* Catch-all: redirect to dashboard */}
					<Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
				</>
			) : (
				// 🔐 Public Routes (user not logged in)
				<>
					{/* Redirect root to login */}
					<Route path="/" element={<Navigate to="/admin/login" replace />} />
					<Route element={<AuthLayout />}>
						<Route path="/admin/login" element={<Login />} />
						{/* You can add forgot-password or register here too */}
					</Route>
					{/* Catch-all: redirect to login when not authenticated */}
					<Route path="*" element={<Navigate to="/admin/login" replace />} />
				</>
			)}
		</Routes>
	);
};

export default Authorize;
