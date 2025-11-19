//import axio from 'axios';
import axios from './axiosInstance.js'

const URL='http://localhost:4000/api/auth';

export const registerRequest = user => axios.post('/auth/register', user);
export const loginRequest = user => axios.post('/auth/login', user);
export const verifyTokenRequest = () => axios.get('/auth/verify');
export const logoutRequest = () => axios.post('/auth/logout'); 
export const getUsersRequest = () => axios.get('/auth/users');
export const deleteUserRequest = (id) => axios.delete(`/auth/users/${id}`);