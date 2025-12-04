import React, { useState, useEffect } from 'react';
import { updateSongRequest } from '../../api/song';

const EditSongModal = ({ song, onClose, onSuccess }) => {
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
    const [imagePreview, setImagePreview] = useState('');

    // Inicializar el formulario con los datos de la canción
    useEffect(() => {
        if (song) {
            setFormData({
                NomMus: song.NomMus || '',
                Album: song.Album || '',
                AnPu: song.AnPu || '',
                Art: song.Art || '',
                genero: song.genero || ''
            });
            setImagePreview(song.UrlPort || '');
        }
    }, [song]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            // Crear preview de la nueva imagen
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
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

            // Agregar imagen si se seleccionó una nueva
            if (image) {
                formDataToSend.append('UrlPort', image);
            }

            await updateSongRequest(song.IdMus, formDataToSend);
            onSuccess();
            
        } catch (error) {
            console.error('Error updating song:', error);
            setError(error.response?.data?.message || 'Error al actualizar la canción');
        } finally {
            setLoading(false);
        }
    };

    const removeImagePreview = () => {
        setImage(null);
        setImagePreview(song.UrlPort || ''); // Volver a la imagen original
    };

    if (!song) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Editar Canción</h2>
                    <button className="btn-close" onClick={onClose}>×</button>
                </div>

                <form onSubmit={handleSubmit} className="song-form">
                    {error && (
                        <div className="error-message">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Preview de imagen */}
                    <div className="image-section">
                        <label>Portada actual:</label>
                        <div className="image-preview">
                            <img 
                                src={imagePreview} 
                                alt="Preview" 
                                className="preview-image"
                            />
                            {image && (
                                <button 
                                    type="button" 
                                    className="btn-remove-image"
                                    onClick={removeImagePreview}
                                >
                                    ✕ Quitar nueva imagen
                                </button>
                            )}
                        </div>
                        
                        <label className="file-input-label">
                            <span>📷 Cambiar imagen</span>
                            <input
                                type="file"
                                accept="image/jpeg, image/png, image/jpg"
                                onChange={handleImageChange}
                                className="file-input"
                            />
                        </label>
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
                            {loading ? '🔄 Actualizando...' : '💾 Guardar Cambios'}
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

export default EditSongModal;