const { hashPassword, verifyPassword } = require('../../utils/PasswordHasher');
const bcrypt = require('bcryptjs');

jest.mock('bcryptjs', () => ({
    genSalt: jest.fn(),
    hash: jest.fn(),
    compare: jest.fn()
}));

describe('PasswordHasher', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('hashPassword', () => {
        it('should call bcrypt.genSalt with salt rounds of 10', async () => {
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword');

            await hashPassword('password123');

            expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
        });

        it('should call bcrypt.hash with password and generated salt', async () => {
            bcrypt.genSalt.mockResolvedValue('generatedSalt');
            bcrypt.hash.mockResolvedValue('hashedPassword');

            await hashPassword('password123');

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'generatedSalt');
        });

        it('should return the hashed password', async () => {
            bcrypt.genSalt.mockResolvedValue('salt');
            bcrypt.hash.mockResolvedValue('hashedPassword123');

            const result = await hashPassword('password123');

            expect(result).toBe('hashedPassword123');
        });
    });

    describe('verifyPassword', () => {
        it('should call bcrypt.compare with input password and stored hash', async () => {
            bcrypt.compare.mockResolvedValue(true);

            await verifyPassword('password123', 'storedHash123');

            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'storedHash123');
        });

        it('should return true when passwords match', async () => {
            bcrypt.compare.mockResolvedValue(true);

            const result = await verifyPassword('password123', 'storedHash123');

            expect(result).toBe(true);
        });

        it('should return false when passwords do not match', async () => {
            bcrypt.compare.mockResolvedValue(false);

            const result = await verifyPassword('wrongPassword', 'storedHash123');

            expect(result).toBe(false);
        });
    });
});