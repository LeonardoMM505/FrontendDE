import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LoginPage from './pages/LoginPage.jsx'; 
import { useAuth } from './context/auth.js';
import SongsPage from './pages/Songspage.jsx';
import PlaylistsPage from './pages/PlaylistsPage';
import PlaylistDetailPage from './pages/PlaylistDetailPage.jsx';
import AdminPlaylistsPage from './pages/AdminPlaylistsPage';

function App() {
    const { isAuthenticated, user, logout, authLoading } = useAuth();
    


    
    // Manejar ambos casos: 'role' (normalizado) y 'Rol' (original del backend)
    // IMPORTANTE: El auth context ya normalizó user.Rol a user.role
    // Pero por si acaso, verificamos ambos
    const userRole = user?.role || user?.Rol;
    const isAdmin = userRole === 'admin';

    
    // Mientras authLoading es true, mostrar loading
    if (authLoading) {
        return <h1>Cargando la aplicación...</h1>;
    }

    return (
        <>
            {/* Navegación - Solo mostrar si está autenticado */}
           {isAuthenticated && user && (
   <nav
    style={{
        width: "100%",
        position: "relative",
        top: "11110",
        left: "11110",
        background: "linear-gradient(90deg, #7B2FFF, #9B4CFF)",
        padding: "15px 30px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "white",
        fontFamily: "Poppins, sans-serif",
        boxSizing: "border-box",
    }}
>


        {/* LOGO */}
        <Link to="/songs" style={{ textDecoration: "none" }}>
            <h1 style={{ color: "white", fontSize: "28px", fontWeight: "700" }}>
                Disco Elysium
            </h1>
        </Link>

        {/* BOTONES */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

            {/* Admin */}
            {isAdmin && (
                <Link
                    to="/admin/playlists"
                    style={{
                        background: "rgba(255,255,255,0.35)",
                        padding: "10px 20px",
                        borderRadius: "30px",
                        color: "white",
                        textDecoration: "none",
                        fontSize: "16px",
                        fontWeight: "500",
                    }}
                >
                    Playlists (Admin)
                </Link>
            )}

            {/* Playlists */}
            <Link
                to="/playlists"
                style={{
                    background: "rgba(255,255,255,0.35)",
                    padding: "10px 20px",
                    borderRadius: "30px",
                    color: "white",
                    textDecoration: "none",
                    fontSize: "16px",
                }}
            >
                Playlist
            </Link>

            {/* Canciones */}
            <Link
                to="/songs"
                style={{
                    background: "rgba(255,255,255,0.35)",
                    padding: "10px 20px",
                    borderRadius: "30px",
                    color: "white",
                    textDecoration: "none",
                    fontSize: "16px",
                }}
            >
                Canciones
            </Link>

            {/* BOTÓN ROJO DE LOGOUT */}
            <button
                onClick={logout}
                style={{
                    background: "#ff3333",
                    padding: "10px 25px",
                    borderRadius: "30px",
                    color: "white",
                    fontWeight: "600",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "16px",
                }}
            >
                Logout
            </button>
        </div>
    </nav>
)}

            
            <main>
                <Routes>
                    <Route path="/" element={
                        isAuthenticated ? <Navigate to="/songs" replace /> : <Navigate to="/login" replace />
                    } />
                    
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    
                    <Route element={<ProtectedRoute />}>
                        <Route path="/songs" element={<SongsPage />} />
                        <Route path="/profile" element={<h1>Perfil de {user?.NomUs || user?.username || 'Usuario'}</h1>} />
                        <Route path="/playlists" element={<PlaylistsPage />} />
                        <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
                        <Route path="/admin/playlists" element={<AdminPlaylistsPage />} />
                    </Route>
                </Routes>
            </main>
        </>
    );
}

export default App;