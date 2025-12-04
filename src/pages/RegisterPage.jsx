import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerRequest } from '../api/auth.js'; 
import { useNavigate } from 'react-router-dom';
import './login.css';

function RegisterPage() {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Para confirmar contraseña
    const password = watch("Pass", "");

    const onSubmit = handleSubmit(async (values) => {
        try {
            setIsSubmitting(true);
            setServerError('');
            console.log("Enviando datos:", values);
            
            const res = await registerRequest(values); 
            console.log("Respuesta del servidor:", res.data);
            
            // Si el registro es exitoso, redirigimos al login
            navigate('/login', { 
                state: { 
                    message: '¡Registro exitoso! Por favor inicia sesión.',
                    type: 'success'
                }
            });

        } catch (error) {
            console.error("Error en el registro:", error.response?.data || error.message);
            
            // Manejo específico de errores del servidor
            if (error.response?.status === 400) {
                if (error.response.data?.message?.includes('contraseña')) {
                    setServerError('La contraseña debe tener al menos 8 caracteres.');
                } else if (error.response.data?.message?.includes('correo') || 
                          error.response.data?.message?.includes('email') ||
                          error.response.data?.message?.includes('ya existe')) {
                    setServerError('Este correo electrónico ya está registrado.');
                } else {
                    setServerError(error.response.data?.message || 'Error en el registro. Verifica tus datos.');
                }
            } else if (error.response?.status === 409) {
                setServerError('Este correo electrónico ya está registrado.');
            } else {
                setServerError('Error en el servidor. Intenta nuevamente.');
            }
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <div className="login-bg">
            <div className="login-card">
                <form onSubmit={onSubmit} className="login-form">
                    <h2 className="login-label" style={{ marginBottom: '10px' }}>
                        Registro
                    </h2>

                    {/* Mostrar error del servidor */}
                    {serverError && (
                        <div className="server-error">
                            {serverError}
                        </div>
                    )}

                    {/* NOMBRE DE USUARIO */}
                    <label className="login-label">Nombre de usuario</label>
                    <input 
                        type="text"
                        placeholder="Nombre de Usuario"
                        {...register("NomUs", { 
                            required: "El nombre es requerido",
                            minLength: {
                                value: 3,
                                message: "El nombre debe tener al menos 3 caracteres"
                            }
                        })}
                        className="login-input"
                    />
                    {errors.NomUs && <span className="error">{errors.NomUs.message}</span>}

                    {/* EMAIL */}
                    <label className="login-label">Correo electrónico</label>
                    <input 
                        type="email"
                        placeholder="correo@ejemplo.com"
                        {...register("Email", { 
                            required: "El correo es requerido",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Correo electrónico inválido"
                            }
                        })}
                        className="login-input"
                    />
                    {errors.Email && <span className="error">{errors.Email.message}</span>}

                    {/* CONTRASEÑA */}
                    <label className="login-label">Contraseña</label>
                    <input 
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        {...register("Pass", { 
                            required: "La contraseña es requerida",
                            minLength: {
                                value: 8,
                                message: "La contraseña debe tener al menos 8 caracteres"
                            },
                            pattern: {
                                value: /^(?=.*[a-zA-Z])(?=.*\d)/,
                                message: "Debe contener letras y números"
                            }
                        })}
                        className="login-input"
                    />
                    {errors.Pass && <span className="error">{errors.Pass.message}</span>}

                    {/* CONFIRMAR CONTRASEÑA (OPCIONAL) */}
                    <label className="login-label">Confirmar contraseña</label>
                    <input 
                        type="password"
                        placeholder="Repite tu contraseña"
                        {...register("ConfirmPass", { 
                            validate: value => 
                                value === password || "Las contraseñas no coinciden"
                        })}
                        className="login-input"
                    />
                    {errors.ConfirmPass && <span className="error">{errors.ConfirmPass.message}</span>}

                    {/* BOTÓN REGISTRARSE */}
                    <button 
                        type="submit" 
                        className="login-btn"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>
            </div>

            {/* BOTÓN INICIAR SESIÓN */}
            <button 
                onClick={() => navigate('/login')}
                className="register-btn"
            >
                ¿Ya tienes cuenta? Iniciar sesión
            </button>
        </div>
    );
}

export default RegisterPage;