const bcrypt = require("bcryptjs");

const { pool } = require("../db/pool");
const { generateToken } = require("../utils/jwt");
const {
  registerSchema,
  loginSchema,
} = require("../validators/authValidators");

async function register(req, res, next) {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid registration data",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { username, email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await pool.query(
      `
      SELECT id, username, email
      FROM users
      WHERE username = $1 OR email = $2
      LIMIT 1
      `,
      [username, normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];

      if (user.username.toLowerCase() === username.toLowerCase()) {
        return res.status(409).json({
          error: "Username is already registered",
        });
      }

      return res.status(409).json({
        error: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const insertResult = await pool.query(
      `
      INSERT INTO users (
        username,
        email,
        password_hash,
        role,
        is_active
      )
      VALUES ($1, $2, $3, 'PLAYER', TRUE)
      RETURNING
        id,
        username,
        email,
        role,
        is_active,
        created_at
      `,
      [username, normalizedEmail, passwordHash]
    );

    const user = insertResult.rows[0];

    const token = generateToken(user);

    return res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        error: "Username or email is already registered",
      });
    }

    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        error: "Invalid login data",
        details: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    const { email, password } = result.data;
    const normalizedEmail = email.toLowerCase();

    const userResult = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        password_hash,
        role,
        is_active
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        error: "Account is inactive",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    await pool.query(
      `
      UPDATE users
      SET last_login_at = NOW()
      WHERE id = $1
      `,
      [user.id]
    );

    const token = generateToken(user);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getMe(req, res, next) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        username,
        email,
        role,
        is_active,
        created_at,
        updated_at,
        last_login_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.json({
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getMe,
};