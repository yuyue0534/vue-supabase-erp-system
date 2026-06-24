# Vue 3 + Supabase 企业 ERP 管理系统

> 基于 **Vue 3（JavaScript）+ Vue Router 4 + Pinia + Element Plus + Supabase** 构建的轻量级企业 ERP 管理系统。
>
> 当前已完成系统管理、基础数据、采购、销售、库存、财务、报表中心和仪表盘等核心模块；账号认证、角色权限、RLS、库存过账、收付款核销和报表查询均已接入 Supabase/PostgreSQL。

---

## 目录

- [项目概览](#项目概览)
- [核心能力](#核心能力)
- [技术架构](#技术架构)
- [功能清单](#功能清单)
- [业务流程](#业务流程)
- [数据库与权限设计](#数据库与权限设计)
- [项目目录](#项目目录)
- [本地启动](#本地启动)
- [Supabase 初始化](#supabase-初始化)
- [账号与角色初始化](#账号与角色初始化)
- [配置说明](#配置说明)
- [常用操作说明](#常用操作说明)
- [生产构建与部署](#生产构建与部署)
- [测试建议](#测试建议)
- [已知边界与注意事项](#已知边界与注意事项)
- [常见问题](#常见问题)

---

## 项目概览

本项目面向中小型商贸、批发、零售及库存型企业场景，覆盖从基础资料、采购入库、销售出库、库存变化到应收应付、收付款和经营报表的完整业务主链路。

项目采用 Supabase 作为后端平台：

- **PostgreSQL**：核心业务数据、事务函数、库存及财务过账。
- **Supabase Auth**：邮箱密码登录、会话恢复、用户身份认证。
- **RLS**：按用户、角色、权限和数据范围控制数据访问。
- **Storage**：商品图片、业务附件等私有文件存储。
- **Realtime**：库存查询页订阅库存变化并刷新展示。
- **PostgreSQL RPC**：库存过账、盘点生成、收付款核销、费用过账等高一致性业务操作。

当前工程默认采用“**无 Edge Function 模式**”：前端不会持有 `service_role`，不需要部署 Supabase CLI 或 Edge Function 即可完成主业务流程。

---

## 核心能力

- 邮箱密码登录、Session 恢复、退出登录、路由守卫。
- 数据库驱动的动态菜单和动态路由。
- 基于角色和权限编码的按钮级权限控制。
- Supabase RLS 数据隔离，超级管理员拥有全量权限。
- 商品、仓库、客户、供应商等基础资料管理。
- 采购订单、收货入库、采购退货、采购对账。
- 销售订单、发货出库、销售退货、销售对账。
- 多仓库、多库位库存查询、调整、盘点、调拨和流水追溯。
- 销售发货后自动生成应收；采购收货后自动生成应付。
- 收款、付款核销，费用单过账。
- ECharts 仪表盘与销售、采购、库存、财务报表。
- Excel 导入、导出；图表 PNG 导出；打印后另存为 PDF。
- 页面布局：左侧菜单独立滚动、顶部栏固定、右侧业务内容独立滚动。

---

## 技术架构

```text
┌───────────────────────────────────────────────────────────────┐
│                        Vue 3 Web Application                  │
│ Vue Router 4 · Pinia · Element Plus · ECharts · XLSX          │
├───────────────────────────────────────────────────────────────┤
│ api/ + composables/ + stores/ + components/ + views/          │
├───────────────────────────────────────────────────────────────┤
│                     Supabase JavaScript SDK                    │
├──────────────┬────────────────┬────────────────┬──────────────┤
│ Supabase Auth│ PostgreSQL +   │ Storage        │ Realtime     │
│ 邮箱密码登录  │ RLS + RPC      │ 商品图片/附件   │ 库存刷新      │
├──────────────┴────────────────┴────────────────┴──────────────┤
│ 角色权限 · 菜单 · 采购/销售/库存/财务/报表等 ERP 数据模型          │
└───────────────────────────────────────────────────────────────┘
```

### 前端技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Vue 3（Composition API，纯 JavaScript） |
| 构建工具 | Vite 8 |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| UI 组件 | Element Plus |
| 后端 SDK | `@supabase/supabase-js` |
| 图表 | ECharts 5 + `vue-echarts` |
| Excel | `xlsx` |

### 后端与数据库能力

| 类别 | 方案 |
|---|---|
| 数据库 | Supabase PostgreSQL |
| 认证 | Supabase Auth（邮箱 + 密码） |
| 授权 | RBAC + PostgreSQL RLS |
| 文件 | Supabase Storage 私有 Bucket |
| 实时 | Supabase Realtime（库存） |
| 关键业务操作 | PostgreSQL Function / RPC 原子事务 |

---

## 功能清单

### 1. 仪表盘

- 今日销售额、本月销售额、待处理订单、库存预警数等 KPI。
- 近 30 天销售趋势折线图。
- 商品销售 Top 10。
- 库存预警列表。
- 待审批采购单、销售单等待办事项。
- 最近操作日志。

### 2. 系统管理

- 用户资料、角色、权限、菜单、操作日志管理。
- 角色权限树配置与菜单动态加载。
- 用户启用/停用、角色分配。
- 按权限编码控制按钮显示，例如：

```vue
<el-button v-permission="['system:user:add']">新增用户</el-button>
```

> 当前默认不部署 Edge Function：**Auth 账号创建、密码重置、Auth 层禁用/删除**建议在 Supabase Dashboard 中处理；ERP 内部只管理 ERP 用户资料、角色和业务访问状态。

### 3. 基础数据

- 客户管理：编码、等级、联系人、地址、账期、信用额度、启停状态。
- 供应商管理：编码、联系人、结算信息、评级、启停状态。
- 仓库与库位：多仓库、多库位、允许负库存配置。
- 商品分类：树形结构、排序和图标。
- 计量单位：商品单位维护。
- 商品档案：基本资料、规格、价格、安全库存、图片、条码。
- 商品图片上传至 Supabase Storage，页面使用签名 URL 展示。
- 商品 Excel 模板下载、批量导入和数据导出。

### 4. 采购管理

- 采购订单：草稿、提交、审核、明细编辑、金额自动计算、商品选择、附件上传、打印。
- 收货入库：基于采购订单创建，支持部分收货、仓库库位和批次信息。
- 采购退货：基于已过账收货单创建。
- 采购对账：按供应商汇总收货、退货、净采购额和应付余额。
- 收货过账后：库存增加、订单收货数量更新、应付账款自动生成。

### 5. 销售管理

- 销售订单：客户选择、信用额度提示、库存提示、折扣、税额、含税/未税切换、订单来源。
- 销售发货：基于已审核销售订单创建，支持分批发货、仓库库位和物流信息。
- 销售退货：基于已过账发货单创建，支持退货入库。
- 销售对账：按客户汇总发货、退货、净销售额和应收余额。
- 发货过账后：库存扣减、订单发货数量更新、应收账款自动生成、客户已用信用额度更新。

### 6. 库存管理

- 库存查询：商品、分类、仓库、库位等多维度筛选。
- 库存预警：低于安全库存时高亮提示。
- 库存调整：调盈、调亏与调整原因记录。
- 库存盘点：按仓库和分类生成快照、录入实盘数、生成盘盈盘亏差异。
- 库存调拨：跨仓库、跨库位调拨。
- 库存流水：按商品、仓库、时间、业务类型追溯来源单据。
- Realtime：订阅 `inv_stocks` 变化，库存查询页面自动刷新。

### 7. 财务管理

- 应收账款：按客户、来源单据、到期日、逾期和账龄展示。
- 应付账款：按供应商、来源单据、到期日、逾期和账龄展示。
- 收款单：选择客户、加载未核销应收、自动/手工分配核销、草稿和过账。
- 付款单：选择供应商、加载未核销应付、自动/手工分配核销、草稿和过账。
- 费用单：费用分类、税额计算、草稿和过账。
- 收款过账会减少应收余额和客户已用信用额度。
- 付款过账会减少应付余额。

### 8. 报表中心

- 销售报表：销售趋势、商品 Top 10、客户排名、明细导出、图表 PNG 导出。
- 采购报表：采购趋势、供应商排名、商品采购金额、明细导出。
- 库存报表：库存金额、期间入库/出库、仓库金额排行、滞销商品、库存汇总导出。
- 财务报表：收支趋势、应收账龄、费用分类、销售毛利分析、账龄明细导出。
- 图表支持时间范围筛选和数据下钻。

### 9. 个人资料

- 当前登录用户可查看邮箱、角色和账号状态。
- 可维护用户名、真实姓名、手机号、头像地址等个人资料。
- 密码建议使用 Supabase Auth 的邮箱自助找回流程处理。

---

## 业务流程

### 采购到应付

```text
采购订单
  ↓ 提交 / 审核
采购收货
  ↓ 审核并过账
库存增加 + 采购订单收货数量更新 + 自动生成应付账款
  ↓
付款单
  ↓ 审核并过账
应付余额减少
```

### 销售到应收

```text
销售订单
  ↓ 提交 / 审核
销售发货
  ↓ 审核并过账
库存扣减 + 销售订单发货数量更新 + 自动生成应收账款
  ↓
收款单
  ↓ 审核并过账
应收余额减少 + 客户已用信用额度减少
```

### 库存调整与盘点

```text
库存查询
  ├─ 库存调整 → 审核并过账 → 库存余额 / 库存流水变化
  ├─ 库存盘点 → 生成盘点快照 → 实盘录入 → 差异过账
  └─ 库存调拨 → 调出仓库减少 / 调入仓库增加 / 写入流水
```

---

## 数据库与权限设计

### 核心业务表

| 模块 | 主要表 |
|---|---|
| 系统 | `sys_users`、`sys_roles`、`sys_permissions`、`sys_user_roles`、`sys_role_permissions`、`sys_menus`、`sys_operation_logs` |
| 基础数据 | `base_customers`、`base_suppliers`、`base_warehouses`、`base_warehouse_locations`、`base_product_categories`、`base_product_units`、`base_products`、`base_product_barcodes` |
| 采购 | `pur_orders`、`pur_order_items`、`pur_receipts`、`pur_receipt_items`、`pur_returns`、`pur_return_items` |
| 销售 | `sal_orders`、`sal_order_items`、`sal_deliveries`、`sal_delivery_items`、`sal_returns`、`sal_return_items` |
| 库存 | `inv_stocks`、`inv_transactions`、`inv_adjustments`、`inv_stocktakes`、`inv_transfers` 等 |
| 财务 | `fin_receivables`、`fin_payables`、`fin_receipts`、`fin_payments`、`fin_expenses` |

所有业务表均包含：

```text
id / created_at / updated_at / created_by
```

并由数据库触发器自动维护 `updated_at`。

### 角色与权限

预置角色：

| 角色编码 | 说明 |
|---|---|
| `SUPER_ADMIN` | 超级管理员，拥有全量系统与数据权限 |
| `ERP_MANAGER` | ERP 管理员，负责运营与审批 |
| `PURCHASER` | 采购专员 |
| `SALES` | 销售专员 |
| `WAREHOUSE_KEEPER` | 仓管员 |
| `FINANCE` | 财务专员 |
| `VIEWER` | 只读观察员 |

权限格式示例：

```text
system:user:read
system:user:add
base:product:update
purchase:order:approve
sales:delivery:post
inventory:stock:read
finance:receipt:post
report:sales:read
```

### RLS 与访问控制

- 所有业务表启用 Row Level Security。
- 超级管理员可访问全部授权资源。
- 普通用户需要同时满足：登录状态、已启用 ERP 用户状态、有效角色、对应权限编码和数据范围。
- 前端只使用 `publishable/anon` Key，**绝不使用 `service_role`**。
- 库存、收付款、费用等需要跨表同步的操作，通过 PostgreSQL RPC 处理，避免浏览器端多次写入造成半成功状态。

---

## 项目目录

```text
src/
├── api/
│   ├── base.js
│   ├── business.js
│   ├── dashboard.js
│   ├── finance.js
│   ├── inventory.js
│   ├── purchase.js
│   ├── report.js
│   ├── sales.js
│   └── system.js
├── assets/
│   └── styles/
├── components/
│   ├── business/
│   │   ├── AttachmentUploader.vue
│   │   ├── FulfillmentDocumentPage.vue
│   │   ├── OrderDocumentPage.vue
│   │   ├── OrderLineEditor.vue
│   │   ├── ProductSelector.vue
│   │   ├── ReturnDocumentPage.vue
│   │   └── StatementPage.vue
│   ├── common/
│   │   ├── DataTable.vue
│   │   ├── EChart.vue
│   │   ├── FormDialog.vue
│   │   └── SearchBar.vue
│   ├── finance/
│   │   ├── BalanceManagePage.vue
│   │   ├── ExpenseManagePage.vue
│   │   └── SettlementVoucherPage.vue
│   ├── layout/
│   │   ├── AppHeader.vue
│   │   ├── AppLayout.vue
│   │   └── AppSidebar.vue
│   └── report/
│       └── ReportChartCard.vue
├── composables/
│   ├── useAuth.js
│   ├── useForm.js
│   └── useTable.js
├── router/
│   ├── componentMap.js
│   └── index.js
├── stores/
│   ├── app.js
│   └── auth.js
├── utils/
│   ├── directives/
│   │   └── permission.js
│   ├── excel.js
│   ├── report.js
│   └── supabase.js
├── views/
│   ├── base/
│   ├── dashboard/
│   ├── finance/
│   ├── inventory/
│   ├── login/
│   ├── profile/
│   ├── purchase/
│   ├── report/
│   ├── sales/
│   └── system/
└── main.js

supabase/
└── migrations/
    ├── 20260623_phase3_system_management.sql
    ├── 20260624_phase5_7_inventory_workflows.sql
    └── 20260625_phase8_9_finance_reporting.sql
```

---

## 本地启动

### 运行环境

- Node.js：建议使用 Node.js 22 LTS；项目最低要求见 `package.json`。
- npm：随 Node.js 安装即可。
- Supabase：已创建项目，并可进入 Dashboard / SQL Editor。

### 安装依赖

在项目根目录执行：

```bash
npm install
```

### 环境变量

在项目根目录创建 `.env`：

```env
VITE_SUPABASE_URL=https://你的项目-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=你的-Supabase-publishable-key
```

> `VITE_SUPABASE_PUBLISHABLE_KEY` 仅用于浏览器端访问 Supabase API。不要把 `service_role`、数据库密码、SMTP 密钥等服务端密钥放入 `.env` 或提交到 Git 仓库。

### 启动开发环境

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:5173
```

### 生产构建检查

```bash
npm run build
npm run preview
```

---

## Supabase 初始化

请按以下顺序执行 SQL，避免函数、表结构和权限依赖顺序错误。

### 1. 执行核心数据库结构

在 Supabase Dashboard：

```text
SQL Editor → New query
```

完整执行：

```text
erp_phase_1_supabase_schema_final.sql
```

该脚本会创建：

- 所有 ERP 数据表、外键、索引。
- 自动维护 `updated_at` 的触发器。
- Auth 用户同步到 `sys_users` 的触发器。
- RLS 策略、角色权限、菜单、种子数据。
- 私有 Storage Bucket 与对象访问策略。

### 2. 执行系统管理补充迁移

```text
supabase/migrations/20260623_phase3_system_management.sql
```

### 3. 执行采购、销售、库存业务迁移

```text
supabase/migrations/20260624_phase5_7_inventory_workflows.sql
```

该迁移提供主要业务 RPC：

```text
erp_next_document_no(...)
erp_post_inventory(...)
erp_prepare_stocktake_items(...)
erp_product_stock_summary(...)
```

### 4. 执行财务与报表迁移

```text
supabase/migrations/20260625_phase8_9_finance_reporting.sql
```

该迁移提供：

```text
erp_post_receipt(...)
erp_post_payment(...)
erp_post_expense(...)
```

### 5. 重新登录

执行迁移、菜单或角色变更后，建议：

```text
退出 ERP → 重新登录
```

系统会重新拉取用户角色、权限和动态菜单。

---

## 账号与角色初始化

### 创建第一个用户

当前项目默认不提供公开注册入口。请在 Supabase Dashboard 创建第一个管理员账号：

```text
Authentication → Users → Add user → Create new user
```

填写邮箱和密码后，复制该用户的 UUID。

也可以通过 SQL 查找：

```sql
select id, email, created_at
from auth.users
order by created_at desc;
```

### 分配超级管理员角色

在 SQL Editor 执行：

```sql
select public.erp_assign_role_to_auth_user(
  '替换为-auth.users-id'::uuid,
  'SUPER_ADMIN',
  true
);
```

此操作会：

1. 激活对应 `sys_users` 的 ERP 使用状态。
2. 绑定 `SUPER_ADMIN` 角色。
3. 使用户登录后获得全部菜单和权限。

### 给普通员工分配角色

例如采购专员：

```sql
select public.erp_assign_role_to_auth_user(
  '替换为-auth.users-id'::uuid,
  'PURCHASER',
  true
);
```

常用角色编码：

```text
ERP_MANAGER
PURCHASER
SALES
WAREHOUSE_KEEPER
FINANCE
VIEWER
```

### 停用 ERP 使用权限

不删除 Auth 用户，只禁止其访问 ERP：

```sql
update public.sys_users
set status = 'inactive'
where auth_user_id = '替换为-auth.users-id'::uuid;
```

恢复时：

```sql
update public.sys_users
set status = 'active'
where auth_user_id = '替换为-auth.users-id'::uuid;
```

---

## 配置说明

### Auth 邮箱确认

测试阶段，若新建用户无法直接登录，可检查：

```text
Authentication → Providers → Email
```

若开启了邮件确认，新账号需要先完成邮箱验证。测试时可按实际需要关闭确认；生产环境建议开启邮箱确认并配置正式邮件服务。

### Storage

商品图片和业务附件使用私有 Storage Bucket。前端只保存对象路径，并在需要展示时请求短期签名 URL。

### Realtime

库存查询使用 `inv_stocks` 的 Realtime 订阅。若 Supabase 项目未允许该表加入 Realtime publication，页面仍可使用手动刷新查询库存。

---

## 常用操作说明

### 商品图片与附件

- 商品图片：进入基础数据 → 商品档案，在商品编辑页上传。
- 采购订单附件：在采购订单编辑页上传。
- 文件存储路径写入业务表；页面展示时使用签名 URL，避免直接公开 Bucket。

### Excel 导入导出

- 商品档案页面可下载导入模板、上传 Excel 并导出当前查询结果。
- 客户等基础资料和报表页面支持导出 Excel。
- 导入前请先维护商品分类、单位、仓库等必要基础资料。

### 打印与 PDF

采购/销售单据页面支持浏览器打印。选择浏览器打印窗口中的“另存为 PDF”即可导出 PDF。

### 已过账单据的处理原则

不要直接修改已过账的收货、发货、退货、调整、盘点、调拨、收款、付款和费用单。

建议使用：

```text
反向退货 / 反向调整 / 红冲或补充单据
```

保持库存、应收应付和历史流水可追溯。

---

## 生产构建与部署

### Vercel / Netlify

构建命令：

```bash
npm run build
```

输出目录：

```text
dist
```

在部署平台配置以下环境变量：

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

部署完成后，确保前端域名已配置到 Supabase Auth 的 Redirect URLs / Site URL 中；否则密码重置、邮箱验证等回跳可能失败。

### 建议的 Git 忽略规则

确保 `.gitignore` 至少包含：

```gitignore
node_modules/
dist/
.env
.env.*
!.env.example
```

### 数据库迁移管理建议

将已执行过的 SQL 放入 `supabase/migrations/` 并按日期排序；生产环境不要随意修改已执行的历史迁移，新增修复时应新增一份迁移文件。

### 备份建议

- 定期从 Supabase Dashboard 导出数据库备份或使用平台提供的备份能力。
- 对商品图片、业务附件建立 Storage 生命周期与备份策略。
- 生产环境上线前，先在独立 Supabase 项目完整演练迁移和关键流程。

---

## 测试建议

### 基础资料准备

先建立：

```text
计量单位
商品分类
仓库 / 库位
供应商
客户
商品档案
```

### 主业务验证顺序

1. 采购订单 → 提交 → 审核。
2. 采购收货 → 审核并过账。
3. 检查库存查询：库存是否增加；检查采购对账：应付是否生成。
4. 销售订单 → 提交 → 审核。
5. 销售发货 → 审核并过账。
6. 检查库存查询：库存是否扣减；检查销售对账：应收是否生成。
7. 创建收款单并过账，确认应收余额和客户已用额度减少。
8. 创建付款单并过账，确认应付余额减少。
9. 测试库存调整、盘点、调拨和库存流水追溯。
10. 进入仪表盘与报表中心，检查数据趋势、排行及导出结果。

### 当前验收状态

- 已完成：登录、动态菜单、页面路由、模块页面加载、数据库迁移执行、基础界面链路。
- 建议继续验证：真实业务数据下的库存、应收应付、核销、权限边界、并发操作、异常撤销与报表口径。

---

## 已知边界与注意事项

1. **项目不是完整财务总账系统**：当前财务模块聚焦应收、应付、收付款、费用和经营分析；未实现总账凭证、会计科目、结账、税务申报等专业财务能力。
2. **报表属于经营分析口径**：库存期初由当前库存和期间流水推算；销售毛利基于已记录的收入与出库成本，不替代正式财务报表。
3. **不公开注册**：ERP 属于内部系统，员工 Auth 账号建议由管理员在 Supabase Dashboard 创建，再通过 SQL 或系统角色功能赋权。
4. **不在浏览器使用 `service_role`**：前端只可使用 publishable/anon key。任何具备 Auth Admin 权限的操作必须留在 Supabase Dashboard 或受控服务端。
5. **库存并发与业务规则**：库存变更统一通过数据库 RPC，避免前端直接改库存余额。对于高频并发仓储场景，上线前需增加更完整的锁定、审批、撤销和审计策略。
6. **权限变更需重新登录**：修改用户角色、菜单或权限后，用户应退出并重新登录以刷新授权缓存。

---

## 常见问题

### 1. 登录成功但没有菜单或提示无权限

检查该 Auth 用户是否已绑定 ERP 用户和角色：

```sql
select
  u.email,
  u.user_name,
  u.status as erp_user_status,
  r.code as role_code,
  r.name as role_name
from public.sys_users u
left join public.sys_user_roles ur
  on ur.user_id = u.id
  and ur.status = 'active'
left join public.sys_roles r
  on r.id = ur.role_id
where u.auth_user_id = '替换为-auth.users-id'::uuid;
```

确认 `erp_user_status = active`，并至少拥有一个有效角色。之后退出并重新登录。

### 2. 启动时报 `Failed to resolve import "echarts/core"`

说明 Phase 8-9 新增图表依赖尚未安装：

```bash
npm install echarts@^5.6.0 vue-echarts@^7.0.3
```

然后重新启动：

```bash
npm run dev
```

### 3. 页面出现 `DataTable` 接收到 Object 而不是 Array 的警告

确认 `src/composables/useTable.js` 使用了 `reactive(...)` 包裹返回对象，让模板中的 `table.rows`、`table.loading` 自动解包为数组和布尔值。

### 4. 左侧菜单会跟随页面一起滚动

确认全局布局样式已设置：

- `html`、`body`、`#app` 使用 `height: 100%` 且 `overflow: hidden`。
- 左侧菜单容器内部滚动。
- 主内容区使用 `overflow: auto`。
- 顶部栏固定在布局流中。

### 5. 商品图片或附件无法显示

检查：

1. Storage Bucket 是否已由 Phase 1 SQL 成功创建。
2. 当前用户是否有对象读取权限。
3. 对象路径是否正确写入业务表。
4. 浏览器控制台中是否存在 Storage/RLS 拒绝错误。

### 6. 财务或库存过账失败

优先检查：

- 单据是否已提交、已审核且尚未过账。
- 当前用户是否拥有对应审批/过账权限。
- 商品、仓库、库位、客户或供应商基础数据是否完整。
- 是否出现库存不足，且仓库未允许负库存。
- Supabase SQL Editor 中相关 RPC 是否已执行成功。

---

## 后续可扩展方向

- 总账、会计科目、凭证、月结、税务及多币种。
- 采购/销售审批流、消息通知、待办催办。
- 更精细的数据范围：部门、组织、区域、业务员维度。
- 批次、序列号、保质期、先进先出和成本核算。
- 客户价格策略、合同、报价单、促销规则。
- 条码扫描、PDA 仓储作业、移动端。
- 更完整的单元测试、E2E 测试、数据库迁移自动化与 CI/CD。
- 引入受控后端或 Supabase Edge Functions，支持企业级 Auth 用户生命周期管理、邮件通知和异步任务。

---

## 安全提示

- 不要将 `service_role`、数据库密码、SMTP 密钥提交至 Git。
- 生产环境必须使用 HTTPS、强密码和邮件确认。
- 定期审查角色权限、RLS 策略和操作日志。
- 对正式环境先备份，再执行任何迁移或结构调整。

---

## 许可证

当前项目为内部 ERP 项目模板。正式商用前，请根据团队或公司的许可证、数据安全与合规要求补充声明。
