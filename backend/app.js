const express = require("express");
const cors = require("cors");

// DB
const connectDB = require("./config/db");

const app = express();
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// routes
const testRoute = require("./routes/testRoute");
app.use("/api", testRoute);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
