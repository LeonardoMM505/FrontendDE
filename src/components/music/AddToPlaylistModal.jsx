import React, { useState, useEffect } from 'react';
import { getUserPlaylistsRequest, addSongToPlaylistRequest, createPlaylistRequest } from '../../api/playlist.js';
import { useAuth } from '../../context/auth.js';
import './AddToPlaylistModal.css'; // Crearemos este archivo CSS

const AddToPlaylistModal = ({ song, onClose, onSuccess }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [creatingNew, setCreatingNew] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistGenre, setNewPlaylistGenre] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    
    const { user } = useAuth();
    const userId = user?.id || user?.IdUs;

    useEffect(() => {
        if (userId) {
            loadUserPlaylists();
        }
    }, [userId]);

    const loadUserPlaylists = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getUserPlaylistsRequest(userId);
            
            const normalizedPlaylists = response.data.map(playlist => ({
                ...playlist,
                idPlay: playlist.idPlay || playlist.IdPlay
            }));
            
            setPlaylists(normalizedPlaylists);
        } catch (error) {
            console.error('Error loading playlists:', error);
            setError('Error al cargar tus playlists');
        } finally {
            setLoading(false);
        }
    };

    const validateNewPlaylist = () => {
        const newErrors = {};
        
        if (!newPlaylistName.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (newPlaylistName.trim().length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 caracteres';
        }
        
        if (!newPlaylistGenre.trim()) {
            newErrors.genre = 'El género es requerido';
        } else {
            const genres = newPlaylistGenre.split(',').map(g => g.trim()).filter(g => g);
            if (genres.length === 0) {
                newErrors.genre = 'Ingresa al menos un género válido';
            }
        }
        
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});

        try {
            let playlistId = selectedPlaylist;

            // Si está creando nueva playlist
            if (creatingNew) {
                const validationErrors = validateNewPlaylist();
                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                    return;
                }
                
                // Crear nueva playlist
                const newPlaylistData = {
                    NomPlay: newPlaylistName.trim(),
                    genero: newPlaylistGenre.split(',').map(g => g.trim()).filter(g => g).join(', ')
                };
                
                const createResponse = await createPlaylistRequest(newPlaylistData);
                
                // Obtener el ID de la playlist creada
                playlistId = createResponse.data.playlist?.idPlay || 
                            createResponse.data.playlist?.IdPlay ||
                            createResponse.data.idPlay;
                
                // Recargar la lista de playlists
                await loadUserPlaylists();
            }

            if (!playlistId) {
                setError('Selecciona una playlist');
                return;
            }

            // Agregar canción a playlist
            setSubmitting(true);
            await addSongToPlaylistRequest({
                playlistId: parseInt(playlistId),
                songId: song.IdMus
            });

            onSuccess();
            onClose();
            
        } catch (error) {
            console.error('Error adding to playlist:', error);
            
            if (error.response?.data?.message) {
                const errorMsg = error.response.data.message;
                if (errorMsg.includes('ya está')) {
                    setError('Esta canción ya está en la playlist seleccionada');
                } else {
                    setError(errorMsg);
                }
            } else {
                setError('Error al agregar a la playlist');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const getSongCount = (playlist) => {
        return playlist.songCount || playlist.totalCanciones || 0;
    };

    // En tu AddToPlaylistModal.js, reemplaza las clases en el JSX:

return (
    <div className="atpl-modal-overlay" onClick={onClose}>
        <div className="atpl-modal" onClick={(e) => e.stopPropagation()}>
            <div className="atpl-modal-header">
                <h2>
                    <span className="atpl-modal-icon">🎵</span>
                    Agregar a Playlist
                </h2>
                <button className="atpl-modal-close-btn" onClick={onClose}>
                    ✕
                </button>
            </div>

            <div className="atpl-song-card-preview">
                <div className="atpl-song-thumbnail">
                    <img 
                        src={song.UrlPort || 'https://via.placeholder.com/60x60/2c3e50/ffffff?text=M'} 
                        alt={song.NomMus}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/60x60/2c3e50/ffffff?text=M'}
                    />
                </div>
                <div className="atpl-song-details">
                    <h3 className="atpl-song-title">{song.NomMus}</h3>
                    <p className="atpl-song-info">{song.Art} • {song.Album}</p>
                    {song.AnPu && <span className="atpl-song-year">{song.AnPu}</span>}
                </div>
            </div>

            {error && (
                <div className="atpl-alert atpl-alert-error">
                    <span className="atpl-alert-icon">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="atpl-modal-form">
                <div className="atpl-form-section">
                    <h3 className="atpl-section-title">
                        <span className="atpl-section-icon">📋</span>
                        Tus Playlists
                    </h3>
                    
                    {loading ? (
                        <div className="atpl-loading-state">
                            <div className="atpl-spinner"></div>
                            <p>Cargando tus playlists...</p>
                        </div>
                    ) : playlists.length === 0 ? (
                        <div className="atpl-empty-state">
                            <p className="atpl-empty-text">📭 No tienes playlists</p>
                            <p className="atpl-empty-hint">Crea tu primera playlist</p>
                        </div>
                    ) : (
                        <div className="atpl-playlists-grid">
                            {playlists.map(playlist => {
                                const playlistId = playlist.idPlay;
                                const isSelected = selectedPlaylist === playlistId.toString();
                                
                                return (
                                    <div 
                                        key={playlistId}
                                        className={`atpl-playlist-card-select ${isSelected ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedPlaylist(playlistId.toString());
                                            setCreatingNew(false);
                                        }}
                                    >
                                        <div className="atpl-playlist-card-header">
                                            <input
                                                type="radio"
                                                name="playlist"
                                                value={playlistId}
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className="atpl-playlist-radio"
                                            />
                                            <div className="atpl-playlist-emoji">🎧</div>
                                            <h4 className="atpl-playlist-name">{playlist.NomPlay}</h4>
                                        </div>
                                        
                                        <div className="atpl-playlist-card-body">
                                            {playlist.genero && (
                                                <div className="atpl-playlist-tags">
                                                    {playlist.genero.split(',').map((genre, idx) => (
                                                        <span key={idx} className="atpl-tag">{genre.trim()}</span>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <div className="atpl-playlist-stats">
                                                <span className="atpl-stat">
                                                    <span className="atpl-stat-icon">🎵</span>
                                                    {getSongCount(playlist)} canciones
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="atpl-divider">
                    <span className="atpl-divider-text">O</span>
                </div>

                <div className="atpl-form-section">
                    <div 
                        className={`atpl-create-playlist-toggle ${creatingNew ? 'active' : ''}`}
                        onClick={() => setCreatingNew(!creatingNew)}
                    >
                        <div className="atpl-toggle-header">
                            <div className="atpl-toggle-icon">✨</div>
                            <h3 className="atpl-toggle-title">Crear nueva playlist</h3>
                            <div className="atpl-toggle-arrow">{creatingNew ? '▼' : '▶'}</div>
                        </div>
                    </div>
                    
                    {creatingNew && (
                        <div className="atpl-create-playlist-form">
                            <div className="atpl-form-group">
                                <label className="atpl-form-label">
                                    Nombre de la playlist *
                                </label>
                                <input
                                    type="text"
                                    value={newPlaylistName}
                                    onChange={(e) => setNewPlaylistName(e.target.value)}
                                    placeholder="Ej: Mis Favoritas 2024"
                                    className={`atpl-form-input ${errors.name ? 'error' : ''}`}
                                    autoFocus
                                />
                                {errors.name && <span className="atpl-form-error">{errors.name}</span>}
                            </div>
                            
                            <div className="atpl-form-group">
                                <label className="atpl-form-label">
                                    Género(s) *
                                </label>
                                <input
                                    type="text"
                                    value={newPlaylistGenre}
                                    onChange={(e) => setNewPlaylistGenre(e.target.value)}
                                    placeholder="Ej: Rock, Pop, Electrónica"
                                    className={`atpl-form-input ${errors.genre ? 'error' : ''}`}
                                />
                                {errors.genre && <span className="atpl-form-error">{errors.genre}</span>}
                                <small className="atpl-form-hint">Separa múltiples géneros con comas</small>
                            </div>
                        </div>
                    )}
                </div>

                <div className="atpl-modal-actions">
                    <button 
                        type="button" 
                        className="atpl-btn-secondary"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="atpl-btn-primary"
                        disabled={submitting || (creatingNew && (!newPlaylistName || !newPlaylistGenre))}
                    >
                        {submitting ? (
                            <>
                                <span className="atpl-spinner-small"></span>
                                Agregando...
                            </>
                        ) : (
                            'Agregar a Playlist'
                        )}
                    </button>
                </div>
            </form>
        </div>
    </div>
);
};

export default AddToPlaylistModal;