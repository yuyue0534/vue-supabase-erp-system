# Phase 3–4 实施说明

本阶段在 Phase 2 工程之上实现了系统管理与基础数据模块，并保持所有数据库读写经过 Phase 1 的 RLS。

## 一、执行数据库补充迁移

在 Supabase SQL Editor 执行：

```sql
-- supabase/migrations/20260623_phase3_system_management.sql
```

该迁移新增“权限管理”菜单。执行后请退出并重新登录，或刷新授权信息，才能在左侧系统管理菜单中看见该页面。

## 二、部署用户管理 Edge Function

用户创建、密码重置和删除必须调用 Supabase Auth Admin API。此 API 只能在可信服务端执行，不能放入浏览器。

1. 安装并登录 Supabase CLI。
2. 从项目根目录执行：

```bash
supabase link --project-ref <你的-project-ref>
supabase functions deploy manage-system-users
```

函数使用项目内置的 `SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY` 环境变量。它关闭平台层 `verify_jwt`，但会在处理器内通过登录用户 JWT 调用 `auth.getUser(token)` 并验证 `erp_is_super_admin()`；因此不能删除这个校验逻辑。

> 仅超级管理员能调用此函数。浏览器只保存 publishable/anon key；`service_role` 始终留在 Edge Function 运行环境。

## 三、已实现页面

### 系统管理

- `/system/users`：用户列表、创建、编辑、角色穿梭框、启停、重置密码、永久删除。
- `/system/roles`：角色 CRUD、数据范围、模块化权限树授权。
- `/system/permissions`：权限 CRUD。
- `/system/menus`：菜单树、图标选择、同级拖拽排序、路由/权限配置。
- `/system/logs`：操作日志时间范围筛选与 JSON 详情。

### 基础数据

- `/base/customers`：客户完整信息、级别标签、Excel 导出。
- `/base/suppliers`：供应商完整信息和评级展示、Excel 导出。
- `/base/warehouses`：仓库 CRUD，下拉展开维护库位。
- `/base/categories`：商品分类树、图标配置、拖拽层级/排序。
- `/base/products`：商品档案、多 Tab 编辑、私有 Storage 图片、条码管理、Excel 模板下载与批量导入、Excel 导出。

## 四、运行检查

```bash
npm install
npm run build
npm run dev
```

本阶段的生产构建已经在 Vite 8 下通过。
