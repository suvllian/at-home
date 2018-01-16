import { serviceNumber } from '../../../config.js'

Component({
  methods: {
    // 修改预约时间 end
    callService: function () {
      wx.makePhoneCall({
        phoneNumber: serviceNumber
      })
    }
  }
})