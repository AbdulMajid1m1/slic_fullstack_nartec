import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const MemberProtectedRoute = (props) => {
    const { Component } = props;
    const navigate = useNavigate();
    const toastShownRef = useRef(false); // Using a ref to track if the toast has been shown

    useEffect(() => {
        const login = sessionStorage.getItem('memberData');
        if (!login) {
            navigate('/');
            // Only show the toast if it hasn't been shown before
            if (!toastShownRef.current) {
                toast.error('Please login first');
                toastShownRef.current = true; // Mark the toast as shown
            }
        }
    }, [navigate]); // Add navigate to dependency array to comply with exhaustive-deps rule

  return (
    <div>
        <Component />
    </div>
  );
}

export default MemberProtectedRoute;
