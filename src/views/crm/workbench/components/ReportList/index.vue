<template>
  <el-dialog
    :visible="show"
    :append-to-body="true"
    :close-on-click-modal="false"
    top="10vh"
    width="80%"
    custom-class="no-padding-dialog"
    @close="hideView">

    <div
      slot="title"
      class="header"
      @click="showDview = false">
      <span class="title">{{ title }}</span>
      <el-input
        v-if="placeholder"
        :placeholder="placeholder"
        v-model="inputContent"
        class="search-input"
        @keyup.enter.native="searchInput">
        <el-button
          slot="append"
          icon="el-icon-search"
          @click.native="searchInput" />
      </el-input>
    </div>

    <div class="container">
      <div class="content">
        <div class="list-body">
          <el-table
            v-loading="loading"
            id="crm-table"
            ref="crmTable"
            :data="list"
            :height="tableHeight"
            :cell-class-name="cellClassName"
            stripe
            border
            highlight-current-row
            style="width: 100%"
            @row-click="handleRowClick"
            @sort-change="sortChange">
            <el-table-column
              v-for="(item, index) in showFieldList"
              :key="index"
              :sortable="item.prop != 'poolDay' ? 'custom' : false"
              :fixed="index==0"
              :prop="item.prop"
              :label="item.label"
              :width="item.width"
              show-overflow-tooltip>
              <template slot-scope="{ row, column, $index }">
                <template v-if="item.prop == 'dealStatus'">
                  <i :class="row[item.prop] | dealIcon"/>
                  <span>{{ row[item.prop] | dealName }}</span>
                </template>
                <template v-else-if="item.prop == 'status'">
                  <i
                    v-if="row.status == 2"
                    class="wk wk-circle-password customer-lock"/>
                </template>
                <template v-else-if="item.prop == 'checkStatus'">
                  <span
                    :style="{
                      backgroundColor: getStatusColor(row.checkStatus)
                  }" class="status-mark"/>
                  <span>{{ getStatusName(row.checkStatus) }}</span>
                </template>
                <wk-field-view
                  v-else
                  :props="item"
                  :form-type="item.formType"
                  :value="row[column.property]"
                >
                  <template slot-scope="{ data }">
                    {{ fieldFormatter(row, column, row[column.property], item) }}
                  </template>
                </wk-field-view>
              </template>
            </el-table-column>
            <el-table-column v-if="showFillColumn" />
          </el-table>
          <div
            v-if="paging"
            class="p-contianer">
            <el-pagination
              :current-page="currentPage"
              :page-sizes="pageSizes"
              :page-size.sync="pageSize"
              :total="total"
              class="p-bar"
              background
              layout="prev, pager, next, sizes, total, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
      <!-- ?????????????????? -->
      <c-r-m-all-detail
        :visible.sync="showDview"
        :crm-type="rowType"
        :id="rowID"
        class="d-view"
        @handle="handleHandle" />

      <record-list
        v-if="recordShow"
        :crm-type="rowType"
        :request="recordRequest"
        :params="recordParams"
        @handle="getList"
        @hide="recordShow = false" />
    </div>
  </el-dialog>
</template>
<script type="text/javascript">
import { filedGetTableFieldAPI } from '@/api/crm/common'

import crmTypeModel from '@/views/crm/model/crmTypeModel'
import CRMAllDetail from '@/views/crm/components/CRMAllDetail'
import RecordList from './components/RecordList'
import WkFieldView from '@/components/NewCom/WkForm/WkFieldView'

import { mapGetters } from 'vuex'
import Lockr from 'lockr'
import CheckStatusMixin from '@/mixins/CheckStatusMixin'
import { getFormFieldShowName } from '@/components/NewCom/WkForm/utils'

export default {
  name: 'ReportList', // ????????????
  components: {
    CRMAllDetail,
    RecordList,
    WkFieldView
  },
  filters: {
    dealIcon(statu) {
      return statu == 1 ? 'wk wk-success deal-suc' : 'wk wk-close deal-un'
    },

    dealName(statu) {
      return statu == 1 ? '?????????' : '?????????'
    }
  },
  mixins: [CheckStatusMixin],
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: String,
    placeholder: {
      type: String,
      default: '?????????????????????'
    },
    crmType: String,
    fieldList: Array,
    recordRequest: Function,
    request: Function,
    params: Object,
    // ????????????
    paging: {
      type: Boolean,
      default: true
    },

    sortable: {
      type: [Boolean, String],
      default: false
    }
  },
  data() {
    return {
      inputContent: '',

      loading: false, // ????????????
      tableHeight: this.getTableHeight(), // ????????????
      list: [],
      showFieldList: [],
      sortData: {}, // ????????????
      currentPage: 1,
      pageSize: Lockr.get('crmPageSizes') || 15,
      pageSizes: [15, 30, 60, 100],
      total: 0,

      /** ?????????????????? */
      rowID: '', // ?????????
      rowType: '', // ????????????
      showDview: false,
      recordParams: {},
      recordShow: false
    }
  },
  computed: {
    ...mapGetters(['crm']),
    showExamineStatus() {
      if (this.crmType == 'contract' && this.crmType == 'receivables') {
        return true
      }
      return false
    },
    showFillColumn() {
      if (this.fieldList && this.fieldList.length) {
        return false
      }
      return true
    }
  },
  watch: {
    show(value) {
      if (value) {
        this.initInfo()
      }
    }
  },
  mounted() {
    this.$el.addEventListener('click', this.handleDocumentClick, false)
  },

  destroyed() {},
  methods: {
    /**
     * ????????????
     */
    getTableHeight() {
      const clientHeight = document.documentElement.clientHeight
      const paddingHieght = clientHeight * 0.2

      return clientHeight - paddingHieght - 200
    },

    /**
     * ???????????????
     */
    initInfo() {
      this.inputContent = ''
      this.showFieldList = []
      this.sortData = {}
      this.$nextTick(() => {
        this.$refs.crmTable.clearSort()
      })
      this.list = []
      this.currentPage = 1

      window.onresize = () => {
        this.tableHeight = this.getTableHeight()
      }

      if (this.fieldList) {
        this.showFieldList = this.fieldList
        this.getList()
      } else {
        this.getFieldList()
      }
    },

    /**
     * ??????
     */
    searchInput() {
      this.currentPage = 1
      this.getList()
    },

    /**
     * ??????????????????
     */
    getList() {
      this.loading = true
      var params = {}

      // ????????????
      if (this.paging) {
        params = {
          page: this.currentPage,
          limit: this.pageSize
        }
      }

      // ?????????????????? ????????????
      if (this.placeholder) {
        params.search = this.inputContent
      }

      if (this.sortData.order) {
        params.sortField = this.sortData.prop
        params.order = this.sortData.order == 'ascending' ? 2 : 1
      }

      this.request({ ...params, ...this.params })
        .then(res => {
          if (this.paging) {
            this.list = res.data.list
            this.total = res.data.totalRow
          } else {
            this.list = res.data
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },

    /**
     * ??????????????????
     */
    getFieldList() {
      if (this.showFieldList.length == 0) {
        this.loading = true
        const crmType =
          this.crmType == 'business_status' ? 'business' : this.crmType
        var params = {
          label: crmTypeModel[crmType]
        }

        filedGetTableFieldAPI(params)
          .then(res => {
            for (let index = 0; index < res.data.length; index++) {
              const element = res.data[index]

              var width = 0
              if (!element.width) {
                if (element.name && element.name.length <= 6) {
                  width = element.name.length * 15 + 45
                } else {
                  width = 140
                }
              } else {
                width = element.width
              }

              this.showFieldList.push({
                prop: element.fieldName,
                formType: element.formType,
                label: element.name,
                width: width
              })
            }

            // ?????????????????????????????????
            this.getList()
          })
          .catch(() => {
            this.loading = false
          })
      } else {
        // ?????????????????????????????????
        this.getList()
      }
    },

    /**
     * ???????????????
     */
    fieldFormatter(row, column, cellValue, field) {
      // ?????????????????????
      if (this.fieldList && this.fieldList.length) {
        if (column.property == 'crmType') {
          return crmTypeModel.convertTypeToName(row[column.property])
        }
      }

      if (field) {
        return getFormFieldShowName(field.formType, row[column.property], '--', field)
      }

      return row[column.property] === '' || row[column.property] === null ? '--' : row[column.property]
    },

    /**
     * ????????????
     */
    sortChange(column, prop, order) {
      this.sortData = column
      this.getList()
    },

    /**
     * ????????????????????????
     */
    handleSizeChange(val) {
      Lockr.set('crmPageSizes', val)
      this.pageSize = val
      this.getList()
    },

    /**
     * ??????????????????
     */
    handleCurrentChange(val) {
      this.currentPage = val
      this.getList()
    },

    /**
     * ????????????
     */
    handleRowClick(row, column, event) {
      if (this.crmType === 'leads') {
        if (column.property === 'leadsName') {
          this.rowID = row.leadsId
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'customer') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'contacts') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'name') {
          this.rowID = row.contactsId
          this.rowType = 'contacts'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (
        this.crmType === 'business' ||
        this.crmType === 'business_status'
      ) {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'businessName') {
          this.rowID = row.businessId
          this.rowType = 'business'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'contract') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'businessName') {
          this.rowID = row.businessId
          this.rowType = 'business'
          this.showDview = true
        } else if (column.property === 'contactsName') {
          this.rowID = row.contactsId
          this.rowType = 'contacts'
          this.showDview = true
        } else if (column.property === 'num' || column.property === 'name') {
          this.rowID = row.contractId
          this.rowType = 'contract'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'product') {
        if (column.property === 'name') {
          this.rowID = row.productId
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'receivables') {
        if (column.property === 'customerName') {
          this.rowID = row.customerId
          this.rowType = 'customer'
          this.showDview = true
        } else if (column.property === 'contractNum') {
          this.rowID = row.contractId
          this.rowType = 'contract'
          this.showDview = true
        } else if (column.property === 'number') {
          this.rowID = row.receivablesId
          this.rowType = 'receivables'
          this.showDview = true
        } else {
          this.showDview = false
        }
      } else if (this.crmType === 'record') {
        if (column.property === 'count' && row.count) {
          this.rowType = 'crm_' + crmTypeModel.convertTypeToKey(row.crmType)
          this.recordParams = { crmType: row.crmType, queryType: 0, ...this.params }
          this.recordShow = true
        } else {
          this.recordShow = false
        }
      }
    },

    /**
     * ????????????
     */
    handleHandle(data) {
      if (
        data.type === 'alloc' ||
        data.type === 'get' ||
        data.type === 'transfer' ||
        data.type === 'transform' ||
        data.type === 'delete' ||
        data.type === 'put_seas'
      ) {
        this.showDview = false
      }

      if (data.type !== 'edit') {
        this.getList()
      }
    },

    /**
     * ??????????????????class
     */
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (
        this.crmType &&
        (column.property === 'customerName' ||
          column.property === 'businessName' ||
          column.property === 'name' ||
          column.property === 'contactsName' ||
          column.property === 'num' ||
          column.property === 'contractNum' ||
          column.property === 'number' ||
          (this.crmType === 'record' && column.property === 'count' &&
        row[column.property]))
      ) {
        return 'can-visit--underline'
      } else {
        return ''
      }
    },

    /**
     * ????????????
     */
    hideView() {
      this.$emit('update:show', false)
      this.$emit('hide')
    },

    /**
     * ???????????????????????????????????????
     */
    handleDocumentClick(e) {
      var hidden = true
      var items = document.getElementsByClassName('el-table__row')
      if (items && hidden) {
        for (let index = 0; index < items.length; index++) {
          const element = items[index]
          if (element.contains(e.target)) {
            hidden = false
            break
          }
        }
      }

      if (
        document.getElementById('slide') &&
        document.getElementById('slide').contains(e.target)
      ) {
        hidden = false
      }
      if (hidden) {
        this.showDview = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../../styles/table.scss';

/** ???????????? */
.container {
  height: 100%;
}

.content {
  position: relative;
  height: 100%;
  padding: 0 15px 15px;
}

.header {
  position: relative;
  padding: 10px 20px 10px 0;

  .title {
    font-size: 16px;
    color: #333;
    font-weight: 600;
  }
  .search-input {
    width: 300px;
    margin: -18px 0 0 -150px;
    position: absolute;
    left: 50%;
    top: 50%;
  }
}

.p-contianer {
  border: 1px solid $xr-border-line-color;
  border-top: none;
}

.d-view {
  top: 0;
}

</style>
