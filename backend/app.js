const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// connect DB
connectDB();

// test route
const testRoute = require("./routes/testRoute");
app.use("/api", testRoute);

// log routes
const logRoutes = require("./routes/logRoutes");
app.use("/api", logRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
