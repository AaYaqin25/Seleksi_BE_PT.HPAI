var { decodeToken } = require('./jwt.js');
const models = require('../models/index.js');
const { Response } = require('./util.js');

const isLoggedIn = async (req, res, next) => {
    try {
        const bearerToken = req.get('Authorization');
        const token = bearerToken?.split(' ')[1];
        if (!token) return res.status(401).json(new Response('Token not provided', false));
        const data = decodeToken(token);
        if (!data || !data.id) return res.status(401).json(new Response('User is not authorized', false));
        const user = await models.User.findOne({
            where: {
                id: data.id
            }
        });
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json(new Response(error, false));
    }
};

module.exports = { isLoggedIn };
