import React, { useState, useEffect, useRef } from 'react'; // ← Agrega useRef
import { updateSongRequest } from '../../api/song';
import './EditSongModal.css';

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
    const [errors, setErrors] = useState({});
    
    // Refs para scroll a errores
    const errorRef = useRef(null);
    const formRef = useRef(null);

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
        // Limpiar error cuando el usuario escribe
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tamaño de imagen (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('La imagen no debe superar los 5MB');
                scrollToError();
                return;
            }
            
            // Validar tipo de imagen
            if (!file.type.match('image/jpeg|image/png|image/jpg')) {
                setError('Solo se permiten imágenes JPEG, JPG o PNG');
                scrollToError();
                return;
            }
            
            setImage(file);
            setError('');
            
            // Crear preview de la nueva imagen
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.NomMus.trim()) {
            newErrors.NomMus = 'El nombre de la canción es requerido';
        } else if (formData.NomMus.trim().length < 2) {
            newErrors.NomMus = 'El nombre debe tener al menos 2 caracteres';
        }
        
        if (!formData.Art.trim()) {
            newErrors.Art = 'El artista es requerido';
        }
        
        if (!formData.AnPu) {
            newErrors.AnPu = 'El año es requerido';
        } else if (isNaN(formData.AnPu) || formData.AnPu < 1900 || formData.AnPu > new Date().getFullYear() + 1) {
            newErrors.AnPu = `Año inválido (1900-${new Date().getFullYear() + 1})`;
        }
        
        if (!formData.genero.trim()) {
            newErrors.genero = 'El género es requerido';
        } else {
            // Validar que haya al menos un género válido
            const genres = formData.genero.split(',').map(g => g.trim()).filter(g => g);
            if (genres.length === 0) {
                newErrors.genero = 'Ingresa al menos un género válido';
            }
        }
        
        return newErrors;
    };

    // Función para hacer scroll al primer error
    const scrollToError = () => {
        setTimeout(() => {
            if (errorRef.current) {
                errorRef.current.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }, 100);
    };

    // Función para hacer scroll al primer campo con error
    const scrollToFieldError = (fieldName) => {
        setTimeout(() => {
            const element = document.querySelector(`[name="${fieldName}"]`);
            if (element) {
                element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
                element.focus();
            }
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            
            // Hacer scroll al primer campo con error
            const firstErrorField = Object.keys(validationErrors)[0];
            if (firstErrorField) {
                scrollToFieldError(firstErrorField);
            }
            
            return;
        }
        
        setLoading(true);
        setErrors({});

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
            scrollToError();
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
        <div className="esm-modal-overlay" onClick={onClose}>
            <div className="esm-modal esm-modal-large" onClick={(e) => e.stopPropagation()} ref={formRef}>
                <div className="esm-modal-header">
                    <h2>
                        <span className="esm-modal-icon">🎵</span>
                        Editar Canción
                    </h2>
                    <button className="esm-modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="esm-current-song">
                    <div className="esm-song-thumbnail">
                        <img 
                            src={song.UrlPort || 'https://via.placeholder.com/80x80/2c3e50/ffffff?text=M'} 
                            alt={song.NomMus}
                            onError={(e) => e.target.src = 'https://via.placeholder.com/80x80/2c3e50/ffffff?text=M'}
                        />
                    </div>
                    <div className="esm-song-info">
                        <h3 className="esm-song-title">{song.NomMus}</h3>
                        <p className="esm-song-details">
                            {song.Art} • {song.Album} {song.AnPu && `(${song.AnPu})`}
                        </p>
                        <p className="esm-song-id">ID: {song.IdMus}</p>
                    </div>
                </div>

                {/* Referencia para scroll de error general */}
                <div ref={errorRef}></div>

                {error && (
                    <div className="esm-alert esm-alert-error">
                        <span className="esm-alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="esm-modal-form">
                    <div className="esm-form-section">
                        <h3 className="esm-section-title">
                            <span className="esm-section-icon">📝</span>
                            Información de la Canción
                        </h3>
                        
                        <div className="esm-form-row">
                            <div className="esm-form-group">
                                <label className="esm-form-label">
                                    Nombre de la canción *
                                </label>
                                <input
                                    type="text"
                                    name="NomMus"
                                    value={formData.NomMus}
                                    onChange={handleInputChange}
                                    className={`esm-form-input ${errors.NomMus ? 'error' : ''}`}
                                    placeholder="Ej: Bohemian Rhapsody"
                                    aria-invalid={!!errors.NomMus}
                                    aria-describedby={errors.NomMus ? 'nommus-error' : undefined}
                                />
                                {errors.NomMus && (
                                    <span className="esm-form-error" id="nommus-error">
                                        ⚠️ {errors.NomMus}
                                    </span>
                                )}
                            </div>
                            
                            <div className="esm-form-group">
                                <label className="esm-form-label">
                                    Artista *
                                </label>
                                <input
                                    type="text"
                                    name="Art"
                                    value={formData.Art}
                                    onChange={handleInputChange}
                                    className={`esm-form-input ${errors.Art ? 'error' : ''}`}
                                    placeholder="Ej: Queen"
                                    aria-invalid={!!errors.Art}
                                    aria-describedby={errors.Art ? 'art-error' : undefined}
                                />
                                {errors.Art && (
                                    <span className="esm-form-error" id="art-error">
                                        ⚠️ {errors.Art}
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="esm-form-group">
                            <label className="esm-form-label">
                                Álbum
                            </label>
                            <input
                                type="text"
                                name="Album"
                                value={formData.Album}
                                onChange={handleInputChange}
                                className="esm-form-input"
                                placeholder="Ej: A Night at the Opera"
                            />
                        </div>
                        
                        <div className="esm-form-row">
                            <div className="esm-form-group">
                                <label className="esm-form-label">
                                    Año de publicación *
                                </label>
                                <input
                                    type="number"
                                    name="AnPu"
                                    value={formData.AnPu}
                                    onChange={handleInputChange}
                                    className={`esm-form-input ${errors.AnPu ? 'error' : ''}`}
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    placeholder="Ej: 1975"
                                    aria-invalid={!!errors.AnPu}
                                    aria-describedby={errors.AnPu ? 'anpu-error' : undefined}
                                />
                                {errors.AnPu && (
                                    <span className="esm-form-error" id="anpu-error">
                                        ⚠️ {errors.AnPu}
                                    </span>
                                )}
                            </div>
                            
                            <div className="esm-form-group">
                                <label className="esm-form-label">
                                    Género(s) *
                                </label>
                                <input
                                    type="text"
                                    name="genero"
                                    value={formData.genero}
                                    onChange={handleInputChange}
                                    className={`esm-form-input ${errors.genero ? 'error' : ''}`}
                                    placeholder="Ej: Rock, Pop, Glam Rock"
                                    aria-invalid={!!errors.genero}
                                    aria-describedby={errors.genero ? 'genero-error' : undefined}
                                />
                                {errors.genero && (
                                    <span className="esm-form-error" id="genero-error">
                                        ⚠️ {errors.genero}
                                    </span>
                                )}
                                <small className="esm-form-hint">Separa múltiples géneros con comas</small>
                            </div>
                        </div>
                    </div>
                    
                    <div className="esm-form-section">
                        <h3 className="esm-section-title">
                            <span className="esm-section-icon">🖼️</span>
                            Portada de la Canción
                        </h3>
                        
                        <div className="esm-image-upload">
                            <div className="esm-image-preview">
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="esm-preview-image"
                                />
                                <div className="esm-image-overlay">
                                    <span className="esm-image-text">
                                        {image ? 'Nueva imagen seleccionada' : 'Imagen actual'}
                                    </span>
                                    {image && (
                                        <button 
                                            type="button" 
                                            className="esm-remove-image-btn"
                                            onClick={removeImagePreview}
                                        >
                                            ✕ Quitar nueva imagen
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="esm-file-upload-container">
                                <label className="esm-file-upload-label">
                                    <span className="esm-file-upload-icon">📷</span>
                                    <span className="esm-file-upload-text">Cambiar imagen</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg, image/png, image/jpg, image/webp"
                                        onChange={handleImageChange}
                                        className="esm-file-input"
                                    />
                                </label>
                                <small className="esm-file-hint">
                                    Formatos: JPG, PNG, WebP • Máx: 5MB
                                </small>
                            </div>
                        </div>
                    </div>

                    <div className="esm-modal-actions">
                        <button 
                            type="button" 
                            className="esm-btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="esm-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="esm-spinner-small"></span>
                                    Guardando...
                                </>
                            ) : (
                                '💾 Guardar Cambios'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditSongModal;