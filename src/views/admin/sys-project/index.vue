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
              >编辑</el-button>

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
                  <el-table-column label="靶场ID" prop="rangeId" width="80" />
                  <el-table-column label="靶场名称" prop="rangeName" width="100" :show-overflow-tooltip="true" />
                  <el-table-column label="状态" prop="status" width="120" />
                  <el-table-column label="镜像" prop="image" width="80" />
                  <el-table-column label="实例类型" prop="flavor" width="80" />
                  <el-table-column label="操作" align="center" width="180" class-name="small-padding fixed-width">
                    <template slot-scope="scope">
                      <el-button
                        v-permisaction="['admin:sysProject:remove']"
                        size="mini"
                        type="text"
                        icon="el-icon-delete"
                        @click="handleDeleteRange(scope.row)"
                      >删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-col>
            </el-row>

            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button
                  v-permisaction="['admin:sysProject:add']"
                  type="primary"
                  icon="el-icon-plus"
                  size="mini"
                  @click="handleProjectAddRange"
                >新增
                </el-button>
              </el-col>
            </el-row>

          </div>
        </el-drawer>

        <!-- 新增靶场 -->
        <el-dialog :title="title" :visible.sync="open_add_project" width="600px" :close-on-click-modal="false">
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

        <!-- 新增靶机_自定义 -->
        <el-dialog :title="title" :visible.sync="open_add_range" :close-on-click-modal="false" :before-close="handleBeforeClose">
          <el-form ref="form" :model="form" label-width="80px">
            <el-row>
              <el-col :span="24">
                <el-form-item label="靶机名称" prop="rangeName">
                  <el-input v-model="form.rangeName" placeholder="请输入靶场名称" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row>
              <el-col :span="12">
                <el-form-item label="镜像" prop="image">
                  <el-select v-model="form.image" placeholder="请选择">
                    <el-option
                      v-for="img in sysImgOptions"
                      :key="img.imageName"
                      :label="img.imageName"
                      :value="img.imageName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>

              <el-col :span="12">
                <el-form-item label="实例类型" prop="flavor">
                  <el-select v-model="form.flavor" placeholder="请选择">
                    <el-option
                      v-for="flavor in sysFlavorOptions"
                      :key="flavor.flavorName"
                      :label="flavor.flavorName"
                      :value="flavor.flavorName"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-form-item label="网络" prop="network">
                  <div v-for="(item,index) in form.network" :key="index">
                    <el-row>
                      <el-col :span="22">
                        <el-input v-model="item.ipadress" type="input" placeholder="请输入ip地址" class="input-with-select" style="width:590px">
                          <template>
                            <el-select
                              slot="prepend"
                              v-model="item.networkName"
                              style="width:430px"
                              placeholder="请选择"
                            >
                              <el-option
                                v-for="network in sysNetworkOptions"
                                :key="network.networkName"
                                :label="network.networkName+'('+network.cidr+')pool start:\''
                                  +network.poolStart+'\'pool end\''+network.poolEnd+'\''"
                                :value="network.networkName"
                              />
                            </el-select>
                          </template>
                        </el-input>
                      </el-col>
                      <el-col :span="2">
                        <el-button type="warning" @click="deleteNetworkOptions(item,index)">-</el-button>
                      </el-col>
                    </el-row>
                  </div>
                  <el-button type="primary" @click="addNetwork">+</el-button>
                </el-form-item>
              </el-col>

            </el-row>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancelRange">取 消</el-button>
          </div>
        </el-dialog>

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>
import { addSysProject, addSysRange, delSysProject, listSysProject, updateSysProject } from '@/api/admin/sys-project'
import { listSysRange, updateSysRange, delSysRange } from '@/api/admin/sys-project'
import { listSysImage } from '@/api/admin/sys-image'
import { listSysFlavor } from '@/api/admin/sys-flavor'
import { listSysNetwork } from '@/api/admin/sys-network'

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
      open_add_project: false,
      open_add_range: false,
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
      sysImgOptions: [],
      sysFlavorOptions: [],
      sysNetworkOptions: [],

      // 靶场更新特定结构体
      sysProjectStructUpdate: {
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
      queryNetworkParams: {
        projectName: '',
        pageIndex: 1,
        pageSize: 10000

      },
      // 表单参数
      form: {
      },
      formRange: {
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
    async getRangeList() {
      this.loading_sub = true
      const response = await listSysRange(this.addDateRange(this.queryParams, this.dateRange))
      this.sysRangeList = response.data.list
      this.loading_sub = false
    },
    // 取消按钮
    cancel() {
      this.open_add_project = false
      this.open_edit = false
      this.open_add_range = false
      this.sysNetworkOptions = []
      this.reset_project()
    },
    addNetwork() {
      if (this.form.network.length < this.sysNetworkOptions.length) {
        this.form.network.push({
          networkName: '',
          ipadress: ''
        })
      }
    },
    deleteNetworkOptions(index) {
      this.formRange.network.splice(index, 1)
    },
    cancelRange() {
      this.open_add_range = false
      this.sysNetworkOptions = []
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
    reset_project_range() {
      this.form = {
        projectId: undefined,
        projectName: undefined,
        rangeName: undefined,
        status: undefined,
        image: undefined,
        flavor: undefined,
        option: undefined,
        network: []
      }
      this.resetForm('form')
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageIndex = 1
      this.getList()
    },
    handleBeforeClose(done) {
      this.sysNetworkOptions = []
      done()
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.dateRange = []
      this.resetForm('queryForm')
      this.handleQuery()
    },
    /** 新增按钮操作 */
    handleProjectAdd() {
      this.reset_project()
      this.open_add_project = true
      this.title = '添加靶场'
    },
    handleProjectAddRange() {
      const projectId = this.form.projectId
      const projectName = this.form.projectName
      this.reset_project_range()
      this.form.projectId = projectId
      this.form.projectName = projectName
      this.form.option = ''
      listSysNetwork(this.queryNetworkParams).then(response => {
        response.data.list.forEach(item => {
          item.children.forEach(child => {
            this.sysNetworkOptions.push(child)
          })
        })
      })
      listSysImage({ pageSize: 1000 }).then(response => {
        this.sysImgOptions = response.data.list
      })
      listSysFlavor({ pageSize: 1000 }).then(response => {
        this.sysFlavorOptions = response.data.list
      })
      this.open_add_range = true
      this.title = '添加靶机'
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
      this.getRangeList().then(() => {
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
      })
      this.loading_sub = false
      this.dateRange = []
      this.resetForm('queryForm')
      this.queryParams.pageIndex = 1
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset_project_range()
      this.handleCheckRanges(row)
      this.form.projectId = row.projectId
      this.form.projectName = row.projectName
      this.queryNetworkParams.projectName = row.projectName
      this.open_edit = true
      this.title = '修改靶场'
    },
    /** 提交按钮 */
    submitForm: function() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          if (this.form.projectId !== undefined && this.form.option === undefined) {
            this.sysProjectStructUpdate.projectNewName = this.form.projectName
            this.sysProjectStructUpdate.newTag = this.form.tag
            updateSysProject(this.form.projectId, this.sysProjectStructUpdate).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open_add_project = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else if (this.form.option === undefined && this.form.projectId === undefined) {
            addSysProject(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open_add_project = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else if (this.form.option === '' && this.form.projectId !== undefined) {
            this.queryParams.projectName = this.form.projectName
            addSysRange(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open_add_project = false
                this.getRangeList()
              } else {
                this.msgError(response.msg)
              }
            })
          }
        }
      })
    },
    submitFormRange: function() {
      this.$refs['formRange'].validate(valid => {
        if (valid) {
          if (this.formRange.rangeId !== undefined) {
            this.sysProjectStructUpdate.projectNewName = this.form.projectName
            this.sysProjectStructUpdate.newTag = this.form.tag
            updateSysProject(this.form.projectId, this.sysProjectStructUpdate).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open_add_project = false
                this.getList()
              } else {
                this.msgError(response.msg)
              }
            })
          } else {
            addSysProject(this.formRange).then(response => {
              if (response.code === 200) {
                this.msgSuccess(response.msg)
                this.open_add_project = false
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
    },
    handleDeleteRange(row) {
      console.log(row.rangeId)
      var Ids = (row.rangeId && [row.rangeId]) || this.ids
      console.log(Ids)
      const projectName = this.queryNetworkParams.projectName
      var Names = (row.rangeName && [row.rangeName]) || this.ids.map(item => this.sysRangeList.find(subItem => subItem.rangeId === item).rangeName)
      console.log(Names)
      this.$confirm('此操作无法撤回！！！！！！！！！！！！是否确认删除名称为"' + Names + '"的靶机? ', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(function() {
          return delSysRange({ 'ids': Ids, 'rangeNames': Names, 'projectName': projectName })
        }).then((response) => {
          if (response.code === 200) {
            this.msgSuccess(response.msg)
            this.open = false
            this.queryParams.projectName = this.form.projectName
            this.getRangeList()
          } else {
            this.msgError(response.msg)
          }
        }).catch(function() {
        })
    }
  }
}
</script>

<style>

  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>
