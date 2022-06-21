const jwt = require("../jwt");

module.exports = (connection) => {
    const express = require("express");
    const router = express.Router();

    router.get("/gary-the-axolotl", jwt.authenticateJWT, (req, res) => {
        res.sendStatus(501); // Not implemented
    });

    router.get("/", jwt.authenticateJWT, (req, res) => {
        res.sendStatus(501); // Not implemented
    });

    router.put("/", jwt.authenticateJWT, (req, res) => { // This will eventually be a premium tier endpoint, costing money to fire
        res.sendStatus(501); // Not implemented
    });

    return router;
}