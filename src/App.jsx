import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx'; 
import { useAuth } from './context/auth.js';

function App() {
    // ⬇️ Desestructuramos el hook ⬇️
    const { isAuthenticated, user, logout, authLoading } = useAuth(); // <--- AÑADE 'authLoading'
    
    // 1. Si el contexto está cargando (verificando el token), mostramos un loading.
    if (authLoading) {
        return <h1>Cargando la aplicación...</h1>;
    }

  return (
    <>
      {/* (Tu navegación va aquí...) */}
      <nav style={{ /* ...estilos... */ }}>
        <Link to="/"><h1>Disco Elysium</h1></Link>
        <div>
          {isAuthenticated ? (
            <>
              <span>Bienvenido, {user.NomUs}</span> 
              <button onClick={logout} style={{ marginLeft: '10px', padding: '5px', cursor: 'pointer' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ color: 'white', marginRight: '15px' }}>Login</Link>
              <Link to="/register" style={{ color: 'white' }}>Register</Link>
            </>
          )}
        </div>
      </nav>
      
      <main>
        <Routes>
          {/* Rutas Públicas */}
          <Route path="/" element={<h1>Página de Inicio (Home)</h1>} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          
          {/* ⬇️ Rutas Protegidas (Requieren Login) ⬇️ */}
          <Route element={<ProtectedRoute />}>
            {/* Si el token es válido, se muestra el componente de estas rutas */}
            <Route path="/profile" element={<h1>¡Bienvenido, {user?.NomUs}! (Perfil)</h1>} /> 
          </Route>
          
        </Routes>
      </main>
    </>
  );
}

export default App;