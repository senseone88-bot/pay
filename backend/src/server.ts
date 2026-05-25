import app from "./app";
import { config } from "./config";

app.listen(config.port, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║   台灣電子支付管理平台 - Backend API      ║
  ║   Port: ${String(config.port).padEnd(31)}║
  ║   Env:  ${config.nodeEnv.padEnd(31)}║
  ╚═══════════════════════════════════════════╝
  `);
});
