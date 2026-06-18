import ENVIRONMENT from "../config/environment.config.js";
import mailer_transport from "../config/mailer.config.js";
import ServerError from "../helpers/serverError.helper.js";
import userRepository from "../repositories/user.repository.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

class AuthService {
    async register({ name, email, password }) {
        if (!name || name.trim().length <= 2) {
            throw new ServerError("Nombre debe ser mayor a 2 caracteres", 400);
        }

        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            throw new ServerError("Email inválido", 400);
        }

        if (!password || password.length < 6) {
            throw new ServerError("Password debe tener al menos 6 caracteres", 400);
        }

        const existingUser = await userRepository.getByEmail(email);
        if (existingUser) {
            throw new ServerError("El email ya está registrado", 400);
        }

        const hashed_password = await bcrypt.hash(password, 12);
        const newUser = await userRepository.create(name, email, hashed_password);

        const verification_token = jwt.sign(
            { email: email },
            ENVIRONMENT.JWT_SECRET
        );

        await mailer_transport.sendMail({
            to: email,
            from: ENVIRONMENT.GMAIL_USERNAME,
            subject: "Verifica tu dirección de correo electrónico",
            html: `
                <div style="background-color: #f8f9fa; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; min-height: 100%;">
                    <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e1e4e8; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                        <!-- Header / Logo -->
                        <div style="background-color: #4a154b; padding: 25px; text-align: center;">
                            <span style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                                slack<span style="color: #36c5f0;">.</span>utn
                            </span>
                        </div>
                        <!-- Content -->
                        <div style="padding: 30px 25px; text-align: center;">
                            <h1 style="font-size: 22px; color: #1d1c1d; margin-top: 0; margin-bottom: 15px; font-weight: 700;">¡Hola, ${name}! 👋</h1>
                            <p style="font-size: 15px; color: #4a154b; line-height: 1.5; margin-bottom: 25px;">
                                ¡Te damos la bienvenida a <b>Slack UTN</b>! Para completar tu registro y comenzar a colaborar con tu equipo, por favor verifica tu dirección de correo electrónico.
                            </p>
                            
                            <!-- CTA Button -->
                            <div style="margin: 30px 0;">
                                <a href="${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}" 
                                   style="background-color: #4a154b; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 3px 6px rgba(74,21,75,0.2);">
                                   Verificar cuenta
                                </a>
                            </div>
                            
                            <p style="font-size: 14px; color: #616061; line-height: 1.5; margin-top: 25px; border-top: 1px solid #f1f1f2; padding-top: 20px;">
                                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                            </p>
                            <p style="font-size: 12px; color: #1264a3; word-break: break-all; margin: 10px 0;">
                                <a href="${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}" style="color: #1264a3; text-decoration: none;">
                                    ${ENVIRONMENT.URL_BACKEND}/api/auth/verify-email?verification_token=${verification_token}
                                </a>
                            </p>
                        </div>
                        <!-- Footer -->
                        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e1e4e8;">
                            <p style="font-size: 11px; color: #616061; margin: 0;">
                                Este correo fue enviado automáticamente por Slack UTN. Por favor no respondas a este mensaje.
                            </p>
                        </div>
                    </div>
                </div>
            `
        });

        return {
            id: newUser._id,
            name: newUser.nombre,
            email: newUser.email
        };
    }

    async verifyEmail(verification_token) {
        if (!verification_token) {
            throw new ServerError("Falta token de verificación", 400);
        }

        let payload;
        try {
            payload = jwt.verify(verification_token, ENVIRONMENT.JWT_SECRET);
        } catch (error) {
            throw new ServerError("Token invalido", 401);
        }

        const { email } = payload;
        const user = await userRepository.getByEmail(email);

        if (!user) {
            throw new ServerError("Usuario no encontrado", 404);
        }

        if (user.email_verificado) {
            throw new ServerError("Este email ya ha sido verificado", 400);
        }

        await userRepository.updateById(user._id, { email_verificado: true });
        return { message: "Email verificado correctamente. ¡Ya puedes usar tu cuenta!" };
    }

    async login({ email, password }) {
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            throw new ServerError("Email inválido", 400);
        }

        if (!password || password.length < 6) {
            throw new ServerError("Contraseña invalida", 400);
        }

        const user_found = await userRepository.getByEmail(email);

        if (!user_found) {
            throw new ServerError("Usuario no registrado", 404);
        }

        if (!user_found.email_verificado) {
            throw new ServerError("Usuario con verificacion de mail pendiente", 401);
        }

        const is_same_password = await bcrypt.compare(password, user_found.password);

        if (!is_same_password) {
            throw new ServerError("Credenciales invalidas", 401);
        }

        const profile_info = {
            nombre: user_found.nombre,
            email: user_found.email,
            id: user_found._id,
            fecha_creacion: user_found.fecha_creacion
        };

        const access_token = jwt.sign(
            profile_info,
            ENVIRONMENT.JWT_SECRET,
            { expiresIn: '24h' }
        );

        return { access_token };
    }

    async resetPasswordRequest(email) {
        if (!email) {
            throw new ServerError("El email es obligatorio", 400);
        }

        const user = await userRepository.getByEmail(email);

        if (!user) {
            return { message: "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña" };
        }

        const secret_key = ENVIRONMENT.JWT_SECRET + user.password;

        const token = jwt.sign(
            { email: user.email, id: user._id },
            secret_key,
            { expiresIn: '15m' }
        );

        const reset_link = `${ENVIRONMENT.URL_FRONTEND}/reset-password?token=${token}`;

        await mailer_transport.sendMail({
            from: ENVIRONMENT.GMAIL_USERNAME,
            to: user.email,
            subject: 'Restablece tu contraseña',
            html: `
                <h1>Restablecimiento de Contraseña</h1>
                <p>Has solicitado restablecer tu contraseña. Haz clic en el enlace de abajo para continuar:</p>
                <a href="${reset_link}">Restablecer mi contraseña</a>
                <p>Este enlace expirará en 15 minutos. Si tú no solicitaste esto, puedes ignorar este correo sin problemas.</p>
            `
        });

        return { message: "En caso de que tengas una cuenta asociada a este correo te enviaremos instrucciones para restablecer tu contraseña" };
    }

    async resetPasswordConfirm(reset_token, newPassword) {
        if (!reset_token) {
            throw new ServerError("Falta el token de autorizacion", 401);
        }

        let decoded;
        try {
            decoded = jwt.decode(reset_token);
        } catch (error) {
            throw new ServerError("Token invalido", 401);
        }

        if (!decoded || !decoded.email) {
            throw new ServerError("Token invalido", 401);
        }

        const user = await userRepository.getByEmail(decoded.email);
        if (!user) {
            throw new ServerError("Usuario no encontrado", 404);
        }

        const secret_key = ENVIRONMENT.JWT_SECRET + user.password;
        try {
            jwt.verify(reset_token, secret_key);
        } catch (error) {
            throw new ServerError("Token expirado o invalido", 401);
        }

        if (!newPassword || newPassword.length < 6) {
            throw new ServerError("Contraseña invalida", 400);
        }

        const new_password_hashed = await bcrypt.hash(newPassword, 10);
        await userRepository.updateById(user._id, { password: new_password_hashed });

        return { message: "Contraseña restablecida exitosamente" };
    }
}

const authService = new AuthService();
export default authService;
