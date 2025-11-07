require('dotenv').config();      
const express = require('express');
const cors = require('cors');
const db = require('./database');
const bcrypt = require('bcryptjs');      
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const authenticateToken = require('./middleware/authMiddleware');

const app = express();
const port = process.env.PORT || 3100;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// STATUS
app.get('/status', (req, res) => {
  res.json({status: 'OK', message: 'Server is Running', timestamp: new Date()});
});

// MOVIES
app.get('/movies', (req, res) => {
  const sql = "SELECT * FROM movies ORDER BY id ASC";
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(400).json({"error":err.message});
    // perbaikan res.json
    res.json({
      message: "success",
      data: rows
    });
  });
});

app.get('/movies/:id', (req, res) => {  // Endpoint untuk mendapatkan film berdasarkan ID
    const sql = "SELECT * FROM movies WHERE id = ?";
    const params = [req.params.id];
    db.get(sql, params, (err, row) => {
        if (err) {
            res.status(400).json({"error": err.message});
            return;
        }
        res.json({"message":"success", "data":row});
    });
});

// DIRECTORS CRUD
app.get('/directors', (req, res) => {
  db.all("SELECT * FROM directors ORDER BY id ASC", [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/directors/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM directors WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Director not found" });
    res.json(row);
  });
});

app.post('/directors', (req, res) => {
  const { name, birthYear } = req.body;
  if (!name || !birthYear) {
    return res.status(400).json({ error: "Name and birthYear are required" });
  }
  db.run(
    "INSERT INTO directors (name, birthYear) VALUES (?, ?)",
    [name, birthYear],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, birthYear });
    }
  );
});

app.put('/directors/:id', (req, res) => {
  const { id } = req.params;
  const { name, birthYear } = req.body;
  db.run(
    "UPDATE directors SET name = ?, birthYear = ? WHERE id = ?",
    [name, birthYear, id],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: "Director not found" });
      res.json({ id, name, birthYear });
    }
  );
});

app.delete('/directors/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM directors WHERE id = ?", [id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Director not found" });
    res.status(204).send();
  });
});

// === AUTH ROUTES ===
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;

  // 1. Validasi input
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ 
      error: 'Username dan password (min 6 karakter) harus diisi' 
    });
  }

  // 2. Hash password sebelum disimpan
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing:", err);
      return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
    }

    // 3. Simpan ke database
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    const params = [username.toLowerCase(), hashedPassword];

    db.run(sql, params, function (err) {
      if (err) {
        // Username sudah ada (UNIQUE constraint)
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(409).json({ error: 'Username sudah digunakan' });
        }
        console.error("Error inserting user:", err);
        return res.status(500).json({ error: 'Gagal menyimpan pengguna' });
      }

      // 4. Registrasi berhasil
      res.status(201).json({ 
        message: 'Registrasi berhasil', 
        userId: this.lastID 
      });
    });
  });
});

// === LOGIN ROUTE ===
app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;

  // 1. Validasi input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan password harus diisi' });
  }

  // 2. Cek apakah user ada di database
  const sql = "SELECT * FROM users WHERE username = ?";
  db.get(sql, [username.toLowerCase()], (err, user) => {
    if (err) {
      console.error("Error query:", err);
      return res.status(500).json({ error: 'Terjadi kesalahan server' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Kredensial tidak valid' });
    }

    // 3. Bandingkan password input dengan password di database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error compare:", err);
        return res.status(500).json({ error: 'Terjadi kesalahan server' });
      }
      if (!isMatch) {
        return res.status(401).json({ error: 'Kredensial tidak valid' });
      }

      // 4. Buat token JWT
      const payload = { 
        user: { 
          id: user.id, 
          username: user.username 
        } 
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          console.error("Error signing token:", err);
          return res.status(500).json({ error: 'Gagal membuat token' });
        }

        // 5. Kirim token ke client
        res.json({ 
          message: 'Login berhasil', 
          token: token 
        });
      });
    });
  });
});

// === PROTECTED MOVIES ROUTES (BUTUH TOKEN) ===
app.post('/movies', authenticateToken, (req, res) => {
  console.log('Request POST /movies oleh user:', req.user.username);
  const { id, title, director, year } = req.body;

  if (!id || !title || !director || !year) {
    return res.status(400).json({ error: 'Semua field (id, title, director, year) harus diisi' });
  }

  const sql = "INSERT INTO movies (id, title, director, year) VALUES (?, ?, ?, ?)";
  db.run(sql, [id, title, director, year], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.status(201).json({ message: 'Movie berhasil ditambahkan', id: this.lastID });
  });
});

app.put('/movies/:id', authenticateToken, (req, res) => {
  console.log('Request PUT /movies oleh user:', req.user.username);
  const { title, director, year } = req.body;
  const { id } = req.params;

  const sql = "UPDATE movies SET title = ?, director = ?, year = ? WHERE id = ?";
  db.run(sql, [title, director, year, id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Movie tidak ditemukan' });
    res.json({ message: 'Movie berhasil diupdate' });
  });
});

app.delete('/movies/:id', authenticateToken, (req, res) => {
  console.log('Request DELETE /movies oleh user:', req.user.username);
  const { id } = req.params;

  const sql = "DELETE FROM movies WHERE id = ?";
  db.run(sql, [id], function (err) {
    if (err) return res.status(400).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Movie tidak ditemukan' });
    res.json({ message: 'Movie berhasil dihapus' });
  });
});

// fallback 404

app.use((req, res) => {
  res.status(404).json({error: 'Endpoint not found'});
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
