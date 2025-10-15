import express from "express";
import sequelize from "./config/db.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => res.send("API Running ✅"));

const PORT = process.env.PORT || 5000;

sequelize.authenticate()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ DB Connection Failed:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
