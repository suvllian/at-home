import { addAddress } from '../../api/index.js'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isMale: false,
    selectedIndex: 0,
    areaList: ['新城区', '碑林区', '莲湖区', '灞桥区', '未央区', '雁塔区', '阎良区', '临潼区', '长安区', '周至县', '户县', '高陵县'],
    addressInformation: {}
  },
  bindRegionChange: function (e) {
    const selectedIndex = e.detail.value

    this.setData({
      selectedIndex
    })
  },
  setSex: function(e) {
    const sexType = e.currentTarget.dataset.male

    this.setData({
      isMale: sexType == "0" ? false : true
    })
  },
  inputName: function(e) {
    const { addressInformation } = this.data

    this.setData({
      addressInformation: { ...addressInformation,  name: e.detail.value }
    })
  },
  inputPhone: function (e) {
    const { addressInformation } = this.data

    this.setData({
      addressInformation: { ...addressInformation, phone: parseInt(e.detail.value) }
    })
  },
  inputSpecific: function (e) {
    const { addressInformation } = this.data

    this.setData({
      addressInformation: { ...addressInformation, specificAddress: e.detail.value }
    })
  },
  submit: function() {
    const { addressInformation, isMale, areaList, selectedIndex } = this.data
    const { name, phone, specificAddress } = addressInformation

    // 校验
    if (!name || !phone || !specificAddress || !selectedIndex) {
      console.log('请将信息填写完整')
      return  
    }

    const address = {
      ...addressInformation,
      isMale: isMale ? 1 : 0,
      area: areaList[selectedIndex]
    }

    wx.login({
      success: res => {
        const { code } = res

        addAddress({
          method: 'POST',
          data: {
            ...address,
            loginCode: code
          },
          success: res => {
            const { success } = res.data

            if (success) {
              wx.navigateBack({
                delta: 1
              })
            } else {

            }
          },
          fail: res => {
            console.log('request fail', res)
          }
        })
      }
    })
  }
})