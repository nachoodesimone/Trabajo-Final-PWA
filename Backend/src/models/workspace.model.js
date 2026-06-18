import mongoose from "mongoose";
import { USER_COLLECTION_NAME } from "./user.model.js";

const workspaceSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },
    fecha_creacion: {
        type: Date,
        required: true,
        default: Date.now()
    },
    descripcion: {
        type: String,
        required: false
    },
    estado: {
        type: Boolean,
        required: true,
        default: true
    },
    dueño: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_COLLECTION_NAME,
        required: true
    }
})
export const WORKSPACE_COLLECTION_NAME = "Workspace"
const Workspace = mongoose.model(WORKSPACE_COLLECTION_NAME, workspaceSchema);
export default Workspace