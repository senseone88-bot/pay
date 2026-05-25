import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  ecpay: {
    merchantId: process.env.ECPAY_MERCHANT_ID || "2000132",
    hashKey: process.env.ECPAY_HASH_KEY || "5294y06JbISpM5x9",
    hashIV: process.env.ECPAY_HASH_IV || "v77hoKGq4kWxNNIS",
    paymentUrl:
      process.env.NODE_ENV === "production"
        ? "https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5"
        : "https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5",
  },

  newebpay: {
    merchantId: process.env.NEWEBPAY_MERCHANT_ID || "",
    apiKey: process.env.NEWEBPAY_API_KEY || "",
    apiSecret: process.env.NEWEBPAY_API_SECRET || "",
  },

  linepay: {
    channelId: process.env.LINE_PAY_CHANNEL_ID || "",
    channelSecret: process.env.LINE_PAY_CHANNEL_SECRET || "",
  },

  jkopay: {
    apiKey: process.env.JKOPAY_API_KEY || "",
    apiSecret: process.env.JKOPAY_API_SECRET || "",
    baseUrl:
      process.env.NODE_ENV === "production"
        ? "https://api.jkopay.com/v1"
        : "https://api-stage.jkopay.com/v1",
  },

  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret",
  },
};
