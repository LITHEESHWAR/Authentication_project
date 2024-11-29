require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    process.exit(1);
  }
  console.log("Connected to MySQL database.");
});

// Utility function: verify JWT token
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(403).send("Access denied.");

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token.");
    req.user = user;
    next();
  });
}

// Utility function: check user roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send("Access denied: insufficient permissions.");
    }
    next();
  };
}

// Routes
// User registration
app.post("/register", async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).send("Missing required fields.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const query = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";

  db.query(query, [username, hashedPassword, role], (err) => {
    if (err) {
      console.error("Error during registration:", err);
      return res.status(500).send("Error during registration.");
    }
    res.status(201).send("User registered successfully.");
  });
});

// User login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Missing username or password.");
  }

  const query = "SELECT * FROM users WHERE username = ?";

  db.query(query, [username], async (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send("Invalid username or password.");
    }

    const user = results[0];
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(400).send("Invalid username or password.");
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, role: user.role });
  });
});

// Fetch user details
app.get("/profile", authenticateToken, (req, res) => {
  const query = "SELECT id, username, role FROM users WHERE id = ?";

  db.query(query, [req.user.id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send("User not found.");
    }
    res.json(results[0]);
  });
});

// Admin-only route
app.get("/admin", authenticateToken, authorizeRoles("Admin"), (req, res) => {
  res.send("Welcome, Admin!");
});

// User route
app.get("/user", authenticateToken, authorizeRoles("User", "Admin"), (req, res) => {
  res.send("Welcome, User!");
});

// Logout (frontend deletes JWT)
app.post("/logout", (req, res) => {
  res.status(200).send("Logged out successfully.");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
