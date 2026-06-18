import mongoose from 'mongoose';
import dns from 'dns';

// Fix DNS for MongoDB connection
dns.setServers(['8.8.8.8', '8.8.4.4']);

const API_URL = 'http://localhost:3000/api';
let access_token = '';
let workspace_id = '';

async function testAll() {
    console.log('--- Conectando a BD para verificar el usuario de prueba ---');
    await mongoose.connect('mongodb+srv://nachoodesimone_db_user:MNsT8dt1695lGl6Z@proyectofinal.xyhqdnl.mongodb.net/Slack');
    
    // Set email as verified
    await mongoose.connection.collection('users').updateOne(
        { email: 'prueba@example.com' },
        { $set: { email_verificado: true } }
    );
    console.log('Usuario verificado en DB.');

    console.log('--- Iniciando pruebas de API ---');

    // TC-07 Login Flujo Feliz
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'prueba@example.com', password: 'password123' })
    });
    const loginData = await loginRes.json();
    console.log('Respuesta de Login:', loginData);
    if (loginRes.ok) {
        console.log('✅ TC-07 Login exitoso.');
        access_token = loginData.payload?.token || loginData.data?.access_token || loginData.token;
        if (!access_token) {
            console.log('No se pudo encontrar el token en la respuesta.');
            process.exit(1);
        }
    } else {
        console.log('❌ TC-07 Falló el login:', loginData);
        process.exit(1);
    }

    // TC-10 Crear Workspace
    const createWsRes = await fetch(`${API_URL}/workspace`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({ nombre: 'Test Workspace', descripcion: 'Test Description' })
    });
    const createWsData = await createWsRes.json();
    if (createWsRes.ok) {
        console.log('✅ TC-10 Crear Workspace exitoso.');
        workspace_id = createWsData.payload?.workspace?._id || createWsData.data?.workspace?._id;
    } else {
        console.log('❌ TC-10 Falló crear workspace:', createWsData);
        process.exit(1);
    }

    // TC-11 Listado de Workspaces
    const listWsRes = await fetch(`${API_URL}/workspace`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    const listWsData = await listWsRes.json();
    if (listWsRes.ok) {
        console.log('✅ TC-11 Listado de Workspaces exitoso. Respuesta:', listWsData);
    } else {
        console.log('❌ TC-11 Falló listar workspaces');
    }

    // TC-12 Detalle de Workspace
    const getWsRes = await fetch(`${API_URL}/workspace/${workspace_id}`, {
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    if (getWsRes.ok) {
        console.log('✅ TC-12 Detalle de Workspace exitoso.');
    } else {
        console.log('❌ TC-12 Falló detalle workspace');
    }

    // TC-13 Editar Workspace (Dueño/Admin)
    const updateWsRes = await fetch(`${API_URL}/workspace/${workspace_id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`
        },
        body: JSON.stringify({ nombre: 'Test Workspace Modificado', descripcion: 'Test Description Modificada' })
    });
    if (updateWsRes.ok) {
        console.log('✅ TC-13 Editar Workspace exitoso.');
    } else {
        console.log('❌ TC-13 Falló editar workspace');
    }

    // TC-15 Eliminar Workspace (Dueño)
    const deleteWsRes = await fetch(`${API_URL}/workspace/${workspace_id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${access_token}` }
    });
    if (deleteWsRes.ok) {
        console.log('✅ TC-15 Eliminar Workspace exitoso.');
    } else {
        console.log('❌ TC-15 Falló eliminar workspace:', await deleteWsRes.text());
    }

    mongoose.disconnect();
}

testAll().catch(err => {
    console.error('Error in tests:', err);
    mongoose.disconnect();
});
