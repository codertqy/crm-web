<template>
  <Dialog
    :model-value="dialogVisible"
    :title="dialogProps.title"
    :fullscreen="dialogProps.fullscreen"
    :max-height="dialogProps.maxHeight"
    :cancel-dialog="cancelDialog"
    width="80%"
    top="7vh"
  >
    <div :style="'width: calc(100% - ' + dialogProps.labelWidth! / 2 + 'px)'">
      <el-form
        ref="ruleFormRef"
        label-position="right"
        :label-width="dialogProps.labelWidth + 'px'"
        :rules="rules"
        :model="dialogProps.row"
        :disabled="dialogProps.isView"
        :hide-required-asterisk="dialogProps.isView"
      >
        <el-form-item label="合同编号" prop="number" v-if="dialogProps.row!.id">
          <el-input v-model="dialogProps.row!.number" readonly="true" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="合同名称" prop="name">
          <el-input v-model="dialogProps.row!.name" clearable maxlength="100" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="签约客户" prop="customerId">
          <div class="flex" style="width: 100%">
            <el-input v-model="dialogProps.row!.customerName" placeholder="请选择要签约的客户" class="mr-18px" disabled> </el-input>

            <el-button type="primary" @click="openCustomerDialog">客户信息</el-button>
            <CustomerDialog ref="customerRef" @get-customer-data="openCustomerDialog" />
          </div>
        </el-form-item>
        <div class="flex" style="width: 100%">
          <el-form-item label="合同开始时间" prop="startTime">
            <el-date-picker
              v-model="dialogProps.row!.startTime"
              type="date"
              placeholder="选择合同开始时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
          <el-form-item label="合同结束时间" prop="endTime">
            <el-date-picker
              v-model="dialogProps.row!.endTime"
              type="date"
              placeholder="选择合同结束时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
          <el-form-item label="合同签约时间" prop="signTime">
            <el-date-picker
              v-model="dialogProps.row!.signTime"
              type="date"
              placeholder="选择合同签约时间"
              value-format="YYYY-MM-DD"
              :disabled-date="(time) => time.getTime() < Date.now() - 8.64e7"
            />
          </el-form-item>
        </div>
        <div class="flex" style="width: 100%">
          <el-form-item label="合同总金额" prop="amount" style="flex: 1">
            <el-input v-model="dialogProps.row!.amount" clearable readonly="true"></el-input>
          </el-form-item>
          <el-form-item label="已收款项" prop="receivedAmount" style="flex: 1">
            <el-input v-model="dialogProps.row!.receivedAmount" clearable></el-input>
          </el-form-item>
        </div>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dialogProps.row!.remark" clearable type="textarea" maxlength="100" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <div style="width: 100%">
        <h2>合同产品关系</h2>
        <el-divider />
        <el-table :data="dialogProps.row.products" border style="width: 100%">
          <el-table-column prop="pName" label="商品录入" min-width="140">
            <template #default="scope">
              <el-input v-model="scope.row.pName" placeholder="请输入商品" readonly="true" style="width: 180px" />
              <el-button type="primary" style="margin-left: 5px" @click="openProductDialog1(scope.$index)">选择商品</el-button>
              <!-- 使用动态 ref -->
              <ProductDialog ref="productRef" @getProductData="(val) => openProductDialog2(val, scope.$index)" />
            </template>
          </el-table-column>
          <el-table-column prop="price" label="单价"> </el-table-column>
          <el-table-column prop="count" label="数量">
            <template #default="scope">
              <el-input-number v-model="scope.row.count" :min="1" @change="calculateSubtotal(scope.row)" style="width: 100px" />
            </template>
          </el-table-column>
          <el-table-column prop="totalPrice" label="小计" />
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="danger" size="small" link @click="removeContractProduct(scope.row, scope.$index)"> 删除 </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div style="display: flex; justify-content: center; width: 100%; margin-top: 10px">
          <el-button type="primary" @click="addContractProduct"> + 添加合同产品关系 </el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <slot name="footer">
        <el-button @click="cancelDialog">取消</el-button>
        <el-button type="primary" v-show="!dialogProps.isView" @click="handleSubmit">确定</el-button>
      </slot>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, FormInstance } from 'element-plus'
import { Dialog } from '@/components/Dialog'
import CustomerDialog from './CustomerDialog.vue'
import ProductDialog from '@/views/Contract/components/ProductDialog.vue'
import { ProductApi } from '@/api/modules/product'
interface DialogProps {
  title: string
  isView: boolean
  fullscreen?: boolean
  row: any
  labelWidth?: number
  maxHeight?: number | string
  api?: (params: any) => Promise<any>
  getTableList?: () => Promise<any>
}
const dialogVisible = ref(false)
const dialogProps = ref<DialogProps>({
  isView: false,
  title: '',
  row: {
    status: 0,
    products: []
  },
  labelWidth: 120,
  fullscreen: false,
  maxHeight: '500px',
  api: ProductApi.saveOrEdit
})

// 接收父组件传过来的参数
const acceptParams = (params: DialogProps): void => {
  params.row = { ...dialogProps.value.row, ...params.row }
  dialogProps.value = { ...dialogProps.value, ...params }
  dialogVisible.value = true
}

defineExpose({
  acceptParams
})
// 表单验证
const rules = reactive({
  customerId: [{ required: true, message: '请选择客户', trigger: 'blur' }],
  name: [{ required: true, message: '请输入合同名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择合同开始时间', trigger: 'blur' }],
  endTime: [{ required: true, message: '请选择合同结束时间', trigger: 'blur' }],
  signTime: [{ required: true, message: '请选择合同签约时间', trigger: 'blur' }],
  receivedAmount: [{ required: true, message: '请输入合同总金额', trigger: 'blur' }]
})

const ruleFormRef = ref<FormInstance>()

const handleSubmit = () => {
  ruleFormRef.value!.validate(async (valid) => {
    if (!valid) return
    try {
      delete dialogProps.value.row['updateTime']
      delete dialogProps.value.row['createTime']
      console.log('=======>携带给后端的参数', dialogProps.value.row)
      await dialogProps.value.api!(dialogProps.value.row)
      ElMessage.success({ message: `${dialogProps.value.title}成功！` })
      dialogProps.value.getTableList!()
      dialogVisible.value = false
      ruleFormRef.value!.resetFields()
      cancelDialog(true)
    } catch (error) {
      console.log(error)
    }
  })
}
const cancelDialog = (isClean?: boolean) => {
  dialogVisible.value = false
  let condition = ['查看', '编辑']
  if (condition.includes(dialogProps.value.title) || isClean) {
    dialogProps.value.row = {}
    ruleFormRef.value!.resetFields()
  }
}

// 客户传值
const customerRef = ref()
const openCustomerDialog = (val) => {
  let params = {
    title: '客户列表',
    fullScreen: false,
    maxHeight: '500px'
  }
  if (val.id && val.name) {
    dialogProps.value.row.customerId = val.id
    dialogProps.value.row.customerName = val.name
  }
  customerRef.value.acceptParams(params)
}

// 商品传值
const productRef = ref() // 存储多个 ProductDialog 实例

const editProductIndex = ref(-1)
// 打开商品列表的弹窗
const openProductDialog1 = (index) => {
  editProductIndex.value = index
  let params = {
    title: '商品列表',
    fullScreen: false,
    maxHeight: '500px'
  }
  productRef.value.acceptParams(params)
}
// 父组件接收到数据，用来处理多个商品的数据
const openProductDialog2 = (val, index) => {
  console.log('商品子组件传递给父组件的商品数据=========》', val)

  if (val.id && val.name) {
    dialogProps.value.row.products[index].pName = val.name
    dialogProps.value.row.products[index].pId = val.id
    dialogProps.value.row.products[index].price = val.price
    dialogProps.value.row.products[index].count = 1
    dialogProps.value.row.products[index].totalPrice = val.price * 1
    console.log('该合同的所有信息包含商品数据======》', dialogProps.value.row)
    calculateSubtotal(dialogProps.value.row.products[index])
  }
}
const calculateSubtotal = (row) => {
  row.totalPrice = row.price * row.count
  dialogProps.value.row.amount = dialogProps.value.row.products.reduce((acc, cur) => {
    return acc + cur.totalPrice
  }, 0)
}

const removeContractProduct = (value, index) => {
  // 将商品删除并且合同总价需要改变
  dialogProps.value.row.products.splice(index, 1)
  calculateSubtotal(value)
}

const addContractProduct = () => {
  // console.log(dialogProps.value.row)
  dialogProps.value.row.products.push({
    pName: '',
    pId: 0,
    price: 0,
    count: 1,
    totalPrice: 0
  })
}
</script>
