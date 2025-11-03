<script setup lang="ts" name="ContractManage">
import { ref, reactive } from 'vue'
import { ColumnProps } from '@/components/ProTable/interface'
import ProTable from '@/components/ProTable/index.vue'
import { ContractApi } from '@/api/modules/contract/index'
import { ContractStatusList } from '@/configs/enum'
import { CirclePlus, EditPen, Promotion } from '@element-plus/icons-vue'
import ContractDialog from '@/views/Contract/components/ContractDialog.vue'
import print from 'print-js'

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
    label: '合同名称',
    minWidth: 120
  },
  {
    prop: 'number',
    label: '合同编号',
    minWidth: 120
  },
  {
    prop: 'customerName',
    label: '客户姓名',
    minWidth: 120
  },
  {
    prop: 'amount',
    label: '合同金额',
    minWidth: 120
  },
  {
    prop: 'receivedAmount',
    label: '已收到金额',
    minWidth: 120
  },
  {
    prop: 'signTime',
    label: '签约时间',
    minWidth: 120
  },
  {
    prop: 'status',
    label: '合同状态',
    minWidth: 120,
    enum: Object.values(ContractStatusList),
    search: { el: 'select' }
  },

  { prop: 'operation', label: '操作', fixed: 'right', width: 230 }
]
const dialogRef = ref()
const openDrawer = (title: string, row: Partial<any> = {}) => {
  console.log('当前合同的所有信息', row)
  let params = {
    title,
    row: { ...row },
    isView: title === '查看',
    api: ContractApi.saveOrEdit,
    getTableList: proTable.value.getTableList,
    maxHeight: '600px'
  }
  dialogRef.value.acceptParams(params)
}

// 打印功能
const openPrint = (row: any) => {
  const product =
    row.products
      ?.map(
        (item: any) => `
    <tr>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${item.pName}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${item.count}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${item.price}</td>
      <td style="padding: 6px; border: 1px solid #ddd; text-align: center;">${item.totalPrice}</td>
    </tr>
  `
      )
      .join('') || ''
  // 创建要打印的HTML内容
  const printableContent = `
    <div style="padding: 20px; font-family: Arial, sans-serif;">
      <h2 style="text-align: center;color:skyblue">合同信息</h2>
      <p style="text-align: center;color:skyblue">${row.name}</p>
      <!-- 主要信息表 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; width: 50%;">合同编号：${row.number}</td>
          <td style="padding: 8px; border: 1px solid #ddd; width: 50%;">下单日期：${row.signTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">客户名称：${row.customerName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">开始日期：${row.startTime}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">结束日期：${row.endTime}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">合同金额：${row.amount}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">已收款：${row.receivedAmount}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding: 8px; border: 1px solid #ddd; text-align: left;">备注：${row.remark || '无'}</td>
        </tr>
      </table>

      <!-- 购买产品或服务表 -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <th colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: center;">购买产品或服务</th>
          <tr style="background-color: #f5f5f5;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">名称</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">数量</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">单价</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">小计</th>
          </tr>
        </thead>
        <tbody>
          ${product}
        </tbody>
      </table>

      <!-- 签字部分 -->
      <div style="display: flex; justify-content: space-between; margin-top: 20px;">
        <div style="flex: 1; text-align: center;">
          <p><strong>甲方</strong></p>
          <p>盖章签名：___________</p>
          <p>日期：___________</p>
        </div>
        <div style="flex: 1; text-align: center;">
          <p><strong>乙方</strong></p>
          <p>盖章签名：___________</p>
          <p>日期：___________</p>
        </div>
      </div>
    </div>
  `

  // 使用 print-js 打印
  print({
    printable: printableContent,
    type: 'raw-html',
    style: '@page { margin: 0.5in; }'
  })

  console.log('打印合同信息', row)
}
</script>
<template>
  <div class="table-box">
    <ProTable
      ref="proTable"
      title="合同列表"
      rowKey="id"
      :columns="columns"
      :requestApi="ContractApi.page"
      :initParam="initParam"
      :dataCallback="dataCallback"
      :searchCol="{ xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }"
    >
      <!-- 表格 header 按钮 -->
      <template #tableHeader>
        <el-button type="primary" :icon="CirclePlus" v-hasPermi="['sys:contract:add']" @click="openDrawer('新增')">新增合同</el-button>
      </template>
      <!-- 表格操作 -->
      <template #operation="scope">
        <el-button type="primary" link :icon="EditPen" v-hasPermi="['sys:contract:edit']" @click="openDrawer('编辑', scope.row)">编辑</el-button>
        <el-button type="success" link :icon="Promotion" v-hasPermi="['sys:contract:print']" @click="openPrint(scope.row)">打印</el-button>
      </template>
    </ProTable>
    <ContractDialog ref="dialogRef" />
  </div>
</template>

<style scoped></style>
