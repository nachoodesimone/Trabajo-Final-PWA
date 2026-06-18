const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function login(email, password) {
    const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al iniciar sesión");
    }
    return data;
}

export async function register(name, email, password) {
    const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al registrarse");
    }
    return data;
}

export async function resetPasswordRequest(email) {
    const response = await fetch(`${API_URL}/api/auth/reset-password-request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al solicitar restauración de contraseña");
    }
    return data;
}

export async function resetPasswordConfirm(token, newPassword) {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al restablecer la contraseña");
    }
    return data;
}