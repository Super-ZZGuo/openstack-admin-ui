<template>
  <BasicLayout>
    <template #wrapper>
      <el-card class="box-card">
        <el-form ref="queryForm" :model="queryParams" :inline="true">
          <el-form-item label="名称" prop="projectName">
            <el-input
              v-model="queryParams.projectName"
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
          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysProject:add']"
              type="primary"
              icon="el-icon-plus"
              size="mini"
              @click="handleProjectAdd"
            >新增
            </el-button>
          </el-col>

          <el-col :span="1.5">
            <el-button
              v-permisaction="['admin:sysProject:remove']"
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
          :data="sysProjectList"
          default-expand-all
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="靶场ID" prop="projectId" width="80" />
          <el-table-column label="靶场名称" prop="projectName" width="100" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <el-popover
                placement="right"
                width="500"
                trigger="click"
              >
                <el-table
                  v-loading="loading_sub"
                  :data="sysRangeList"
                  border
                >
                  <el-table-column label="靶机名称" prop="rangeName" width="100" :show-overflow-tooltip="true" />
                  <el-table-column label="状态" prop="status" width="80" />
                  <el-table-column label="镜像" prop="image" width="80" />
                  <el-table-column label="实例类型" prop="flavor" width="80" />
                  <el-table-column label="标签" prop="tag" :show-overflow-tooltip="true" />
                </el-table>
                <el-button
                  slot="reference"
                  v-permisaction="['admin:sysProject:edit']"
                  size="mini"
                  type="text"
                  @click="handleCheckRanges(scope.row)"
                >{{ scope.row.projectName }}</el-button>
              </el-popover>
            </template>>
          </el-table-column>
          <el-table-column label="标签" prop="tag" :show-overflow-tooltip="true" />

          <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
            <template slot-scope="scope">

              <el-button
                v-permisaction="['admin:sysImge:edit']"
                size="mini"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdate(scope.row)"
              >修改</el-button>

              <el-button
                v-if="scope.row.p_id != 0"
                v-permisaction="['admin:sysProject:remove']"
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

        <!-- 添加或修改靶场对话框 -->
        <el-drawer
          ref="drawer"
          :title="title"
          :before-close="cancel"
          :visible.sync="open_edit"
          direction="rtl"
          custom-class="demo-drawer"
          size="70%"
        >
          <el-row class="mb8">
            <el-col>
              <el-radio-group v-model="radio">
                <el-radio-button label="1">自定义生成靶场</el-radio-button>
                <el-radio-button label="2">格式化生成靶场</el-radio-button>
              </el-radio-group>
            </el-col>
          </el-row>

          <div v-if="radio==1">

            <el-row class="mb8">
              <el-col :span="22">
                <el-alert
                  title="警告:在创建靶机之前需要创建网络"
                  type="warning"
                  description="创建靶机时，确认您填写的想要将靶机连接的到网络已经创建完毕或者已经存在。在选择网络之后填写固定IP(如果需要的话)，选择固定IP之后无法修改！"
                  :closable="false"
                  show-icon
                />
              </el-col>
            </el-row>
            <el-row class="mb8">
              <el-col :span="22">
                <el-table
                  v-loading="loading_sub"
                  :data="sysRangeList"
                  size:="mini"
                >
                  <el-table-column label="靶场名称" prop="rangeName" width="100" :show-overflow-tooltip="true" />
                  <el-table-column label="状态" prop="status" width="80" />
                  <el-table-column label="镜像" prop="image" width="80" />
                  <el-table-column label="实例类型" prop="flavor" width="80" />
                  <el-table-column label="标签" prop="tag" :show-overflow-tooltip="true" />
                </el-table>
              </el-col>
            </el-row>

          </div>
        </el-drawer>

        <!-- 新增靶场 -->
        <el-dialog :title="title" :visible.sync="open_add" width="600px" :close-on-click-modal="false">
          <el-form ref="form" :model="form" :rules="rules" label-width="150px">
            <el-row>
              <el-col :span="24">
                <el-form-item label="靶场名称" prop="projectName">
                  <el-input v-model="form.projectName" placeholder="请输入靶场名称" />
                </el-form-item>
              </el-col>

              <el-col :span="24">
                <el-form-item label="标签" prop="tag">
                  <el-input v-model="form.tag" type="textarea" placeholder="请输入标签" />
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
import { addSysProject, delSysProject, listSysProject, updateSysProject } from '@/api/admin/sys-project'
import { listSysRange, updateSysRange } from '@/api/admin/sys-project'

export default {
  name: 'SysProject',
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      loading_sub: true,
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
      open_edit: false,
      open_add: false,
      isEdit: false,
      isEditO: false,
      // slot: "",
      // 类型数据字典
      typeOptions: [],
      sysProjectList: [],
      sysRangeList: [],
      uploadForm: {
        projectName: '',
        projectId: ''
      },
      radio: 1,
      // 靶场类型选项
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

      // 靶场更新特定结构体
      sysImgStructUpdate: {
        projectOldName: '',
        projectNewName: '',
        oldTag: '',
        newTag: ''
      },
      sysRangeStutusUpdate: {
        projectName: '',
        rangeName: '',
        option: ''
      },
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
      listSysProject(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.sysProjectList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
    getRangeList() {
      this.loading_sub = true
      listSysRange(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.sysRangeList = response.data.list
        this.loading_sub = false
      }
      )
    },
    // 取消按钮
    cancel() {
      this.open_add = false
      this.open_edit = false
      this.reset_project()
    },
    // 表单重置
    reset_project() {
      this.form = {
        projectId: undefined,
        projectName: undefined,
        tag: undefined
      }
      this.resetForm('form')
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
    checkStatus() {

    },
    /** 新增按钮操作 */
    handleProjectAdd() {
      this.reset_project()
      this.open_add = true
      this.title = '添加靶场'
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.projectId)
      this.single = selection.length !== 1
      this.multiple = !selection.length
    },
    /** 查看靶机按钮操作 */
    handleCheckRanges(row) {
      this.reset_project()
      this.queryParams.projectName = row.projectName
      this.loading_sub = true
      this.getRangeList()
      for (var i = 0; i < this.sysRangeList.length; i++) {
        this.sysRangeStutusUpdate.projectName = row.projectName
        this.sysRangeStutusUpdate.rangeName = this.sysRangeList[i].rangeName

        updateSysRange(this.sysRangeList[i].rangeId, this.sysRangeStutusUpdate).then(response => {
          if (response.code === 200) {
            this.msgSuccess('靶机状态' + response.msg)
          } else {
            this.msgError(response.msg)
          }
        })
        this.sysRangeStutusUpdate.projectName = ''
        this.sysRangeStutusUpdate.rangeName = ''
      }
      this.loading_sub = false
      this.dateRange = []
      this.resetForm('queryForm')
      this.queryParams.pageIndex = 1
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset_project()
      this.handleCheckRanges(row)
      this.open_edit = true
      this.title = '修改靶场'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.projectId !== undefined) {
            this.sysImgStructUpdate.projectNewName = this.form.projectName
            this.sysImgStructUpdate.newTag = this.form.tag
            updateSysProject(this.form.projectId, this.sysImgStructUpdate).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open_add = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addSysProject(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open_add = false
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
      var Ids = (row.projectId && [row.projectId]) || this.ids
      var Names = (row.projectName && [row.projectName]) || this.ids.map(item => this.sysProjectList.find(subItem => subItem.projectId === item).projectName)
      this.$confirm('此操作无法撤回！！！！！！！！！！！！是否确认删除名称为"' + Names + '"的靶场? ', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delSysProject({ 'ids': Ids, 'projectNames': Names })
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
