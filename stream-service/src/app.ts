import express from "express";
import bookRoutes from "./routes/stream.route";
import kafka from "./config/kafka";

const app = express();

app.use(express.json());
app.use("/api/v1/stream", bookRoutes);

const PORT = process.env.PORT || 3003;

const start = async () => {
  await kafka.connectProducer();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();