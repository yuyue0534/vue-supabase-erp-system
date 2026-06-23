import { supabase } from '@/utils/supabase'

function dateString(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function sumAmount(rows = [], field = 'receivable_amount') {
  return rows.reduce((sum, row) => sum + Number(row[field] || 0), 0)
}

function normalizeError(result) {
  if (result.error) throw result.error
  return result.data || []
}

export async function getDashboardOverview() {
  const now = new Date()
  const today = dateString(now)
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const [todaySalesResult, monthSalesResult, pendingPurchaseResult, pendingSalesResult, stocksResult, productsResult, logsResult] = await Promise.all([
    supabase
      .from('sal_orders')
      .select('id, order_date, receivable_amount, status')
      .eq('order_date', today)
      .not('status', 'in', '(draft,rejected,closed)')
      .limit(1000),
    supabase
      .from('sal_orders')
      .select('id, order_date, receivable_amount, status')
      .gte('order_date', monthStart)
      .not('status', 'in', '(draft,rejected,closed)')
      .limit(5000),
    supabase
      .from('pur_orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['submitted', 'under_review']),
    supabase
      .from('sal_orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['submitted', 'under_review']),
    supabase
      .from('inv_stocks')
      .select('product_id, quantity_available, warehouse_id')
      .eq('status', 'active')
      .limit(5000),
    supabase
      .from('base_products')
      .select('id, code, name, safety_stock')
      .eq('status', 'active')
      .limit(5000),
    supabase
      .from('sys_operation_logs')
      .select('id, module, operation, status, created_at, actor_user_id')
      .order('created_at', { ascending: false })
      .limit(8)
  ])

  const todaySales = normalizeError(todaySalesResult)
  const monthSales = normalizeError(monthSalesResult)
  const stocks = normalizeError(stocksResult)
  const products = normalizeError(productsResult)
  const logs = normalizeError(logsResult)

  if (pendingPurchaseResult.error) throw pendingPurchaseResult.error
  if (pendingSalesResult.error) throw pendingSalesResult.error

  const stockByProduct = new Map()
  stocks.forEach((stock) => {
    const available = Number(stock.quantity_available || 0)
    stockByProduct.set(stock.product_id, (stockByProduct.get(stock.product_id) || 0) + available)
  })

  const stockAlerts = products
    .map((product) => ({
      ...product,
      available_qty: stockByProduct.get(product.id) || 0
    }))
    .filter((product) => Number(product.safety_stock || 0) > 0 && product.available_qty < Number(product.safety_stock))
    .sort((a, b) => a.available_qty - b.available_qty)

  return {
    metrics: {
      todaySalesAmount: sumAmount(todaySales),
      monthSalesAmount: sumAmount(monthSales),
      pendingOrderCount: Number(pendingPurchaseResult.count || 0) + Number(pendingSalesResult.count || 0),
      stockAlertCount: stockAlerts.length
    },
    stockAlerts: stockAlerts.slice(0, 8),
    todos: [
      { label: '待审核采购订单', count: Number(pendingPurchaseResult.count || 0), path: '/purchase/orders' },
      { label: '待审核销售订单', count: Number(pendingSalesResult.count || 0), path: '/sales/orders' }
    ],
    logs
  }
}
