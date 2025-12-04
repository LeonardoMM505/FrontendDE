import React from 'react';
import '../../pages/music.css'
const SongCard = ({ song, onAddToPlaylist, onEdit, onDelete, isAdmin }) => {
    return (
        <div className="song-card">
            <div className="song-image">
                <img 
                    src={song.UrlPort || 'https://via.placeholder.com/300x300/2c3e50/ffffff?text=No+Image'} 
                    alt={song.NomMus}
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/2c3e50/ffffff?text=No+Image';
                    }}
                />
            </div>
            <div className="song-info">
                <h3 className="song-title">{song.NomMus}</h3>
                <p className="song-artist">{song.Art}</p>
                <p className="song-album">{song.Album} ({song.AnPu})</p>
                <p className="song-genre">{song.genero}</p>
            </div>
            <div className="song-actions">
                {/* Botón para usuarios normales */}
                <button 
                    className="btn-add"
                    onClick={() => onAddToPlaylist(song)}
                >
                    ➕ Agregar a Playlist
                </button>
                
                {/* Botones para admin */}
                {isAdmin && (
                    <div className="admin-actions">
                        <button 
                            className="btn-edit"
                            onClick={() => onEdit(song)}
                        >
                            ✏️ Editar
                        </button>
                        <button 
                            className="btn-delete"
                            onClick={() => onDelete(song.IdMus)}
                        >
                            🗑️ Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SongCard;