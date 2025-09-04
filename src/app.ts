import express from "express";
import type { Request, Response, NextFunction } from "express";

import cors from "cors";
import dotenv from "dotenv";
import DB from "./config/database";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

DB.testConnection();

function validateRequest(req: Request, res: Response, next: NextFunction): void {
  if (req.headers.authorization !== process.env.API_KEY) {
    res.status(403).json({ error: "Forbidden: Invalid API key" });
    return;
  }
  next();
}

async function main(): Promise<void> {
  try {
    await DB.pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100),
        age INT,
        grade VARCHAR(10)
      )
    `);
    console.log("✅ Students table ready.");

    await DB.pool.query(
      `INSERT INTO students (name, age, grade) VALUES ?`,
      [
        [
          ["Alice", 20, "A"],
          ["Bob", 22, "B"],
          ["Charlie", 21, "A"],
        ],
      ]
    );

    console.log("✅ Dummy data inserted.");

    const [rows] = await DB.pool.query("SELECT * FROM students");
    console.log("📚 Student Records:", rows);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

main();

// Routes
app.get("/api/students", validateRequest, async (req: Request, res: Response) => {
  try {
    const [rows] = await DB.pool.query("SELECT * FROM students");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

app.post("/api/students", validateRequest, async (req: Request, res: Response) => {
  try {
    const { name, age, grade } = req.body;
    const [result]: any = await DB.pool.query(
      `INSERT INTO students (name, age, grade) VALUES (?, ?, ?)`,
      [name, age, grade]
    );
    res.status(201).json({ id: result.insertId, name, age, grade });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

app.put("/api/students/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, age, grade } = req.body;
    const [result]: any = await DB.pool.query(
      `UPDATE students SET name = ?, age = ?, grade = ? WHERE id = ?`,
      [name, age, grade, id]
    );
    if (result.affectedRows > 0) {
      res.json({ id, name, age, grade });
    } else {
      res.status(404).send("Student not found");
    }
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

app.delete("/api/students/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [result]: any = await DB.pool.query(
      `DELETE FROM students WHERE id = ?`,
      [id]
    );
    if (result.affectedRows > 0) {
      res.sendStatus(204);
    } else {
      res.status(404).send("Student not found");
    }
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send("Server error");
  }
});

app.listen(3000, () => console.log("🚀 Server is running on port 3000"));
