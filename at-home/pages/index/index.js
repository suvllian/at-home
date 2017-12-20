import api from '../../api/index.js'
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
        { title: '家电清洗', src: '../../assets/images/electrical.png', url: '/pages/whole-house/index' },
        { title: '家居养护', src: '../../assets/images/household.png', url: '/pages/whole-house/index' },
        { title: '家政服务', src: '../../assets/images/housekeeping.png', url: '/pages/whole-house/index' },
        { title: '企业清洁', src: '../../assets/images/corproation.png', url: '/pages/whole-house/index' }
      ]
    ],
    panelList: [
      { title: '我的订单', label: '查看历史订单 >>', src: '../../assets/images/my_order.png', url: '/pages/history/index' },
      { title: '我的卡券', label: '查看更多卡券 >>', src: '../../assets/images/my_coupons.png', url: '/pages/personal/index' },
      { title: '个人中心', label: '管理个人信息 >>', src: '../../assets/images/personal.png', url: '/pages/personal/index' }
    ],
    cardList: [
      {
        title: '送朋友在乎乔迁卡',
        cards: [
          { text: '祝你乔迁之喜', src: 'https://gw.alicdn.com/tfs/TB1R1S4SXXXXXaRXpXXXXXXXXXX-900-500.jpg' },
          { text: '搬家了', src: 'https://gw.alicdn.com/tfs/TB1R1S4SXXXXXaRXpXXXXXXXXXX-900-500.jpg' }
        ]
      },
      {
        title: '在乎卡/表心意',
        cards: [
          { text: '给特别的你', src: 'https://gw.alicdn.com/tfs/TB1R1S4SXXXXXaRXpXXXXXXXXXX-900-500.jpg' },
          { text: '爱来了', src: 'https://gw.alicdn.com/tfs/TB1R1S4SXXXXXaRXpXXXXXXXXXX-900-500.jpg' },
          { text: '妈妈，今天你休息', src: 'https://gw.alicdn.com/tfs/TB1R1S4SXXXXXaRXpXXXXXXXXXX-900-500.jpg' },
          { text: '谢谢你', src: 'https://gw.alicdn.com/tfs/TB1R1S4SXXXXXaRXpXXXXXXXXXX-900-500.jpg' }
        ]
      }
    ]
  },
  onLoad() {
    
  },
  getCards(idList) {
    let { cards } = this.data

    if (idList.length > 0) {
      api.getCardById({
        query: {
          id: idList.shift()
        },
        success: res => {
          if (res.data.res === 0) {
            let card = res.data.data

            card.hp_makettime = util.formatMakettime(card.hp_makettime)
            cards.push(card)
          }
          this.getCards(idList)
        }
      })
    } else {
      this.setData({ cards })
    }
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
