import ServerError from "../helpers/serverError.helper.js";
import jwt from "jsonwebtoken";

function errorHandler(error, request, response, next) {
    if (
        error instanceof jwt.JsonWebTokenError ||
        error instanceof jwt.TokenExpiredError ||
        error instanceof jwt.NotBeforeError
    ) {
        return response.status(401).json({
            ok: false,
            status: 401,
            message: error.message || "Token expirado o invalido"
        });
    }

    if (error instanceof ServerError) {
        return response.status(error.status).json({
            ok: false,
            status: error.status,
            message: error.message
        });
    }

    console.error("Error no controlado:", error);
    return response.status(500).json({
        ok: false,
        status: 500,
        message: "Error interno del servidor"
    });
}

export default errorHandler;
