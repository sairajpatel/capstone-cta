import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

function AdminProtectWrapper({children}){
    const {isAuthenticated, user} = useSelector((state) => state.auth);
    
    if (!isAuthenticated || !user || user.role !== "admin") {
        return <Navigate to="/admin-login" />;
    }
    
    return children;
}

export default AdminProtectWrapper;
