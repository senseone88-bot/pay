/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_ECPAY_MERCHANT_ID: string;
  readonly VITE_ECPAY_HASH_KEY: string;
  readonly VITE_ECPAY_HASH_IV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
