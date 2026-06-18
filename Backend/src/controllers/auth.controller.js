import authService from "../services/auth.service.js";

class AuthController {
    async register(req, res, next) {
        try {
            const { name, email, password } = req.body;
            const user = await authService.register({ name, email, password });

            return res.status(201).json({
                message: "Usuario registrado con éxito",
                ok: true,
                status: 201,
                data: { user }
            });
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req, res, next) {
        try {
            const { verification_token } = req.query;
            const result = await authService.verifyEmail(verification_token);

            return res.status(200).json({
                ok: true,
                status: 200,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const result = await authService.login({ email, password });

            return res.status(200).json({
                ok: true,
                status: 200,
                message: 'Usuario autentificado exitosamente',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPasswordRequest(req, res, next) {
        try {
            const { email } = req.body;
            const result = await authService.resetPasswordRequest(email);

            return res.status(200).json({
                ok: true,
                status: 200,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }

    async resetPasswordConfirm(req, res, next) {
        try {
            const auth_header = req.headers.authorization;
            if (!auth_header) {
                return res.status(401).json({
                    ok: false,
                    status: 401,
                    message: "Falta header de autentificacion"
                });
            }

            const reset_token = auth_header.split(' ')[1];
            const { newPassword } = req.body;

            const result = await authService.resetPasswordConfirm(reset_token, newPassword);

            return res.status(200).json({
                ok: true,
                status: 200,
                message: result.message
            });
        } catch (error) {
            next(error);
        }
    }
}

const authController = new AuthController();
export default authController;
