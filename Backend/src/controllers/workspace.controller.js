import workspaceService from "../services/workspace.service.js";

class WorkspaceController {
    async create(req, res, next) {
        try {
            const { nombre, descripcion } = req.body;
            const user_id = req.user.id;

            const newWorkspace = await workspaceService.createWorkspace({
                nombre,
                descripcion,
                user_id
            });

            return res.status(201).json({
                ok: true,
                message: "Espacio de trabajo creado con éxito",
                data: {
                    workspace: newWorkspace
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getAllByUser(req, res, next) {
        try {
            const user_id = req.user.id;
            const workspaces = await workspaceService.getAllWorkspacesByUser(user_id);

            return res.status(200).json({
                ok: true,
                message: "Espacios de trabajo obtenidos",
                data: { 
                    workspaces 
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const workspace_id = req.params.workspace_id;
            const workspace = await workspaceService.getWorkspaceById(workspace_id);

            return res.status(200).json({
                ok: true,
                message: "Detalle del espacio de trabajo obtenido",
                data: {
                    workspace
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteById(req, res, next) {
        try {
            const workspace_id = req.params.workspace_id;
            const deleted_workspace = await workspaceService.deleteWorkspace(workspace_id);

            return res.status(200).json({
                message: "Espacio de trabajo eliminado exitosamente",
                ok: true,
                status: 200,
                data: {
                    workspace: deleted_workspace
                }
            });
        } catch (error) {
            next(error);
        }
    }

    async updateById(req, res, next) {
        try {
            const workspace_id = req.params.workspace_id;
            const { nombre, descripcion } = req.body;

            const updated_workspace = await workspaceService.updateWorkspace(workspace_id, { nombre, descripcion });

            return res.status(200).json({
                message: "Espacio de trabajo actualizado exitosamente",
                ok: true,
                status: 200,
                data: {
                    workspace: updated_workspace
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

const workspaceController = new WorkspaceController();
export default workspaceController;