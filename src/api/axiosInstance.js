import axios from 'axios';

const instance = axios.create({
    // Se conectará a http://localhost:4000/api
    baseURL: import.meta.env.VITE_BASE_URL + '/api', 
    withCredentials: true
});

export default instance;