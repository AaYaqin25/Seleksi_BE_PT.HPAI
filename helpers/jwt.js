var jwt = require('jsonwebtoken');

const privateKey = 'PT.HPAI';

const encodeToken = (data) => jwt.sign(data, privateKey);

const decodeToken = (token) => {
    try {
        const decoded = jwt.verify(token,privateKey)
        return decoded
    } catch (error) {
        return null;
    }
};

module.exports = { encodeToken, decodeToken };