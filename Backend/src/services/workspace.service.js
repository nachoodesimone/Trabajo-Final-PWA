import workspaceRepository from "../repositories/workspace.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import ServerError from "../helpers/serverError.helper.js";

class WorkspaceService {
    async createWorkspace({ nombre, descripcion, user_id }) {
        if (!nombre || nombre.trim() === '') {
            throw new ServerError("El nombre del espacio de trabajo es obligatorio", 400);
        }

        // Crea el espacio de trabajo con dueño
        const newWorkspace = await workspaceRepository.create(
            nombre, 
            descripcion || '',
            user_id
        );

        // Creamos la membresia del dueño
        await workspaceMemberRepository.create(
            user_id, 
            newWorkspace._id, 
            MEMBER_WORKSPACE_ROLES.OWNER,
            MEMBER_INVITATION_STATUS.ACCEPTED,
            null
        );

        return newWorkspace;
    }

    async getAllWorkspacesByUser(user_id) {
        return await workspaceMemberRepository.getByUserId(user_id);
    }

    async getWorkspaceById(workspace_id) {
        const workspace = await workspaceRepository.getById(workspace_id);
        if (!workspace || !workspace.estado) {
            throw new ServerError("No se encontro el espacio de trabajo", 404);
        }
        return workspace;
    }

    async updateWorkspace(workspace_id, { nombre, descripcion }) {
        if (!nombre && !descripcion) {
            throw new ServerError("Debes enviar al menos un campo para actualizar", 400);
        }

        const updated_info = {};

        if (nombre) {
            if (nombre.trim().length < 2) {
                throw new ServerError("El nombre debe tener al menos 2 caracteres", 400);
            }
            updated_info.nombre = nombre;
        }

        if (descripcion !== undefined) {
            updated_info.descripcion = descripcion;
        }

        const workspace = await workspaceRepository.getById(workspace_id);
        if (!workspace || !workspace.estado) {
            throw new ServerError("No se encontro el espacio de trabajo", 404);
        }

        await workspaceRepository.updateById(workspace_id, updated_info);
        return await workspaceRepository.getById(workspace_id);
    }

    async deleteWorkspace(workspace_id) {
        const workspace = await workspaceRepository.getById(workspace_id);
        if (!workspace || !workspace.estado) {
            throw new ServerError("No se encontro el espacio de trabajo", 404);
        }

        await workspaceRepository.softDeleteById(workspace_id);
        
        // Obtenemos el workspace actualizado con estado: false para retornar
        return await workspaceRepository.getById(workspace_id);
    }
}

const workspaceService = new WorkspaceService();
export default workspaceService;
