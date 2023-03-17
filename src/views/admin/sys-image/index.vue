<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form :inline="true">
          <el-form-item label="名称" prop="imageName">
            <el-input
              v-model="queryParams.roleName"
              placeholder="请输入镜像名称"
              clearable
              size="small"
              @keyup.enter.native="handleQuery"
            />
          </el-form-item>
          <el-form-item label="类型" prop="type">
            <el-select v-model="queryParams.visible" placeholder="镜像类型" clearable size="small">
              <el-option
                v-for="img in sysImgOptions"
                :key="img.value"
                :label="img.label"
                :value="img.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
            <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysImage:add']"
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
          :data="sysImageList"
          default-expand-all
          border
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="编码" sortable="custom" prop="imageId" width="80" />
          <el-table-column label="镜像名称" sortable="custom" prop="imageName" width="250" :show-overflow-tooltip="true" />
          <el-table-column label="OpenStack Image ID" sortable="custom" prop="openstackId" width="350" />
          <el-table-column label="标签" sortable="custom" prop="tag" :show-overflow-tooltip="true" />
          <el-table-column label="类型" sortable="custom" prop="type" width="80" :show-overflow-tooltip="true" />
          <!-- <el-table-column label="权限字符" prop="roleKey" :show-overflow-tooltip="true" width="150" /> -->
          <!-- <el-table-column label="排序" sortable="custom" prop="roleSort" width="80" /> -->

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

        <!-- 添加或修改部门对话框 -->
        <el-dialog :title="title" :visible.sync="open" width="800px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="150px">
            <el-row>
              <el-col :span="24">
                <el-form-item label="镜像名称" prop="imageName">
                  <el-input v-model="form.imageName" placeholder="请输入镜像名称" />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="OpenStack Image ID" prop="openstackId">
                  <el-input v-model="form.openstackId" controls-position="right" :disabled="isEdit" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="标签" prop="tag">
                  <el-input v-model="form.tag" placeholder="请输入标签" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="类型" prop="type">
                  <el-select v-model="form.type" placeholder="请选择" :disabled="isEdit">
                    <el-option
                      v-for="img in sysImgOptions"
                      :key="img.value"
                      :label="img.label"
                      :value="img.value"
                    />
                  </el-select>
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
import { addSysImage, delSysImage, getSysImage, listSysImage, updateSysImage } from '@/api/admin/sys-image'

export default {
  name: 'SysImage',
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
      sysImageList: [],

      sysImgOptions: [{
        value: 'ami',
        label: 'ami'
      }, {
        value: 'ari',
        label: 'ari'
      }, {
        value: 'aki',
        label: 'aki'
      }, {
        value: 'vhd',
        label: 'vhd'
      }, {
        value: 'vmdk',
        label: 'vmdk'
      }, {
        value: 'raw',
        label: 'raw'
      }, {
        value: 'qcow2',
        label: 'qcow2'
      }, {
        value: 'vdi',
        label: 'vdi'
      }, {
        value: 'iso',
        label: 'iso' }],

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
      listSysImage(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.sysImageList = response.data.list
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

        imageId: undefined,
        imageName: undefined,
        openstackId: undefined,
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
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset()
      this.open = true
      this.title = '添加SysImage'
      this.isEdit = true
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.imageId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset()
      getSysImage(row.imageId).then(response => {
        this.form = response.data
        this.open = true
        this.title = '修改镜像'
        this.isEdit = true
      })
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.imageId !== undefined) {
            updateSysImage(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addSysImage(this.form).then(response => {
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
      var Ids = (row.imageId && [row.imageId]) || this.ids

      this.$confirm('是否确认删除名称为"' + row.imageName + '"的镜像?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delSysImage({ 'ids': Ids, 'names': [row.imageName] })
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
