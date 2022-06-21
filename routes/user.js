const mysql = require("mysql");
const crypto = require("crypto");

const jwt = require("../jwt");

const generateSalt = () => {
    let s = "";
    for (let i = 0; i < 32; i++) { s += Math.floor(Math.random() * 36).toString(36); }
    return s;
}

module.exports = (connection) => {
    const express = require("express");
    const router = express.Router();

    router.post("/login", (req, res) => {
        // Check if body is valid
        const { username, password } = req.body;
        if (!username || !password) return res.sendStatus(400);

        connection.query(`SELECT * FROM \`users\` WHERE \`username\` = ${mysql.escape(email)}`, async (err, results) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            if (results.length === 0) return res.sendStatus(401); // Unauthorized, the user does not exist
            
            const user = results[0];

            if (crypto.createHash("sha256").update(password + user.salt + process.env.PASSWORD_PEPPER).digest("hex") != user.hash) return res.sendStatus(401); // Unauthorized, the password was incorrect

            const accessToken = jwt.sign({
                id: user.id,
                username: username
            }, { expiresIn: "24h" });

            res.status(200).json({
                accessToken: accessToken,
                id: user.id,
                username: username
            });
        });
    });

    router.post("/register", (req, res) => {
        // Check if body is valid
        const { username, password } = req.body;
        if (!username || !password) return res.sendStatus(400);

        // Check if user already exists
        connection.query(`SELECT * FROM users WHERE username = ${mysql.escape(email)}`, (err, result) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            if (result.length > 0) return res.sendStatus(409);

            const salt = generateSalt();
            const hashedPassword = crypto.createHash("sha256").update(password + salt + process.env.PASSWORD_PEPPER).digest("hex");

            connection.query(`INSERT INTO users (id, username, hash, salt) VALUES (NULL, ${mysql.escape(username)}, ${mysql.escape(hashedPassword)}, ${mysql.escape(salt)})`, (err2, result2) => {
                if (err2) {
                    console.error(err2);
                    return res.sendStatus(500);
                }
                
                const accessToken = jwt.sign({
                    id: result2.insertId,
                    username: username
                }, { expiresIn: "24h" });

                res.status(201).json({
                    accessToken: accessToken,
                    id: result2.insertId,
                    username: username
                });
            });
        });
    });

    router.get("/me", jwt.authenticateJWT, (req, res) => {
        const { id, email } = req.user;
        res.json({ id, email });
    });

    return router;
}