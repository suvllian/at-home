import { SERVICENUMBER } from '../../../config.js'

Component({
  methods: {
    callService: function () {
      wx.makePhoneCall({
        phoneNumber: SERVICENUMBER
      })
    }
  }
})