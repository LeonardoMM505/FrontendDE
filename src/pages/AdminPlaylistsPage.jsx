import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    getAllPlaylistsRequest,
    deletePlaylistRequest,
    searchAllPlaylistsRequest,
    getPlaylistSongsRequest 
} from '../api/playlist';
import { getUsersRequest} from '../api/auth.js'; // Importar API de usuarios
import { useAuth } from '../context/auth.js';
import SearchPlaylists from '../components/playlist/searchPlaylist.jsx';

const AdminPlaylistsPage = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchPerformed, setSearchPerformed] = useState(false);
    const [users, setUsers] = useState({}); // Almacenar usuarios por ID

    const { user, authLoading } = useAuth();

    useEffect(() => {
        if (authLoading) return;

        const userRole = user?.role || user?.Rol;
        const isAdmin = userRole === 'admin';

        if (!isAdmin) {
            window.location.href = '/playlists';
            return;
        }

        loadAllPlaylists();
        loadUsers(); // Cargar usuarios
    }, [authLoading, user]);

    // Cargar todos los usuarios
    const loadUsers = async () => {
        try {
            const response = await getUsersRequest();
            const usersData = response.data;
            
            // Crear un objeto para acceder rápido por ID
            const usersMap = {};
            usersData.forEach(user => {
                const userId = user.idUs || user.IdUs;
                usersMap[userId] = {
                    id: userId,
                    name: user.NomUs || user.nombre || `Usuario ${userId}`
                };
            });
            
            setUsers(usersMap);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
        }
    };

    // Función para obtener nombre de usuario
    const getUserName = (userId) => {
        const user = users[userId];
        if (user) {
            return user.name;
        }
        return `Usuario #${userId}`; // Fallback si no se encuentra
    };

    const loadAllPlaylists = async () => {
        try {
            setLoading(true);
            setError('');
            setSearchPerformed(false);

            const response = await getAllPlaylistsRequest();
            const playlistsData = response.data;

            // Obtener el conteo de canciones para cada playlist
            const playlistsWithCounts = await Promise.all(
                playlistsData.map(async playlist => {
                    const playlistId = playlist.idPlay || playlist.IdPlay;

                    try {
                        const songsResponse = await getPlaylistSongsRequest(playlistId);
                        return {
                            ...playlist,
                            idPlay: playlistId,
                            totalCanciones: songsResponse.data?.length || 0
                        };
                    } catch (error) {
                        console.error(`Error cargando canciones para la playlist ${playlistId}:`, error);
                        return {
                            ...playlist,
                            idPlay: playlistId,
                            totalCanciones: 0
                        };
                    }
                })
            );

            setPlaylists(playlistsWithCounts);
        } catch (error) {
            console.error('Error loading all playlists:', error);
            setError('Error al cargar todas las playlists');
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlaylist = async (playlistId, playlistName) => {
        if (!window.confirm(`¿Eliminar "${playlistName}"?\nEsto eliminará todas sus canciones.`)) return;

        try {
            await deletePlaylistRequest(playlistId);
            loadAllPlaylists();
        } catch (error) {
            console.error('Error deleting playlist:', error);
            setError('Error al eliminar la playlist');
        }
    };

    const handleSearch = async (query) => {
        try {
            setLoading(true);
            setError('');
            setSearchPerformed(true);

            if (!query.trim()) {
                loadAllPlaylists();
                return;
            }

            const response = await searchAllPlaylistsRequest(query);
            setPlaylists(response.data);

        } catch (error) {
            console.error('Error searching playlists:', error);

            if (error.response?.status === 404) {
                setError('No se encontraron playlists con ese criterio');
                setPlaylists([]);
            } else {
                setError('Error al realizar la búsqueda');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setError('');
        setSearchPerformed(false);
        loadAllPlaylists();
    };

    if (authLoading || loading) {
        return <div className="loading">Cargando...</div>;
    }

    return (
        <div className="admin-playlists-page">
            {/*************** HEADER ***************/}
            <header className="page-header admin-header">
                <h1>Administración de Playlists</h1>
                <p>Gestiona todas las playlists del sistema</p>
            </header>

            {/*************** SEARCH ***************/}
            <SearchPlaylists onSearch={handleSearch} onClear={handleClearSearch} />

            {error && <div className="error-message">⚠️ {error}</div>}

            {/*************** NO RESULTS ***************/}
            {playlists.length === 0 && searchPerformed && !loading && !error && (
                <div className="no-results">No se encontraron playlists.</div>
            )}

            {/*************** EMPTY ***************/}
            {playlists.length === 0 && !searchPerformed && !loading && !error && (
                <div className="no-playlists">No hay playlists en el sistema.</div>
            )}

            {/*************** TABLE ***************/}
            {playlists.length > 0 && (
                <>
                    {searchPerformed && (
                        <div className="search-info">
                            {playlists.length} resultado(s) encontrados
                        </div>
                    )}

                    <div className="playlists-table-container">
                        <table className="admin-playlists-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Género</th>
                                    <th>Propietario</th>
                                    <th>Canciones</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {playlists.map((playlist) => {
                                    const playlistId = playlist.idPlay || playlist.IdPlay;
                                    const userId = playlist.IdUs;
                                    const userName = getUserName(userId);

                                    return (
                                        <tr key={playlistId}>
                                            <td className="playlist-id">#{playlistId}</td>

                                            <td className="playlist-name">
                                                <Link to={`/playlists/${playlistId}`} className="playlist-link-admin">
                                                    {playlist.NomPlay}
                                                </Link>
                                            </td>

                                            <td className="playlist-genre-admin">
                                                {playlist.genero || '—'}
                                            </td>

                                            <td className="playlist-owner-admin">
                                                <div className="user-info">
                                                    <span className="user-name">{userName}</span>
                                                    <span className="user-id">(ID: {userId})</span>
                                                </div>
                                            </td>

                                            <td className="playlist-songs-admin">
                                                {playlist.totalCanciones || 0} canción(es)
                                            </td>

                                            <td className="playlist-actions-admin">
                                                <Link
                                                    to={`/playlists/${playlistId}`}
                                                    className="btn-view-admin"
                                                >
                                                    👁️ Ver
                                                </Link>

                                                <Link
                                                    to={`/playlists/${playlistId}`}
                                                    className="btn-edit-admin"
                                                >
                                                    ✏️ Editar
                                                </Link>

                                                <button
                                                    onClick={() =>
                                                        handleDeletePlaylist(playlistId, playlist.NomPlay)
                                                    }
                                                    className="btn-delete-admin"
                                                >
                                                    🗑️ Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminPlaylistsPage;


/*************** ESTILOS ACTUALIZADOS ***************/
const styles = `
.admin-playlists-page {
    padding: 20px;
    color: white;
    min-height: 100vh;
    background: linear-gradient(135deg, #0d0d0f, #1a1a1d);
}

/**************** HEADER ****************/
.admin-header {
    background: #1a1a1d;
    border-radius: 20px;
    padding: 30px;
    margin-bottom: 25px;
    text-align: center;
    border: 1px solid #2a2a2d;
}

.admin-header h1 {
    font-size: 2.2rem;
    color: #c084fc;
}

.btn-back-admin {
    display: inline-block;
    margin-top: 15px;
    background: #7e22ce;
    padding: 10px 18px;
    border-radius: 12px;
    text-decoration: none;
    color: white;
    transition: 0.2s;
    font-weight: bold;
}

.btn-back-admin:hover {
    background: #a855f7;
}

/**************** TABLE ****************/
.playlists-table-container {
    overflow-x: auto;
}

.admin-playlists-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
    background: rgba(20, 20, 25, 0.7);
    backdrop-filter: blur(6px);
    border-radius: 14px;
    overflow: hidden;
}

.admin-playlists-table th {
    background: #2b2b33;
    padding: 12px;
    color: #c084fc;
    text-align: left;
    font-size: 1rem;
}

.admin-playlists-table td {
    padding: 14px 10px;
    border-bottom: 1px solid #2d2d33;
}

/**************** USER INFO ****************/
.user-info {
    display: flex;
    flex-direction: column;
    gap: 3px;
}

.user-name {
    font-weight: bold;
    color: #60a5fa;
}

.user-id {
    font-size: 0.8rem;
    color: #9ca3af;
}

/**************** LINKS & TAGS ****************/
.playlist-link-admin {
    color: #a855f7;
    font-weight: bold;
}

.playlist-link-admin:hover {
    color: #c084fc;
}

/**************** ACTION BUTTONS ****************/
.btn-view-admin,
.btn-edit-admin,
.btn-delete-admin {
    padding: 7px 12px;
    margin-right: 5px;
    border-radius: 8px;
    font-weight: bold;
    border: none;
    cursor: pointer;
}

.btn-view-admin {
    background: #4c1d95;
    color: white;
}

.btn-edit-admin {
    background: #6d28d9;
    color: white;
}

.btn-delete-admin {
    background: #991b1b;
    color: white;
}

.btn-delete-admin:hover {
    background: #b91c1c;
}

/**************** UTILITY CLASSES ****************/
.loading {
    text-align: center;
    padding: 50px;
    color: #aaa;
}

.error-message {
    background: rgba(220, 38, 38, 0.1);
    border: 1px solid #dc2626;
    color: #f87171;
    padding: 15px;
    border-radius: 10px;
    margin: 20px 0;
    text-align: center;
}

.no-results,
.no-playlists {
    text-align: center;
    padding: 50px;
    color: #888;
    font-size: 1.1rem;
}

.search-info {
    margin: 15px 0;
    color: #a855f7;
    font-weight: bold;
    text-align: center;
}
`;

if (typeof document !== "undefined") {
    const styleTag = document.createElement("style");
    styleTag.innerHTML = styles;
    document.head.appendChild(styleTag);
}