import React, { useState } from 'react';
import { createSongRequest } from '../../api/song'; // ← Cambié a "songs"

const CreateSongModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        NomMus: '',
        Album: '',
        AnPu: '',
        Art: '',
        genero: ''
    });
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const formDataToSend = new FormData();
            
            // Agregar campos de texto
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // Agregar imagen si se seleccionó
            if (image) {
                formDataToSend.append('UrlPort', image);
            } else {
                setError('La imagen de portada es requerida');
                setLoading(false);
                return;
            }

            await createSongRequest(formDataToSend);
            onSuccess();
            
        } catch (error) {
            console.error('Error creating song:', error);
            setError(error.response?.data?.message || 'Error al crear la canción');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Subir Nueva Canción</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="song-form">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Campo de imagen */}
                    <div className="form-group">
                        <label htmlFor="image">Imagen de portada *</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/jpeg, image/png, image/jpg"
                            onChange={handleImageChange}
                            required
                        />
                    </div>

                    {/* Campos del formulario */}
                    <div className="form-group">
                        <label htmlFor="NomMus">Nombre de la canción *</label>
                        <input
                            type="text"
                            id="NomMus"
                            name="NomMus"
                            value={formData.NomMus}
                            onChange={handleInputChange}
                            required
                            placeholder="Ej: Bohemian Rhapsody"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="Art">Artista *</label>
                        <input
                            type="text"
                            id="Art"
                            name="Art"
                            value={formData.Art}
                            onChange={handleInputChange}
                            required
                            placeholder="Ej: Queen"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="Album">Álbum</label>
                        <input
                            type="text"
                            id="Album"
                            name="Album"
                            value={formData.Album}
                            onChange={handleInputChange}
                            placeholder="Ej: A Night at the Opera"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="AnPu">Año de publicación *</label>
                            <input
                                type="number"
                                id="AnPu"
                                name="AnPu"
                                value={formData.AnPu}
                                onChange={handleInputChange}
                                required
                                min="1900"
                                max="2030"
                                placeholder="Ej: 1975"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="genero">Género</label>
                            <input
                                type="text"
                                id="genero"
                                name="genero"
                                value={formData.genero}
                                onChange={handleInputChange}
                                placeholder="Ej: Rock, Pop"
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? '🔄 Subiendo...' : '🎵 Subir Canción'}
                        </button>
                        <button 
                            type="button" 
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateSongModal;