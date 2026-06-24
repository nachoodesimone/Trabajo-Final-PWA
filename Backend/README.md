# Chat UTN - Backend (API REST)

API construida con Node.js y Express que gestiona la persistencia de datos en MongoDB, la autenticación de usuarios y la gestión de espacios de trabajo (workspaces) con roles.

---

## Estructura del Proyecto (Backend)

```
Backend/
  - api/                  # Archivos de configuración de despliegue en Vercel
  - src/
    - config/           # Configuraciones de base de datos y entorno
    - constants/        # Constantes del sistema (roles, códigos de estado)
    - controllers/      # Controladores de req/res sin lógica de negocio
    - helpers/          # Funciones auxiliares (ServerError centralizado)
    - middlewares/      # Middlewares (autenticación JWT, validación de roles, manejador de errores)
    - models/           # Modelos de Mongoose (User, Workspace, WorkspaceMembers)
    - repositories/     # Capa de acceso a datos (queries puras a MongoDB)
    - services/         # Capa de lógica de negocio y validaciones
    - routes/           # Definición de rutas y endpoints
    - main.js           # Punto de entrada de la aplicación Express
  - .env                  # Variables de entorno locales
  - package.json          # Dependencias y scripts del backend
  - vercel.json           # Configuración para despliegue en Vercel
```

---

## Instrucciones de Instalación y Ejecución

### Requisitos Previos
- Node.js (v18 o superior)
- Servidor MongoDB (local o en la nube mediante MongoDB Atlas)
- Cuenta SMTP o Gmail configurada para el envío de correos (Nodemailer)

### Pasos
1. Navega al directorio del backend:
   ```bash
   cd Backend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` en la raíz de `Backend/` basándote en las variables de entorno necesarias:
   ```env
   PORT=3000
   MONGO_DB_CONNECTION_STRING=mongodb://localhost:27017
   MONGO_DB_NAME=slack-clone
   JWT_SECRET=tu_secreto_super_seguro
   GMAIL_USERNAME=tu_correo_gmail@gmail.com
   GMAIL_PASSWORD=tu_contraseña_de_aplicación_gmail
   URL_BACKEND=http://localhost:3000
   URL_FRONTEND=http://localhost:5173
   MODE=development
   ```
4. Inicia el servidor en modo desarrollo:
   ```bash
   npm run dev
   ```

---

## Documentación de Endpoints (Backend)

Todos los endpoints que no pertenecen a la sección de Autenticación requieren el envío del header:
`Authorization: Bearer <access_token>`

### 1. Autenticación (/api/auth)

#### Registrar Usuario
- **Endpoint**: `POST /api/auth/register`
- **Body**:
  ```json
  {
    "name": "Juan Perez",
    "email": "juan@example.com",
    "password": "mi_password_seguro"
  }
  ```
- **Respuesta Exitosa (201)**:
  ```json
  {
    "ok": true,
    "status": 201,
    "message": "Usuario registrado con éxito",
    "data": {
      "user": {
        "id": "60d0fe4f5311236168a109ca",
        "name": "Juan Perez",
        "email": "juan@example.com"
      }
    }
  }
  ```

#### Verificar Email
- **Endpoint**: `GET /api/auth/verify-email?verification_token=<token>`
- **Query Params**: `verification_token` (token JWT enviado al email del usuario)
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Email verificado correctamente. Ya puedes usar tu cuenta"
  }
  ```

#### Iniciar Sesión (Login)
- **Endpoint**: `POST /api/auth/login`
- **Body**:
  ```json
  {
    "email": "juan@example.com",
    "password": "mi_password_seguro"
  }
  ```
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Usuario autentificado exitosamente",
    "data": {
      "access_token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

#### Solicitar Recuperación de Contraseña
- **Endpoint**: `POST /api/auth/reset-password-request`
- **Body**:
  ```json
  {
    "email": "juan@example.com"
  }
  ```
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña"
  }
  ```

#### Restablecer Contraseña
- **Endpoint**: `POST /api/auth/reset-password`
- **Headers**: `Authorization: Bearer <reset_token>`
- **Body**:
  ```json
  {
    "newPassword": "nuevo_password_123"
  }
  ```
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Contraseña restablecida exitosamente"
  }
  ```

---

### 2. Espacios de Trabajo (/api/workspace)

#### Crear Espacio de Trabajo
- **Endpoint**: `POST /api/workspace`
- **Body**:
  ```json
  {
    "nombre": "Mi Workspace de UTN",
    "descripcion": "Workspace para programar en grupo"
  }
  ```
- **Respuesta Exitosa (201)**:
  ```json
  {
    "ok": true,
    "message": "Espacio de trabajo creado con éxito",
    "data": {
      "workspace": {
        "_id": "60d0fe4f5311236168a109cb",
        "nombre": "Mi Workspace de UTN",
        "descripcion": "Workspace para programar en grupo",
        "dueño": "60d0fe4f5311236168a109ca",
        "estado": true,
        "fecha_creacion": "2026-06-18T00:00:00.000Z"
      }
    }
  }
  ```

#### Listar Espacios de Trabajo del Usuario
- **Endpoint**: `GET /api/workspace`
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "message": "Espacios de trabajo obtenidos",
    "data": {
      "workspaces": [
        {
          "member_id": "60d0fe4f5311236168a109cc",
          "member_rol": "dueño",
          "member_fecha_union": "2026-06-18T00:00:00.000Z",
          "workspace_id": "60d0fe4f5311236168a109cb",
          "workspace_nombre": "Mi Workspace de UTN",
          "workspace_descripcion": "Workspace para programar en grupo"
        }
      ]
    }
  }
  ```

#### Ver Detalle de Espacio de Trabajo
- **Endpoint**: `GET /api/workspace/:workspace_id`
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "message": "Detalle del espacio de trabajo obtenido",
    "data": {
      "workspace": {
        "_id": "60d0fe4f5311236168a109cb",
        "nombre": "Mi Workspace de UTN",
        "descripcion": "Workspace para programar en grupo",
        "dueño": "60d0fe4f5311236168a109ca",
        "estado": true,
        "fecha_creacion": "2026-06-18T00:00:00.000Z"
      }
    }
  }
  ```

#### Actualizar Espacio de Trabajo
- **Endpoint**: `PUT /api/workspace/:workspace_id`
- **Permisos**: Requiere rol dueño o admin.
- **Body**:
  ```json
  {
    "nombre": "Nombre Actualizado",
    "descripcion": "Nueva descripción"
  }
  ```
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Espacio de trabajo actualizado exitosamente",
    "data": {
      "workspace": {
        "_id": "60d0fe4f5311236168a109cb",
        "nombre": "Nombre Actualizado",
        "descripcion": "Nueva descripción",
        "dueño": "60d0fe4f5311236168a109ca",
        "estado": true
      }
    }
  }
  ```

#### Eliminar Espacio de Trabajo (Eliminación Lógica)
- **Endpoint**: `DELETE /api/workspace/:workspace_id`
- **Permisos**: Requiere rol dueño.
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Espacio de trabajo eliminado exitosamente",
    "data": {
      "workspace": {
        "_id": "60d0fe4f5311236168a109cb",
        "nombre": "Nombre Actualizado",
        "estado": false
      }
    }
  }
  ```

---

### 3. Miembros del Espacio de Trabajo (/api/workspace/:workspace_id/members)

#### Invitar Miembro
- **Endpoint**: `POST /api/workspace/:workspace_id/members`
- **Permisos**: Requiere rol dueño o admin.
- **Body**:
  ```json
  {
    "email": "miembro@example.com",
    "role": "usuario"
  }
  ```
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "message": "Invitación enviada con éxito",
    "data": {
      "member": {
        "_id": "60d0fe4f5311236168a109cd",
        "fk_workspace_id": "60d0fe4f5311236168a109cb",
        "fk_user_id": "60d0fe4f5311236168a109ce",
        "rol": "usuario",
        "estatus_invitacion": "PENDIENTE",
        "fecha_expiracion_invitacion": "2026-07-18T00:00:00.000Z",
        "fecha_creacion": "2026-06-18T00:00:00.000Z"
      }
    }
  }
  ```

#### Procesar Decisión de Invitación
- **Endpoint**: `GET /api/workspace/:workspace_id/members/:decision`
- **Query Params**: `invitation_token` (token JWT de la invitación)
- **URL Params**:
  - `workspace_id`: ID del espacio de trabajo
  - `decision`: "ACEPTADO" o "RECHAZADO"
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Decision de ACEPTADO tomada con exito"
  }
  ```

#### Listar Miembros del Espacio de Trabajo
- **Endpoint**: `GET /api/workspace/:workspace_id/members`
- **Permisos**: Requiere ser miembro activo ("ACEPTADO").
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "message": "Miembros del espacio de trabajo obtenidos con éxito",
    "data": {
      "members": [
        {
          "user_id": "60d0fe4f5311236168a109ce",
          "member_fk_workspace_id": "60d0fe4f5311236168a109cb",
          "member_rol": "usuario",
          "member_fecha_creacion": "2026-06-18T00:00:00.000Z",
          "user_nombre": "Miembro Test",
          "user_email": "miembro@example.com"
        }
      ]
    }
  }
  ```

#### Cambiar Rol de un Miembro
- **Endpoint**: `PUT /api/workspace/:workspace_id/members/:member_id`
- **Permisos**: Requiere rol dueño.
- **Body**:
  ```json
  {
    "rol": "admin"
  }
  ```
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "message": "Rol del miembro actualizado con éxito",
    "data": {
      "member": {
        "_id": "60d0fe4f5311236168a109cd",
        "fk_workspace_id": "60d0fe4f5311236168a109cb",
        "fk_user_id": "60d0fe4f5311236168a109ce",
        "rol": "admin"
      }
    }
  }
  ```

#### Eliminar Miembro / Salir del Espacio de Trabajo
- **Endpoint**: `DELETE /api/workspace/:workspace_id/members/:member_id`
- **Permisos**: Requiere ser dueño o admin, o que el propio miembro decida salirse.
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "message": "Miembro removido exitosamente"
  }
  ```

---

### 4. Perfil (/api/profile)

#### Obtener Perfil Autenticado
- **Endpoint**: `GET /api/profile`
- **Respuesta Exitosa (200)**:
  ```json
  {
    "ok": true,
    "status": 200,
    "message": "Estas autenticado"
  }
  ```
