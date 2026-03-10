import app from "./app";
import { ENV } from "./config/env";

const startServer = async () => {
  try {
    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server running on port ${ENV.PORT}`);
      console.log(`📍 http://localhost:${ENV.PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();