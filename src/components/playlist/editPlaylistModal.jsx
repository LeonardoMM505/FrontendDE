import React, { useState, useEffect, useRef } from 'react';
import { updatePlaylistRequest } from '../../api/playlist';
import './EditPlaylistModal.css';

const EditPlaylistModal = ({ playlist, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        NomPlay: '',
        genero: ''  // Cambiado de Descripcion a genero
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    
    const errorRef = useRef(null);

    useEffect(() => {
        if (playlist) {
            setFormData({
                NomPlay: playlist.NomPlay || '',
                genero: playlist.genero || ''  // Cambiado de Descripcion a genero
            });
        }
    }, [playlist]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        
        // Limpiar error cuando el usuario escribe
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Validación para Nombre
        if (!formData.NomPlay.trim()) {
            newErrors.NomPlay = 'El nombre de la playlist es requerido';
        } else if (formData.NomPlay.trim().length < 3) {
            newErrors.NomPlay = 'El nombre debe tener al menos 3 caracteres';
        } else if (formData.NomPlay.trim().length > 100) {
            newErrors.NomPlay = 'El nombre es demasiado largo (máx. 100 caracteres)';
        }
        
        // Validación para Género (requerido)
        if (!formData.genero.trim()) {
            newErrors.genero = 'El género es requerido';
        } else {
            // Validar que haya al menos un género válido
            const genres = formData.genero.split(',').map(g => g.trim()).filter(g => g);
            if (genres.length === 0) {
                newErrors.genero = 'Ingresa al menos un género válido';
            } else if (formData.genero.length > 200) {
                newErrors.genero = 'Los géneros son demasiado largos (máx. 200 caracteres)';
            }
        }
        
        return newErrors;
    };

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            
            // Hacer scroll al primer campo con error
            const firstErrorField = Object.keys(validationErrors)[0];
            if (firstErrorField) {
                setTimeout(() => {
                    const element = document.querySelector(`[name="${firstErrorField}"]`);
                    if (element) {
                        element.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'center' 
                        });
                        element.focus();
                    }
                }, 100);
            }
            
            return;
        }
        
        setLoading(true);
        setErrors({});

        try {
            // Formatear géneros antes de enviar (eliminar espacios extra)
            const formattedData = {
                ...formData,
                NomPlay: formData.NomPlay.trim(),
                genero: formData.genero.split(',').map(g => g.trim()).filter(g => g).join(', ')
            };
            
            await updatePlaylistRequest(playlist.IdPlay, formattedData);
            onSuccess();
        } catch (err) {
            console.error('Error updating playlist:', err);
            setError(err.response?.data?.message || "Error al actualizar playlist");
            scrollToError();
        } finally {
            setLoading(false);
        }
    };

    if (!playlist) return null;

    return (
        <div className="epl-modal-overlay" onClick={onClose}>
            <div className="epl-modal" onClick={e => e.stopPropagation()}>
                <div className="epl-modal-header">
                    <h2>
                        <span className="epl-modal-icon">📝</span>
                        Editar Playlist
                    </h2>
                    <button className="epl-modal-close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="epl-current-info">
                    <div className="epl-playlist-icon">🎵</div>
                    <div className="epl-playlist-info">
                        <h3 className="epl-current-title">{playlist.NomPlay}</h3>
                        <p className="epl-current-id">ID: {playlist.IdPlay}</p>
                        {playlist.genero && (
                            <p className="epl-current-genre">
                                <span className="genre-label">Género:</span> {playlist.genero}
                            </p>
                        )}
                    </div>
                </div>

                {/* Referencia para scroll de error */}
                <div ref={errorRef}></div>

                {error && (
                    <div className="epl-alert epl-alert-error">
                        <span className="epl-alert-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="epl-modal-form">
                    <div className="epl-form-group">
                        <label className="epl-form-label">
                            Nombre de la playlist *
                        </label>
                        <input
                            type="text"
                            name="NomPlay"
                            value={formData.NomPlay}
                            onChange={handleChange}
                            className={`epl-form-input ${errors.NomPlay ? 'error' : ''}`}
                            placeholder="Ej: Mis Favoritas 2024"
                            maxLength="100"
                            aria-invalid={!!errors.NomPlay}
                            aria-describedby={errors.NomPlay ? 'nomplay-error' : undefined}
                        />
                        {errors.NomPlay && (
                            <span className="epl-form-error" id="nomplay-error">
                                ⚠️ {errors.NomPlay}
                            </span>
                        )}
                        <div className="epl-char-count">
                            {formData.NomPlay.length}/100 caracteres
                        </div>
                    </div>

                    <div className="epl-form-group">
                        <label className="epl-form-label required">
                            Género(s) *
                        </label>
                        <input
                            type="text"
                            name="genero"  // Cambiado de Descripcion a genero
                            value={formData.genero}
                            onChange={handleChange}
                            className={`epl-form-input ${errors.genero ? 'error' : ''}`}
                            placeholder="Ej: Rock, Pop, Electrónica"
                            maxLength="200"
                            aria-invalid={!!errors.genero}
                            aria-describedby={errors.genero ? 'genero-error' : undefined}
                        />
                        {errors.genero && (
                            <span className="epl-form-error" id="genero-error">
                                ⚠️ {errors.genero}
                            </span>
                        )}
                        <div className="epl-char-count">
                            {formData.genero.length}/200 caracteres
                        </div>
                        <small className="epl-form-hint">
                            Separa múltiples géneros con comas (ej: Rock, Pop, Electrónica)
                        </small>
                    </div>

                    <div className="epl-modal-actions">
                        <button 
                            type="button" 
                            className="epl-btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" 
                            className="epl-btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="epl-spinner-small"></span>
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

export default EditPlaylistModal;