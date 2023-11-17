//https://www.youtube.com/watch?v=sTHWNPVNvm8

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const cookieParser = require("cookie-parser");
const session = require("express-session");

const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

app.use(express.json());

const whitelist = ["http://localhost:3000"]
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
}

app.use(cors(corsOptions))

app.use(cookieParser());

app.use(
  session({                     // initialise la session
    key: "userId",              // nom du cookie
    secret: "subscribe",        // utilisé pour hasché l'id de session
    resave: false,              // a vous de trouver l'utilité
    saveUninitialized: false,   //a vous de trouver l'utilité
    cookie: {                   //
      expires: 60 * 60 * 24,    // 24 heures
    },
  })
);

const db = mysql.createConnection({
  database: 'session',
  host: "mysql-29cea68d-kamy-de31.aivencloud.com",
  user: "user-formatif",
  password: "AVNS_9PkaTowuWO-G74OvGu7",
  port: 13194
});

app.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.log(err);
    }

    db.query(
      "INSERT INTO users (username, password) VALUES (?,?)",
      [username, hash],
      (err, result) => {
        console.log(err);
      }

    );
    res.status(200).send();
  });
});

app.get("/login", (req, res) => {
  if (req.session.user) {
    res.send({ loggedIn: true, user: req.session.user });
  } else {
    res.send({ loggedIn: false });
  }
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.query(
    "SELECT * FROM users WHERE username = ?;",
    username,
    (err, result) => {
      if (err) {
        res.send({ err: err });
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = result;
            console.log(req.session.user);
            res.send(result);
          } else {
            res.send({ message: "Wrong username/password combination!" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
});

//deconnexion

app.delete("/deconnexion", (req, res) => {
  res.clearCookie('userId');
  req.session.destroy();
  res.status(200).send();
});


app.listen(3001, () => {
  console.log("running server");
});
