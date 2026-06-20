export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [totalOrders, totalProducts, pendingOrders, revenueResult] = await Promise.all([
    prisma.order.count(),
    prisma.product.count({ where: { visible: true } }),
    prisma.order.count({ where: { status: { in: ['pending_cod', 'paid'] } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ['paid', 'shipped', 'confirmed'] } } }),
  ])
  const revenue = revenueResult._sum.total ?? 0

  const recentOrders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: { items: true },
  })

  const stats = [
    { label: 'Total Orders', value: totalOrders.toString() },
    { label: 'Active Products', value: totalProducts.toString() },
    { label: 'Pending Orders', value: pendingOrders.toString() },
    { label: 'Total Revenue', value: formatPrice(revenue) },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-[#1a1a1a] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-sm">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-[#4CA771] font-medium">View all</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No orders yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{order.customerName}</p>
                  <p className="text-xs text-gray-500">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · {order.paymentMethod}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#4CA771]">{formatPrice(order.total)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    order.status === 'paid' || order.status === 'confirmed' ? 'bg-[#e8f5ee] text-[#2e7049]' :
                    order.status === 'pending_cod' ? 'bg-amber-50 text-amber-700' :
                    order.status === 'shipped' ? 'bg-blue-50 text-blue-700' :
                    order.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
