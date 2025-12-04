import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPlaylistByIdRequest, getPlaylistSongsRequest, deletePlaylistRequest } from '../api/playlist';
import { useAuth } from '../context/auth.js';
import SongCard from '../components/music/SongCard';
import EditPlaylistModal from '../components/playlist/editPlaylistModal.jsx';
import RemoveFromPlaylistButton from '../components/music/removeFromPlaylistButton.jsx';



const PlaylistDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(null);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    
    const { user } = useAuth();
    
    const userRole = user?.role || user?.Rol;
    const isAdmin = userRole === 'admin';
    const isOwner = playlist && (user?.id === playlist?.IdUs || user?.IdUs === playlist?.IdUs);
    
    const canEdit = isAdmin || isOwner;
    const canDelete = isAdmin || isOwner;
    const canAddSongs = isAdmin || isOwner;
    const canRemoveSongs = isAdmin || isOwner;

    useEffect(() => {
        if (!id || id === 'undefined') {
            navigate('/playlists');
            return;
        }
        
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
                            Creada por {playlist.user?.NomUs || (isOwner ? 'Tú' : `Usuario #${playlist.IdUs}`)}
                            {isAdmin && !isOwner && ' (Vista como admin)'}
                        </p>
                    </div>

                    {canEdit && (
                        <div className="playlist-actions">
                            <button 
                                className="btn-primary"
                                onClick={() => setShowEditModal(true)}
                            >
                                ✏️ {isAdmin ? "Editar (Admin)" : "Editar"}
                            </button>

                            {canAddSongs && (
                                <Link to={`/songs?playlist=${id}`} className="btn-secondary">
                                    ➕ Agregar Canciones
                                </Link>
                            )}

                            <button 
                                className="btn-danger"
                                onClick={handleDeletePlaylist}
                            >
                                🗑️ {isAdmin ? "Eliminar (Admin)" : "Eliminar"}
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
                        {canAddSongs && (
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
                                    <SongCard song={song} />

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

            {showEditModal && (
                <EditPlaylistModal 
                    playlist={playlist}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={handleEditSuccess}
                    isAdminMode={isAdmin && !isOwner}
                />
            )}
        </div>
    );
};

export default PlaylistDetailPage;
