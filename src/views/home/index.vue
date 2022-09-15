<template>
  <div class="main">

    <div class="main-body">
      <div class="main-table-header">
        <div>
          <el-input
            v-model="inputs"
            style="width:200px;padding: 10px 0px 10px 10px;"
            placeholder="请输入使用人姓名"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="handleCurrentChange(0)"
            />
          </el-input>
          <div style="width:200px;display:inline-block  ;  position: absolute;    right: 0px;    top: 13px;">
            <i class="wk wk-moretj" @click="morecondition=!morecondition"/>
            <el-button
              class="export-button"
              icon="iconfont icon-daochu1"
              type="primary"
              @click.native="exportExcel">导出</el-button>
          </div>
          <div v-show="morecondition" class="morecondition1">
            <div class="morecondition">
              <div>
                <label for="">使用人</label>
                <el-input
                  v-model="inputs"
                  placeholder="请输入使用人姓名"
                />
              </div>
              <div>
                <label for="">使用时间</label>
                <el-date-picker
                  v-model="startTime"
                  type="daterange"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"/>
              </div>
              <div>
                <label for="">设备名称</label>
                <el-input
                  v-model="company"
                  placeholder="请输入设备名称"
                />
              </div>
              <div>
                <label for="">项目代码</label>
                <el-input
                  v-model="company"
                  placeholder="请输入项目代码"
                />
              </div>
            </div>
            <div
              class="morecondition2">
              <el-button
                class="main-table-header-button "
                @click="Reset">重置</el-button>
              <el-button
                class="main-table-header-button "
                type="primary" @click="handleCurrentChange(0)">搜索</el-button>
            </div>
          </div>
        </div>
      </div>
      <el-table
        v-loading="loading"
        id="examine-table"
        :data="list"
        :height="tableHeight"
        class="main-table"
        highlight-current-row
      >
        <el-table-column
          show-overflow-tooltip
          type="index"
          width="60"
          label="序号"
          align="center"
        >
          <template slot-scope="{ row, column, $index }">
            <span class="status-name">
              <span
                class="index"
                style="text-align: center; display: block;"

              >
                <!-- <el-checkbox
                  v-show="row.hover || row.checked"
                  v-model="row.checked"
                  @change="onItemCheckboxChange"
                /> -->
                <span class="text">{{
                  $index + 1
                }}</span>
              </span>
            </span>
          </template>
        </el-table-column>
        <el-table-column show-overflow-tooltip prop="name" label="使用人姓名"/>

        <el-table-column prop="orderNo" label="使用时间" />
        <el-table-column prop="address" label="实验/样品名称"/>
        <el-table-column prop="goodsCategoryName" label="有效机时" />
        <el-table-column prop="wareHouseName" label="项目代码" />
        <el-table-column prop="memoryCardName" label="服务名称" />
        <el-table-column prop="createUserName" label="服务类型" />
        <el-table-column prop="receiptDate" label="委托人姓名" />
        <el-table-column prop="receiptDate" label="研究中心/单位" />
      </el-table>
      <div class="p-contianer">
        <el-pagination
          :current-page="currentPage"
          :page-sizes="pageSizes"
          :page-size.sync="pageSize"
          :total="total"
          class="p-bar"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"/>
      </div>
    </div>

  </div>
</template>

<script>
import { filterTimestampToFormatTime } from '@/filters/index'
import { OrderPage } from '@/api/kchk/order'
// import Ccware from './comp/add.vue'
import XrHeader from '@/components/XrHeader'
import CreateSections from '@/components/CreateSections'

import { mapGetters } from 'vuex'
import pagest from '@/mixins/pagest'
export default {
  /** 系统管理 的 项目管理 */
  name: 'SystemProject',
  components: {
    XrHeader,
    CreateSections
    // Ccware
  },
  filters: {

  },
  mixins: [pagest],
  data() {
    return {
      morecondition: false,
      company: '',
      warehouse: '',
      orderCategory: '',
      startTime: [],
      inputs: '',
      loading: false, // 加载动画
      tableHeight: document.documentElement.clientHeight - 180, // 表的高度
      list: [],
      currentPage: 0,
      pageSize: 15,
      total: 0,
      name: ''
    }
  },
  computed: {
    ...mapGetters(['allAuth'])
  },
  mounted() {
    var self = this
    /** 控制table的高度 */
    window.onresize = function() {
      self.tableHeight = document.documentElement.clientHeight - 196
    }
    if (this.$route.params.time) {
      this.startTime = [new Date(), new Date()]
    }
    this.getList()
  },
  methods: {
    /**
     * 导出
     */
    exportExcel() {
      this.loading = true
      // biExamineExcelExportAPI(this.postParams)
      //   .then(res => {
      //     this.loading = false
      //     downloadExcelWithResData(res)
      //   })
      //   .catch(() => {
      //     this.loading = false
      //   })
    },
    Reset() {
      this.company = ''
      this.flag = null
      this.orderCategory = null
      this.startTime = []
      this.inputs = ''
    },

    /**
     * 获取列表数据
     */
    getList() {
      this.loading = true
      const data = {
        maxResultCount: this.pageSize + this.currentPage,
        skipCount: this.currentPage,
        isOutbound: false,
        createName: this.inputs,
        searchKey: this.company
      }
      if (this.flag !== '') {
        data.flag = this.flag
      }
      if (this.orderCategory) {
        data.stockCategory = this.orderCategory
      }
      if (this.startTime && this.startTime.length > 0) {
        data.startTime = filterTimestampToFormatTime(new Date(this.startTime[0]).getTime(), 'YYYY-MM-DD') + ' 00:00:00'
        data.endTime = filterTimestampToFormatTime(new Date(this.startTime[1]).getTime(), 'YYYY-MM-DD') + ' 23:59:59'
      }
      OrderPage(data)
        .then(res => {
          for (let i = 0; i < res.items.length; i++) {
            res.items[i].hover = false
            res.items[i].checked = false
            res.items[i].receiptDate = filterTimestampToFormatTime(new Date(res.items[i].receiptDate).getTime(), 'YYYY-MM-DD HH:mm')
          }
          this.list = res.items
          this.total = res.totalCount
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    /**
     * 更改当前页数
     * @param {*} val
     */
    handleCurrentChange(val) {
      this.morecondition = false
      const x = val > 0 ? val - 1 : 0
      this.currentPage = x ? x * this.pageSize : x
      this.getList()
    }
    /**
     * 编辑删除
     */
    /**
     * 导出
     */
  }
}
</script>

<style lang="scss" scoped>
  .morecondition1{
    padding-left:4px !important;
  top: -5px;
  margin-top: 4px;
  align-items: baseline;
      position: absolute;
    z-index: 9;
    background: #fff;
    width: 100%;
    border: 1px solid #e6e6e6;
  }
  .morecondition2{
    width: 100%;
    padding: 0px 0 8px 8px;
    text-align: center;
    .main-table-header-button{
      float: none !important;
    }
  }
.morecondition{

    display: flex;
    padding: 20px 20px 0px 20px;
    flex-wrap: wrap;
    -webkit-box-pack: start;
    justify-content: flex-start;
    >div{
      margin-bottom: 10px;
    margin-right: 1.5%;
    width: 31.33%;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    >div{
      width: 100%;
    }
      label{
        width: 80px;
    display: inline-block;
    text-align: right;
      }
      label:after {
    content: " ";
    position: relative;
    top: -0.5px;
    margin: 0 8px 0 2px;
}
    }

}
.main {
  height: 100%;

  /deep/ .xr-header {
    padding: 15px 30px;
  }
}

.main-body {
  // height: calc(100% - 61px);
  background-color: white;
  // border-top: 1px solid $xr-border-line-color;
  border-bottom: 1px solid $xr-border-line-color;
}
// .main-table{
//       height: calc(100% - 90px ) !important;
// }
.main-table-header {
  height: 50px;
  background-color: white;
  position: relative;
  .main-table-header-button {
    float: right;
      margin-right: 20px;
    margin-top: 5px;
    margin-bottom: 6px;
    margin-left: 21px;
  }
}

.project-reminder {
  width: auto;
  float: left;
  margin-left: 20px;
  margin-top: 10px;
}
// @import '../styles/table.scss';
.buttonc {
  color: #4f81fc;
   cursor: pointer;
}
</style>
