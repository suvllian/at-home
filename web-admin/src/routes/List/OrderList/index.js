import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Form, Card, Table } from 'antd';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';
import { loadavg } from 'os';
 
@connect(({ orderList, loading }) => ({
  orderList,
  loading: loading.models.rule,
}))
@Form.create()
export default class OrderList extends PureComponent {
  state = {
    typeMap: ['全屋保洁', '钟点保洁', '擦玻璃', '厨卫清洁', '家电清洗', '家居养护'],
    typeItemMap: {
      4: ['厨房', '卫生间'],
      5: ['挂式空调', '柜式空调', '油烟机', '洗衣机', '电脑', '微波炉', '单开门冰箱', '双开门冰箱'],
      6: ['沙发', '地毯', '地板', '除螨'],
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'orderList/fetch',
    });
  }

  timeFormater(timeStr) {
    return timeStr && moment(new Date(+timeStr)).format('YYYY-MM-DD');
  }

  orderListRender(info, loading) {
    if (info && info.length > 0) {
      const { typeMap, typeItemMap } = this.state;
      const formatInfo = [];
      info.forEach((item) => {
        formatInfo.push({
          ...item,
          name: item.name,
          nick_name: item.nick_name,
          gmt_create: item.gmt_create,
          order_time: item.order_time,
          phone: item.phone,
          order_type: item.order_parent_type,
          order_parent_type: { type: item.order_parent_type, desc: item.order_description, type_name: item.type_name },
          address: `西安市${item.area}${item.specific_address}`,
        });
      });
      const columns = [{
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '性别',
        dataIndex: 'is_male',
        key: 'is_male',
        render: val => {
          return val ? '男' : '女'
        }
      }, {
        title: '用户昵称',
        dataIndex: 'nick_name',
        key: 'nick_name',
      }, {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
      }, {
        title: '下单时间',
        dataIndex: 'gmt_create',
        key: 'gmt_create',
        render: (value) => {
          return this.timeFormater(value);
        },
      }, {
        title: '预约时间',
        dataIndex: 'order_time',
        key: 'order_time',
      }, {
        title: '订单类型',
        dataIndex: 'order_type',
        key: 'order_type',
        render: val => {
          return typeMap[val - 1] || '未知订单';
        }
      }, {
        title: '订单描述',
        dataIndex: 'order_parent_type',
        key: 'order_parent_type',
        width: '370px',
        render: (value) => {
          if (value.type <= 3) {
            return value.type_name || '未知订单';
          } else {
            let map = typeItemMap[value.type];
            let desc = value.desc.split(',');
            let str = '';
            if (map.length === desc.length) {
              for (let i = 0; i < map.length; i++) {
                str += desc[i] === '0' ? '' : `${map[i]}/${desc[i]}，`
              }
            }
            return str.slice(0, str.length - 1) || '暂无数据'
          }
        }
      }, {
        title: '详细地址',
        dataIndex: 'address',
        key: 'address',
      }, {
        title: '订单金额',
        dataIndex: 'money_number',
        key: 'money_number',
        render: val => {
          return `${val}元`
        }
      }];
      return (
        <Table
          style={{ marginBottom: 24 }}
          pagination={false}
          loading={loading}
          dataSource={formatInfo}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      );
    }
    return null;
  }

  render() {
    const { orderList: { data }, loading } = this.props;
    console.log(data)
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          {this.orderListRender(data, loading)}
        </Card>
      </PageHeaderLayout>
    );
  }
}
