import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPlaylistRequest } from "../../api/playlist.js";
import "./CreatePlaylistModal.css"; // Crearemos este CSS

const CreatePlaylistModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        NomPlay: "",
        genero: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errors, setErrors] = useState({});
    
    const modalRef = useRef(null);
    const errorRef = useRef(null);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        
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
        setError("");
        
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
            // Formatear géneros antes de enviar
            const formattedData = {
                ...formData,
                NomPlay: formData.NomPlay.trim(),
                genero: formData.genero.split(',').map(g => g.trim()).filter(g => g).join(', ')
            };
            
            await createPlaylistRequest(formattedData);
            onSuccess();
            onClose(); // Cerrar después de éxito
        } catch (error) {
            console.error('Error creating playlist:', error);
            setError(error.response?.data?.message || "Error al crear la playlist");
            scrollToError();
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="cpl-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    ref={modalRef}
                    className="cpl-modal"
                    initial={{ opacity: 0, scale: 0.85, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -10 }}
                    transition={{ duration: 0.18 }}
                >
                    <div className="cpl-modal-header">
                        <h2>
                            <span className="cpl-modal-icon">🎵</span>
                            Crear Nueva Playlist
                        </h2>
                        <button className="cpl-modal-close-btn" onClick={onClose}>
                            ✕
                        </button>
                    </div>

                    {/* Referencia para scroll de error */}
                    <div ref={errorRef}></div>

                    {error && (
                        <div className="cpl-alert cpl-alert-error">
                            <span className="cpl-alert-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="cpl-modal-form">
                        <div className="cpl-form-group">
                            <label className="cpl-form-label">
                                Nombre de la playlist *
                            </label>
                            <input
                                type="text"
                                name="NomPlay"
                                value={formData.NomPlay}
                                onChange={handleInputChange}
                                className={`cpl-form-input ${errors.NomPlay ? 'error' : ''}`}
                                placeholder="Ej: Mis Favoritas 2024"
                                maxLength="100"
                                autoFocus
                                aria-invalid={!!errors.NomPlay}
                                aria-describedby={errors.NomPlay ? 'nomplay-error' : undefined}
                            />
                            {errors.NomPlay && (
                                <span className="cpl-form-error" id="nomplay-error">
                                    ⚠️ {errors.NomPlay}
                                </span>
                            )}
                            <div className="cpl-char-count">
                                {formData.NomPlay.length}/100 caracteres
                            </div>
                        </div>

                        <div className="cpl-form-group">
                            <label className="cpl-form-label">
                                Género(s) *
                            </label>
                            <input
                                type="text"
                                name="genero"
                                value={formData.genero}
                                onChange={handleInputChange}
                                className={`cpl-form-input ${errors.genero ? 'error' : ''}`}
                                placeholder="Ej: Rock, Pop, Electrónica"
                                maxLength="200"
                                aria-invalid={!!errors.genero}
                                aria-describedby={errors.genero ? 'genero-error' : undefined}
                            />
                            {errors.genero && (
                                <span className="cpl-form-error" id="genero-error">
                                    ⚠️ {errors.genero}
                                </span>
                            )}
                            <div className="cpl-char-count">
                                {formData.genero.length}/200 caracteres
                            </div>
                            <small className="cpl-form-hint">
                                Separa múltiples géneros con comas (ej: Rock, Pop, Electrónica)
                            </small>
                        </div>

                        <div className="cpl-modal-actions">
                            <button
                                type="button"
                                onClick={onClose}
                                className="cpl-btn-secondary"
                                disabled={loading}
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="cpl-btn-primary"
                            >
                                {loading ? (
                                    <>
                                        <span className="cpl-spinner-small"></span>
                                        Creando...
                                    </>
                                ) : (
                                    '🎵 Crear Playlist'
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreatePlaylistModal;