<template>
  <el-dialog v-if="showDialog" :visible.sync="showDialog" style="    " destroy-on-close title="饮水机台账">
    <create-sections >
      <mtForm :rules="fieldsRules" :field-from="aoiinfo" :field-list="fields" :is-save="isSave" @save="saveClick" @change="formChange"/>
    </create-sections>
    <span slot="footer" class="dialog-footer" style="text-align: center !important;">
      <el-button @click="showDialog = false">取 消</el-button>
      <el-button type="primary" @click="savechange">保 存</el-button>
    </span>
  </el-dialog>
</template>
<script>
import { mapGetters } from 'vuex'
import { objDeepCopy } from '@/utils'
import {
  WaterDispenserCreate,
  WaterDispenserUpdate,
  GetSpacePointTree
} from '@/api/account'
import { parseTime } from '@/utils'
import CreateSections from '@/components/CreateSections'
import mtForm from '@/components/mtForm/index'
import GenerateRulesMixin from '@/components/NewCom/WkForm/GenerateRules'
export default {
  components: {
    CreateSections,
    mtForm
  },
  mixins: [GenerateRulesMixin],
  props: {
    showing: {
      type: Boolean
    },
    info: {
      type: Object,
      default: () => {
        return {}
      }
    }},
  data() {
    return {
      showDialog: true,
      list: [],
      maxlength: 300,
      checkedAll: [],
      tt: true,
      fieldsRules: {}, // 字段列表需要验证,
      setting2: [],
      setting1: [],
      aoiinfo: {
        drugName: '',
        parentId1: '',
        parentId2: ''
      },
      tree: [],
      fields: {},
      isSave: false,
      mining: false,
      isDefault: false,
      yq: {},
      settings: []
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  watch: {
    showing: {
      handler(val) {
        this.showDialog = !this.showDialog
        if (!this.info.id) {
          this.aoiinfo = {
          }
        } else {
          this.aoiinfo = { ...this.info, ...{ parentId1: '', parentId2: '' }}
        }
        this.getBaseField()
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.pointTree()
  },
  methods: {

    pointTree(item, name, j) {
      const data = item ? { parentId: item } : {}
      GetSpacePointTree(data)
        .then(response => {
          if (j == 1) {
            for (let i = 0; i < this.fields.length; i++) {
              if (this.fields[i].field == 'parentId') {
                this.aoiinfo.parentId2 = ''
                this.setting2 = response
                this.$set(this.fields[i], 'setting2', response)
              }
            }
          } else if (j == 2) {
            this.tt = false
            this.aoiinfo = { ...this.aoiinfo }
          } else if (name == 'parentId') {
            for (let i = 0; i < this.fields.length; i++) {
              if (this.fields[i].field == 'parentId') {
                this.setting1 = response
                this.setting2 = []
                this.$set(this.fields[i], 'setting1', response)
                this.fields[i].setting2 = []
                this.aoiinfo.parentId1 = ''
                this.aoiinfo.parentId2 = ''
              }
            }
          } else {
            this.settings = response || []
            this.getBaseField()
          }
          this.fieldsRules['parentId'] = this.getRules({
            field: 'parentId',
            formType: 'seleteAll',
            isNull: 1,
            name: '空间点位',
            array1: 1,
            placeholder: '请选择空间点位',
            setting: this.settings,
            setting1: this.setting1,
            setting2: this.setting2,
            parentId2: this.aoiinfo.parentId2,
            parentId1: this.aoiinfo.parentId1,
            optionL: 'specificLocation',
            optionV: 'id',
            inputTips: '',
            value: this.aoiinfo ? this.aoiinfo.parentId : ''
          })
        })
        .catch(() => {
        })
    },

    saveClick(data) {
      console.log(this.aoiinfo, 666)
      if (!data) return
      this.aoiinfo.fillingDate = parseTime(this.aoiinfo.fillingDate)
      this.aoiinfo.installationDate = parseTime(this.aoiinfo.installationDate)
      this.aoiinfo.maintenanceDate = parseTime(this.aoiinfo.maintenanceDate)
      if (this.aoiinfo.parentId2 != '') {
        this.aoiinfo.spacePointId = this.aoiinfo.parentId2.id
      } else if (this.aoiinfo.parentId1 != '') {
        this.aoiinfo.spacePointId = this.aoiinfo.parentId1.id
      } else {
        this.aoiinfo.spacePointId = this.aoiinfo.parentId
      }
      if (this.aoiinfo.id) {
        WaterDispenserUpdate(this.aoiinfo).then(res => {
          this.$message.success('修改成功')
          this.showDialog = false
          this.$emit('change', 'up')
        })
      } else {
        WaterDispenserCreate(this.aoiinfo).then(res => {
          this.$message.success('新增成功')
          this.showDialog = false
          this.$emit('change', 'add')
        })
      }
    },
    formChange(id, type, type1, i, j) {
      if (id.field == 'parentId') {
        this.pointTree(type1.id, id.field, j)
      }
    },
    savechange() {
      this.isSave = !this.isSave
    },
    getBaseField() {
      const field = []
      field.push({
        field: 'fillingDate',
        formType: 'datetime',
        format: 'yyyy-MM-dd HH:mm',
        isNull: 1,
        name: '填写日期',
        placeholder: '请选择日期',
        setting: [],
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.fillingDate : ''
      })
      field.push({
        field: 'installationDate',
        formType: 'datetime',
        format: 'yyyy-MM-dd HH:mm',
        isNull: 1,
        name: '安装日期',
        placeholder: '请选择日期',
        setting: [],
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.installationDate : ''
      })
      field.push({
        field: 'maintenanceDate',
        formType: 'datetime',
        format: 'yyyy-MM-dd HH:mm',
        isNull: 1,
        name: '维护日期',
        placeholder: '请选择维护日期',
        setting: [],
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.maintenanceDate : ''
      })
      field.push({
        field: 'parentId',
        formType: 'seleteAll',
        isNull: 1,
        name: '空间点位',
        array1: 1,
        placeholder: '请选择空间点位',
        setting: this.settings,
        setting1: this.setting1,
        setting2: this.setting2,
        optionL: 'specificLocation',
        optionV: 'id',
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.parentId : ''
      })
      field.push({
        field: 'machineModel',
        formType: 'text',
        isNull: 1,
        name: '机器型号',
        placeholder: '请输入机器型号',
        setting: [],
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.machineModel : ''
      })
      field.push({
        field: 'quantity',
        formType: 'text',
        isNull: 1,
        name: '数量',
        placeholder: '请输入数量',
        setting: [],
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.quantity : ''
      })
      field.push({
        field: 'company',
        formType: 'text',
        isNull: 1,
        name: '维护单位',
        placeholder: '请输入维护单位',
        setting: [],
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.company : ''
      })
      field.push({
        field: 'maintainer',
        formType: 'text',
        isNull: 1,
        name: '维护人',
        placeholder: '请输入维护人',
        setting: [],
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.maintainer : ''
      })
      field.push({
        field: 'remark',
        formType: 'textarea',
        isNull: 1,
        name: '维护说明',
        placeholder: '请输入维护说明',
        row: 3,
        maxLength: 200,
        setting: [],
        inputTips: '',
        value: this.aoiinfo ? this.aoiinfo.remark : ''
      })
      this.fields = this.handleFields(field).list
      this.fieldsRules = this.handleFields(field).fieldRules
    },
    /**
     * 调整字段
     */
    handleFields(list) {
      const fieldRules = {}
      const fieldForm = {}
      list.forEach(item => {
        fieldRules[item.field] = this.getRules(item)
        fieldForm[item.field] = item.value
      })
      return {
        list: objDeepCopy(list),
        fieldRules: fieldRules
      }
    }
  }
}
</script>
<style lang="scss" scoped>
// /deep/.el-dialog{
    // margin-top:2vh !important;
// }
/deep/.el-dialog__footer{
    text-align: center !important;
}
</style>
