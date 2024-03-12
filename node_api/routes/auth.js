const router = require("express").Router();
const connection = require("../connection"); // Adjust the path to your MySQL connection module
const bcrypt = require("bcrypt");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    // Generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user
    const newUser = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    };

    // Save user to the database and respond
    const result = await new Promise((resolve, reject) => {
      connection.query('INSERT INTO users SET ?', newUser, (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    newUser.id = result.insertId;
    res.status(200).json(newUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    // Find user by email
    const users = await new Promise((resolve, reject) => {
      connection.query('SELECT * FROM users', (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      });
    });

    const user = users.find((u) => u.email === req.body.email);

    if (!user) {
      return res.status(404).json("User not found");
    }

    // Check password
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json("Wrong password");
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
