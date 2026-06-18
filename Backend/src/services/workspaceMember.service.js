import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";
import workspaceRepository from "../repositories/workspace.repository.js";
import userRepository from "../repositories/user.repository.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";
import ENVIRONMENT from "../config/environment.config.js";
import ServerError from "../helpers/serverError.helper.js";
import jwt from "jsonwebtoken";
import mailService from "./mail.service.js";

const WORKSPACE_CONFIG = {
    INVITATION_MEMBERSHIP_EXPIRATION_DAYS: 30
};

class WorkspaceMemberService {
    async inviteUser(workspace_id, email, role, requester_id) {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            throw new ServerError("Email inválido", 400);
        }

        const roles = Object.values(MEMBER_WORKSPACE_ROLES);
        if (!role || !roles.includes(role)) {
            throw new ServerError(`Rol inválido. Debe ser uno de: ${roles.join(', ')}`, 400);
        }

        const workspace = await workspaceRepository.getById(workspace_id);
        if (!workspace || !workspace.estado) {
            throw new ServerError("No se encontro el espacio de trabajo", 404);
        }

        // Obtener la membresia del solicitante para asegurar que tiene permisos
        const requesterMembership = await workspaceMemberRepository.getByUserAndWorkspaceId(requester_id, workspace_id);
        if (!requesterMembership) {
            throw new ServerError("No eres miembro de este espacio de trabajo", 403);
        }

        if (requesterMembership.rol !== MEMBER_WORKSPACE_ROLES.OWNER && requesterMembership.rol !== MEMBER_WORKSPACE_ROLES.ADMIN) {
            throw new ServerError("No tienes permisos para invitar miembros a este espacio de trabajo", 403);
        }

        const userToInvite = await userRepository.getByEmail(email);
        if (!userToInvite) {
            throw new ServerError("El usuario ingresado no existe en el sistema", 404);
        }

        // Validar si ya es miembro o tiene invitación activa
        await this.verifyAlreadyMember(workspace_id, userToInvite._id);

        const expiration_date = this.getMembershipExpirationDate();
        const member_created = await workspaceMemberRepository.create(
            userToInvite._id,
            workspace_id,
            role,
            MEMBER_INVITATION_STATUS.PENDING,
            expiration_date
        );

        const invitation_token = jwt.sign(
            { member_id: member_created._id },
            ENVIRONMENT.JWT_SECRET,
            { expiresIn: `${WORKSPACE_CONFIG.INVITATION_MEMBERSHIP_EXPIRATION_DAYS}d` }
        );

        // Se usa URL_BACKEND ya que el endpoint /api/workspace/:workspace_id/members/:decision es procesado directamente por Express
        const accept_url = `${ENVIRONMENT.URL_BACKEND}/api/workspace/${workspace_id}/members/${MEMBER_INVITATION_STATUS.ACCEPTED}?invitation_token=${invitation_token}`;
        const reject_url = `${ENVIRONMENT.URL_BACKEND}/api/workspace/${workspace_id}/members/${MEMBER_INVITATION_STATUS.REJECTED}?invitation_token=${invitation_token}`;

        await mailService.sendInvitationMemberEmail(userToInvite.email, accept_url, reject_url, role);
        return member_created;
    }

    async memberDesicion(invitation_token, decision) {
        const decoded = jwt.verify(invitation_token, ENVIRONMENT.JWT_SECRET);

        const member_created = await workspaceMemberRepository.getById(decoded.member_id);
        if (!member_created) {
            throw new ServerError("Invitación no encontrada o expirada", 404);
        }

        if (member_created.estatus_invitacion !== MEMBER_INVITATION_STATUS.PENDING) {
            throw new ServerError("Esta invitación ya fue procesada anteriormente", 400);
        }

        if (member_created.fecha_expiracion_invitacion && member_created.fecha_expiracion_invitacion < new Date()) {
            throw new ServerError("Esta invitación ha expirado", 400);
        }

        if (decision === MEMBER_INVITATION_STATUS.ACCEPTED) {
            await workspaceMemberRepository.updateById(
                member_created._id,
                { estatus_invitacion: MEMBER_INVITATION_STATUS.ACCEPTED }
            );
        } else if (decision === MEMBER_INVITATION_STATUS.REJECTED) {
            await workspaceMemberRepository.updateById(
                member_created._id,
                { estatus_invitacion: MEMBER_INVITATION_STATUS.REJECTED }
            );
        }
    }

    async verifyAlreadyMember(workspace_id, user_id) {
        const isInvitedAlreadyMember = await workspaceMemberRepository.getMemberByWorkspaceAndUserId(workspace_id, user_id);
        if (isInvitedAlreadyMember) {
            if (isInvitedAlreadyMember.estatus_invitacion === MEMBER_INVITATION_STATUS.ACCEPTED) {
                throw new ServerError("El usuario ya es un miembro del espacio de trabajo", 400);
            }

            const ahora = new Date();
            if (isInvitedAlreadyMember.estatus_invitacion === MEMBER_INVITATION_STATUS.PENDING) {
                if (isInvitedAlreadyMember.fecha_expiracion_invitacion > ahora) {
                    throw new ServerError("Ya has enviado una invitacion al usuario", 400);
                } else {
                    await workspaceMemberRepository.deleteById(isInvitedAlreadyMember._id);
                }
            }
            if (isInvitedAlreadyMember.estatus_invitacion === MEMBER_INVITATION_STATUS.REJECTED) {
                throw new ServerError("El usuario ha rechazado la invitacion", 400);
            }
        }
    }

    getMembershipExpirationDate() {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + WORKSPACE_CONFIG.INVITATION_MEMBERSHIP_EXPIRATION_DAYS);
        return expirationDate;
    }

    async listMembers(workspace_id) {
        const workspace = await workspaceRepository.getById(workspace_id);
        if (!workspace || !workspace.estado) {
            throw new ServerError("No se encontro el espacio de trabajo", 404);
        }

        return await workspaceMemberRepository.getByWorkspaceId(workspace_id);
    }

    async changeRole(workspace_id, member_id, new_rol, requester_id) {
        const roles = Object.values(MEMBER_WORKSPACE_ROLES);
        if (!new_rol || !roles.includes(new_rol)) {
            throw new ServerError(`Rol inválido. Debe ser uno de: ${roles.join(', ')}`, 400);
        }

        const workspace = await workspaceRepository.getById(workspace_id);
        if (!workspace || !workspace.estado) {
            throw new ServerError("No se encontro el espacio de trabajo", 404);
        }

        const memberToUpdate = await workspaceMemberRepository.getById(member_id);
        if (!memberToUpdate || memberToUpdate.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Membresía no encontrada", 404);
        }

        if (memberToUpdate.estatus_invitacion !== MEMBER_INVITATION_STATUS.ACCEPTED) {
            throw new ServerError("No se puede cambiar el rol de un miembro cuya invitación no ha sido aceptada", 400);
        }

        const requesterMembership = await workspaceMemberRepository.getByUserAndWorkspaceId(requester_id, workspace_id);
        if (!requesterMembership) {
            throw new ServerError("No eres miembro de este espacio de trabajo", 403);
        }

        if (requesterMembership.rol !== MEMBER_WORKSPACE_ROLES.OWNER) {
            throw new ServerError("Solo el dueño puede cambiar los roles de los miembros", 403);
        }

        if (new_rol === MEMBER_WORKSPACE_ROLES.OWNER) {
            await workspaceRepository.updateById(workspace_id, { dueño: memberToUpdate.fk_user_id });
            await workspaceMemberRepository.updateById(requesterMembership._id, { rol: MEMBER_WORKSPACE_ROLES.ADMIN });
        }

        await workspaceMemberRepository.updateById(member_id, { rol: new_rol });
        return await workspaceMemberRepository.getById(member_id);
    }

    async removeMember(workspace_id, member_id, requester_id) {
        const workspace = await workspaceRepository.getById(workspace_id);
        if (!workspace || !workspace.estado) {
            throw new ServerError("No se encontro el espacio de trabajo", 404);
        }

        const memberToRemove = await workspaceMemberRepository.getById(member_id);
        if (!memberToRemove || memberToRemove.fk_workspace_id.toString() !== workspace_id) {
            throw new ServerError("Membresía no encontrada", 404);
        }

        const requesterMembership = await workspaceMemberRepository.getByUserAndWorkspaceId(requester_id, workspace_id);
        if (!requesterMembership) {
            throw new ServerError("No eres miembro de este espacio de trabajo", 403);
        }

        const isSelfRemoval = memberToRemove.fk_user_id.toString() === requester_id.toString();

        if (!isSelfRemoval) {
            if (requesterMembership.rol !== MEMBER_WORKSPACE_ROLES.OWNER && requesterMembership.rol !== MEMBER_WORKSPACE_ROLES.ADMIN) {
                throw new ServerError("No tienes permisos para quitar miembros de este espacio de trabajo", 403);
            }

            if (requesterMembership.rol === MEMBER_WORKSPACE_ROLES.ADMIN) {
                if (memberToRemove.rol === MEMBER_WORKSPACE_ROLES.OWNER || memberToRemove.rol === MEMBER_WORKSPACE_ROLES.ADMIN) {
                    throw new ServerError("Un administrador no puede remover al dueño ni a otro administrador", 403);
                }
            }
        }

        if (memberToRemove.rol === MEMBER_WORKSPACE_ROLES.OWNER) {
            throw new ServerError("No se puede eliminar al dueño del espacio de trabajo. Transfiere la propiedad primero.", 400);
        }

        await workspaceMemberRepository.deleteById(member_id);
        return { message: "Miembro removido exitosamente" };
    }
}

const workspaceMemberService = new WorkspaceMemberService();
export default workspaceMemberService;
