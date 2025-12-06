import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    getUserPlaylistsRequest, 
    deletePlaylistRequest, 
    getPlaylistSongsRequest 
} from '../api/playlist';

import { useAuth } from '../context/auth.js';
import CreatePlaylistModal from '../components/playlist/createPlaylistModal';
import '../pages/music.css'

const PlaylistsPage = () => {

    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const { user } = useAuth();
    const userId = user?.id || user?.IdUs;

    useEffect(() => {
        if (userId) loadPlaylists();
    }, [userId]);

    const loadPlaylists = async () => {
        try {
            const response = await getUserPlaylistsRequest(userId);
            const playlistsData = response.data;

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
            console.error("Error cargando playlists:", error);
            setError("Error al cargar tus playlists");
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePlaylist = async (playlistId) => {
        if (!window.confirm("¿Eliminar esta playlist?")) return;

        try {
            await deletePlaylistRequest(playlistId);
            loadPlaylists();
        } catch (error) {
            console.error("Error eliminando playlist:", error);
            setError("Error al eliminar la playlist");
        }
    };

    const handlePlaylistCreated = () => {
        setShowCreateModal(false);
        loadPlaylists();
    };

    if (loading) {
        return (
            <div className="loading-screen">
                Cargando playlists...
            </div>
        );
    }

    return (
        <div className="playlists-page">

            {/* ENCABEZADO */}
            <header className="songs-header">
                <h1>Mis Playlists</h1>
                <p>Organiza y administra tus listas personalizadas</p>

                <button 
                    className="btn-create-song"
                    onClick={() => setShowCreateModal(true)}
                >
                    🎵 Crear Nueva Playlist
                </button>
            </header>

            {/* ERRORES */}
            {error && <div className="songs-error">{error}</div>}

            {/* SIN PLAYLISTS */}
            {playlists.length === 0 ? (
                <div className="songs-empty">
                    <p>No tienes playlists creadas.</p>
                    <button 
                        className="btn-create-song"
                        onClick={() => setShowCreateModal(true)}
                    >
                        ➕ Crear mi primera playlist
                    </button>
                </div>
            ) : (
                <div className="playlists-grid">

                    {playlists.map(playlist => (
                        <div key={playlist.idPlay} className="playlist-card">

                            <Link 
                                to={`/playlists/${playlist.idPlay}`} 
                                className="playlist-content"
                            >
                                <div className="playlist-icon-circle">
                                    🎧
                                </div>

                                <h3 className="playlist-title">{playlist.NomPlay}</h3>

                                <p className="playlist-count">
                                    {playlist.totalCanciones} {playlist.totalCanciones === 1 ? "canción" : "canciones"}
                                </p>
                            </Link>

                            <div className="playlist-actions">
                                <Link 
                                    to={`/playlists/${playlist.idPlay}`}
                                    className="btn-edit"
                                >
                                    👁️ Ver
                                </Link>

                                <button 
                                    className="btn-delete"
                                    onClick={() => handleDeletePlaylist(playlist.idPlay)}
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}

                </div>
            )}

          
            {showCreateModal && (
    <CreatePlaylistModal 
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
            loadPlaylists(); // Recargar playlists
            setShowCreateModal(false);
        }}
    />
)}

        </div>
    );
};

export default PlaylistsPage;
