const placeholder = () => import('@/views/common/ModulePlaceholderView.vue')

export const componentMap = {
  'dashboard/DashboardView': () => import('@/views/dashboard/DashboardView.vue'),

  'system/UserManage': () => import('@/views/system/UserManage.vue'),
  'system/RoleManage': () => import('@/views/system/RoleManage.vue'),
  'system/PermissionManage': () => import('@/views/system/PermissionManage.vue'),
  'system/MenuManage': () => import('@/views/system/MenuManage.vue'),
  'system/OperationLog': () => import('@/views/system/OperationLog.vue'),

  'base/CustomerManage': () => import('@/views/base/CustomerManage.vue'),
  'base/SupplierManage': () => import('@/views/base/SupplierManage.vue'),
  'base/WarehouseManage': () => import('@/views/base/WarehouseManage.vue'),
  'base/ProductCategory': () => import('@/views/base/ProductCategory.vue'),
  'base/ProductManage': () => import('@/views/base/ProductManage.vue'),

  'purchase/PurchaseOrder': placeholder,
  'purchase/PurchaseReceipt': placeholder,
  'purchase/PurchaseReturn': placeholder,
  'purchase/PurchaseStatement': placeholder,

  'sales/SalesOrder': placeholder,
  'sales/SalesDelivery': placeholder,
  'sales/SalesReturn': placeholder,
  'sales/SalesStatement': placeholder,

  'inventory/StockQuery': placeholder,
  'inventory/StockAdjust': placeholder,
  'inventory/StockTake': placeholder,
  'inventory/StockTransfer': placeholder,
  'inventory/StockFlow': placeholder,

  'finance/Receivable': placeholder,
  'finance/Payable': placeholder,
  'finance/ReceiptVoucher': placeholder,
  'finance/PaymentVoucher': placeholder,
  'finance/Expense': placeholder,

  'report/SalesReport': placeholder,
  'report/PurchaseReport': placeholder,
  'report/InventoryReport': placeholder,
  'report/FinanceReport': placeholder
}

export function resolveMenuComponent(componentPath) {
  return componentMap[componentPath] || placeholder
}
