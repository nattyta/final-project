const bcrypt = require("bcryptjs")

async function hashPassword(password){
    return await bcrypt.hash(password, 10)
}

module.exports = { hashPassword }