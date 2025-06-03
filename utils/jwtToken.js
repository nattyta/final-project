const jwt = require("jsonwebtoken")
require("dotenv").config()
function generateJwtToken(id){
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn:10*60*1000})
}

module.exports = { generateJwtToken }