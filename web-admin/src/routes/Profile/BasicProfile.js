import React, { Component } from 'react';
import { connect } from 'dva';
import { Card, Badge, Table, Divider } from 'antd';
import moment from 'moment';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import DescriptionList from '../../components/DescriptionList';
import styles from './BasicProfile.less';
import { getUrlHashParam } from '../../utils/utils'

const { Description } = DescriptionList;

const progressColumns = [{
  title: '时间',
  dataIndex: 'time',
  key: 'time',
}, {
  title: '当前进度',
  dataIndex: 'rate',
  key: 'rate',
}, {
  title: '状态',
  dataIndex: 'status',
  key: 'status',
  render: text => (
    text === 'success' ? <Badge status="success" text="成功" /> : <Badge status="processing" text="进行中" />
  ),
}, {
  title: '操作员ID',
  dataIndex: 'operator',
  key: 'operator',
}, {
  title: '耗时',
  dataIndex: 'cost',
  key: 'cost',
}];

@connect(({ profile, loading }) => ({
  profile,
  loading: loading.effects['profile/fetch'],
}))
export default class BasicProfile extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'profile/fetch',
      payload: {
        id: getUrlHashParam('id')
      }
    });
  }

  timeFormater(timeStr) {
    return timeStr && moment(new Date(+timeStr)).format('YYYY-MM-DD')
  }

  basicInformationRender(info) {
    if (info && info.length > 0) {
      return (
        <DescriptionList size="large" title="用户信息" style={{ marginBottom: 32 }}>
          <Description term="用户姓名">{info[0].nick_name}</Description>
          <Description term="联系电话">{info[0].phone}</Description>
          <Description term="会员类型">{info[0].member_description}</Description>
        </DescriptionList>
      )
    }
    return null;
  }

  orderInformationRender(info, loading) {
    if (info && info.length > 0) {
      const columns = [{
        title: '预约时间',
        dataIndex: 'order_time',
        key: 'order_time',
      }, {
        title: '下单时间',
        dataIndex: 'gmt_create',
        key: 'gmt_create',
        render: (value) => {
          return this.timeFormater(value)
        },
      }, {
        title: '订单金额（元）',
        dataIndex: 'money_number',
        key: 'money_number',
      }, {
        title: '订单类型',
        dataIndex: 'type_description',
        key: 'type_description',
      }];
      return (
        <div>
          <Divider style={{ marginBottom: 32 }} />
          <div className={styles.title}>订单信息</div>
          <Table
            style={{ marginBottom: 24 }}
            pagination={false}
            loading={loading}
            dataSource={info}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )
    }
    return null;
  }

  addressInformationRender(info, loading) {
    if (info && info.length > 0) {
      let formatInfo = [];
      info.forEach(item => {
        formatInfo.push({
          'name': item.name,
          'is_male': item.is_male === 1 ? '男' : '女',
          'phone': item.phone,
          'address': `西安市${item.area}${item.specific_address}`,
        })
      });
      const columns = [{
        title: '姓名',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '性别',
        dataIndex: 'is_male',
        key: 'is_male',
      }, {
        title: '联系电话',
        dataIndex: 'phone',
        key: 'phone',
      }, {
        title: '详细地址',
        dataIndex: 'address',
        key: 'address',
      }];
      return (
        <div>
          <Divider style={{ marginBottom: 32 }} />
          <div className={styles.title}>地址信息</div>
          <Table
            style={{ marginBottom: 24 }}
            pagination={false}
            loading={loading}
            dataSource={formatInfo}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />     
        </div>
      )
    }
    return null;
  }

  couponsInformationRender(info, loading) {
    if (info && info.length > 0) {
      const columns = [{
        title: '凭证码',
        dataIndex: 'coupon_code',
        key: 'coupon_code',
      }, {
        title: '金额（元）',
        dataIndex: 'money_number',
        key: 'money_number',
      }, {
        title: '失效时间',
        dataIndex: 'invalid_time',
        key: 'invalid_time',
        render: (value) => {
          return this.timeFormater(value)
        },
      }, {
        title: '兑换时间',
        dataIndex: 'gmt_exchange',
        key: 'gmt_exchange',
        render: (value) => {
          return this.timeFormater(value)
        },
      }, {
        title: '使用时间',
        dataIndex: 'gmt_used',
        key: 'gmt_used',
        render: (value) => {
          return this.timeFormater(value)
        },
      }, {
        title: '已使用',
        dataIndex: 'has_used',
        key: 'has_used',
      }];
      return (
        <div>
          <Divider style={{ marginBottom: 32 }} />
          <div className={styles.title}>券信息</div>
          <Table
            style={{ marginBottom: 24 }}
            pagination={false}
            loading={loading}
            dataSource={info}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      )
    }
    return null;
  }

  render() {
    const { profile, loading } = this.props;
    const { basicInformation, orderInformation, couponsInformation, addressInformation } = profile.data;
    
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          {this.basicInformationRender(basicInformation)}
          {this.orderInformationRender(orderInformation, loading)}
          {this.addressInformationRender(addressInformation, loading)}
          {this.couponsInformationRender(couponsInformation, loading)}
        </Card>
      </PageHeaderLayout>
    );
  }
}
