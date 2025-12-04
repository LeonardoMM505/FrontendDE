// components/music/removeFromPlaylistButton.jsx
import React from 'react';
import { removeSongFromPlaylistRequest } from '../../api/playlist';

const RemoveFromPlaylistButton = ({ playlistId, songId, onSuccess, isAdminMode = false }) => {
    const handleRemove = async () => {
        const message = isAdminMode 
            ? '¿Estás seguro de que quieres quitar esta canción? (Eres admin)' 
            : '¿Estás seguro de que quieres quitar esta canción de la playlist?';
        
        if (!window.confirm(message)) {
            return;
        }

        try {
            await removeSongFromPlaylistRequest(playlistId, songId);
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error removing song from playlist:', error);
            alert('Error al quitar la canción de la playlist');
        }
    };

    return (
        <button 
            className="btn-remove-from-playlist"
            onClick={handleRemove}
            title={isAdminMode ? "Quitar canción (Modo Admin)" : "Quitar de la playlist"}
        >
            ❌ {isAdminMode ? "Quitar (Admin)" : "Quitar"}
        </button>
    );
};

export default RemoveFromPlaylistButton;