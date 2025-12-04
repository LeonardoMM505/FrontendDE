import React, { useState } from "react";

const SearchPlaylists = ({ onSearch, onClear }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      onClear();
      return;
    }

    setSearching(true);
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
    onClear();
  };

  return (
    <div className="w-full max-w-xl mx-auto mb-6 animate-fadeIn">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          {/* INPUT */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar playlists por nombre, género o ID usuario..."
            className="
              w-full py-3 pl-4 pr-28 rounded-xl border shadow-sm
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              placeholder:text-gray-400 text-gray-800
            "
          />

          {/* BOTONES DENTRO DEL INPUT */}
          <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1">
            <button
              type="submit"
              disabled={searching}
              className="
                px-3 py-1 text-sm rounded-lg bg-indigo-600 text-white
                hover:bg-indigo-700 transition disabled:opacity-50
              "
            >
              {searching ? "Buscando..." : "Buscar"}
            </button>

            <button
              type="button"
              disabled={searching}
              onClick={handleClear}
              className="
                px-3 py-1 text-sm rounded-lg bg-gray-200
                hover:bg-gray-300 transition disabled:opacity-50
              "
            >
              Limpiar
            </button>
          </div>
        </div>

        <small className="block mt-2 text-gray-500 text-sm px-1">
          Puedes buscar por nombre, género o ID del usuario
        </small>
      </form>
    </div>
  );
};

export default SearchPlaylists;
