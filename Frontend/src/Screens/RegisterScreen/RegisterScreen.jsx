import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import { register } from '../../services/authService'

export const RegisterScreen = () => {
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (localStorage.getItem('access_token')) {
            navigate('/home');
        }
    }, [navigate]);

    const initial_form_state = {
        name: '',
        email: '',
        password: ''
    }

    async function onSubmit(formData) {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const res = await register(formData.name, formData.email, formData.password);
            if (res.ok) {
                setSuccess("Registro exitoso. Por favor revisa tu correo electrónico para verificar tu cuenta antes de iniciar sesión.");
            } else {
                setError(res.message || "Error al registrarse");
            }
        } catch (err) {
            setError(err.message || "El correo ingresado ya podría estar registrado o los datos son inválidos.");
        } finally {
            setLoading(false);
        }
    }

    const { formState, handleChange, handleSubmit } = useForm(initial_form_state, onSubmit)

    return (
        <div className="auth-container">
            <div className="auth-header-logo">
                <svg className="auth-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 50a7.5 7.5 0 1 1 7.5-7.5v7.5zm0 5a7.5 7.5 0 1 1 7.5 7.5H15zm10-12.5A7.5 7.5 0 0 1 32.5 35h15v15h-15zm0 15a7.5 7.5 0 0 1 7.5-7.5h7.5v15h-7.5zm25-32.5a7.5 7.5 0 1 1 7.5 7.5V25zm-5 10a7.5 7.5 0 0 1 7.5-7.5h15v15h-15zm5 25a7.5 7.5 0 1 1 7.5-7.5v7.5zm-5 10a7.5 7.5 0 0 1 7.5-7.5h7.5v15h-7.5zm25-17.5a7.5 7.5 0 1 1-7.5 7.5v-7.5zm0-5a7.5 7.5 0 1 1-7.5-7.5h7.5zm-10 12.5a7.5 7.5 0 0 1-7.5 7.5h-15v-15h15zm0-15a7.5 7.5 0 0 1-7.5 7.5h-7.5v-15h7.5zm-25 32.5a7.5 7.5 0 1 1-7.5-7.5v7.5zm5-10a7.5 7.5 0 0 1-7.5 7.5h-15v-15h15zm-5-25a7.5 7.5 0 1 1-7.5 7.5v-7.5zm5-10a7.5 7.5 0 0 1-7.5 7.5h-7.5v-15h7.5z" fill="#4a154b"/>
                </svg>
                <span className="auth-logo-text" style={{color: '#4a154b'}}>slack</span>
            </div>

            <div className="auth-card">
                <h2 className="auth-title">Regístrate en Slack</h2>
                <p className="auth-subtitle">Crea tu cuenta para comenzar a organizar tu espacio de trabajo.</p>

                {error && (
                    <div className="alert alert-danger">
                        <span>⚠️</span> {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <span>✉️</span> {success}
                    </div>
                )}

                {!success && (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Nombre completo</label>
                            <input 
                                className="form-input"
                                id='name' 
                                name='name' 
                                type='text' 
                                required
                                placeholder="Juan Pérez"
                                value={formState.name} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input 
                                className="form-input"
                                id='email' 
                                name='email' 
                                type='email' 
                                required
                                placeholder="nombre@trabajo.com"
                                value={formState.email} 
                                onChange={handleChange} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="password">Contraseña</label>
                            <input 
                                className="form-input"
                                id='password' 
                                name='password' 
                                type='password' 
                                required
                                placeholder="Al menos 6 caracteres"
                                value={formState.password} 
                                onChange={handleChange} 
                            />
                        </div>

                        <button className="btn-primary" disabled={loading}>
                            {loading ? "Creando cuenta..." : "Crear cuenta"}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p>¿Ya tienes una cuenta? <Link to={'/login'}>Inicia sesión</Link></p>
                </div>
            </div>
        </div>
    )
}
