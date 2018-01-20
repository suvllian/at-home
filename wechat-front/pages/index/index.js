import { login, getCardsList } from '../../api/index.js'
import util from '../../utils/util.js'

const app = getApp()

Page({
  data: {
    cards: [],
    current: 0,
    navList: [
      [
        { title: '全屋保洁', src: '../../assets/images/whole_home.png', url: '/pages/whole-house/index' },
        { title: '钟点保洁', src: '../../assets/images/hour.png', url: '/pages/hour/index' },
        { title: '擦玻璃', src: '../../assets/images/wash_glass.png', url: '/pages/wash-glass/index' },
        { title: '厨卫清洁', src: '../../assets/images/kitchen.png', url: '/pages/kitchen/index' }
      ],
      [
        { title: '家电清洗', src: '../../assets/images/electrical.png', url: '/pages/electric/index' },
        { title: '家居养护', src: '../../assets/images/household.png', url: '/pages/household/index' },
        { title: '家政服务', src: '../../assets/images/housekeeping.png', url: '/pages/whole-house/index' },
        { title: '企业清洁', src: '../../assets/images/corproation.png', url: '/pages/whole-house/index' }
      ]
    ],
    panelList: [
      { title: '我的订单', label: '查看历史订单 >>', src: '../../assets/images/my_order.png', url: '/pages/history/index' },
      { title: '我的卡券', label: '查看更多卡券 >>', src: '../../assets/images/my_coupons.png', url: '/pages/coupons/index' },
      { title: '个人中心', label: '管理个人信息 >>', src: '../../assets/images/personal.png', url: '/pages/personal/index' }
    ],
    cardList: []
  },
  onLoad() {
    const $that = this

    // 获取用户基本信息
    wx.getUserInfo({
      success: function (res) {
        app.globalData.userInfo = res.userInfo
      }
    })

    // 获取卡券列表
    this.getCards()
    wx.checkSession({
      // success: function() {
      //   console.log('check session success')
      // },
      success: function() {
        wx.login({
          success: res => {
            const { code } = res

            if (code) {
              login({
                method: 'POST',
                data: {
                  loginCode: code
                },
                success: res => {
                  const { success = false, msg = '', noRegister = false } = res.data
                  const { userInfo } = app.globalData

                  // 登录失败
                  // if (!success) {
                  //   if (noRegister) {
                  //     // 未注册
                  //     wx.navigateTo({
                  //       url: '/pages/login/index'
                  //     })
                  //   } else {
                  //     return 
                  //   }
                  // }

                  // if (data && data.length) {
                  //   app.globalData.userInfo = {
                  //     ...userInfo,
                  //     memberTypeInfo: {
                  //       memberType: data[0].member_type,
                  //       memberScale: 0.1
                  //     }
                  //   }
                  // }
                }
              })
            }
          }
        })
      } 
    })
  },
  getCards() {
    getCardsList({
      method: 'GET',
      success: res => {
        const { data = {} } = res
        const { data: cardList = [] } = data
        let couponsTypeArray = [], newCardList = []

        cardList.forEach(card => {
          const { coupon_type, type_name } = card
          if (!couponsTypeArray.includes(coupon_type)) {
            couponsTypeArray.push(coupon_type)
            newCardList.push({
              title: type_name,
              cards: []
            })
          }
        })

        couponsTypeArray.forEach((couponsType, index) => {
          cardList.forEach(card => {
            if (couponsType === card.coupon_type) {
              newCardList[index] && newCardList[index].cards.push(card)
            }
          })
        })
        
        this.setData({
          cardList: newCardList
        })
      }
    })
  },
  handleChange(e) {
    const { current } = e.detail
    const cardsLen = this.data.cards.length

    if (current === cardsLen) {
      this.setData({
        current: cardsLen
      })
    }
  } 
})
