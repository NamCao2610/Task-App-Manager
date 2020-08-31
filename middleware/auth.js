const User = require('../models/user');

const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {

    try {

        const token = req.header('Authorization').replace('Bearer ', '');

        const decode = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findOne({ _id: decode._id, "tokens.token": token });
        if (!user) {
            throw new Error('Khong phai user');
        }

        req.user = user;
        req.token = token;

        next();

    } catch (e) {
        res.status(404).send('Please authenticatite');
    }

}

module.exports = auth;