const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Hardcoded user for login
const user = {
  username: "user1",
  password: "password123",
};

// In-memory account data
let balance = 1000;

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

// Login endpoint
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === user.username && password === user.password) {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
    return res.json({ token });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// Protected route: Get balance
app.get("/balance", authenticateToken, (req, res) => {
  res.json({ balance });
});

// Protected route: Deposit money
app.post("/deposit", authenticateToken, (req, res) => {
  const { amount } = req.body;
  balance += amount;
  res.json({ message: `Deposited $${amount}`, newBalance: balance });
});

// Protected route: Withdraw money
app.post("/withdraw", authenticateToken, (req, res) => {
  const { amount } = req.body;
  if (amount > balance) {
    return res.status(400).json({ message: "Insufficient funds" });
  }
  balance -= amount;
  res.json({ message: `Withdrew $${amount}`, newBalance: balance });
});

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
