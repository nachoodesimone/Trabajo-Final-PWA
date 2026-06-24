# Chat UTN - Frontend (React SPA)

Aplicación web de una sola página (SPA) construida con **React, Vite, React Router v7** y configurada como una Progressive Web App (PWA). Representa la interfaz de usuario basada en la arquitectura de Slack, totalmente conectada a la API REST del backend.

---

## Estructura del Proyecto (Frontend)

```
Frontend/
  - public/               # Activos estáticos (favicon, iconos)
  - src/
    - assets/           # Imágenes y hojas de estilo locales
    - hooks/            # Custom hooks de React (useForm)
    - services/         # Servicios de conexión con la API (Fetch nativo)
    - Screens/          # Pantallas de la aplicación (Home, Login, Register, ResetPassword)
    - App.jsx           # Enrutamiento de la aplicación
    - main.jsx          # Punto de entrada de la aplicación React
  - .env                  # Variables de entorno locales (URL de la API)
  - package.json          # Dependencias y scripts del frontend
  - vite.config.js        # Configuración de Vite
```

---

## Instrucciones de Instalación y Ejecución

### Requisitos Previos
- Node.js (v18 o superior)
- Servidor Backend corriendo (por defecto en `http://localhost:3000`)

### Pasos
1. Navega al directorio del frontend:
   ```bash
   cd Frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de `Frontend/` y configura la variable que apunta a la URL de la API del Backend:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Inicia la aplicación en modo desarrollo:
   ```bash
   npm run dev
   ```

---

## Características de la UI

- **Autenticación Completa**: Pantallas dedicadas para registrarse, iniciar sesión y solicitar la restauración de contraseña por email.
- **Gestión de Espacios de Trabajo (Workspaces)**:
  - Crear nuevos workspaces a través de modales.
  - Listar los workspaces activos de los cuales el usuario autenticado es miembro.
  - Modificar información (nombre y descripción) del workspace.
  - Eliminar workspaces de manera lógica.
- **Gestión de Colaboradores / Miembros**:
  - Panel integrado para invitar nuevos usuarios ingresando su correo electrónico.
  - Gestión de roles de miembros (dueño, administrador, usuario).
  - Expulsión de miembros del workspace o auto-eliminación (abandonar el espacio).
- **Diseño Responsivo**: Adaptado para pantallas desde 320px hasta más de 2000px de resolución.
