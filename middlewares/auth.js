const jwt = require('jsonwebtoken')
const { UnauthenticatedError } = require('../errors')
require('dotenv').config()

const authenticateUser = async (req, res, next) => {
    const authHeader = req.headers.authorization
    if(!authHeader || !authHeader.startsWith('Bearer')){
        throw new UnauthenticatedError('No valid token provided')
    }
    const token = authHeader.split(' ')[1]
    
    try {
        const googleDecoded = jwt.decode(token)
        if(googleDecoded.sub && googleDecoded.jti) {
            const {sub, name: username, email} = googleDecoded
            req.user = {id: `${sub}123`, username, email, token, isActive: true}
            next()
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const {id, username, email, isActive} = decoded
        req.user = {id, username, email, token, isActive}
        next()
    } catch (error) {
        throw new UnauthenticatedError('Invalid token!')
    }
}

module.exports = authenticateUser