'use client'
import { useEffect, useState } from 'react'
import { formatPrice } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface Order {
  id: string
  customerName: string
  customerPhone: string
  customerArea: string
  total: number
  paymentMethod: string
  status: string
  createdAt: string
  items: { name: string; quantity: number; price: number }[]
}

const STATUS_OPTIONS = ['pending_payment', 'pending_cod', 'paid', 'confirmed', 'shipped', 'cancelled']
const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'neutral'> = {
  paid: 'success', confirmed: 'success', shipped: 'success',
  pending_cod: 'warning', pending_payment: 'warning',
  cancelled: 'error',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/admin/orders')
    if (res.ok) setOrders(await res.json())
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Orders</h1>
      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        {orders.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-12">No orders yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <div key={order.id}>
                <button
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{order.customerName}</p>
                      <Badge variant={STATUS_VARIANT[order.status] ?? 'neutral'}>{order.status}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{order.customerPhone} · {order.customerArea} · {new Date(order.createdAt).toLocaleDateString('en-BD')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-[#4CA771]">{formatPrice(order.total)}</p>
                    <p className="text-xs text-gray-400">{order.paymentMethod}</p>
                  </div>
                </button>
                {expanded === order.id && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                    <div className="py-3">
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">Items</p>
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm py-0.5">
                          <span className="text-gray-700">{item.name} × {item.quantity}</span>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-2">Update Status</p>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((s) => (
                          <button
                            key={s}
                            onClick={() => updateStatus(order.id, s)}
                            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${order.status === s ? 'bg-[#4CA771] text-white border-[#4CA771]' : 'border-gray-200 text-gray-600 hover:border-[#4CA771] hover:text-[#4CA771]'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
