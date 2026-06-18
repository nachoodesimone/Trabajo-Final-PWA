import Workspace from '../models/workspace.model.js';
class WorkspaceRepository {
    async getAll(){
        return await Workspace.find({estado: true});
    } 
    async getById(workspace_id){
        return await Workspace.findById(workspace_id);
    }
    async softDeleteById(workspace_id){
        await this.updateById(workspace_id, {estado: false});
    }
    async deleteById(workspace_id){
        return await Workspace.findByIdAndDelete(workspace_id, {estado: false});
    }

    async updateById(workspace_id, update_data){
        return await Workspace.findByIdAndUpdate(workspace_id, update_data);
    }
    async create(nombre, descripcion, dueño){
        return await Workspace.create({
            nombre, 
            descripcion,
            dueño
        });
    }
}   
const workspaceRepository = new WorkspaceRepository();
export default workspaceRepository;

