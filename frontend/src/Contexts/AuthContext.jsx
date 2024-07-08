import React, { createContext, useState, useEffect } from 'react';
import newRequest from '../utils/userRequest.jsx';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [adminData, setAdminData] = useState(null);
    // Separate states for userPermissions and allPermissions
    const [userPermissions, setUserPermissions] = useState([]);
    const [allPermissions, setAllPermissions] = useState([]);

    // Adjust login function to handle userPermissions
    const login = (adminData, permissions) => {
        setAdminData(adminData);
        setUserPermissions(permissions); // Now setting userPermissions
        sessionStorage.setItem('adminData', JSON.stringify(adminData));
        // Store user permissions under a distinct key
        sessionStorage.setItem('userPermissions', JSON.stringify(permissions));
    };

    // Adjust fetchPermissions to fetch all permissions and store them separately
    const fetchPermissions = () => {
        newRequest.get('/permissions')
            .then((response) => {
                // console.log("Fetched permissions:", response.data);
                const fetchedPermissions = response.data.map(permission => permission.name);
                setAllPermissions(fetchedPermissions); // Now setting allPermissions
                // Store all permissions under a distinct key to avoid confusion
                sessionStorage.setItem('allPermissions', JSON.stringify(fetchedPermissions));
            })
            .catch((error) => {
                console.error("Error fetching permissions:", error);
            });
    };

    // Load admin data and permissions from sessionStorage on initial load
    useEffect(() => {
        // check if allPermissions is present in sessionStorage and fetch if not
        const storedAllPermissions = sessionStorage.getItem('allPermissions');
        if (!storedAllPermissions) fetchPermissions();

        const storedAdminData = sessionStorage.getItem('adminData');
        const storedUserPermissions = sessionStorage.getItem('userPermissions');
        // Fetch allPermissions only if needed, i.e., not in this useEffect
        if (storedAdminData) setAdminData(JSON.parse(storedAdminData));
        if (storedUserPermissions) setUserPermissions(JSON.parse(storedUserPermissions));
    }, []);

    return (
        <AuthContext.Provider value={{
            adminData, setAdminData,
            permissions: userPermissions, // Use userPermissions here
            setPermissions: setUserPermissions,
            login, fetchPermissions
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
