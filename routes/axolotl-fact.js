const mysql = require("mysql");

const jwt = require("../jwt");

module.exports = (connection) => {
    const express = require("express");
    const router = express.Router();

    router.get("/", jwt.authenticateJWT, (req, res) => {
        // Get random axolotl fact
        connection.query(`SELECT * FROM \`axolotl-facts\` ORDER BY RAND() LIMIT 1`, (err, results) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            let result = {
                id: results[0].id,
                content: results[0].content
            };

            connection.query(`SELECT username FROM \`users\` WHERE \`id\` = ${mysql.escape(results[0].author)}`, (err2, results2) => {
                if (err2) {
                    console.error(err2);
                    return res.sendStatus(500);
                }

                result.author = results2[0].username;
                res.send(result); // Result is { id, content, author }
            });
        });
    });

    router.get("/mine", jwt.authenticateJWT, (req, res) => {
        // Get my axolotl facts
        connection.query(`SELECT * FROM \`axolotl-facts\` WHERE \`author\` = ${mysql.escape(req.user.id)}`, (err, results) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            res.send(results.map(fact => fact.content));
        });
    });

    router.get("/curated", jwt.authenticateJWT, (req, res) => {
        // Get random curated axolotl fact
        connection.query(`SELECT * FROM \`axolotl-facts\` WHERE \`status\` = 1 ORDER BY RAND() LIMIT 1`, (err, results) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            let result = {
                id: results[0].id,
                content: results[0].content
            };

            connection.query(`SELECT username FROM \`users\` WHERE \`id\` = ${mysql.escape(results[0].author)}`, (err2, results2) => {
                if (err2) {
                    console.error(err2);
                    return res.sendStatus(500);
                }

                result.author = results2[0].username;
                res.send(result); // Result is { id, content, author }
                // TODO: Charge user
            });
        });
    });

    router.post("/", jwt.authenticateJWT, (req, res) => {
        // TODO: Charge user
        // Upload fact
        res.sendStatus(501); // Not implemented
    });

    router.post("/report", jwt.authenticateJWT, (req, res) => {
        // Report fact
        res.sendStatus(501); // Not implemented
    });

    return router;
}