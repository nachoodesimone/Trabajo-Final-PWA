import workspaceMemberService from "../services/workspaceMember.service.js";
import ServerError from "../helpers/serverError.helper.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";

class WorkspaceMemberController {
    async inviteUser(req, res, next) {
        try {
            const { workspace_id } = req.params;
            const email = req.body.invited_email || req.body.email;
            const role = req.body.role || req.body.rol;
            const requester_id = req.user.id;

            if (!email || !role) {
                throw new ServerError("Faltan datos obligatorios (email y rol)", 400);
            }

            const newMember = await workspaceMemberService.inviteUser(workspace_id, email, role, requester_id);

            return res.status(200).json({
                ok: true,
                message: "Invitación enviada con éxito",
                data: {
                    member: newMember
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async processInvitation(req, res, next) {
        try {
            const { decision } = req.params;
            const { invitation_token } = req.query;

            if (!invitation_token) {
                throw new ServerError("Falta token de invitacion", 400);
            }

            if (decision !== MEMBER_INVITATION_STATUS.ACCEPTED && decision !== MEMBER_INVITATION_STATUS.REJECTED) {
                throw new ServerError("Decisión no válida", 400);
            }

            await workspaceMemberService.memberDesicion(invitation_token, decision);

            return res.status(200).json({
                ok: true,
                status: 200,
                message: `Decision de ${decision} tomada con exito!`
            });
        } catch (error) {
            next(error);
        }
    }

    async listMembers(req, res, next) {
        try {
            const { workspace_id } = req.params;
            const members = await workspaceMemberService.listMembers(workspace_id);

            return res.status(200).json({
                ok: true,
                message: "Miembros del espacio de trabajo obtenidos con éxito",
                data: {
                    members
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async changeRole(req, res, next) {
        try {
            const { workspace_id, member_id } = req.params;
            const { rol } = req.body;
            const requester_id = req.user.id;

            const updatedMember = await workspaceMemberService.changeRole(workspace_id, member_id, rol, requester_id);

            return res.status(200).json({
                ok: true,
                message: "Rol del miembro actualizado con éxito",
                data: {
                    member: updatedMember
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async removeMember(req, res, next) {
        try {
            const { workspace_id, member_id } = req.params;
            const requester_id = req.user.id;

            const result = await workspaceMemberService.removeMember(workspace_id, member_id, requester_id);

            return res.status(200).json({
                ok: true,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

const workspaceMemberController = new WorkspaceMemberController();
export default workspaceMemberController;
