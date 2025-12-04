// axiosInstance.js
import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL + '/api', 
    withCredentials: true
});

// INTERCEPTOR PARA AGREGAR TOKEN A TODAS LAS PETICIONES
instance.interceptors.request.use(
  (config) => {
    // Obtener el token de localStorage
    const token = localStorage.getItem('token');
    

    
    // Si hay token, agregarlo al header Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
 
    } else {
      console.warn('⚠️ axiosInstance - No hay token disponible para:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ axiosInstance - Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// INTERCEPTOR PARA MANEJAR ERRORES DE RESPUESTA
instance.interceptors.response.use(
  (response) => {
   
    return response;
  },
  (error) => {
    console.error('❌ axiosInstance - Error en respuesta:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message
    });
    
    // Si es error 401 (No autorizado), limpiar el token
    if (error.response?.status === 401) {
      console.warn('⚠️ axiosInstance - Token inválido o expirado, limpiando...');
      localStorage.removeItem('token');
      // Opcional: redirigir a login
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default instance;