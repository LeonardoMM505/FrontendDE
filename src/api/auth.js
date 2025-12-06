//import axio from 'axios';
import axios from './axiosInstance.js'

//const URL='http://localhost:4000/api/auth';

export const registerRequest = user => axios.post('/auth/register', user);
export const loginRequest = (user) => {
    console.log('🔐 Llamando a loginRequest con:', user);
    return axios.post('/auth/login', user)
        .then(response => {

            return response;
        })
        .catch(error => {
            console.error('❌ loginRequest - Error:', error.response?.data || error.message);
            throw error;
        });
};
export const verifyTokenRequest = () => {
    console.log('🔐 Llamando a verifyTokenRequest...');
    return axios.get('/auth/verify')
        .then(response => {
            console.log('✅ verifyTokenRequest - Respuesta recibida:', response.data);
            return response;
        })
        .catch(error => {
            console.error('❌ verifyTokenRequest - Error:', error.response?.data || error.message);
            throw error;
        });
};
export const logoutRequest = () => axios.post('/auth/logout'); 
export const getUsersRequest = () => axios.get('/auth/users');
export const getUserByIdRequest = (id) => axios.get(`/auth/users/${id}`);
export const deleteUserRequest = (id) => axios.delete(`/auth/users/${id}`);