import React, { useState, useEffect } from 'react';
import { 
    getSongsRequest, 
    searchSongsRequest, 
    deleteSongRequest 
} from '../api/song.js';

import SongCard from '../components/music/SongCard';
import SearchSongs from '../components/music/SearchSongs';
import CreateSongModal from '../components/music/createSongModal';
import EditSongModal from '../components/music/editSongModal.jsx';
import AddToPlaylist from '../components/music/AddToPlaylistModal.jsx';

import { useAuth } from '../context/auth';
import '../pages/music.css'

const SongsPage = () => {

    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedSong, setSelectedSong] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [error, setError] = useState('');
    const [searchPerformed, setSearchPerformed] = useState(false);

    const { user } = useAuth();
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        loadSongs();
    }, []);

    const loadSongs = async () => {
        try {
            setLoading(true);
            setError('');
            setSearchPerformed(false);

            const response = await getSongsRequest();
            setSongs(response.data);

        } catch (error) {
            console.error("Error cargando canciones:", error);
            setError("Error al cargar las canciones");

        } finally {
            setLoading(false);
        }
    };

    const handleDeleteSong = async (songId) => {

        if (!window.confirm("¿Eliminar esta canción?")) return;

        try {
            await deleteSongRequest(songId);
            loadSongs();

        } catch (error) {
            console.error("Error eliminando:", error);
            setError("Error al eliminar la canción");
        }
    };

    const handleEditSong = (song) => {
        setSelectedSong(song);
        setShowEditModal(true);
    };

    const handleSongCreated = () => {
        setShowCreateModal(false);
        loadSongs();
    };

    const handleSongUpdated = () => {
        setShowEditModal(false);
        setSelectedSong(null);
        loadSongs();
    };

    const handleSearch = async (filters) => {
        try {
            setLoading(true);
            setError('');
            setSearchPerformed(true);

            const response = await searchSongsRequest(filters);
            setSongs(response.data);

        } catch (error) {

            if (error.response?.status === 404) {
                setError("No se encontraron coincidencias");
                setSongs([]);
            } else if (error.response?.status === 400) {
                setError(error.response.data?.message || "Parámetro inválido");
            } else {
                setError("Error al buscar canciones");
            }

        } finally {
            setLoading(false);
        }
    };

    const handleClearSearch = () => {
        setError('');
        setSearchPerformed(false);
        loadSongs();
    };

    const handleAddToPlaylist = (song) => {
        setSelectedSong(song);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setSelectedSong(null);
        setShowAddModal(false);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                Cargando canciones...
            </div>
        );
    }

    return (
        <div className="songs-page">

            {/* Encabezado */}
            <header className="songs-header">
                <h1>Catálogo de Música</h1>
                <p>Explora todas las canciones disponibles</p>

                {isAdmin && (
                    <button 
                        className="btn-create-song"
                        onClick={() => setShowCreateModal(true)}
                    >
                        🎵 Agregar canción
                    </button>
                )}
            </header>

            {/* Buscador */}
            <SearchSongs onSearch={handleSearch} onClear={handleClearSearch} />

            {/* Errores */}
            {error && <div className="songs-error">{error}</div>}

            {/* Mensaje si no hay canciones */}
            {songs.length === 0 && !loading && (
                <div className="songs-empty">
                    {searchPerformed 
                        ? "No se encontraron canciones con esos filtros."
                        : "No hay canciones disponibles."
                    }
                </div>
            )}

            {/* GRID */}
            {songs.length > 0 && (
                <div className="songs-grid">
                    {songs.map(song => (
                        <SongCard 
                            key={song.IdMus}
                            song={song}
                            onAddToPlaylist={handleAddToPlaylist}
                            onEdit={isAdmin ? handleEditSong : null}
                            onDelete={isAdmin ? handleDeleteSong : null}
                            isAdmin={isAdmin}
                        />
                    ))}
                </div>
            )}

            {/* Modales */}
            {showCreateModal && (
                <CreateSongModal 
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleSongCreated}
                />
            )}

            {showEditModal && selectedSong && (
                <EditSongModal 
                    song={selectedSong}
                    onClose={() => {
                        setShowEditModal(false);
                        setSelectedSong(null);
                    }}
                    onSuccess={handleSongUpdated}
                />
            )}

            {showAddModal && selectedSong && (
                <AddToPlaylist 
                    song={selectedSong}
                    onClose={handleCloseModal}
                    onSuccess={() => {
                        handleCloseModal();
                        alert("Canción agregada a playlist");
                    }}
                />
            )}

        </div>
    );
};

export default SongsPage;
