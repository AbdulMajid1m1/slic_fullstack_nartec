import React, { useContext, useEffect, useState } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { AuthContext } from './Contexts/AuthContext';
import { toast } from 'react-toastify';

const ProtectedRoute = ({ children, requiredPermission }) => {
    const { permissions } = useContext(AuthContext);
    console.log(permissions)

    const [toastShown, setToastShown] = useState(false);

    const adminData = sessionStorage.getItem('adminData');
    // console.log('Admin Data:', adminData);

    useEffect(() => {
        const loginToastShown = localStorage.getItem('loginToastShown');

        // Check if admin data exists
        if (!adminData && !loginToastShown) {
            // console.log('Showing login toast');
            toast.error('Please log in to access this page');
            localStorage.setItem('loginToastShown', 'true');
            setToastShown(true);
        }
    }, [adminData]);

    if (!adminData) {
        // console.log('User not logged in, navigating to login page');
        return <Navigate to="/admin-login" />;
    }

    const parsedAdminData = JSON.parse(adminData);

    // Checking for super admin
    if (parsedAdminData.is_super_admin === 1) {
        // console.log('Super admin, allowing access');
        return children;
    }
    console.log(requiredPermission)
    if (!permissions.includes(requiredPermission)) {
        const toastShownKey = `toastShown_${requiredPermission}`;
        if (!sessionStorage.getItem(toastShownKey)) {
            // console.log(`Showing permission toast for ${requiredPermission}`);
            console.log(`You don't have permission ${requiredPermission} to access this page`);
            toast.error(`You don't have permission ${requiredPermission} to access this page`);
            sessionStorage.setItem(toastShownKey, 'true');
        }
        // console.log('Navigating to admin dashboard');
        return <Navigate to="/admin/dashboard" />;
    }

    // console.log('User has required permission, allowing access');
    return children;
};

export default ProtectedRoute;
