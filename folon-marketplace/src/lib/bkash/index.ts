import { appConfig } from '@/lib/config'

const BASE_URL = appConfig.bkash.sandbox
  ? 'https://tokenized.sandbox.bka.sh/v1.2.0-beta'
  : 'https://tokenized.pay.bka.sh/v1.2.0-beta'

let tokenCache: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) return tokenCache.token

  const res = await fetch(`${BASE_URL}/tokenized/checkout/token/grant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      username: appConfig.bkash.username,
      password: appConfig.bkash.password,
    },
    body: JSON.stringify({
      app_key: appConfig.bkash.appKey,
      app_secret: appConfig.bkash.appSecret,
    }),
  })
  const data = await res.json()
  if (!data.id_token) throw new Error('bKash token grant failed')

  tokenCache = { token: data.id_token, expiresAt: Date.now() + 55 * 60 * 1000 }
  return data.id_token
}

export async function createPayment(params: {
  amount: string
  orderId: string
  callbackUrl: string
}): Promise<{ bkashURL: string; paymentID: string }> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}/tokenized/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'X-APP-Key': appConfig.bkash.appKey,
    },
    body: JSON.stringify({
      mode: '0011',
      payerReference: params.orderId,
      callbackURL: params.callbackUrl,
      amount: params.amount,
      currency: 'BDT',
      intent: 'sale',
      merchantInvoiceNumber: params.orderId,
    }),
  })
  const data = await res.json()
  if (data.statusCode !== '0000') throw new Error(data.statusMessage ?? 'bKash create failed')
  return { bkashURL: data.bkashURL, paymentID: data.paymentID }
}

export async function executePayment(paymentID: string): Promise<{
  trxID: string
  amount: string
  status: string
}> {
  const token = await getToken()
  const res = await fetch(`${BASE_URL}/tokenized/checkout/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
      'X-APP-Key': appConfig.bkash.appKey,
    },
    body: JSON.stringify({ paymentID }),
  })
  const data = await res.json()
  if (data.statusCode !== '0000') throw new Error(data.statusMessage ?? 'bKash execute failed')
  return { trxID: data.trxID, amount: data.amount, status: data.transactionStatus }
}
