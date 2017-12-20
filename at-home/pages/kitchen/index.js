Page({
  data: {
    hideSelectPopup: true,
    kitchenCount: 1,
    bathroomCount: 1,
    minCount: 0,
    maxCount: 10,
    showText: '',
    time: '00:00',
    date: (new Date()).getFullYear() + '-' + (new Date()).getMonth() + '-' + (new Date()).getDate()
  },
  onLoad: function () {
    this.setNumber()
  },
  bindPickerChange: function (e) {
    this.setData({
      areaIndex: e.detail.value
    })
  },
  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },
  bindTimeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  },
  callService: function () {
    wx.makePhoneCall({
      phoneNumber: '15619216635'
    })
  },
  togglePopup: function() {
    var isHide = this.data.hideSelectPopup
    this.setData({
      hideSelectPopup: !isHide
    })
  },
  decreaseKitchen: function() {
    if (this.data.kitchenCount > this.data.minCount) {
      var currentCount = this.data.kitchenCount;
      currentCount--;
      this.setData({
        kitchenCount: currentCount
      })
    }
  },
  increaseKitchen: function () {
    if (this.data.kitchenCount < this.data.maxCount) {
      var currentCount = this.data.kitchenCount;
      currentCount++;
      this.setData({
        kitchenCount: currentCount
      })
    }
  },
  decreaseBathroom: function () {
    if (this.data.bathroomCount > this.data.minCount) {
      var currentCount = this.data.bathroomCount;
      currentCount--;
      this.setData({
        bathroomCount: currentCount
      })
    }
  },
  increaseBathroom: function () {
    if (this.data.bathroomCount < this.data.maxCount) {
      var currentCount = this.data.bathroomCount;
      currentCount++;
      this.setData({
        bathroomCount: currentCount
      })
    }
  },
  setNumber: function () {
    const { kitchenCount, bathroomCount }  = this.data
    const pickArray = ['一', '两', '三', '四', '五', '六', '七', '八', '九', '十']
    let showText = ''

    if (kitchenCount && bathroomCount) {
      showText = `厨房${pickArray[kitchenCount - 1]}间、卫生间${pickArray[bathroomCount - 1]}间`
    } else if (kitchenCount && !bathroomCount) {
      showText = `厨房${pickArray[kitchenCount - 1]}间`
    } else if (!kitchenCount && bathroomCount) {
      showText = `卫生间${pickArray[bathroomCount - 1]}间`
    }

    this.setData({
      showText
    })
  },
  submitNumber: function () {
    this.togglePopup()
    this.setNumber()
  }
 })
