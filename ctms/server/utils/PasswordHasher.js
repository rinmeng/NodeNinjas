const bcrypt = require('bcryptjs');
// 10 is the recommended salt rounds
const BCRYPT_SALT = 10;

// use bcryptjs to hash passwords
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(BCRYPT_SALT);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

// use bcryptjs to verify passwords
async function verifyPassword(inputPassword, storedHash) {
    return await bcrypt.compare(inputPassword, storedHash);
}

module.exports = {
    hashPassword,
    verifyPassword
};