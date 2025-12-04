import React, { useState, useEffect } from 'react';
import { updatePlaylistRequest } from '../../api/playlist';

const EditPlaylistModal = ({ playlist, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        NomPlay: '',
        Descripcion: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (playlist) {
            setFormData({
                NomPlay: playlist.NomPlay,
                Descripcion: playlist.Descripcion
            });
        }
    }, [playlist]);

    const handleChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await updatePlaylistRequest(playlist.IdPlay, formData);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || "Error al actualizar playlist");
        } finally {
            setLoading(false);
        }
    };

    if (!playlist) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h2>Editar Playlist</h2>

                {error && <p className="error-message">⚠️ {error}</p>}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Nombre *</label>
                        <input
                            type="text"
                            name="NomPlay"
                            value={formData.NomPlay}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Descripción</label>
                        <input
                            name="Descripcion"
                            value={formData.Descripcion}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-actions">
                        <button className="btn-submit" type="submit" disabled={loading}>
                            {loading ? "Guardando..." : "Guardar Cambios"}
                        </button>

                        <button className="btn-cancel" type="button" onClick={onClose}>
                            Cancelar
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditPlaylistModal;
