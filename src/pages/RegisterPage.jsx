import React from 'react';
import { useForm } from 'react-hook-form';
import { registerRequest } from '../api/auth.js'; 
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    // 2. Inicializamos useForm
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate(); // Hook para navegar

    // 3. Esta función se llama al enviar el formulario
    const onSubmit = handleSubmit(async (values) => {
        try {
            console.log("Enviando datos:", values);
            // 'values' ya es un objeto { NomUs, Email, Pass }
            const res = await registerRequest(values); 
            
            console.log("Respuesta del servidor:", res.data);
            
            // 5. Si el registro es exitoso, redirigimos al login
            navigate('/login'); 

        } catch (error) {
            console.error("Error en el registro:", error.response.data);
            // (Aquí podríamos mostrar un mensaje de error al usuario)
        }
    });

    // 4. Este es el formulario visual (HTML)
    return (
        <div style={{ maxWidth: '320px', margin: '50px auto' }}>
            <h2>Registro</h2>
            
            {/* Usamos el 'onSubmit' de react-hook-form */}
            <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* Campo Nombre de Usuario */}
                <input 
                    type="text" 
                    placeholder="Nombre de Usuario (NomUs)"
                    // 'register' conecta el campo al hook
                    {...register("NomUs", { required: true })}
                />
                {/* Muestra un error si el campo es requerido */}
                {errors.NomUs && <span style={{ color: 'red' }}>El nombre es requerido</span>}

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
                    Registrarse
                </button>
            </form>
        </div>
    );
}

export default RegisterPage;