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
import Agent from "./Pages/Admin/Agents/Index";

const Authorize = () => {
	const { isLoggedIn } = useContext(GlobalContext);

	return (
		<Routes>
			{isLoggedIn ? (
				// ✅ Protected Routes (user is logged in)
				<Route element={<AppLayout />}>
					<Route path="/admin/dashboard" element={<Dashboard />} />
					<Route path="/admin/users" element={<Users />} />
					<Route path="/admin/apartments" element={<Apartments />} />
					<Route path="/admin/agents" element={<Agent />} />
					{/* Add more protected routes here */}
				</Route>
			) : (
				// 🔐 Public Routes (user not logged in)
				<Route element={<AuthLayout />}>
					<Route path="/admin/login" element={<Login />} />
					{/* You can add forgot-password or register here too */}
				</Route>
			)}

			{/* Redirect root to login */}
			<Route path="/" element={<Navigate to="/admin/login" replace />} />

			{/* Catch-all: go to login or 404 */}
			<Route path="*" element={<Navigate to="/admin/login" replace />} />
		</Routes>
	);
};

export default Authorize;
