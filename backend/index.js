const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONT_ORIGIN, 
    credentials: true,
  })
);

// ✅ MongoDB 연결
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB 연결 성공"))
  .catch((err) => console.log("연결 실패", err));

// ✅ Trip 라우트 사용
const tripRoutes = require("./routes/tripRoutes");
app.use("/auth/trips", tripRoutes);

app.get("/", (req, res) => {
  res.send("Hello Express");
});

app.listen(PORT, () => {
  console.log('tripRoutes from:', require.resolve('./routes/tripRoutes'));
  console.log(`Server is Running on port ${PORT}!`);
});
