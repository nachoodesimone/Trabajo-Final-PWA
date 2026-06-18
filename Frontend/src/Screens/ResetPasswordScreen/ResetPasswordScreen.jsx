import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import useForm from "../../hooks/useForm";
import { resetPasswordRequest, resetPasswordConfirm } from "../../services/authService";

export const ResetPasswordScreen = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") || searchParams.get("reset_password_token");

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);

    // Formulario para solicitar enlace
    const request_initial_state = { email: "" };
    async function onRequestSubmit(formData) {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const res = await resetPasswordRequest(formData.email);
            setSuccess(res.message || "Se han enviado instrucciones a tu correo electrónico.");
        } catch (err) {
            setError(err.message || "Error al solicitar restauración de contraseña");
        } finally {
            setLoading(false);
        }
    }
    const requestForm = useForm(request_initial_state, onRequestSubmit);

    // Formulario para reestablecer con token
    const reset_initial_state = { newPassword: "" };
    async function onResetSubmit(formData) {
        setError(null);
        setSuccess(null);
        setLoading(true);
        try {
            const res = await resetPasswordConfirm(token, formData.newPassword);
            setSuccess("Tu contraseña ha sido restablecida con éxito. Ya puedes iniciar sesión.");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.message || "El token ha expirado o es inválido.");
        } finally {
            setLoading(false);
        }
    }
    const resetForm = useForm(reset_initial_state, onResetSubmit);

    return (
        <div className="auth-container">
            <div className="auth-header-logo">
                <svg className="auth-logo-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 50a7.5 7.5 0 1 1 7.5-7.5v7.5zm0 5a7.5 7.5 0 1 1 7.5 7.5H15zm10-12.5A7.5 7.5 0 0 1 32.5 35h15v15h-15zm0 15a7.5 7.5 0 0 1 7.5-7.5h7.5v15h-7.5zm25-32.5a7.5 7.5 0 1 1 7.5 7.5V25zm-5 10a7.5 7.5 0 0 1 7.5-7.5h15v15h-15zm5 25a7.5 7.5 0 1 1 7.5-7.5v7.5zm-5 10a7.5 7.5 0 0 1 7.5-7.5h7.5v15h-7.5zm25-17.5a7.5 7.5 0 1 1-7.5 7.5v-7.5zm0-5a7.5 7.5 0 1 1-7.5-7.5h7.5zm-10 12.5a7.5 7.5 0 0 1-7.5 7.5h-15v-15h15zm0-15a7.5 7.5 0 0 1-7.5 7.5h-7.5v-15h7.5zm-25 32.5a7.5 7.5 0 1 1-7.5-7.5v7.5zm5-10a7.5 7.5 0 0 1-7.5 7.5h-15v-15h15zm-5-25a7.5 7.5 0 1 1-7.5 7.5v-7.5zm5-10a7.5 7.5 0 0 1-7.5 7.5h-7.5v-15h7.5z" fill="#4a154b"/>
                </svg>
                <span className="auth-logo-text" style={{color: '#4a154b'}}>slack</span>
            </div>

            <div className="auth-card">
                <h2 className="auth-title">Restablecer Contraseña</h2>
                <p className="auth-subtitle">
                    {token ? "Ingresa tu nueva contraseña para actualizar tu cuenta." : "Ingresa tu dirección de correo electrónico institucional o de trabajo."}
                </p>

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

                {!success && !token && (
                    <form onSubmit={requestForm.handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input 
                                className="form-input"
                                id='email' 
                                name='email' 
                                type='email' 
                                required
                                placeholder="nombre@trabajo.com"
                                value={requestForm.formState.email} 
                                onChange={requestForm.handleChange} 
                            />
                        </div>
                        <button className="btn-primary" disabled={loading}>
                            {loading ? "Enviando correo..." : "Enviar enlace de restablecimiento"}
                        </button>
                    </form>
                )}

                {!success && token && (
                    <form onSubmit={resetForm.handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="newPassword">Nueva Contraseña</label>
                            <input 
                                className="form-input"
                                id='newPassword' 
                                name='newPassword' 
                                type='password' 
                                required
                                placeholder="Mínimo 6 caracteres"
                                value={resetForm.formState.newPassword} 
                                onChange={resetForm.handleChange} 
                            />
                        </div>
                        <button className="btn-primary" disabled={loading}>
                            {loading ? "Actualizando contraseña..." : "Restablecer contraseña"}
                        </button>
                    </form>
                )}

                <div className="auth-footer">
                    <p><Link to={'/login'}>Volver al inicio de sesión</Link></p>
                </div>
            </div>
        </div>
    );
};
