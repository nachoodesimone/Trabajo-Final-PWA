# Contexto del Proyecto Base - Slack UTN

Este documento detalla la arquitectura de software, el stack tecnológico, las herramientas y las prácticas de código del proyecto **Slack UTN**, diseñado como plantilla base modular y escalable para aplicaciones de chat en tiempo real.

---

## 1. Stack Tecnológico

El proyecto está construido bajo una arquitectura desacoplada (Frontend/Backend) con las siguientes tecnologías principales:

### Backend (API REST)
- **Node.js & Express**: Servidor web y enrutamiento modular.
- **MongoDB & Mongoose**: Base de datos de documentos con modelado de relaciones mediante Populate de Mongoose.
- **jsonwebtoken (JWT)**: Generación y verificación de tokens de sesión con expiración definida.
- **bcrypt**: Encriptación unidireccional de contraseñas de usuarios.
- **Nodemailer**: Motor de envío de correos SMTP (verificación de cuenta y restablecimiento de contraseña).
- **CORS & Dotenv**: Configuración de seguridad cruzada e inyección dinámica de variables de entorno.

### Frontend (SPA)
- **React (Vite)**: Biblioteca de componentes reactivos y entorno de compilación optimizado.
- **React Router v7**: Enrutador declarativo para Single Page Applications.
- **Fetch API nativo**: Consumo de endpoints de forma nativa sin dependencias pesadas de terceros.
- **CSS Vanilla Moderno**: Estilos personalizados adaptables y responsivos (desde 320px hasta 2000px).

---

## 2. Arquitectura de 4 Capas (C CSR)

Para lograr un código desacoplado y fácil de mantener, la API del Backend implementa estrictamente una arquitectura en capas:

```
[Cliente HTTP] 
      │
      ▼
   Routes ────────► Mapea rutas URL y ejecuta middlewares (CORS, Auth, Roles).
      │
      ▼
 Controllers ─────► Extrae parámetros de Express (params, query, body, user).
      │             Llama al servicio y retorna respuestas HTTP. Cero lógica de negocio.
      ▼
  Services ───────► Contiene toda la lógica de negocio y validaciones.
      │             No conoce Express ni objetos req/res. Llama a los repositories.
      ▼
Repositories ─────► Capa exclusiva de acceso a datos.
      │             Realiza queries puras a MongoDB (find, create, update, delete).
      ▼
  [Database]
```

### Reglas Clave de Diseño
- **Middleware de Errores**: Los controladores capturan cualquier error mediante try/catch y lo delegan usando `next(error)` al middleware centralizado `errorHandler.middleware.js`, evitando redundancia en el formateo de respuestas de error.
- **Middleware de Roles (`workspace.middleware.js`)**: Valida que el usuario tenga el rol correcto (`dueño`, `admin`, `usuario`) antes de acceder a rutas sensibles del espacio de trabajo.
- **Independencia del Servicio**: La capa `services` puede testearse de manera unitaria fácilmente ya que no recibe ni depende de llamadas de Express (`req`, `res`).

---

## 3. Estructura de Directorios

### Backend
- `/src/config`: Configuraciones de base de datos (`mongodb.config.js`), SMTP (`mailer.config.js`) y del entorno global (`environment.config.js`).
- `/src/constants`: Constantes compartidas del sistema como roles de miembros y estados de invitaciones.
- `/src/controllers`: Manejadores HTTP que orquestan las peticiones.
- `/src/helpers`: Clases auxiliares como el constructor `ServerError`.
- `/src/middlewares`: Filtros de Express para JWT (`auth.middleware.js`), Roles (`workspace.middleware.js`) y errores globales (`errorHandler.middleware.js`).
- `/src/models`: Definición de esquemas de Mongoose (`User`, `Workspace`, `WorkspaceMembers`).
- `/src/repositories`: Consultas específicas a la base de datos.
- `/src/routes`: Definición modular de endpoints de autenticación y espacios de trabajo.
- `/src/services`: Toda la lógica operativa (registro, validación, mailer, membresías).

### Frontend
- `/src/assets`: Activos y logos en SVG.
- `/src/hooks`: Funciones personalizadas compartidas (`useForm`).
- `/src/services`: Clientes Fetch integrados con el backend (`authService.js`, `workspaceService.js`).
- `/src/Screens`: Vistas y modales organizados por módulo (`LoginScreen`, `RegisterScreen`, `ResetPasswordScreen`, `HomeScreen`).

---

## 4. Buenas Prácticas Implementadas
- **Eliminación Lógica (Soft Delete)**: Los workspaces no se borran físicamente de la base de datos, sino que actualizan su propiedad `estado: false` para auditoría y consistencia relacional.
- **Flujo de Invitación por Estados**: Un usuario invitado a un Workspace no accede inmediatamente; se le crea una membresía en estado `PENDIENTE` que expira en 30 días. El usuario confirma su participación haciendo clic en un enlace de decisión firmado con JWT.
- **Persistencia de Sesión Segura**: Almacenamiento seguro del token JWT en el cliente y envío en cada petición a través del header `Authorization: Bearer <token>`.
