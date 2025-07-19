import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { validateSession } from '../../../redux/features/authSlice';

function UserProtection({children}) {
    const dispatch = useDispatch();
    const {isAuthenticated, user} = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(validateSession());
    }, [dispatch]);

    if(!isAuthenticated || !user || user.role !== "user"){
        return <Navigate to="/" />;
    }
    return children;
}

export default UserProtection;
