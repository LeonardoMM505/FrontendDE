import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPlaylistRequest } from "../../api/playlist.js";

const CreatePlaylistModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        NomPlay: "",
        genero: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const modalRef = useRef(null);

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!formData.NomPlay.trim()) {
            setError("El nombre de la playlist es requerido");
            setLoading(false);
            return;
        }

        try {
            await createPlaylistRequest(formData);
            onSuccess();
        } catch (error) {
            setError(error.response?.data?.message || "Error al crear la playlist");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    ref={modalRef}
                    className="modal-content w-[380px] p-6"
                    initial={{ opacity: 0, scale: 0.85, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: -10 }}
                    transition={{ duration: 0.18 }}
                >
                    <h2 className="text-2xl font-semibold mb-4 text-neutral-800 text-center">
                        Crear Playlist
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {error && (
                            <div className="text-red-500 bg-red-100 border border-red-300 px-3 py-2 rounded-lg text-sm">
                                ⚠️ {error}
                            </div>
                        )}

                        <div className="flex flex-col">
                            <label className="font-medium mb-1">Nombre *</label>
                            <input
                                type="text"
                                name="NomPlay"
                                value={formData.NomPlay}
                                onChange={handleInputChange}
                                className="px-3 py-2 rounded-lg border border-neutral-300 
                                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Mis Favoritas"
                                autoFocus
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="font-medium mb-1">Género(s)</label>
                            <input
                                type="text"
                                name="genero"
                                value={formData.genero}
                                onChange={handleInputChange}
                                className="px-3 py-2 rounded-lg border border-neutral-300 
                                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Ej: Rock, Pop"
                            />
                            <span className="text-xs text-neutral-600 mt-1">
                                Separa múltiples géneros con comas
                            </span>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border bg-neutral-100 hover:bg-neutral-200 
                                           transition text-neutral-700"
                            >
                                Cancelar
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium 
                                           hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? "Creando..." : "Crear"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CreatePlaylistModal;

