import axiosInstance from './axiosInstance.js';
const URL='http://localhost:4000/api/playlists';

// AGREGAR ESTA FUNCIÓN (FALTA EN TU CÓDIGO):
export const getPlaylistByIdRequest = (playlistId) => axiosInstance.get(`/playlists/${playlistId}`);

// Playlists del usuario
export const createPlaylistRequest = (playlistData) => axiosInstance.post('/playlists', playlistData);
export const getUserPlaylistsRequest = (userId) => axiosInstance.get(`/playlists/user/${userId}`);
export const updatePlaylistRequest = (id, playlistData) => axiosInstance.put(`/playlists/${id}`, playlistData);
export const deletePlaylistRequest = (id) => axiosInstance.delete(`/playlists/${id}`);

// Canciones en playlists
export const getPlaylistSongsRequest = (playlistId) => axiosInstance.get(`/playlists/${playlistId}/songs`);
export const addSongToPlaylistRequest = (data) => axiosInstance.post('/playlists/songs', data);
export const removeSongFromPlaylistRequest = (playlistId, songId) => axiosInstance.delete(`/playlists/${playlistId}/songs/${songId}`);

// Búsqueda
export const searchUserPlaylistsRequest = (userId, query) => axiosInstance.get(`/playlists/user/${userId}/search`, { 
    params: { q: query } 
});

// Rutas solo para admin
export const getAllPlaylistsRequest = () => {
  console.log('🔍 getAllPlaylistsRequest llamada');
  return axiosInstance.get('/playlists');
};

export const searchAllPlaylistsRequest = (query) => axiosInstance.get('/playlists/search', { 
    params: { q: query } 
});