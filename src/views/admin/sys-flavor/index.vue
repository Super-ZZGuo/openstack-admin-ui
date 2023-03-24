<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="名称" prop="falvorName">
            <el-input
              v-model="queryParams.flavorName"
              placeholder="请输入实例名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="vcpu(个)" prop="vcpu">
            <el-input
              v-model="queryParams.vcpu"
              oninput="this.value = this.value.replace(/[^0-9]/g, '')"
              type="number"
              placeholder="请输入cpu核心个数"
              clearable
              size="small"
              min="1"
              max="100"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="内存大小(MB)" prop="ram">
            <el-input
              v-model="queryParams.ram"
              oninput="this.value = this.value.replace(/[^0-9]/g, '')"
              type="number"
              placeholder="请输入内存大小"
              clearable
              size="small"
              step="1024"
              min="0"
              max="102400"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="硬盘大小(GB)" prop="disk">
            <el-input
              v-model="queryParams.disk"
              oninput="this.value = this.value.replace(/[^0-9]/g, '')"
              type="number"
              placeholder="请输入硬盘大小"
              clearable
              size="small"
              min="1"
              max="102400"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysFlavor:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleAdd"
            >新增
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysFlavor:remove']"
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="multiple"
              @click="handleDelete"
            >删除</el-button>
          </el-col>

        </el-row>

        <el-table
          v-loading="loading"
          :data="sysFlaovrList"
          border
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="ID" sortable="custom" prop="flavorId" width="80" />
          <el-table-column label="vcpu(个)" sortable="custom" prop="vcpu" width="100" />
          <el-table-column label="内存大小(MB)" sortable="custom" prop="ram" width="130" />
          <el-table-column label="硬盘大小(GB)" sortable="custom" prop="disk" width="130" />
          <el-table-column label="实例类型名称" sortable="custom" prop="flavorName" width="150" :show-overflow-tooltip="true" />
          <el-table-column label="标签" sortable="custom" prop="tag" :show-overflow-tooltip="true" />

          <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.p_id != 0"
                v-permisaction="['admin:sysFlavor:remove']"
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

        <!-- 添加或修改镜像对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="400px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="70px">
            <el-row>
              <el-col :span="24">
                <el-form-item label="实例名称" prop="flavorName">
                  <el-input
                    v-model="form.flavorName"
                    clearable
                    placeholder="请输入镜像名称"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="vcpu" prop="vcpu">
                  <el-input
                    v-model="form.vcpu"
                    oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                    type="number"
                    clearable
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="内存大小" prop="ram">
                  <el-input
                    v-model="form.ram"
                    oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                    type="number"
                    step="512"
                    min="0"
                    max="102400"
                    clearable
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="硬盘大小" prop="disk">
                  <el-input
                    v-model="form.disk"
                    oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                    type="number"
                    clearable
                    controls-position="right"
                  />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="标签" prop="tag">
                  <el-input
                    v-model="form.tag"
                    type="textarea"
                    placeholder="请输入标签"
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
import { addSysFlavor, listSysFlavor, delSysFlavor } from '@/api/admin/sys-flavor'

export default {
  name: 'SysFlavor',
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
      // 类型数据字典
      sysFlaovrList: [],
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
      rules: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    /** 查询参数列表 */
    getList() {
      this.loading = true
      listSysFlavor(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.sysFlaovrList = response.data.list
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
        flavorId: undefined,
        flavorName: undefined,
        vcpu: undefined,
        ram: undefined,
        disk: undefined,
        tag: undefined
      }
      this.resetForm('form')
    },
    // getImgList: function() {
    //   this.form[this.fileIndex] = this.$refs['fileChoose'].resultList[0].fullUrl
    // },
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
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加SysFlavor'
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.flavorId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    // /** 修改按钮操作 */
    // handleUpdate(row) {
    //   this.reset()
    //   getSysImage(row.imageId).then(response => {
    //     this.sysImgStructUpdate.imageOldName = row.imageName
    //     this.sysImgStructUpdate.oldTag = row.tag
    //     this.form = response.data
    //     this.open = true
    //     this.title = '修改镜像'
    //     this.isEdit = true
    //     this.isEditO = true
    //   })
    // },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.form.vcpu = parseInt(this.form.vcpu)
          this.form.ram = parseInt(this.form.ram)
          this.form.disk = parseInt(this.form.disk)
          addSysFlavor(this.form).then(response => {
            if (response.code === 200) {
              this.msgSuccess(response.msg)
              this.open = false
              this.getList()
            } else {
              this.msgError(response.msg)
            }
          })
        }
      })
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      var Ids = (row.flavorId && [row.flavorId]) || this.ids
      var Names = (row.flavorName && [row.flavorName]) || this.ids.map(item => this.sysFlaovrList.find(subItem => subItem.flavorId === item).flavorName)
      this.$confirm('是否确认删除名称为"' + Names + '"的实例类型?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delSysFlavor({ 'ids': Ids, 'names': [row.flavorName] })
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
