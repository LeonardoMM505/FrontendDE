import { useState, useEffect } from "react";
import { AuthContext} from './auth.js';
import { registerRequest, loginRequest, verifyTokenRequest, logoutRequest } from "../api/auth.js";
import Cookies from "js-cookie";

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users] = useState([]);
    const [authLoading, setAuthLoading] = useState(true);

    // Función para normalizar el objeto usuario
    const normalizeUser = (userData) => {
    if (!userData) return null;
    

    
    const normalized = {
        id: userData.IdUs || userData.id,
        username: userData.NomUs || userData.username,
        email: userData.Email || userData.email,
        // Asegurar que siempre tengamos 'role' disponible
        role: userData.Rol || userData.role, // ← Primero Rol, luego role
        // Mantener propiedades originales
        ...userData
    };
    

    return normalized;
};

    // Función de registro
    const signup = async (userData) => {
        try {
            const res = await registerRequest(userData);
            const normalizedUser = normalizeUser(res.data);
            setUser(normalizedUser);
            setErrors([]); 
            setIsAuthenticated(true);
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Error de registro";
            setErrors([errorMessage]); 
            throw error;
        }
    };

    // Función de login
   const login = async (credentials) => {
  try {
    const res = await loginRequest(credentials);
    

    
    // Guardar token en localStorage
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
   
    }
    
    const normalizedUser = normalizeUser(res.data.user);
    
    
    // ESTAS 3 LÍNEAS SON CRÍTICAS:
    setUser(normalizedUser);
    setIsAuthenticated(true);  // ← ¡Establecer a TRUE!
    setErrors([]);
    
    console.log('✅ isAuthenticated establecido a: true');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error en login:', error);
    const errorMessage = error.response?.data?.message || "Error de inicio de sesión";
    setErrors([errorMessage]); 
    setIsAuthenticated(false); // ← Asegurar que sea false en error
    throw error;
  }
};

    // Función de logout
    const logout = async () => {
        try {
            await logoutRequest();
            Cookies.remove("token");
            setUser(null);
            setIsAuthenticated(false);
            setErrors([]);
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    // Efecto para limpiar errores
    useEffect(() => {
        if (errors.length > 0) {
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [errors]);
    
    // Verificación de login al cargar la app
    useEffect(() => {
        async function CheckLogin() {
            const cookies = Cookies.get();
            
            if (!cookies.token) {
                setIsAuthenticated(false);
                setLoading(false);
                setAuthLoading(false);
                return setUser(null);
            }

            try {
                const res = await verifyTokenRequest();
                
                if (!res.data) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    setAuthLoading(false);
                    return setUser(null);
                }
                
                const normalizedUser = normalizeUser(res.data);

                
                setIsAuthenticated(true);
                setUser(normalizedUser);
                setLoading(false);
                setAuthLoading(false);
            } catch (error) {
                console.log("Error en verifyToken:", error);
                setIsAuthenticated(false);
                setLoading(false);
                setAuthLoading(false);
                setUser(null);
            }
        }
        CheckLogin();
    }, []);

    // --- FUNCIONES DE ADMINISTRACIÓN ---
    // (Mantendremos el resto de tus funciones aquí para el futuro)
    
 

    // 3. Devolvemos el contexto a los hijos
      return (
        <AuthContext.Provider value={{
            signup,
            logout,
            login,
            user,
            isAuthenticated,
            authLoading, 
            errors,
            loading,
            users
           
        }}>
            {children}
        </AuthContext.Provider>
    );
};