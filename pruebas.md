# Plan de Pruebas - Slack UTN

Este documento detalla los puntos de verificación y casos de prueba necesarios para validar el correcto funcionamiento de la aplicación **Slack UTN** (Frontend y Backend).

---

## 🛠️ Requisitos Previos antes de Iniciar
Antes de realizar las pruebas, asegúrate de tener ambos servidores corriendo de forma local:

1. **Base de Datos (MongoDB)**: Debe estar activa y accesible.
2. **Servidor Backend**:
   - Ruta: `c:\Users\nacho\Desktop\Nacho\Codigo clases utn\Back end\Trabajo Final - Slack\Backend`
   - Comando: `npm run dev`
   - Puerto esperado: `http://localhost:3000`
   - Archivo `.env` configurado con `PORT=3000` y `MODE=development`
3. **Servidor Frontend**:
   - Ruta: `c:\Users\nacho\Desktop\Nacho\Codigo clases utn\Back end\Trabajo Final - Slack\Frontend`
   - Comando: `npm run dev`
   - Puerto esperado: `http://localhost:5173` (o el asignado por Vite)
   - Archivo `.env` configurado con `VITE_API_URL=http://localhost:3000`

---

## 📋 Lista de Casos de Prueba (Checklist)

### 1. Registro, Verificación y Autenticación de Cuentas

| ID | Componente / Flujo | Acción a Realizar | Resultado Esperado | Estado |
|---|---|---|---|---|
| **TC-01** | Registro - Flujo Feliz | Registrar un nuevo usuario con datos válidos. | Se crea el usuario en la base de datos (con `email_verificado: false`) y se envía un correo de bienvenida y verificación al email ingresado. | ✅ OK |
| **TC-02** | Registro - Validaciones | Intentar registrar con: <br>• Nombre < 3 caracteres. <br>• Correo inválido (sin @ o sin dominio). <br>• Contraseña < 6 caracteres. | La API deniega el registro devolviendo código `400` y el frontend muestra el error correspondiente de forma clara. | ✅ OK |
| **TC-03** | Registro - Duplicado | Intentar registrar un email que ya está en uso. | Retorna error `400` ("El email ya está registrado") y no se crea duplicado. | ✅ OK |
| **TC-04** | Verificación de Email | Abrir el email recibido, hacer clic en el enlace/botón **"Verificar cuenta"**. | Redirige al endpoint de verificación, el backend cambia el estado en la base de datos a `email_verificado: true` y muestra un mensaje de éxito. | ✅ OK |
| **TC-05** | Login - Restricción de Verificación | Intentar loguearse con una cuenta recién creada cuyo email **no** ha sido verificado. | El login falla devolviendo error `401` ("Usuario con verificación de mail pendiente"). | ✅ OK |
| **TC-06** | Login - Credenciales Incorrectas | Intentar ingresar con contraseña incorrecta o correo no registrado. | Falla el login devolviendo error `401` ("Credenciales inválidas") o `404` ("Usuario no registrado"). | ✅ OK |
| **TC-07** | Login - Flujo Feliz | Ingresar con correo verificado y contraseña correcta. | Login exitoso, el servidor retorna un JWT (`access_token`) que se almacena en el `localStorage` del navegador, y se redirige a la pantalla `/home`. | ✅ OK |
| **TC-08** | Restablecer Contraseña - Solicitud | En la pantalla de Login, hacer clic en "¿Olvidaste tu contraseña?", ingresar el email y enviar. | Se envía un correo con un enlace temporal que contiene un token firmado. | `[ ]` |
| **TC-09** | Restablecer Contraseña - Confirmación | Abrir el enlace recibido en el correo, ingresar una nueva contraseña válida y confirmar. | La contraseña se actualiza encriptada en la base de datos y se permite iniciar sesión con la nueva clave. | `[ ]` |

---

### 2. Gestión de Espacios de Trabajo (Workspaces)

Para realizar estas pruebas, debes haber iniciado sesión exitosamente (**TC-07**).

| ID | Componente / Flujo | Acción a Realizar | Resultado Esperado | Estado |
|---|---|---|---|---|
| **TC-10** | Crear Workspace | Hacer clic en "Crear un nuevo espacio", rellenar el formulario (Nombre y Descripción) y enviar. | El espacio se crea con éxito, el usuario actual se registra automáticamente como miembro con rol de `dueño` (`owner`), y aparece en el listado izquierdo del Home. | ✅ OK |
| **TC-11** | Listado de Workspaces | Iniciar sesión con un usuario. | El menú lateral del home muestra únicamente los workspaces donde el usuario es miembro activo. | ✅ OK |
| **TC-12** | Detalle de Workspace | Hacer clic en un Workspace del listado lateral. | Se despliega un panel lateral derecho o modal con el nombre, descripción y la lista de todos los miembros activos. | ✅ OK |
| **TC-13** | Editar Workspace (Dueño/Admin) | Como `dueño` o `admin`, hacer clic en "Editar" en los detalles del Workspace, cambiar el nombre y descripción, y guardar. | Los cambios se guardan y se actualizan de forma inmediata en la interfaz. | ✅ OK |
| **TC-14** | Editar Workspace (Usuario Estándar) | Intentar editar el workspace como un miembro que posee rol de `usuario`. | La interfaz no muestra la opción de edición, y si se intenta por API, el backend responde con un error de permisos `403`. | `[ ]` |
| **TC-15** | Eliminar Workspace (Dueño) | Como `dueño`, hacer clic en el botón "Eliminar" en los detalles del Workspace y confirmar. | El espacio se elimina de forma lógica (`estado: false`), desaparece de la lista del frontend, pero permanece en la base de datos para consistencia. | ✅ OK |
| **TC-16** | Eliminar Workspace (Admin/Usuario) | Intentar eliminar el workspace con un usuario con rol de `admin` o `usuario`. | La interfaz no presenta la opción de eliminar y la API deniega la acción con código `403`. | `[ ]` |

---

### 3. Gestión de Invitaciones y Miembros del Workspace

Para estas pruebas, se requieren al menos **dos usuarios distintos registrados** en el sistema (ej. *Usuario A* y *Usuario B*).

| ID | Componente / Flujo | Acción a Realizar | Resultado Esperado | Estado |
|---|---|---|---|---|
| **TC-17** | Invitar Miembro (Dueño/Admin) | En el panel de miembros de un Workspace, hacer clic en "Invitar colaborador", ingresar el correo de un usuario existente (*Usuario B*) y seleccionar el rol (`usuario` o `admin`). | Se crea la membresía del *Usuario B* en la base de datos en estado `PENDIENTE` y se le envía un correo electrónico de invitación con enlaces para Aceptar/Rechazar. | `[ ]` |
| **TC-18** | Aceptar Invitación | *Usuario B* abre el correo recibido y hace clic en **"ACEPTAR INVITACIÓN"**. | El backend actualiza la membresía a estado `ACEPTADO`. Al iniciar sesión, el *Usuario B* ya puede ver y acceder al Workspace. | `[ ]` |
| **TC-19** | Rechazar Invitación | Repetir la invitación y hacer que el *Usuario B* presione **"RECHAZAR"** en el correo. | El backend cambia la membresía a estado `RECHAZADO`. El *Usuario B* no tendrá acceso al Workspace. | `[ ]` |
| **TC-20** | Cambiar Rol de Miembro (Dueño) | Como `dueño`, cambiar el rol de un miembro de `usuario` a `admin` (o viceversa) usando el selector en la lista de miembros. | El rol del miembro se actualiza inmediatamente en el listado y en la base de datos. | `[ ]` |
| **TC-21** | Transferir Propiedad (Dueño) | Como `dueño`, seleccionar un miembro en la lista y cambiar su rol a `dueño`. | El miembro seleccionado se convierte en el nuevo `dueño`, y el usuario original es degradado automáticamente a `admin`. | `[ ]` |
| **TC-22** | Quitar Miembro (Admin a Usuario) | Como `admin`, intentar quitar a un miembro que tiene rol de `usuario`. | El miembro es removido exitosamente y desaparece de la lista de miembros. | `[ ]` |
| **TC-23** | Quitar Miembro Restricción (Admin a Admin/Dueño) | Como `admin`, intentar remover a otro `admin` o al `dueño` del espacio. | La interfaz no debe habilitar el botón y el backend denegará la petición con error `403`. | `[ ]` |
| **TC-24** | Auto-Eliminarse (Salir del Workspace) | Un miembro con rol `usuario` o `admin` intenta salir del Workspace haciendo clic en quitarse a sí mismo. | Se procesa la salida exitosamente. El usuario ya no puede ver el Workspace en su panel. | `[ ]` |

---

## 🚪 Cierre de Sesión

| ID | Componente / Flujo | Acción a Realizar | Resultado Esperado | Estado |
|---|---|---|---|---|
| **TC-25** | Cerrar Sesión | Hacer clic en "Cerrar Sesión" en la barra superior. | El `access_token` es removido de `localStorage`, la sesión se invalida y el navegador redirige a la pantalla de `/login`. Intentar volver atrás con el navegador no debe permitir el reingreso al Home. | `[ ]` |

---

## 🐛 Bugs Encontrados y Corregidos

> Registro de bugs detectados durante la sesión de pruebas automatizadas del **18/06/2026**.

### BUG-01 — Botón "Eliminar Workspace" sin función asignada ✅ Corregido

| Campo | Detalle |
|---|---|
| **Archivo** | `Frontend/src/Screens/HomeScreen/HomeScreen.jsx` — línea 428 |
| **Severidad** | 🔴 Crítica — el botón crasheaba la aplicación |
| **Descripción** | El botón "🗑️ Eliminar" del modal de detalle de un Workspace referenciaba a `handleDeleteWorkspace`, una función que **no existe** en el componente. La función correcta es `handleDeleteClick`. Al hacer clic en el botón, React lanzaba un error en tiempo de ejecución. |
| **TC relacionado** | TC-15 — Eliminar Workspace (Dueño) |
| **Estado** | ✅ Corregido y listo para re-probar |

```diff
- <button onClick={handleDeleteWorkspace}>🗑️ Eliminar</button>
+ <button onClick={handleDeleteClick}>🗑️ Eliminar</button>
```
