require("dotenv").config();

const express = require("express");
const app = express();

const mysql = require("mysql");
const cors = require("cors");

app.use(express.json());

app.use(cors({
    origin: (origin, callback) => {
        callback(null, true);
    },
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    optionsSuccessStatus: 200 // Some legacy browsers (Internet Explorer, looking at you) choke on 204
}));

app.get("/api", async (req, res) => {
    const host = "http://localhost:8080";

    res.send({
        routes_uri: `${host}/api`,
        axolotl_pictures_router: {
            gary_the_axolotl_uri: `${host}/api/axolotl-picture/gary-the-axolotl`,
            get_uri: `${host}/api/axolotl-picture`,
            mine_uri: `${host}/api/axolotl-picture/mine`,
            get_curated_uri: `${host}/api/axolotl-picture/curated`,
            post_uri: `${host}/api/axolotl-picture`,
            report_uri: `${host}/api/axolotl-picture/report`,
        },
        axolotl_fact_router: {
            get_uri: `${host}/api/axolotl-fact`,
            mine_uri: `${host}/api/axolotl-fact/mine`,
            get_curated_uri: `${host}/api/axolotl-fact/curated`,
            post_uri: `${host}/api/axolotl-fact`,
            report_uri: `${host}/api/axolotl-fact/report`,
        },
        user_router: {
            login_uri: `${host}/api/user/login`,
            register_uri: `${host}/api/user/register`,
            me_uri: `${host}/api/user/me`
        }
    });
});

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "axolotlapi"
});

connection.connect(() => { console.log("Connected to database"); });

app.use("/api/axolotl-picture", require("./routes/axolotl-picture")(connection));
app.use("/api/axolotl-fact", require("./routes/axolotl-fact")(connection));
app.use("/api/user", require("./routes/user")(connection));

app.listen(process.env.PORT || 8080, () => {
    console.log("Server started");
});