import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { 
    getAllWorkspaces, 
    createWorkspace, 
    getWorkspaceById, 
    updateWorkspace, 
    deleteWorkspace, 
    listMembers, 
    inviteMember, 
    changeMemberRole, 
    removeMember 
} from '../../services/workspaceService';

export const HomeScreen = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [selectedWorkspace, setSelectedWorkspace] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Form states
    const [newWorkspaceName, setNewWorkspaceName] = useState('');
    const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('usuario');
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');

    // Current User decoding
    const token = localStorage.getItem('access_token');
    let currentUser = null;
    if (token) {
        try {
            currentUser = JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            console.error("Error decoding token", e);
        }
    }

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            fetchWorkspaces();
        }
    }, [token, navigate]);

    const fetchWorkspaces = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAllWorkspaces();
            if (res.ok) {
                // workspaces comes as member relations
                setWorkspaces(res.data.workspaces || []);
            }
        } catch (err) {
            setError(err.message || "Error al cargar los espacios de trabajo");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectWorkspace = async (workspaceId) => {
        setError(null);
        setSuccess(null);
        try {
            const res = await getWorkspaceById(workspaceId);
            if (res.ok) {
                setSelectedWorkspace(res.data.workspace);
                setEditName(res.data.workspace.nombre);
                setEditDesc(res.data.workspace.descripcion || '');
                
                // Fetch members
                const mRes = await listMembers(workspaceId);
                if (mRes.ok) {
                    setMembers(mRes.data.members || []);
                }
                setShowDetailModal(true);
            }
        } catch (err) {
            setError(err.message || "Error al abrir el espacio de trabajo");
        }
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const res = await createWorkspace(newWorkspaceName, newWorkspaceDesc);
            if (res.ok) {
                setSuccess("Espacio de trabajo creado con éxito");
                setNewWorkspaceName('');
                setNewWorkspaceDesc('');
                setShowCreateModal(false);
                fetchWorkspaces();
            }
        } catch (err) {
            setError(err.message || "Error al crear el espacio de trabajo");
        }
    };

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const res = await inviteMember(selectedWorkspace._id, inviteEmail, inviteRole);
            if (res.ok) {
                setSuccess("Invitación enviada por correo con éxito");
                setInviteEmail('');
                setInviteRole('usuario');
                setShowInviteModal(false);
            }
        } catch (err) {
            setError(err.message || "Error al enviar la invitación");
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            const res = await updateWorkspace(selectedWorkspace._id, editName, editDesc);
            if (res.ok) {
                setSuccess("Espacio de trabajo actualizado con éxito");
                setSelectedWorkspace(res.data.workspace);
                setShowEditModal(false);
                fetchWorkspaces();
            }
        } catch (err) {
            setError(err.message || "Error al actualizar el espacio de trabajo");
        }
    };

    const handleDeleteClick = async () => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este espacio de trabajo? Esta acción no se puede deshacer.")) {
            setError(null);
            setSuccess(null);
            try {
                const res = await deleteWorkspace(selectedWorkspace._id);
                if (res.ok) {
                    setSuccess("Espacio de trabajo eliminado con éxito");
                    setShowDetailModal(false);
                    setSelectedWorkspace(null);
                    fetchWorkspaces();
                }
            } catch (err) {
                setError(err.message || "Error al eliminar el espacio de trabajo");
            }
        }
    };

    const handleRoleChange = async (memberId, newRole) => {
        setError(null);
        setSuccess(null);
        try {
            const res = await changeMemberRole(selectedWorkspace._id, memberId, newRole);
            if (res.ok) {
                setSuccess("Rol del miembro actualizado con éxito");
                // Refresh members
                const mRes = await listMembers(selectedWorkspace._id);
                if (mRes.ok) {
                    setMembers(mRes.data.members || []);
                }
            }
        } catch (err) {
            setError(err.message || "No tienes permisos para realizar esta acción.");
        }
    };

    const handleKickMember = async (memberId) => {
        if (window.confirm("¿Deseas quitar a este miembro del espacio de trabajo?")) {
            setError(null);
            setSuccess(null);
            try {
                const res = await removeMember(selectedWorkspace._id, memberId);
                if (res.ok) {
                    setSuccess("Miembro removido con éxito");
                    // Refresh members
                    const mRes = await listMembers(selectedWorkspace._id);
                    if (mRes.ok) {
                        setMembers(mRes.data.members || []);
                    }
                }
            } catch (err) {
                setError(err.message || "No tienes permisos para remover a este miembro.");
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    const getWorkspaceInitials = (name) => {
        if (!name) return "SL";
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };

    return (
        <div style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
            
            {/* Top Navbar */}
            <nav className="slack-top-navbar">
                <div className="slack-logo-container" onClick={() => fetchWorkspaces()}>
                    <svg style={{height: '24px'}} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 50a7.5 7.5 0 1 1 7.5-7.5v7.5zm0 5a7.5 7.5 0 1 1 7.5 7.5H15zm10-12.5A7.5 7.5 0 0 1 32.5 35h15v15h-15zm0 15a7.5 7.5 0 0 1 7.5-7.5h7.5v15h-7.5zm25-32.5a7.5 7.5 0 1 1 7.5 7.5V25zm-5 10a7.5 7.5 0 0 1 7.5-7.5h15v15h-15zm5 25a7.5 7.5 0 1 1 7.5-7.5v7.5zm-5 10a7.5 7.5 0 0 1 7.5-7.5h7.5v15h-7.5zm25-17.5a7.5 7.5 0 1 1-7.5 7.5v-7.5zm0-5a7.5 7.5 0 1 1-7.5-7.5h7.5zm-10 12.5a7.5 7.5 0 0 1-7.5 7.5h-15v-15h15zm0-15a7.5 7.5 0 0 1-7.5 7.5h-7.5v-15h7.5zm-25 32.5a7.5 7.5 0 1 1-7.5-7.5v7.5zm5-10a7.5 7.5 0 0 1-7.5 7.5h-15v-15h15zm-5-25a7.5 7.5 0 1 1-7.5 7.5v-7.5zm5-10a7.5 7.5 0 0 1-7.5 7.5h-7.5v-15h7.5z" fill="#ffffff"/>
                    </svg>
                    <span style={{fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px'}}>slack</span>
                </div>
                <ul className="slack-nav-links">
                    <li>Funciones</li>
                    <li>Soluciones</li>
                    <li>Empresa</li>
                    <li>Recursos</li>
                    <li>Precios</li>
                </ul>
                <div className="slack-top-actions">
                    <button className="btn-outline-white" onClick={handleLogout}>Cerrar Sesión</button>
                    <button className="btn-white-filled" onClick={() => setShowCreateModal(true)}>Crear un nuevo espacio</button>
                </div>
            </nav>

            {/* Hero Purple Banner */}
            <header className="slack-hero-banner">
                <h1 className="slack-hero-title">¡Hola de nuevo{currentUser ? `, ${currentUser.nombre}` : ''}! 👋</h1>
                <p className="slack-hero-subtitle">Elige un espacio de trabajo para comenzar a colaborar.</p>
            </header>

            {/* Main Area Content */}
            <main style={{flex: 1, padding: '40px 0'}}>
                
                {/* Alert Notifications */}
                <div style={{maxWidth: '1200px', margin: '0 auto 20px auto', padding: '0 20px'}}>
                    {error && (
                        <div className="alert alert-danger">
                            <span>⚠️</span> {error}
                        </div>
                    )}
                    {success && (
                        <div className="alert alert-success">
                            <span>✅</span> {success}
                        </div>
                    )}
                </div>

                <div className="workspace-grid-container">
                    
                    {/* Left Column: Workspaces List */}
                    <section className="workspace-card-box">
                        <div className="workspace-box-header">
                            <span className="workspace-tab-title">Espacios de trabajo</span>
                        </div>

                        {loading && workspaces.length === 0 ? (
                            <p style={{padding: '20px', textAlign: 'center'}}>Cargando espacios de trabajo...</p>
                        ) : workspaces.length === 0 ? (
                            <div style={{padding: '40px 20px', textAlign: 'center', color: '#666'}}>
                                <p style={{fontSize: '18px', fontWeight: '600', marginBottom: '8px'}}>Aún no perteneces a ningún espacio de trabajo</p>
                                <p style={{fontSize: '14px'}}>Crea uno nuevo con el botón superior o pídele a un administrador que te invite.</p>
                            </div>
                        ) : (
                            <div className="workspace-list">
                                {workspaces.map((ws) => (
                                    <div 
                                        key={ws.workspace_id} 
                                        className="workspace-item"
                                        onClick={() => handleSelectWorkspace(ws.workspace_id)}
                                    >
                                        <div className="workspace-item-left">
                                            <div className="workspace-avatar">
                                                {getWorkspaceInitials(ws.workspace_nombre)}
                                            </div>
                                            <div className="workspace-item-details">
                                                <h3>{ws.workspace_nombre}</h3>
                                                <p>Rol: <strong style={{textTransform: 'uppercase'}}>{ws.member_rol}</strong> • Unido el {new Date(ws.member_fecha_union).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <span className="workspace-item-arrow">→</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="workspace-create-inline">
                            <span className="workspace-create-link" onClick={() => setShowCreateModal(true)}>
                                Crear un nuevo espacio de trabajo
                            </span>
                            <p className="workspace-create-help">
                                ¿No encuentras tu espacio de trabajo? <span>Prueba con otro correo electrónico</span>
                            </p>
                        </div>
                    </section>

                    {/* Right Column: Sidebar Cards */}
                    <aside className="slack-sidebar-box">
                        
                        <div className="sidebar-card">
                            <h3 className="sidebar-card-title">
                                <span>👥</span> ¿Quieres invitar a otros?
                            </h3>
                            <p className="sidebar-card-text">
                                Slack es mejor en equipo. Invita a tus compañeros a tus espacios activos para chatear.
                            </p>
                            <button 
                                className="btn-sidebar-action"
                                onClick={() => {
                                    if (selectedWorkspace) {
                                        setShowInviteModal(true);
                                    } else {
                                        alert("Por favor selecciona un espacio de trabajo de la lista primero.");
                                    }
                                }}
                            >
                                👤 Invita compañeros de equipo
                            </button>
                            <div className="sidebar-card-icon">✉️</div>
                        </div>

                        <div className="sidebar-card">
                            <h3 className="sidebar-card-title">
                                <span>🎙️</span> Háblalo en tiempo real
                            </h3>
                            <p className="sidebar-card-text">
                                Conéctate al instante a través de audio o vídeo con las juntas de Slack.
                            </p>
                            <button className="btn-sidebar-action" onClick={() => alert("Función de junta en desarrollo.")}>
                                Iniciar una junta
                            </button>
                            <div className="sidebar-card-icon">🎧</div>
                        </div>

                    </aside>
                </div>

                {/* Bottom Discover section */}
                <section className="slack-discover-section">
                    <h3 className="discover-title">
                        <span>🧭</span> Descubre más
                    </h3>
                    <div className="discover-grid">
                        <div className="discover-card">
                            <h4>Descarga Slack</h4>
                            <p>Mantente al día en tu ordenador con notificaciones de escritorio.</p>
                            <a href="#download" onClick={(e) => { e.preventDefault(); alert("Descargando..."); }}>Descargar aplicación</a>
                        </div>
                        <div className="discover-card">
                            <h4>Conecta tus aplicaciones</h4>
                            <p>Elige entre más de 2600 herramientas y servicios en la App Directory.</p>
                            <a href="#apps" onClick={(e) => { e.preventDefault(); alert("Abriendo App Directory..."); }}>Explorar aplicaciones</a>
                        </div>
                        <div className="discover-card">
                            <h4>Novedades de Slack</h4>
                            <p>Descubre ahora las nuevas funciones de inteligencia artificial y automatización.</p>
                            <a href="#news" onClick={(e) => { e.preventDefault(); alert("Cargando novedades..."); }}>Más información</a>
                        </div>
                    </div>
                </section>

            </main>

            {/* MODAL 1: Crear Workspace */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
                        <h3 className="modal-title">Crear Espacio de Trabajo</h3>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="ws-name">Nombre</label>
                                <input 
                                    className="form-input"
                                    id="ws-name"
                                    type="text" 
                                    required
                                    placeholder="Ej. FrontEnd-Dev, Proyecto UTN"
                                    value={newWorkspaceName}
                                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="ws-desc">Descripción (Opcional)</label>
                                <input 
                                    className="form-input"
                                    id="ws-desc"
                                    type="text" 
                                    placeholder="Breve descripción del propósito"
                                    value={newWorkspaceDesc}
                                    onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary" type="submit">Crear espacio</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Detalle de Workspace & Gestión de Miembros */}
            {showDetailModal && selectedWorkspace && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="modal-content" style={{maxWidth: '650px'}} onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
                        
                        <div className="workspace-detail-panel">
                            
                            <div className="panel-header-section">
                                <div className="panel-title">
                                    <h2>{selectedWorkspace.nombre}</h2>
                                    <p>{selectedWorkspace.descripcion || "Sin descripción disponible"}</p>
                                </div>
                                <div className="panel-actions">
                                    <button className="btn-action-icon" onClick={() => setShowEditModal(true)}>
                                        ✏️ Editar
                                    </button>
                                    <button className="btn-action-icon btn-delete-workspace" onClick={handleDeleteClick}>
                                        🗑️ Eliminar
                                    </button>
                                </div>
                            </div>

                            <div>
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                                    <h3 className="members-section-title">Miembros activos</h3>
                                    <button 
                                        className="btn-sidebar-action" 
                                        style={{padding: '6px 12px', fontSize: '12px'}}
                                        onClick={() => setShowInviteModal(true)}
                                    >
                                        ➕ Invitar miembro
                                    </button>
                                </div>

                                <div className="member-list-items">
                                    {members.length === 0 ? (
                                        <p style={{fontSize: '14px', color: '#666'}}>No hay otros miembros activos.</p>
                                    ) : (
                                        members.map((m) => {
                                            const isOwner = m.member_rol === 'dueño';
                                            return (
                                                <div key={m.user_id} className="member-list-item">
                                                    <div className="member-user-info">
                                                        <span className="member-name">{m.user_nombre}</span>
                                                        <div className="member-email-role">
                                                            <span>{m.user_email}</span>
                                                            <span className={`badge-role badge-${m.member_rol === 'dueño' ? 'owner' : m.member_rol}`}>
                                                                {m.member_rol}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="member-actions">
                                                        {/* Solo el owner puede cambiar roles */}
                                                        {!isOwner && (
                                                            <select 
                                                                className="select-role" 
                                                                value={m.member_rol}
                                                                onChange={(e) => handleRoleChange(m._id, e.target.value)}
                                                            >
                                                                <option value="usuario">Usuario</option>
                                                                <option value="admin">Admin</option>
                                                                <option value="dueño">Dueño (Transferir)</option>
                                                            </select>
                                                        )}
                                                        {!isOwner && (
                                                            <button 
                                                                className="btn-remove-member"
                                                                title="Quitar del espacio"
                                                                onClick={() => handleKickMember(m._id)}
                                                            >
                                                                🗑️
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 3: Invitar Miembro */}
            {showInviteModal && selectedWorkspace && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowInviteModal(false)}>×</button>
                        <h3 className="modal-title">Invitar Colaborador</h3>
                        <p style={{fontSize: '14px', color: '#666', marginBottom: '20px'}}>
                            Se enviará un correo electrónico de invitación con un token seguro para unirse a <strong>{selectedWorkspace.nombre}</strong>.
                        </p>
                        <form onSubmit={handleInviteSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="inv-email">Correo Electrónico</label>
                                <input 
                                    className="form-input"
                                    id="inv-email"
                                    type="email" 
                                    required
                                    placeholder="compañero@trabajo.com"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="inv-role">Rol asignado</label>
                                <select 
                                    className="form-input" 
                                    id="inv-role"
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                >
                                    <option value="usuario">Usuario (Colaborador estándar)</option>
                                    <option value="admin">Administrador (Puede editar info e invitar)</option>
                                </select>
                            </div>
                            <button className="btn-primary" type="submit">Enviar invitación</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: Editar Workspace */}
            {showEditModal && selectedWorkspace && (
                <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        <h3 className="modal-title">Editar Espacio de Trabajo</h3>
                        <form onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-name">Nombre</label>
                                <input 
                                    className="form-input"
                                    id="edit-name"
                                    type="text" 
                                    required
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label" htmlFor="edit-desc">Descripción</label>
                                <input 
                                    className="form-input"
                                    id="edit-desc"
                                    type="text" 
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                />
                            </div>
                            <button className="btn-primary" type="submit">Guardar cambios</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};
export default HomeScreen;
