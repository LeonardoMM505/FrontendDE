import React, { useState, useEffect } from 'react';
import { getUserPlaylistsRequest, addSongToPlaylistRequest, createPlaylistRequest } from '../../api/playlist.js'; // ← Agregar createPlaylistRequest
import { useAuth } from '../../context/auth.js';

const AddToPlaylistModal = ({ song, onClose, onSuccess }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlaylist, setSelectedPlaylist] = useState('');
    const [creatingNew, setCreatingNew] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [newPlaylistGenre, setNewPlaylistGenre] = useState(''); // ← Agregar género
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    
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
            const response = await getUserPlaylistsRequest(userId);
            
            // Normalizar las playlists (idPlay vs IdPlay)
            const normalizedPlaylists = response.data.map(playlist => ({
                ...playlist,
                idPlay: playlist.idPlay || playlist.IdPlay // Asegurar idPlay
            }));
            
            setPlaylists(normalizedPlaylists);
        } catch (error) {
            console.error('Error loading playlists:', error);
            setError('Error al cargar tus playlists');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            let playlistId = selectedPlaylist;

            // Si está creando nueva playlist
            if (creatingNew) {
                if (!newPlaylistName.trim()) {
                    setError('Ingresa un nombre para la nueva playlist');
                    setSubmitting(false);
                    return;
                }
                
                // Crear nueva playlist
                const newPlaylistData = {
                    NomPlay: newPlaylistName,
                    genero: newPlaylistGenre || undefined
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
                setSubmitting(false);
                return;
            }

            // Agregar canción a playlist
            await addSongToPlaylistRequest({
                playlistId: parseInt(playlistId),
                songId: song.IdMus
            });

            onSuccess();
            onClose(); // Cerrar modal después de éxito
            
        } catch (error) {
            console.error('Error adding to playlist:', error);
            
            // Manejar errores específicos
            if (error.response?.data?.message) {
                const errorMsg = error.response.data.message;
                if (Array.isArray(errorMsg)) {
                    setError(errorMsg[0] || 'Error al agregar a la playlist');
                } else {
                    setError(errorMsg);
                }
            } else if (error.message === "La canción ya está dentro de la playlist") {
                setError('Esta canción ya está en la playlist seleccionada');
            } else {
                setError('Error al agregar a la playlist');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Función para obtener el conteo de canciones (podrías obtenerlo del backend)
    const getSongCount = (playlist) => {
        // Esto es temporal - idealmente el backend debería devolver el conteo
        return playlist.songCount || playlist.totalCanciones || 0;
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>🎵 Agregar a Playlist</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <div className="song-info">
                    <h3>{song.NomMus}</h3>
                    <p>{song.Art} • {song.Album} {song.AnPu && `(${song.AnPu})`}</p>
                </div>

                <form onSubmit={handleSubmit} className="add-to-playlist-form">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="loading">Cargando tus playlists...</div>
                    ) : (
                        <>
                            <div className="form-section">
                                <label className="section-label">Seleccionar playlist existente:</label>
                                
                                {playlists.length === 0 ? (
                                    <p className="no-playlists-message">
                                        No tienes playlists. Crea una nueva.
                                    </p>
                                ) : (
                                    <div className="playlists-list">
                                        {playlists.map(playlist => {
                                            // Usar idPlay normalizado
                                            const playlistId = playlist.idPlay;
                                            
                                            return (
                                                <label key={playlistId} className="playlist-option">
                                                    <input
                                                        type="radio"
                                                        name="playlist"
                                                        value={playlistId}
                                                        checked={selectedPlaylist === playlistId.toString()}
                                                        onChange={(e) => {
                                                            setSelectedPlaylist(e.target.value);
                                                            setCreatingNew(false);
                                                        }}
                                                    />
                                                    <span className="playlist-info">
                                                        <strong>{playlist.NomPlay}</strong>
                                                        {playlist.genero && (
                                                            <span className="playlist-genre"> • {playlist.genero}</span>
                                                        )}
                                                        <span className="playlist-count">
                                                            ({getSongCount(playlist)} canciones)
                                                        </span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="divider">
                                <span></span>
                            </div>

                            <div className="form-section">
                                <label className="create-new-label">
                                    <input
                                        type="radio"
                                        name="playlistOption"
                                        checked={creatingNew}
                                        onChange={() => {
                                            setCreatingNew(true);
                                            setSelectedPlaylist('');
                                        }}
                                    />
                                    <strong> Crear nueva playlist</strong>
                                </label>
                                
                                {creatingNew && (
                                    <div className="new-playlist-form">
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                value={newPlaylistName}
                                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                                placeholder="Nombre de la nueva playlist *"
                                                className="new-playlist-input"
                                                autoFocus
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                value={newPlaylistGenre}
                                                onChange={(e) => setNewPlaylistGenre(e.target.value)}
                                                placeholder="Género (opcional)"
                                                className="new-playlist-input"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={submitting || loading}
                        >
                            {submitting ? '🔄 Agregando...' : '✅ Agregar a Playlist'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={submitting}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;