import { login, getCardsList, getEffectiveCoupons } from '../../api/index.js'
import { getCurrentDate } from '../../utils/util.js'
import { wxPay } from '../../utils/pay.js'
import { STORAGEKEY, COUPONSTORAGEKEY } from '../../config.js'
const app = getApp()

Page({
  data: {
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
        { title: '家政服务', src: '../../assets/images/housekeeping.png', url: '/pages/image-page/index?type=7' },
        { title: '企业清洁', src: '../../assets/images/corproation.png', url: '/pages/image-page/index?type=8' }
      ]
    ],
    panelList: [
      { title: '我的订单', label: '查看历史订单 >>', src: '../../assets/images/my_order.png', url: '/pages/history/index' },
      { title: '我的卡券', label: '查看更多卡券 >>', src: '../../assets/images/my_coupons.png', url: '/pages/coupons/index' },
      { title: '个人中心', label: '管理个人信息 >>', src: '../../assets/images/personal.png', url: '/pages/personal/index' }
    ],
    cardList: [],
    originalCards: []
  },
  onLoad() {
    // 获取卡券列表
    this.getCards()
    this.getEffectiveCoupons()

    // 将用户基本信息存储到缓存中
    wx.getStorage({
      key: STORAGEKEY,
      success: res => {
        const { data: userInfo } = res || {}
        const { phone } = userInfo || {}
        if (!phone) {
          return 
        }

        //验证登陆态
        wx.login({
          success: res => {
            const { code } = res
            if (!code) {
              return 
            }

            login({
              method: 'POST',
              data: {
                phone,
                loginCode: code
              },
              success: res => {
                const { success = false, msg = '', noRegister = false, noLogin = false, data: memberData } = res.data

                // 登录失败
                if (!success) {
                  if (noRegister || noLogin) {
                    // 未注册或未登录
                  }
                  return
                }

                if (memberData) {
                  wx.setStorageSync(STORAGEKEY, {
                    ...userInfo,
                    memberType: memberData.memberType,
                    memberScale: parseFloat(memberData.memberScale),
                    memberDescription: memberData.memberDescription,
                    phone: memberData.phone,
                    signature: memberData.signature
                  })
                }
              }
            })
          }
        })
      },
      fail: err => {
        // 获取用户基本信息
        wx.getUserInfo({
          success: res => {
            wx.setStorageSync(STORAGEKEY, res.userInfo)
          }
        })
      }
    })
  },
  /**
   * 获取有效的券
   */
  getEffectiveCoupons() {
    const userInfo = wx.getStorageSync(STORAGEKEY) || {}
    const { phone } = userInfo

    if (!phone) {
      return
    }

    wx.login({
      success: res => {
        const { code } = res

        if (!code) {
          return 
        }

        getEffectiveCoupons({
          method: 'GET',
          data: {
            code, phone
          },
          success: res => {
            const { data = {} } = res
            const { data: effictiveCouponList = [], success = false } = data

            if (!success) {
              return 
            }

            if (effictiveCouponList.length > 1) {
              effictiveCouponList.sort((a, b) => {
                return b.coupons_money - a.coupons_money
              })
            }

            wx.setStorageSync(COUPONSTORAGEKEY, effictiveCouponList)
          },
          fail: err => {
            console.log(err)
          }
        })
      }
    })
  },
  /**
   * 获取卡券列表
   */
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
          cardList: newCardList,
          originalCards: cardList
        })
      }
    })
  },
  buyCoupons(e) {
    const { cardList, originalCards } = this.data
    const createTime = new Date().getTime()
    const { couponId } = e.currentTarget.dataset
    const clickedCoupon = originalCards.filter(card => card.id === couponId)
    const totalFee = clickedCoupon[0].coupons_price
    // 订单号
    const orderId = `2${couponId}${getCurrentDate().join('')}${createTime}`

    // wxPay(orderId, totalFee, '', {
    //   createTime
    // })
  }
})
