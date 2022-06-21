const jwt = require("jsonwebtoken");

module.exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.sendStatus(401); // Unauthorized

    jwt.verify(authHeader, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden

        req.user = user;
        next();
    });
}

module.exports.sign = (json, options={}) => {
    return jwt.sign(json, process.env.JWT_SECRET, options);
}