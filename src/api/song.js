import axios from './axiosInstance.js';

const URL='http://localhost:4000/api/songs';

// RUTAS QUE REQUIEREN AUTENTICACIÓN ADMIN
export const createSongRequest = (songData) => axios.post('/songs', songData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

export const updateSongRequest = (id, songData) => axios.put(`/songs/${id}`, songData, {
    headers: {
        'Content-Type': 'multipart/form-data'
    }
});

export const deleteSongRequest = (id) => axios.delete(`/songs/${id}`);

// RUTAS PÚBLICAS (no requieren admin, pero sí token para algunas)
export const getSongsRequest = () => axios.get('/songs');

export const getSongRequest = (id) => axios.get(`/songs/${id}`);

export const searchSongsRequest = (params) => axios.get('/songs/search', { params });
