import React, { useState, useEffect, useRef } from "react";
import './SearchPlaylists.css';

const SearchPlaylists = ({ onSearch, onClear, searchResultsCount = 0, searchQuery: externalSearchQuery = '' }) => {
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef(null);

  // Sincronizar con el término de búsqueda externo
  useEffect(() => {
    setSearchQuery(externalSearchQuery);
    setHasSearched(!!externalSearchQuery);
  }, [externalSearchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      onClear();
      return;
    }

    setSearching(true);
    setHasSearched(true);
    try {
      await onSearch(searchQuery);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setHasSearched(false);
    onClear();
  };

  const handleShowAll = () => {
    setSearchQuery("");
    setHasSearched(false);
    onClear();
  };

  const handleKeyDown = (e) => {
    // Tecla Enter para buscar
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (searchQuery.trim()) {
        handleSubmit(e);
      }
    }
    
    // Tecla Escape para limpiar
    if (e.key === 'Escape') {
      e.target.blur();
      if (!searchQuery.trim()) {
        handleClear();
      }
    }
  };

  return (
    <div className="spl-search-container" ref={searchRef}>
      <div className="spl-search-header">
        <h3 className="spl-search-title">
          <span className="spl-search-icon">📋</span>
          Buscar Playlists
        </h3>
        
        {hasSearched && searchResultsCount > 0 && (
          <div className="spl-results-count">
            <span className="spl-count-badge">{searchResultsCount}</span>
            <span className="spl-results-text">
              {searchResultsCount === 1 ? ' playlist encontrada' : ' playlists encontradas'}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className={`spl-search-form ${isFocused ? 'focused' : ''}`}>
        <div className="spl-input-container">
          <div className="spl-icon-left">
            🔍
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre, género, ID usuario..."
            className="spl-search-input"
          />
          
        
            <button 
              type="button" 
              onClick={handleClear}
              className="spl-clear-btn"
              aria-label="Limpiar búsqueda"
            >
              ✕
            </button>
       
        </div>
        
        <div className="spl-actions">
          <button
            type="submit"
            disabled={searching || !searchQuery.trim()}
            className="spl-btn-search"
          >
            {searching ? (
              <>
                <span className="spl-spinner-small"></span>
                Buscando...
              </>
            ) : (
              'Buscar'
            )}
          </button>
          
          {hasSearched && (
            <button
              type="button"
              onClick={handleShowAll}
              className="spl-btn-show-all"
            >
              Ver Todas
            </button>
          )}
        </div>
      </form>
      
      {/* Consejos de búsqueda */}
      
    </div>
  );
};

export default SearchPlaylists;