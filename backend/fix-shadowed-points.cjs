const { Pool } = require("pg");

const pool = new Pool({
  host: "127.0.0.1",
  port: 5432,
  database: "nxtgensec_ctf",
  user: "nxtgensec_app",
  password: "NXTGENSEC_LOCAL_CHANGE_ME",
});

(async () => {
  try {
    const result = await pool.query(
      `
      UPDATE challenges
      SET points = 250
      WHERE slug = 'shadowed-headers'
      RETURNING title, slug, points, state;
      `
    );

    console.table(result.rows);
  } catch (error) {
    console.error(error.message);
  } finally {
    await pool.end();
  }
})();
