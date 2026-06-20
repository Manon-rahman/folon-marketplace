import { appConfig } from '@/lib/config'

export async function sendSms(phone: string, message: string): Promise<void> {
  if (!appConfig.sms.apiKey) return // skip if not configured

  try {
    const url = new URL('https://sms.sslwireless.com/pushapi/dynamic/server.php')
    url.searchParams.set('api_token', appConfig.sms.apiKey)
    url.searchParams.set('sid', appConfig.sms.senderId)
    url.searchParams.set('msisdn', phone.startsWith('880') ? phone : `880${phone.replace(/^0/, '')}`)
    url.searchParams.set('sms', message)
    url.searchParams.set('csmsid', Date.now().toString())

    await fetch(url.toString())
  } catch {
    // SMS failure must never break order flow
  }
}

export function orderConfirmationMessage(params: {
  orderId: string
  total: number
  method: string
}): string {
  const totalTk = (params.total / 100).toFixed(0)
  const method = params.method === 'cod' ? 'Cash on Delivery' : 'bKash'
  return `Your Folon Marketplace order #${params.orderId.slice(-8).toUpperCase()} has been placed. Total: ৳${totalTk} via ${method}. We will contact you shortly.`
}
