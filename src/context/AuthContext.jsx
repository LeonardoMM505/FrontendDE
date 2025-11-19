import { useState,  useEffect } from "react";
import { AuthContext, useAuth } from './auth.js';
// Importamos las funciones que están en src/api/auth.js
import { registerRequest, loginRequest, verifyTokenRequest, logoutRequest, getUsersRequest, deleteUserRequest } from "../api/auth.js";
import Cookies from "js-cookie"; // Necesitas tener instalado js-cookie





export const AuthProvider = ( { children } ) =>{
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState (false);
    const [errors, setErrors] = useState ([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    const [authLoading, setAuthLoading] = useState(true); // Para autenticación
    const [usersLoading, setUsersLoading] = useState(false); // Para usuarios

// Función de registro
    const signup = async (user) => {
        try{
            const res = await registerRequest(user);
        setUser(res.data);
        setErrors([]); 
        setIsAuthenticated(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error de registro";
            setErrors([errorMessage]); 
            throw error;
    }
};


// Función de login
    const login = async (user) => {
        try {
            const res = await loginRequest(user);
            setUser(res.data);
            setErrors([]); 
            setIsAuthenticated(true);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error de inicio de sesión";
            setErrors([errorMessage]); 
            throw error;
     }
    };

// Función de logout
    const logout = async () => {
        try {
            await logoutRequest(); // Llama al backend para eliminar la cookie

// Limpia el estado y las cookies en el frontend
            Cookies.remove("token"); // Elimina la cookie del frontend
            setUser(null);
            setIsAuthenticated(false);
            setErrors([]); // Limpia errores
// window.location.href = "/"; 
        } catch (error) {
    console.error("Error al cerrar sesión:", error);
    }
    };

// Efecto para limpiar errores después de 5 segundos
    useEffect( ()=> {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
            setErrors([]);
        }, 5000);

        return () => clearTimeout(timer);
    }
    }, [errors]);
    
    // --- FUNCIÓN DE VERIFICACIÓN DE LOGIN (CheckLogin) ---
    // Este efecto es clave: revisa si hay un token al cargar la aplicación
    // y llama a /verify para obtener los datos del usuario.
    useEffect(()=>{
    async function CheckLogin() {
        const cookies = Cookies.get();

            if (!cookies.token) {
                setIsAuthenticated(false);
                setLoading(false);
                setAuthLoading(false);
                return setUser(null);
    }

        try {
// Llama al endpoint de verificar token (aún no lo hemos creado en el backend)
                 const res = await verifyTokenRequest();

                    if (!res.data) {
                        setIsAuthenticated(false);
                        setLoading(false);
                        setAuthLoading(false);
                       return setUser(null);
    }

                setIsAuthenticated(true);
                setUser(res.data);
                setLoading(false);
                setAuthLoading(false); // Aseguramos que termine la carga de auth
            } catch (error) {
                console.log(error);
                setIsAuthenticated(false);
                setLoading(false);
                setAuthLoading(false); 
                return setUser(null);
     }

        }
        CheckLogin();
    }, []);


    // --- FUNCIONES DE ADMINISTRACIÓN ---
    // (Mantendremos el resto de tus funciones aquí para el futuro)
    
    const getUsers = async () => {
        setUsersLoading(true);
        try {
            const res = await getUsersRequest();
            setUsers(res.data);
        } catch (error) {
            setErrors([error.response?.data?.message || "Error al obtener usuarios"]);
        } finally {
            setUsersLoading(false);
        }
    };

    const deleteUser = async (id) => {
        setUsersLoading(true);
        try {
            // Note: Tu código anterior usaba user._id, nosotros usaremos user.IdUs
            await deleteUserRequest(id); 
            // Filtramos la lista eliminando el usuario con el ID
            setUsers(prev => prev.filter(user => user.IdUs !== id)); 
            return true;
        } catch (error) {
            setErrors([error.response?.data?.message || "Error al eliminar usuario"]);
            return false;
        } finally {
            setUsersLoading(false);
        }
    };


    // 3. Devolvemos el contexto a los hijos
    return(
    <AuthContext.Provider value={ { // CORRECCIÓN: debe ser AuthContext.Provider
            signup,
            logout,
            login,
            user,
            isAuthenticated,
            authLoading, 
            usersLoading,
            errors,
            loading,
            getUsers,
            users,
            deleteUser
        } } >
            {children}
    </AuthContext.Provider>
    )
}