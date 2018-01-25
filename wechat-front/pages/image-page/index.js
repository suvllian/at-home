import { getPageInfor } from '../../api/index.js'
var app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    handleType: 7,
    imageList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const handleType = options.type ? parseInt(options.type) : 7
    this.setData({
      handleType
    })
    const title = handleType === 7 ? '家政服务' : '企业清洁'
    wx.setNavigationBarTitle({
      title
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const $that = this
    const { handleType } = this.data

    getPageInfor({
      method: 'GET',
      data: {
        pageType: handleType
      },
      success: res => {
        const { data = {} } = res
        const { data: list } = data

        $that.setData({
          imageList: list.map(item => item.image_url)
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  }
})