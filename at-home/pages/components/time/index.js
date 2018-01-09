Component({
  properties: {},
  data: {
    multiArray: [['上午', '下午'], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]],
    multiIndex: [0, 8, 9],
    date: (new Date()).getFullYear() + '-' + ((new Date()).getMonth() + 1) + '-' + (new Date()).getDate(),
  },
  methods: {
    // 修改预约时间
    bindMultiPickerChange: function (e) {
      this.setData({
        multiIndex: e.detail.value
      })
    },
    bindDateChange: function (e) {
      this.setData({
        date: e.detail.value
      })
    }
  }
})