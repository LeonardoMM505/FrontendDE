import { Navigate, Outlet } from "react-router";
import { useAuth } from "./context/auth.js";


export default function ProtectedRoute () {
        const {user, loading, isAuthenticated} = useAuth();
        console.log("Loading:"+ loading);
        console.log("isAuthenticated:"+ isAuthenticated);

        if (loading) return <h1>Cargando...</h1>

        if (!loading && !isAuthenticated) {
            return <Navigate to='/' replace/>
        }
    return ( <Outlet/> )
}

// ProtectedRoute.jsx