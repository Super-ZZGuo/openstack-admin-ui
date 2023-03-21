<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="名称" prop="networkName">
            <el-input
              v-model="queryParams.networkName"
              placeholder="请输入靶场名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="24">
            <el-button
              v-permisaction="['admin:sysNetwork:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>
        </el-row>

        <el-table
          v-loading="loading"
          :data="sysNetworkList"
          default-expand-all
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="网络ID" sortable="custom" prop="networkId" width="100" />
          <el-table-column label="网络名称" sortable="custom" prop="networkName" width="100" :show-overflow-tooltip="true" />
          <el-table-column label="CIDR" sortable="custom" prop="cidr" width="150" :show-overflow-tooltip="true" />
          <el-table-column label="靶场名称" sortable="custom" prop="projectName" :show-overflow-tooltip="true" />
          <el-table-column label="可分配IP(起始)" sortable="custom" prop="poolStart" width="150" :show-overflow-tooltip="true" />
          <el-table-column label="可分配IP(结尾)" sortable="custom" prop="poolEnd" width="150" :show-overflow-tooltip="true" />
          <el-table-column label="标签" sortable="custom" prop="tag" width="150" :show-overflow-tooltip="true" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template slot-scope="scope">
              <el-button
                v-permisaction="['admin:sysImg:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>
              <el-button
                v-if="scope.row.p_id != 0"
                v-permisaction="['admin:sysImg:remove']"
                size="mini"
                type="text"
                icon="el-icon-delete"
                @click="handleDelete(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total>0"
          :total="total"
          :page.sync="queryParams.pageIndex"
          :limit.sync="queryParams.pageSize"
          @pagination="getList"
        />

        <!-- 添加或修改对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="800px">
          <el-form ref="form" :model="form" :rules="rules" label-width="200px">
            <el-row>
              <el-col :span="12">
                <el-form-item label="网络名称" prop="networkName">
                  <el-input
                    v-model="form.networkName"
                    placeholder="请输入网络名称"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="CIDR" prop="cidr">
                  <el-input
                    v-model="form.cidr"
                    :disabled="isEdit"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="靶场名称" prop="projectName">
                  <el-input
                    v-model="form.projectName"
                    :disabled="isEdit"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="可分配IP(起始)" prop="poolStart">
                  <el-input
                    v-model="form.poolStart"
                    :disabled="isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="可分配IP(结尾)" prop="poolEnd">
                  <el-input
                    v-model="form.poolEnd"
                    :disabled="isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="标签" prop="tag">
                  <el-input
                    v-model="form.tag"
                    placeholder="请输入标签名字"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-dialog>
      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addSysNetwork, delSysNetwork, getSysNetwork, listSysNetwork, updateSysNetwork } from '@/api/admin/sys-network'

export default {
  name: 'SysNetwork',
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      isEdit: false,
      // 类型数据字典
      typeOptions: [],
      sysNetworkList: [],

      // 关系表类型

      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10

      },
      // 表单参数
      form: {
      },
      // 表单校验
      rules: {},

      // 网络更新特定结构体
      sysNetworkStructUpdate: {
        projectName: '',
        networkOldName: '',
        networkNewName: '',
        oldTag: '',
        newTag: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listSysNetwork(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.sysNetworkList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    // 取消按钮
    cancel() {
      this.open = false
      this.reset()
    },
    // 表单重置
    reset() {
      this.form = {
        projectName: undefined,
        networkId: undefined,
        networkName: undefined,
        cidr: undefined,
        poolStart: undefined,
        poolEnd: undefined,
        tag: undefined
      }
      this.resetForm('form')
    },
    getImgList: function() {
      this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    },
    fileClose: function() {
      this.fileOpen = false
    },
    // 关系
    // 文件
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      console.log(this.queryParams)
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加SysNetwork'
      this.isEdit = false
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.networkId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      const networkId =
                row.networkId || this.ids
      getSysNetwork(networkId).then(response => {
        this.form = response.data
        this.sysNetworkStructUpdate.projectName = row.projectName
        this.sysNetworkStructUpdate.networkOldName = row.networkName
        this.sysNetworkStructUpdate.oldTag = row.tag
        this.open = true
        this.title = '修改网络'
        this.isEdit = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.networkId !== undefined) {
            this.sysNetworkStructUpdate.networkNewName = this.form.networkName
            this.sysNetworkStructUpdate.newTag = this.form.tag
            updateSysNetwork(this.form.networkId, this.sysNetworkStructUpdate).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addSysNetwork(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      var Ids = (row.networkId && [row.networkId]) || this.ids

      this.$confirm('是否确认删除编号为"' + Ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(function() {
        return delSysNetwork({ 'ids': Ids })
      }).then((response) => {
        if (response.code === 200) {
          this.msgSuccess(response.msg)
          this.open = false
          this.getList()
        } else {
          this.msgError(response.msg)
        }
      }).catch(function() {
      })
    }
  }
}
</script>
