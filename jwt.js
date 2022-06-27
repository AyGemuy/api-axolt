const chalk = require("chalk");
const jwt = require("jsonwebtoken");

module.exports.authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.sendStatus(401); // Unauthorized

    jwt.verify(authHeader, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden

        req.user = user;

        // console.log(`User ${user.username} (id=${user.id}) fired ${req.baseUrl}`);
        const datetime = new Date();
        const [ day, month, year ] = [ datetime.getDate(), datetime.getMonth() + 1, datetime.getFullYear() ];
        const [ hours, minutes, seconds ] = [ datetime.getHours(), datetime.getMinutes(), datetime.getSeconds() ];

        console.log(`${chalk.blue("[")}${day}-${month}-${year} ${hours}:${minutes}:${seconds}${chalk.blue("]")} ${chalk.blue("[")}User ${user.id}: ${user.username}${chalk.blue("]")} fired ${chalk.red(req.originalUrl)} with ${chalk.red(JSON.stringify(req.body))}`);

        next();
    });
}

module.exports.sign = (json, options={}) => {
    return jwt.sign(json, process.env.JWT_SECRET, options);
}