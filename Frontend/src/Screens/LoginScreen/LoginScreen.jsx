import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import useForm from '../../hooks/useForm'
import { login } from '../../services/authService'

export const LoginScreen = () => {
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Redirigir a Home si ya está logueado
        if (localStorage.getItem('access_token')) {
            navigate('/home');
        }
    }, [navigate]);

    const initial_form_state = {
        email: '',
        password: ''
    }

    async function onSubmit(formData) {
        setError(null);
        setLoading(true);
        try {
            const res = await login(formData.email, formData.password);
            if (res.ok && res.data.access_token) {
                localStorage.setItem('access_token', res.data.access_token);
                navigate('/home');
            } else {
                setError(res.message || "Error al iniciar sesión");
            }
        } catch (err) {
            setError(err.message || "Credenciales incorrectas");
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
                <h2 className="auth-title">Inicia sesión en Slack</h2>
                <p className="auth-subtitle">Te sugerimos usar la dirección de correo electrónico que usas en el trabajo.</p>

                {error && (
                    <div className="alert alert-danger">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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
                            placeholder="Ingresa tu contraseña"
                            value={formState.password} 
                            onChange={handleChange} 
                        />
                    </div>

                    <button className="btn-primary" disabled={loading}>
                        {loading ? "Iniciando sesión..." : "Iniciar sesión con email"}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>¿Nuevo en Slack? <Link to={'/register'}>Crea una cuenta</Link></p>
                    <p style={{marginTop: '8px'}}><Link to={'/reset-password'}>¿Olvidaste tu contraseña?</Link></p>
                </div>
            </div>
        </div>
    )
}
