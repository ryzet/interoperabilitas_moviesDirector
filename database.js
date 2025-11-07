require('dotenv').config(); // Load environment variables
const sqlite3 = require('sqlite3').verbose(); // Import sqlite3

const DBSOURCE = process.env.DB_SOURCE || "db.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to the SQLite database.');

    // Tabel movies
    db.run(
      `CREATE TABLE IF NOT EXISTS movies (
          id INTEGER PRIMARY KEY,
          title TEXT NOT NULL, 
          director TEXT NOT NULL,
          year INTEGER NOT NULL
      )`,
      (err) => {
        if (!err) {
          console.log("Table 'movies' ensured/created.");
          db.get('SELECT COUNT(*) AS count FROM movies', (err, row) => {
            if (!err && row.count === 0) {
              const insert = 'INSERT INTO movies (title, director, year) VALUES (?,?,?)';
              db.run(insert, ["FARIS", "Peter Jackson", 2001]);
              db.run(insert, ["FIRIS", "Joss Whedon", 2012]);
              db.run(insert, ["FURUS", "Sam Raimi", 2002]);
            }
          });
        }
      }
    );

    // Tabel directors
    db.run(
      `CREATE TABLE IF NOT EXISTS directors (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          birthYear INTEGER
      )`,
      (err) => {
        if (!err) {
          console.log("Table 'directors' ensured/created.");
          db.get('SELECT COUNT(*) AS count FROM directors', (err, row) => {
            if (!err && row.count === 0) {
              const insert = 'INSERT INTO directors (name, birthYear) VALUES (?,?)';
              db.run(insert, ["FARIS", 1970]);
              db.run(insert, ["FIRIS", 1946]);
              db.run(insert, ["FURUS", 1942]);
            }
          });
        } else {
          console.error("Error ensuring table directors:", err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("Gagal membuat tabel users:", err.message);
        } else {
          console.log("Table 'users' ensured/created.");
        }
      }
    );
  }
});

module.exports = db;
