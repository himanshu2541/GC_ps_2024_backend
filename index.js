const express = require("express");
require("dotenv").config();
const userRoute = require("./routes/userRoute");
const adminRoute = require('./routes/adminRoute')
const connectDb = require("./db/connectDb");
const errorHandler = require("./middlewares/errorMiddleware");
connectDb();

const app = express();

const port = process.env.PORT || 5000;
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: false })); // url encoded

app.use("/user", userRoute);
app.use("/admin", adminRoute);
app.all("*", (req, res, next) => {
  res.status(404);
  next(new Error(`Can't find ${req.originalUrl} on this server!`));
})

app.use(errorHandler)

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
