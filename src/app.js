import express from "express";

const app = express();


app.use(express.json());

app.get("/", (req, res) => {
  res.send("The server is running fine in port " + process.env.PORT + "!");
});

export default app;