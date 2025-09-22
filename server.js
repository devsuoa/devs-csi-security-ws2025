// server.js

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_FILE = path.join(__dirname, 'demo.db');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database(DB_FILE);

function initDb() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT
    )`);

    db.get(`SELECT COUNT(*) as c FROM users WHERE username = 'alice'`, (err, row) => {
      if (err) return console.error(err);
      if (!row || row.c === 0) {
        db.run(`INSERT OR IGNORE INTO users (username, password) VALUES ('alice', 'password123')`);
      }
    });
  });
}

initDb();

app.post('/login', (req, res) => {
  const username = req.body.username || '';
  const password = req.body.password || '';

  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  console.log('Running query:', query);

  db.get(query, (err, row) => {
    if (err) {
      console.error('SQL Error:', err.message);
      console.log('Failed query:', query);
      const html = `
        <!doctype html>
        <html>
        <head><meta charset="utf-8"><title>Welcome</title>
        <link rel="stylesheet" href="/style.css">
        </head>
        <body class="center">
          <div class="card">
            <h1>Welcome, ${username}</h1>
            <p><small>SQL Error occurred, but proceeding for demo purposes.</small></p>
            <a href="/">Back to login</a>
          </div>
        </body>
        </html>
      `;
      return res.send(html);
    }

    if (row) {
      const html = `
        <!doctype html>
        <html>
        <head><meta charset="utf-8"><title>Welcome</title>
        <link rel="stylesheet" href="/style.css">
        </head>
        <body class="center">
          <div class="card">
            <h1>Welcome, ${username}</h1>
            <p><small>You are now "authenticated".</small></p>
            <a href="/">Back to login</a>
          </div>
        </body>
        </html>
      `;
      return res.send(html);
    } else {
      return res.sendFile(path.join(__dirname, 'public', 'login-failed.html'));
    }
  });
});

app.get('/_debug/users', (req, res) => {
  db.all("SELECT id, username FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: 'server error' });
    res.json(rows);
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Demo app listening on http://localhost:${PORT}`);
});
