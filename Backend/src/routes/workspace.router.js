import express from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import workspaceController from '../controllers/workspace.controller.js';
import workspaceMemberController from '../controllers/workspaceMember.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';

const workspaceRouter = express.Router();

// Ruta de procesamiento de invitación sin authMiddleware
workspaceRouter.get(
    '/:workspace_id/members/:decision',
    workspaceMemberController.processInvitation
);

// Configuramos el authMiddleware a nivel de ruta para el resto de endpoints
workspaceRouter.use(authMiddleware);

// CRUD de Workspace
workspaceRouter.post('/', workspaceController.create);
workspaceRouter.get('/', workspaceController.getAllByUser);
workspaceRouter.get(
    '/:workspace_id', 
    workspaceMiddleware(), 
    workspaceController.getById
);
workspaceRouter.delete(
    '/:workspace_id', 
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER]), 
    workspaceController.deleteById
);
workspaceRouter.put(
    '/:workspace_id', 
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.OWNER]), 
    workspaceController.updateById
);

// CRUD de WorkspaceMember (Asociados al Workspace)
workspaceRouter.post(
    '/:workspace_id/members',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]),
    workspaceMemberController.inviteUser
);
workspaceRouter.get(
    '/:workspace_id/members',
    workspaceMiddleware(),
    workspaceMemberController.listMembers
);
workspaceRouter.put(
    '/:workspace_id/members/:member_id',
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER]),
    workspaceMemberController.changeRole
);
workspaceRouter.delete(
    '/:workspace_id/members/:member_id',
    workspaceMiddleware(),
    workspaceMemberController.removeMember
);

export default workspaceRouter;