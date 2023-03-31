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

        <el-table
          v-loading="loading"
          :data="useProjectList"
          default-expand-all
          :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
          border
        >
          <el-table-column label="靶场名称" prop="projectName" width="100" :show-overflow-tooltip="true" />
          <el-table-column label="靶机名称" prop="rangeName" width="100" :show-overflow-tooltip="true" />
          <el-table-column label="IP" prop="ipadress" width="200" />
          <el-table-column label="Console" prop="rangeConsole" width="298" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <el-link type="primary" :underline="false" :href="scope.row.rangeConsole">
                {{ scope.row.rangeConsole }}
              </el-link>
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

      </el-card>
    </template>
  </BasicLayout>
</template>

<script>

import { getUseProject } from '@/api/use/use-project'

export default {
  name: 'UseProject',
  components: {
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 弹出层标题
      title: '',
      useProjectList: [],
      // 查询参数
      queryParams: {
        pageIndex: 1,
        pageSize: 10

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
      getUseProject(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.useProjectList = response.data.list
        this.total = response.data.count
        this.loading = false
      }
      )
    },
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
    }
  }
}
</script>

<style>
  .el-form-item__label{
    white-space:pre-line;
    word-wrap: break-word;
  }
  .el-table .cell {
    white-space: pre-line;
  }
  .input-with-select .el-input-group__prepend {
    background-color: #fff;
  }
</style>
