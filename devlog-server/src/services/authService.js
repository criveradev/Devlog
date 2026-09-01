/** Encapsula registro y autenticación sin depender de Express. */
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApplicationError } from '../errors/ApplicationError.js';

const PASSWORD_HASH_ROUNDS = 12;
const INVALID_CREDENTIALS_MESSAGE = 'Credenciales inválidas';

/** Factoría de autenticación con persistencia y hasher sustituibles en pruebas. */
export const createAuthService = ({ userModel, passwordHasher }) => ({
    async registerUser({ username, email, password }) {
        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            throw new ApplicationError(409, 'Usuario o email ya en uso');
        }

        const hashedPassword = await passwordHasher.hash(password, PASSWORD_HASH_ROUNDS);
        return userModel.create({ username, email, password: hashedPassword });
    },

    async authenticateUser({ email, password }) {
        // El mismo mensaje cubre usuario inexistente y password incorrecto contra enumeración.
        const user = await userModel.findOne({ email }).select('+password +tokenVersion');
        if (!user) {
            throw new ApplicationError(401, INVALID_CREDENTIALS_MESSAGE);
        }

        const passwordMatches = await passwordHasher.compare(password, user.password);
        if (!passwordMatches) {
            throw new ApplicationError(401, INVALID_CREDENTIALS_MESSAGE);
        }

        return user;
    },
});

export const authService = createAuthService({
    userModel: User,
    passwordHasher: bcrypt,
});
