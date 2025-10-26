<script setup lang="ts" name="ProductManage">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { ProductApi } from '@/api/modules/product'
import { ProductStatusList } from '@/configs/enum'
// 获取 ProTable 元素，调用其获取刷新数据方法（还能获取到当前查询参数，方便导出携带参数）
const proTable = ref()

// 如果表格需要初始化请求参数，直接定义传给 ProTable(之后每次请求都会自动带上该参数，此参数更改之后也会一直带上，改变此参数会自动刷新表格数据)
const initParam = reactive({ isPublic: 0 })

// dataCallback 是对于返回的表格数据做处理，如果你后台返回的数据不是 datalist && total 这些字段，那么你可以在这里进行处理成这些字段
const dataCallback = (data: any) => {
  return {
    list: data.list,
    total: data.total
  }
}
// 表格配置项
const columns: ColumnProps[] = [
  { type: 'selection', fixed: 'left', width: 60 },
  {
    prop: 'name',
    label: '商品名称',
    minWidth: 120
  },
  {
    prop: 'price',
    label: '价格',
    minWidth: 120
  },
  {
    prop: 'sales',
    label: '销量',
    minWidth: 120
  },
  {
    prop: 'stock',
    label: '库存数量',
    minWidth: 120
  },
  {
    prop: 'status',
    label: '商品状态',
    minWidth: 120,
    enum: Object.values(ProductStatusList),
    search: { el: 'select' }
  },

  { prop: 'operation', label: '操作', fixed: 'right', width: 230 }
]
</script>
<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="客户列表"
      rowKey="id"
      :columns="columns"
      :requestApi="ProductApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格 header 按钮 -->
      <!-- <template #tableHeader="scope">
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:customer:add']" @click="openDrawer('新增')">新增客户</el-button>
        <el-button type="primary" :icon="Download" v-hasPermi="['sys:customer:export']" @click="downloadFile">导出客户</el-button>
        <el-button type="danger" :icon="Delete" :disabled="!scope.isSelected" v-hasPermi="['sys:customer:remove']" @click="batchDelete(scope.selectedListIds)">批量删除</el-button>
      </template> -->
      <!-- 表格操作 -->
      <!-- <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:customer:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="danger" link :icon="Delete" v-hasPermi="['sys:customer:remove']" @click="batchDelete([scope.row.id])">删除</el-button>
        <el-button type="warning" link :icon="Share" v-hasPermi="['sys:customer:share']" @click="customerToPublic(scope.row.id)">转入公海</el-button>
      </template> -->
    </ProTable>
    <CustomerDialog ref="dialogRef" />
  </div>
</template>

<style scoped></style>
