<template>
  <div style="display: flex; flex-direction: row;">
    <div style="border-radius: 8px 0 0 0; background-color: #FFFFFF; height: 100%; width: 300px; box-shadow: 0 0px 4px rgba(55, 55, 77, 0.1);">
      <div
        style="border-radius: 8px 0 0 0; font-size: 20px; padding: 20px; color: #292929; user-select: none;"
      >
        <span>服务列表</span>
        <span style="font-size: 12px;">/ FTP</span>
      </div>
      <div style="padding: 10px 25px; display: flex; flex-direction: column;">
        <div
          class="ftp-service-item"
          @click="dialogFormVisible = true"
        >
          <span class="ftp-service-item-icon"><svg-icon icon-class="add" /></span>
          <span>添加FTP服务器</span>
        </div>
      </div>
      <div style="padding: 20px 10px; display: flex; flex-direction: column; height: calc(100% - 140px);">
        <div
          v-show="clients.length === 0"
          style="color: #283593; border-top: 1px dashed #d5d8e3; padding: 20px 10px; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;"
        >
          <div style="font-size: 48px;">
            <svg-icon icon-class="empty" />
          </div>
          <div style="padding: 15px 0;">
            您还没有添加服务器哦
          </div>
        </div>
        <div
          v-if="clients.length > 0"
          style="color: #283593; border-top: 1px dashed #d5d8e3; padding: 0 10px; height: 100%; display: flex; flex-direction: column; align-items: center; "
        >
          <div style="padding: 10px; font-size: 14px;">
            当前共有{{ clients.length }}个服务器
          </div>
          <div
            v-for="(client, idx) in clients"
            :key="`ftpClient${idx}`"
            :class="ftpClientItemClass(client)"
            @click="handleClickFtpClient(client, idx)"
            @dblclick="handleFtpClientEdit(client, idx)"
          >
            <div>
              <div style="padding: 4px;">
                <span style="font-size: 14px; font-weight: bold;">{{ client.ftpForm.name }}</span>
              </div>
              <div style="padding: 4px; font-size: 12px; display: flex; justify-content: space-between;">
                <div style="display: flex;">
                  <div style="color: #545454;">
                    主机:
                  </div>
                  <div style="color: #000000; margin-left: 4px; width: 85px; max-width: 85px; overflow: hidden; text-overflow: ellipsis;">
                    {{ client.ftpForm.host }}
                  </div>
                </div>
                <div>{{ client.connected ? '已连接' : '未连接' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div style="flex: 1; padding: 20px;">
      <div
        v-show="clients.length === 0"
        style="text-align: center; font-size: 26px; font-weight: lighter; padding: 20px;"
      >
        请选择一个服务器
      </div>
    </div>
    <el-dialog

      title="添加FTP服务器"
      :visible.sync="dialogFormVisible"
    >
      <el-form
        v-loading="connecting"
        :label-position="'left'"
        :model="ftpForm"
        :label-width="formLabelWidth"
        :rules="ftpRules"
      >
        <el-form-item
          label="连接名"
        >
          <el-input
            v-model="ftpForm.name"
            placeholder="为你的连接起一个名字（可空）"
          />
        </el-form-item>
        <el-form-item
          label="服务器"
        >
          <el-input
            v-model="ftpForm.host"
            placeholder="FTP服务器地址"
          />
        </el-form-item>
        <el-form-item
          label="端口"
        >
          <el-input
            v-model="ftpForm.port"

            placeholder="FTP服务端口号"
          />
        </el-form-item>
        <el-form-item
          label="用户名"
        >
          <el-input
            v-model="ftpForm.user"

            placeholder="FTP用户名"
          />
        </el-form-item>
        <el-form-item
          label="密码"
        >
          <el-input
            v-model="ftpForm.password"
            show-password
            placeholder="FTP密码"
          />
        </el-form-item>
        <el-form-item label="安全性">
          <el-select
            v-model="ftpForm.secure"
            placeholder="可空项"
          >
            <el-option
              label="默认"
              :value="false"
            />
            <el-option
              label="TLS"
              :value="true"
            />
            <el-option
              label="旧版隐式FTPS"
              :value="'implicit'"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button
          type="primary"
          :loading="connecting"
          @click="handleAddFtp"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import uuid from 'uuid/v1'
const ftp = require('basic-ftp')

export default {
  data () {
    return {
      ftpForm: {
        name: '',
        host: '',
        port: '21',
        user: '',
        password: '',
        secure: false
      },
      ftpRules: {
        host: [{ required: true, message: '请输入服务器地址（ip / 域名）', trigger: 'blur' }],
        port: [{ required: true, message: '请输入服务器端口号', trigger: 'blur' }]
      },
      connecting: false,
      formLabelWidth: '120px',
      dialogFormVisible: false,
      clients: []
    }
  },
  computed: {
    ftpClientItemClass () {
      return (client) => {
        console.log(client)
        return 'ftp-client-item' + (client.connected === true ? ' ftp-client-item-connected' : client.connected === false ? ' ftp-client-item-connect-failed' : '')
      }
    }
  },
  created () {
    this.readClientsFromStorage()
  },
  beforeDestroy () {
    this.saveClientToStorage()
  },
  methods: {
    handleFtpClientEdit (client, idx) {

    },

    handleClickFtpClient (client, idx) {
      this.connectToFtp(client.ftpForm, idx)
    },

    handleDeleteFtpClient (idx) {
      const deleted = this.clients.splice(idx, 1)
      this.saveClientToStorage()
      console.log('client', deleted, 'has been deleted')
    },

    async handleAddFtp () {
      this.connecting = true
      const result = await this.connectToFtp(this.ftpForm)
      this.connecting = false
      if (result) {
        this.dialogFormVisible = false
        this.saveClientToStorage()
      }
    },

    readClientsFromStorage () {
      const getItemResult = localStorage.getItem('ftpClients')
      this.clients = JSON.parse(getItemResult || '[]').filter(client => client && client.ftpForm)
      this.saveClientToStorage()
    },

    saveClientToStorage () {
      localStorage.setItem('ftpClients', JSON.stringify(this.clients.map(client => { return { ftpForm: client.ftpForm } })))
    },

    async connectToFtp (ftpForm, idx) {
      if (!ftpForm.name) ftpForm.name = `${ftpForm.host}:${ftpForm.user}`
      const client = new ftp.Client()
      client.ftp.verbose = true
      try {
        await client.access(ftpForm)

        if (idx && this.clients[idx]) {
          Object.assign(this.clients[idx], { connected: true, con: client, id: uuid(), ftpForm })
        } else {
          this.clients.push({ connected: true, con: client, id: uuid(), ftpForm })
        }

        console.log(`ftp connect ${ftpForm.host}:${ftpForm.name} success`)

        this.$notify.success({
          title: '成功连接到FTP服务器',
          message: `您已成功连接到FTP服务器"${this.ftpForm.host}:${this.ftpForm.port}"！`,
          position: 'bottom-right',
          duration: 3000
        })
        return true
      } catch (err) {
        console.log(err)
        this.$notify.error({
          title: '连接FTP失败',
          message: `无法连接到FTP服务器 "${ftpForm.host}:${ftpForm.port}"，请检查输入是否正确。详细错误信息：${err.message}`,
          position: 'bottom-right',
          duration: 10000
        })
      }
      client.close()
    }
  }
}
</script>

<style lang="less" scoped>
@import '../themes/light.less';

.ftp-service-item {
    padding: 0 15px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #E8EAF6;
    color: #283593;
    border-radius: 4px;
    transition: .2s ease;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 10px;
}

.ftp-service-item:hover {
    background-color: @primary;
    color: #FFFFFF;
}

.ftp-service-item:active {
    filter: brightness(.9);
}

.ftp-service-item-icon {
    margin-right: 10px;
    font-size: 16px;
}

.ftp-client-item {
    padding: 0 15px;
    height: 70px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #ECEDF8;
    color: #303F9F;
    border-radius: 4px;
    transition: .2s ease;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 10px;
    overflow: hidden;
    width: 100%;

}

.ftp-client-item:hover {
    filter: brightness(.9);
}

.ftp-client-item:active {
    filter: brightness(.85);
}

.ftp-client-item-connected {
    background-color: #E8F5E9;
}

.ftp-client-item-connect-failed {
    background-color: #ffcdd2;
}
</style>
