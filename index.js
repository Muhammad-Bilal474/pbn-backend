import express from "express";
import cors from "cors";
import { PORT } from "./config/config.js";
import "./config/database/index.js";

const app = express();

app.use(cors());
app.use(express.json());

// routes
import v1Routes from "./src/routes/v1/index.js";
app.use("/api/v1", v1Routes);

// test routes
app.get("/", (req, res) => {
  res.send("Hello PBN Backend is running successfully");
});

app.get("/api", (req, res) => {
  res.json({
    status: true,
    message: "Server is running, this is initial route for PBN Backend",
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
