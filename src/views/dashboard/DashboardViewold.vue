<template>
  <section class="page-container dashboard-page">
    <div class="dashboard-page__hero">
      <div>
        <p class="dashboard-page__eyebrow">经营概览</p>
        <h1>你好，{{ displayName }}。</h1>
        <p>这里展示当前账号在权限范围内可见的关键经营数据。</p>
      </div>
      <el-button :icon="Refresh" :loading="loading" @click="loadDashboard">刷新数据</el-button>
    </div>

    <el-alert
      v-if="errorMessage"
      :title="errorMessage"
      type="warning"
      show-icon
      :closable="false"
      class="dashboard-page__alert"
    />

    <div class="dashboard-page__metrics">
      <article v-for="card in metricCards" :key="card.label" class="metric-card">
        <div class="metric-card__icon" :class="`metric-card__icon--${card.type}`">
          <el-icon><component :is="card.icon" /></el-icon>
        </div>
        <div>
          <p>{{ card.label }}</p>
          <strong>{{ card.value }}</strong>
          <small>{{ card.description }}</small>
        </div>
      </article>
    </div>

    <div class="dashboard-page__grid">
      <el-card shadow="never" class="dashboard-panel dashboard-panel--wide">
        <template #header>
          <div class="dashboard-panel__header">
            <div>
              <h3>待办事项</h3>
              <p>需要及时处理的业务单据</p>
            </div>
            <el-icon><List /></el-icon>
          </div>
        </template>

        <el-empty v-if="!loading && !dashboard.todos.length" description="暂无待办事项" :image-size="76" />
        <div v-else class="todo-list">
          <button v-for="item in dashboard.todos" :key="item.label" class="todo-item" @click="goTo(item.path)">
            <span class="todo-item__dot"></span>
            <span class="todo-item__label">{{ item.label }}</span>
            <strong>{{ item.count }}</strong>
            <el-icon><ArrowRight /></el-icon>
          </button>
        </div>
      </el-card>

      <el-card shadow="never" class="dashboard-panel">
        <template #header>
          <div class="dashboard-panel__header">
            <div>
              <h3>库存预警</h3>
              <p>低于商品安全库存</p>
            </div>
            <el-tag type="danger" effect="light">{{ dashboard.stockAlerts.length }} 项</el-tag>
          </div>
        </template>

        <el-empty v-if="!loading && !dashboard.stockAlerts.length" description="暂无库存预警" :image-size="76" />
        <div v-else class="stock-alert-list">
          <div v-for="item in dashboard.stockAlerts" :key="item.id" class="stock-alert-item">
            <div>
              <strong>{{ item.name }}</strong>
              <span>{{ item.code }}</span>
            </div>
            <div class="stock-alert-item__qty">
              <b>{{ formatNumber(item.available_qty, { maximumFractionDigits: 3 }) }}</b>
              <span>/ 安全 {{ formatNumber(item.safety_stock, { maximumFractionDigits: 3 }) }}</span>
            </div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="dashboard-panel dashboard-panel--wide">
        <template #header>
          <div class="dashboard-panel__header">
            <div>
              <h3>近期操作</h3>
              <p>系统最近记录的业务行为</p>
            </div>
            <el-icon><Document /></el-icon>
          </div>
        </template>

        <el-table :data="dashboard.logs" size="small" stripe>
          <el-table-column prop="module" label="模块" min-width="130" />
          <el-table-column prop="operation" label="操作" min-width="130" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'danger'" size="small">
                {{ row.status === 'success' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="时间" min-width="180">
            <template #default="{ row }">{{ formatDateTime(row.created_at) }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight, Document, List, Money, Refresh, ShoppingCart, WarningFilled } from '@element-plus/icons-vue'
import { getDashboardOverview } from '@/api/dashboard'
import { useAuthStore } from '@/stores/auth'
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const errorMessage = ref('')
const dashboard = reactive({
  metrics: {
    todaySalesAmount: 0,
    monthSalesAmount: 0,
    pendingOrderCount: 0,
    stockAlertCount: 0
  },
  stockAlerts: [],
  todos: [],
  logs: []
})

const displayName = computed(() => authStore.profile?.display_name || authStore.profile?.user_name || '同事')
const metricCards = computed(() => [
  {
    label: '今日销售额',
    value: formatCurrency(dashboard.metrics.todaySalesAmount),
    description: '已排除草稿、驳回和关闭单据',
    icon: Money,
    type: 'primary'
  },
  {
    label: '本月销售额',
    value: formatCurrency(dashboard.metrics.monthSalesAmount),
    description: '按销售订单的应收金额统计',
    icon: ShoppingCart,
    type: 'success'
  },
  {
    label: '待处理订单',
    value: formatNumber(dashboard.metrics.pendingOrderCount),
    description: '采购与销售待审核单据合计',
    icon: List,
    type: 'warning'
  },
  {
    label: '库存预警',
    value: formatNumber(dashboard.metrics.stockAlertCount),
    description: '可用库存低于安全库存的商品',
    icon: WarningFilled,
    type: 'danger'
  }
])

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    const data = await getDashboardOverview()
    Object.assign(dashboard.metrics, data.metrics)
    dashboard.stockAlerts = data.stockAlerts
    dashboard.todos = data.todos
    dashboard.logs = data.logs
  } catch (error) {
    errorMessage.value = `仪表盘数据加载失败：${error.message || '请检查数据权限与 Supabase 配置。'}`
  } finally {
    loading.value = false
  }
}

function goTo(path) {
  router.push(path)
}

onMounted(loadDashboard)
</script>
