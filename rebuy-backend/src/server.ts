import "dotenv/config";

import app from "./app";
import "./config/database";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ReBuy server running on port ${PORT}`);
});
