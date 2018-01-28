import { stringify } from 'qs';
import request from '../utils/request';

// 用户列表
export async function getUserList() {
  return request('https://zaihu.zhangguanzhang.com/zaihu/get_user_list');
}
