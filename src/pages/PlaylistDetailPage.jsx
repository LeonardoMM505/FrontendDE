import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaylistByIdRequest, getPlaylistSongsRequest, deletePlaylistRequest } from '../api/playlist';
import { useAuth } from '../context/auth.js';
import SongCard from '../components/music/SongCard';
import { getUsersRequest } from '../api/auth.js';
import EditPlaylistModal from '../components/playlist/editPlaylistModal.jsx';
import RemoveFromPlaylistButton from '../components/music/removeFromPlaylistButton.jsx';
import AddToPlaylistModal from '../components/music/AddToPlaylistModal';

const PlaylistDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddToPlaylistModal, setShowAddToPlaylistModal] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
      const [users, setUsers] = useState({}); // Almacenar usuarios por ID
    
    const { user } = useAuth();
    
    const userRole = user?.role || user?.Rol;
    const isAdmin = userRole === 'admin';
    const isOwner = playlist && (user?.id === playlist?.IdUs || user?.IdUs === playlist?.IdUs);
    
    const canEditPlaylist = isAdmin || isOwner;
    const canDeletePlaylist = isAdmin || isOwner;
    const canAddSongsToPlaylist = isAdmin || isOwner;
    const canRemoveSongs = isAdmin || isOwner;

    useEffect(() => {
        if (!id || id === 'undefined') {
            navigate('/playlists');
            return;
        }
        loadUsers();
        loadPlaylistDetails();
    }, [id, navigate]);

    const loadPlaylistDetails = async () => {
        try {
            setLoading(true);
            setError('');
            
            const playlistResponse = await getPlaylistByIdRequest(id);
            const playlistData = playlistResponse.data;
            
            const normalizedPlaylist = {
                ...playlistData,
                idPlay: playlistData.idPlay || playlistData.IdPlay
            };
            
            setPlaylist(normalizedPlaylist);
            
            // Cargar canciones
            try {
                const songsResponse = await getPlaylistSongsRequest(id);
                setSongs(songsResponse.data || []);
            } catch (songsError) {
                if (songsError.response?.status === 404) {
                    setSongs([]);
                } else {
                    throw songsError;
                }
            }
            
        } catch (error) {
            console.error('Error loading playlist:', error);
            setError('Error al cargar la playlist');
        } finally {
            setLoading(false);
        }
    };

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

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song);
        setShowAddToPlaylistModal(true);
    };

    const handleAddSuccess = () => {
        setShowAddToPlaylistModal(false);
    };

    const handleDeletePlaylist = async () => {
        const ownerName = playlist.user?.NomUs || 'otro usuario';
        const warningMsg = isAdmin 
            ? `¿Estás seguro de que quieres eliminar esta playlist creada por ${ownerName}? (Eres admin)` 
            : '¿Estás seguro de que quieres eliminar esta playlist?';

        if (!window.confirm(warningMsg)) {
            return;
        }

        try {
            await deletePlaylistRequest(id);
            navigate('/playlists');
        } catch (error) {
            console.error('Error deleting playlist:', error);
            setError('Error al eliminar la playlist');
        }
    };

    const handleEditSuccess = () => {
        loadPlaylistDetails();
        setShowEditModal(false);
    };

    if (loading) return <div className="loading">Cargando playlist...</div>;

    if (error && !playlist) {
        return (
            <div className="page-container">
                <div className="error-box">
                    <p>⚠️ {error}</p>
                    <Link to="/playlists" className="back-link">← Volver a Mis Playlists</Link>
                </div>
            </div>
        );
    }

    if (!playlist) return <div className="page-container">Playlist no encontrada</div>;

    return (
        <div className="page-container">

            <div className="section-card">

                <header className="playlist-header">
                    <div className="playlist-info">
                        <h1 className="playlist-title">
                            {playlist.NomPlay}
                            {isAdmin && !isOwner && <span className="admin-badge">👑 Admin</span>}
                        </h1>

                        {playlist.genero && (
                            <p className="playlist-genre">🎵 {playlist.genero}</p>
                        )}

                        <p className="playlist-details">
                            {songs.length} {songs.length === 1 ? 'canción' : 'canciones'} • 
                            Creada por { ' ' }
                            {getUserName(playlist.IdUs)}
                            {isAdmin && !isOwner && ' (Vista como admin)'}
                        </p>
                    </div>

                    {/* BOTONES SOLO PARA EDITAR/ELIMINAR LA PLAYLIST, NO LAS CANCIONES */}
                    {canEditPlaylist && (
                        <div className="playlist-actions">
                            <button 
                                className="btn-primary"
                                onClick={() => setShowEditModal(true)}
                            >
                                ✏️ {isAdmin ? "Editar Playlist (Admin)" : "Editar Playlist"}
                            </button>

                            {canAddSongsToPlaylist && (
                                <Link to={`/songs?playlist=${id}`} className="btn-secondary">
                                    ➕ Agregar Canciones
                                </Link>
                            )}

                            <button 
                                className="btn-danger"
                                onClick={handleDeletePlaylist}
                            >
                                🗑️ {isAdmin ? "Eliminar Playlist (Admin)" : "Eliminar Playlist"}
                            </button>
                        </div>
                    )}
                </header>

                {isAdmin ? (
                    <Link to="/admin/playlists" className="back-link">
                        ← Volver a Administración de Playlists
                    </Link>
                ) : (
                    <Link to="/playlists" className="back-link">
                        ← Volver a Mis Playlists
                    </Link>
                )}

            </div>

            {/* CANCIONES */}
            <div className="section-card">
                {songs.length === 0 ? (
                    <div className="empty-state">
                        <p>🎵 Esta playlist está vacía</p>
                        {canAddSongsToPlaylist && (
                            <Link to={`/songs?playlist=${id}`} className="btn-primary">
                                ➕ Agregar Canciones desde el Catálogo
                            </Link>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="section-header">
                            <h2>Canciones</h2>
                            <span className="count">{songs.length}</span>
                        </div>

                        <div className="songs-grid">
                            {songs.map(song => (
                                <div key={song.IdMus} className="song-wrapper">
                                    {/* IMPORTANTE: isAdmin = false para que no muestre botones de admin */}
                                    <SongCard 
                                        song={song} 
                                        onAddToPlaylist={handleAddToPlaylist}
                                        onEdit={() => {}} // No se usará aquí
                                        onDelete={() => {}} // No se usará aquí
                                        isAdmin={false} // ← ESTA ES LA CLAVE: false para NO mostrar botones de admin
                                    />

                                    {/* Solo botón para remover de playlist si tiene permiso */}
                                    {canRemoveSongs && (
                                        <RemoveFromPlaylistButton 
                                            playlistId={id}
                                            songId={song.IdMus}
                                            onSuccess={loadPlaylistDetails}
                                            isAdminMode={isAdmin && !isOwner}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* MODALES */}
            {showEditModal && (
                <EditPlaylistModal 
                    playlist={playlist}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                    isAdminMode={isAdmin && !isOwner}
                />
            )}

            {showAddToPlaylistModal && selectedSong && (
                <AddToPlaylistModal
                    song={selectedSong}
                    onClose={() => {
                        setShowAddToPlaylistModal(false);
                        setSelectedSong(null);
                    }}
                    onSuccess={handleAddSuccess}
                />
            )}
        </div>
    );
};

export default PlaylistDetailPage;