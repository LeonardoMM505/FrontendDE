import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.js';
import './login.css';

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { login } = useAuth();
    const [loginError, setLoginError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = handleSubmit(async (values) => {
        try {
            console.log("Enviando datos de login:", values);
            setLoginError('');
            setIsSubmitting(true);
            
            await login(values);
            navigate('/songs');
        } catch (error) {
            console.error("Error en el login:", error);
            
            // Manejo específico de errores
            if (error.response) {
                // Error de respuesta del servidor
                switch (error.response.status) {
                    case 401:
                        setLoginError('Credenciales incorrectas. Verifica tu correo y contraseña.');
                        break;
                    case 404:
                        setLoginError('Usuario no encontrado. Verifica tu correo electrónico.');
                        break;
                    case 400:
                        // Puede ser error de validación
                        const errorMsg = error.response.data?.message || error.response.data?.error;
                        if (errorMsg) {
                            if (errorMsg.toLowerCase().includes('contraseña') || 
                                errorMsg.toLowerCase().includes('password')) {
                                setLoginError('Contraseña incorrecta.');
                            } else if (errorMsg.toLowerCase().includes('correo') || 
                                      errorMsg.toLowerCase().includes('email') ||
                                      errorMsg.toLowerCase().includes('usuario')) {
                                setLoginError('Correo electrónico no registrado.');
                            } else {
                                setLoginError(errorMsg);
                            }
                        } else {
                            setLoginError('Error en la solicitud. Verifica tus datos.');
                        }
                        break;
                    case 500:
                        setLoginError('Error en el servidor. Por favor, intenta más tarde.');
                        break;
                    default:
                        setLoginError('Error al iniciar sesión. Intenta nuevamente.');
                }
            } else if (error.request) {
                // Error de red (no hubo respuesta)
                setLoginError('Error de conexión. Verifica tu internet e intenta nuevamente.');
            } else {
                // Otros errores
                setLoginError('Error al iniciar sesión: ' + error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    });

    // También puedes agregar validación de email en el frontend
    const validateEmail = (email) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        if (!emailRegex.test(email)) {
            return "Correo electrónico inválido";
        }
        return true;
    };

    return (
        <div className="login-bg">
            <div className="login-card">
                <form onSubmit={onSubmit} className="login-form">
                    <h2 className="login-label" style={{ marginBottom: '20px' }}>
                        Iniciar Sesión
                    </h2>

                    {/* Mostrar error del servidor */}
                    {loginError && (
                        <div className="server-error" style={{ marginBottom: '20px' }}>
                            {loginError}
                        </div>
                    )}

                    {/* CORREO */}
                    <label className="login-label">Correo electrónico</label>
                    <input 
                        type="email"
                        placeholder="correo@ejemplo.com"
                        {...register("Email", { 
                            required: "El correo es requerido",
                            validate: validateEmail
                        })}
                        className="login-input"
                    />
                    {errors.Email && (
                        <span className="error" style={{ marginBottom: '15px', display: 'block' }}>
                            {errors.Email.message}
                        </span>
                    )}

                    {/* CONTRASEÑA */}
                    <label className="login-label">Contraseña</label>
                    <input 
                        type="password"
                        placeholder="Ingresa tu contraseña"
                        {...register("Pass", { 
                            required: "La contraseña es requerida",
                            minLength: {
                                value: 1,
                                message: "La contraseña es requerida"
                            }
                        })}
                        className="login-input"
                    />
                    {errors.Pass && (
                        <span className="error" style={{ marginBottom: '15px', display: 'block' }}>
                            {errors.Pass.message}
                        </span>
                    )}

                    {/* Enlace para recuperar contraseña (opcional) */}
                    <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                        <button 
                            type="button" 
                            className="forgot-password-btn"
                            onClick={() => navigate('/forgot-password')} // Si tienes esta página
                            style={{
                                background: 'none',
                                border: 'none',
                                color: '#7B2FFF',
                                cursor: 'pointer',
                                fontSize: '0.9em',
                                padding: 0
                            }}
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    {/* BOTÓN LOGIN */}
                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
                    </button>
                </form>
            </div>

            {/* BOTÓN REGISTRO */}
            <button 
                onClick={() => navigate('/register')}
                className="register-btn"
                style={{ marginTop: '20px' }}
            >
                ¿No tienes cuenta? Regístrate
            </button>
        </div>
    );
}

export default LoginPage;