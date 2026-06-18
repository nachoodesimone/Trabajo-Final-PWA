const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
}

export async function createWorkspace(nombre, descripcion) {
    const response = await fetch(`${API_URL}/api/workspace`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ nombre, descripcion })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al crear el espacio de trabajo");
    }
    return data;
}

export async function getAllWorkspaces() {
    const response = await fetch(`${API_URL}/api/workspace`, {
        method: 'GET',
        headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al obtener los espacios de trabajo");
    }
    return data;
}

export async function getWorkspaceById(workspace_id) {
    const response = await fetch(`${API_URL}/api/workspace/${workspace_id}`, {
        method: 'GET',
        headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al obtener el detalle del espacio de trabajo");
    }
    return data;
}

export async function updateWorkspace(workspace_id, nombre, descripcion) {
    const response = await fetch(`${API_URL}/api/workspace/${workspace_id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ nombre, descripcion })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al actualizar el espacio de trabajo");
    }
    return data;
}

export async function deleteWorkspace(workspace_id) {
    const response = await fetch(`${API_URL}/api/workspace/${workspace_id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al eliminar el espacio de trabajo");
    }
    return data;
}

// MIEMBROS DE WORKSPACE

export async function inviteMember(workspace_id, email, role) {
    const response = await fetch(`${API_URL}/api/workspace/${workspace_id}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, role })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al invitar al miembro");
    }
    return data;
}

export async function listMembers(workspace_id) {
    const response = await fetch(`${API_URL}/api/workspace/${workspace_id}/members`, {
        method: 'GET',
        headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al obtener la lista de miembros");
    }
    return data;
}

export async function changeMemberRole(workspace_id, member_id, role) {
    const response = await fetch(`${API_URL}/api/workspace/${workspace_id}/members/${member_id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ rol: role })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al cambiar el rol del miembro");
    }
    return data;
}

export async function removeMember(workspace_id, member_id) {
    const response = await fetch(`${API_URL}/api/workspace/${workspace_id}/members/${member_id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al remover al miembro");
    }
    return data;
}

export async function processInvitation(workspace_id, decision, token) {
    const response = await fetch(`${API_URL}/api/workspace/${workspace_id}/members/${decision}?invitation_token=${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || "Error al procesar la invitación");
    }
    return data;
}
