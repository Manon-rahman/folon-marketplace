export const appConfig = {
  appId: process.env.APP_ID ?? 'folon',
  appName: process.env.APP_NAME ?? 'Folon Marketplace',
  primaryColor: process.env.NEXT_PUBLIC_PRIMARY_COLOR ?? '#4CA771',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000',
  bkash: {
    appKey: process.env.BKASH_APP_KEY ?? '',
    appSecret: process.env.BKASH_APP_SECRET ?? '',
    username: process.env.BKASH_USERNAME ?? '',
    password: process.env.BKASH_PASSWORD ?? '',
    sandbox: process.env.BKASH_SANDBOX !== 'false',
  },
  sms: {
    apiKey: process.env.SMS_API_KEY ?? '',
    senderId: process.env.SMS_SENDER_ID ?? 'FolonMkt',
  },
  session: {
    secret: process.env.SESSION_SECRET ?? 'fallback-dev-secret-at-least-32-chars!!',
  },
}
