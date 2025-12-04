import React, { useState } from 'react';

const SearchSongs = ({ onSearch, onClear }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [localError, setLocalError] = useState(''); // Error local para validación

    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError(''); // Limpiar error anterior
        
        if (!searchTerm.trim()) {
            setLocalError('Por favor ingresa un término de búsqueda');
            return;
        }
        
        if (searchTerm.trim().length < 2) {
            setLocalError('La búsqueda debe tener al menos 2 caracteres');
            return;
        }

        onSearch({ q: searchTerm });
    };

    const handleClear = () => {
        setSearchTerm('');
        setLocalError('');
        onClear();
    };

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        // Limpiar error cuando el usuario empiece a escribir
        if (localError) {
            setLocalError('');
        }
    };

    return (
        <div className="search-songs">
            <form onSubmit={handleSubmit} className="search-form">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder="Buscar canciones, artistas, álbumes, géneros..."
                    className="search-input"
                />
                
                <button type="submit" className="btn-search">
                    🔍 Buscar
                </button>
                
                <button 
                    type="button" 
                    onClick={handleClear}
                    className="btn-clear"
                >
                    🔄 Limpiar
                </button>
            </form>
            
            {/* Mostrar error de validación local */}
            {localError && (
                <div className="validation-error">
                    ⚠️ {localError}
                </div>
            )}
        </div>
    );
};

export default SearchSongs;