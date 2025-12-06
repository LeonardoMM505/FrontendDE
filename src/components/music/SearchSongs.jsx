import React, { useState, useEffect, useRef } from 'react';
import './SearchSongs.css'; // Crearemos este archivo CSS

const SearchSongs = ({ onSearch, onClear, searchResultsCount = 0, searchTerm: externalSearchTerm = '' }) => {
    const [searchTerm, setSearchTerm] = useState(externalSearchTerm);
    const [localError, setLocalError] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const searchRef = useRef(null);
    
    // Sincronizar con el término de búsqueda externo
    useEffect(() => {
        setSearchTerm(externalSearchTerm);
    }, [externalSearchTerm]);
    
    // Cargar historial del localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('songSearchHistory');
        if (savedHistory) {
            try {
                setSearchHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Error loading search history:', e);
            }
        }
    }, []);
    
    // Cerrar historial al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowHistory(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
   
    const handleSearch = (term = searchTerm) => {
        const trimmedTerm = term.trim();
        
        if (!trimmedTerm) {
            setLocalError('Por favor ingresa un término de búsqueda');
            return false;
        }
        
        if (trimmedTerm.length < 2) {
            setLocalError('La búsqueda debe tener al menos 2 caracteres');
            return false;
        }
        
        setLocalError('');
     
        onSearch({ q: trimmedTerm });
        setShowHistory(false);
        return true;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };
    
    const handleClear = () => {
        setSearchTerm('');
        setLocalError('');
        setShowHistory(false);
        onClear();
    };
    
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        if (localError) {
            setLocalError('');
        }
        
        // Mostrar historial cuando hay texto
        if (value.trim()) {
            setShowHistory(true);
        }
    };
    
    const handleKeyDown = (e) => {
        // Tecla Enter para buscar
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSearch();
        }
        
        // Tecla Escape para limpiar foco
        if (e.key === 'Escape') {
            e.target.blur();
            setShowHistory(false);
        }
        
        // Tecla flecha abajo para navegar historial
        if (e.key === 'ArrowDown' && showHistory && searchHistory.length > 0) {
            e.preventDefault();
            // Implementación de navegación por teclado (opcional)
        }
    };
    
   
    return (
        <div className="search-container" ref={searchRef}>
            <div className="search-header">
                <h2 className="search-title">
                    <span className="search-icon">🔍</span>
                    Buscar en el Catálogo
                </h2>
                {searchResultsCount > 0 && (
                    <div className="search-results-count">
                        <span className="count-badge">{searchResultsCount}</span>
                        {searchResultsCount === 1 ? ' resultado' : ' resultados'}
                    </div>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className={`search-form ${isFocused ? 'focused' : ''}`}>
                <div className="search-input-container">
                    <div className="search-icon-left">
                        🔍
                    </div>
                    
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={() => {
                            setIsFocused(true);
                            if (searchTerm.trim() || searchHistory.length > 0) {
                                setShowHistory(true);
                            }
                        }}
                        onBlur={() => {
                            setIsFocused(false);
                            // Retrasar ocultar historial para permitir clics
                            setTimeout(() => setShowHistory(false), 200);
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Busca canciones, artistas, álbumes, géneros..."
                        className="search-input"
                        aria-label="Buscar canciones"
                    />
                    
                   
                    
                   
                </div>
                
                <div className="search-actions">
                    <button 
                        type="submit" 
                        className="btn-search-primary"
                        disabled={!searchTerm.trim()}
                    >
                        <span className="btn-icon">🔍</span>
                        <span className="btn-text">Buscar</span>
                    </button>
                    
                   
                        <button 
                            type="button" 
                            onClick={handleClear}
                            className="btn-search-secondary"
                        >
                            <span className="btn-icon">↻</span>
                            <span className="btn-text">Limpiar</span>
                        </button>
                   
                </div>
            </form>
            
           
            
            {/* Mostrar error de validación */}
            {localError && (
                <div className="search-error">
                    <span className="error-icon">⚠️</span>
                    <span className="error-text">{localError}</span>
                </div>
            )}
            
           
        </div>
    );
};

export default SearchSongs;