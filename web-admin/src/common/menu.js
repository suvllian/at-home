import {
  isUrl,
} from '../utils/utils';

const menuData = [{
  name: '用户列表',
  icon: 'home',
  path: 'list/user-list',
}, {
  name: '个人信息',
  icon: 'profile',
  path: 'profile',
  hideInMenu: true,
}, {
  name: '价格列表',
  icon: 'pay-circle-o',
  path: 'list/price-list',
}, {
  name: '订单列表',
  icon: 'pay-circle',
  path: 'list/order-list',
}, {
  name: '抵用券列表',
  icon: 'table',
  path: 'list/coupon-list',
}, {
  name: '页面设置',
  icon: 'layout',
  path: 'set-pages',
}, {
  name: '会员折扣设置',
  icon: 'user-add',
  path: 'set-member-discount',
}, {
  name: '账户',
  icon: 'user',
  path: 'user',
  authority: 'guest',
  children: [{
    name: '登录',
    path: 'login',
  }, {
    name: '注册',
    path: 'register',
  }, {
    name: '注册结果',
    path: 'register-result',
  }],
}];

function formatter(data, parentPath = '', parentAuthority) {
  return data.map((item) => {
    let {
      path,
    } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
