import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.js'; // ⬅️ 1. Importamos el hook de Contexto

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const { login } = useAuth(); // ⬅️ 2. Obtenemos la función 'signin' del contexto

    // 3. Esta función se llama al enviar el formulario
    const onSubmit = handleSubmit(async (values) => {
        try {
            console.log("Enviando datos de login:", values);
            

            await login(values); 
            
            // Si el signin fue exitoso, el estado se actualizó, y navegamos inmediatamente
            navigate('/profile'); 

        } catch (error) {
            // El error es manejado en el contexto, pero aquí podemos logearlo
            console.error("Error en el login:", error);
            // Mostrar mensaje de error al usuario
        }
    });

    // 4. Este es el formulario visual (HTML)
    return (
        <div style={{ maxWidth: '320px', margin: '50px auto' }}>
            <h2>Login</h2>
            
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Campo Email */}
                <input 
                    type="email" 
                    placeholder="Email"
                    {...register("Email", { required: true })}
                />
                {errors.Email && <span style={{ color: 'red' }}>El email es requerido</span>}

                {/* Campo Contraseña */}
                <input 
                    type="password" 
                    placeholder="Contraseña (Pass)"
                    {...register("Pass", { required: true })}
                />
                {errors.Pass && <span style={{ color: 'red' }}>La contraseña es requerida</span>}

                <button type="submit">
                    Iniciar Sesión
                </button>
            </form>
        </div>
    );
}

export default LoginPage;