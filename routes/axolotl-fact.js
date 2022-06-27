const mysql = require("mysql");
const chalk = require("chalk");

const jwt = require("../jwt");

module.exports = (connection) => {
    const express = require("express");
    const router = express.Router();

    router.get("/", jwt.authenticateJWT, (req, res) => {
        // Get random axolotl fact
        connection.query(`SELECT * FROM \`axolotl-facts\` WHERE status != 2 ORDER BY RAND() LIMIT 1`, (err, results) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            let result = {
                id: results[0].id,
                content: results[0].content
            };

            connection.query(`SELECT username FROM users WHERE id = ${mysql.escape(results[0].author)}`, (err2, results2) => {
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
        connection.query(`SELECT * FROM \`axolotl-facts\` WHERE author = ${mysql.escape(req.user.id)}`, (err, results) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            res.send(results.map(fact => fact.content));
        });
    });

    router.get("/curated", jwt.authenticateJWT, (req, res) => {
        // Get random curated axolotl fact
        connection.query(`SELECT * FROM \`axolotl-facts\` WHERE status = 1 ORDER BY RAND() LIMIT 1`, (err, results) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }

            let result = {
                id: results[0].id,
                content: results[0].content
            };

            connection.query(`SELECT username FROM users WHERE id = ${mysql.escape(results[0].author)}`, (err2, results2) => {
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
        // Check if body is valid
        const { content } = req.body;
        if (!content) return res.sendStatus(400);

        // Check if fact already exists
        connection.query(`SELECT * FROM \`axolotl-facts\` WHERE content = ${mysql.escape(content)}`, (err, result) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            if (result.length > 0) return res.sendStatus(409); // Conflict, already exists

            connection.query(`INSERT INTO \`axolotl-facts\` (id, content, author, status) VALUES (NULL, ${mysql.escape(content)}, ${mysql.escape(req.user.id)}, 0)`, (err2, result2) => {
                if (err2) {
                    console.error(err2);
                    return res.sendStatus(500);
                }

                res.sendStatus(200);
                // TODO: Charge user
            });
        });
    });

    router.post("/report", jwt.authenticateJWT, (req, res) => {
        // Check if body is valid
        const { id } = req.body;
        if (!id) return res.sendStatus(400);

        // Check if fact is already reported
        connection.query(`SELECT * FROM \`axolotl-facts\` WHERE id = ${mysql.escape(id)}`, (err, result) => {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            if (result.length == 0) return res.sendStatus(304); // Not Modified, fact doesn't exist
            if (result[0].status == 1) return res.sendStatus(403); // Forbidden, fact has been verified
            if (result[0].status == 2) return res.sendStatus(304); // Not Modified, fact has already been reported

            connection.query(`UPDATE \`axolotl-facts\` SET status = 2 WHERE id = ${id};`, (err2, result2) => {
                if (err2) {
                    console.error(err2);
                    return res.sendStatus(500);
                }

                console.log(chalk.yellow(`Fact ${id} has been reported: ${result[0].content}`));
                res.sendStatus(200);
            });
        });
    });

    return router;
}