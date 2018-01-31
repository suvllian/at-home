import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const formatTime = val => !!val ? moment(parseInt(val)).format('YYYY-MM-DD HH:mm:ss') : ' -- '
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const couponsTypeObject = {
  all: '全部类型有效',
  1: '全屋清洁免单',
  2: '钟点保洁免单',
  3: '擦玻璃免单',
  4: '厨卫清洁免单',
  5: '家电清洗免单',
  6: '家居养护免单'
}
const columns = [
  {
    title: '卡券凭证码',
    dataIndex: 'coupon_code',
  },
  {
    title: '卡券额度',
    dataIndex: 'money_number',
  },
  {
    title: '卡券类型',
    dataIndex: 'coupon_type',
    render: val => couponsTypeObject[val]
  },
  {
    title: '创建时间',
    dataIndex: 'gmt_create',
    render: val => formatTime(val),
  },
  {
    title: '失效时间',
    dataIndex: 'invalid_time',
    render: val => formatTime(val),
  },
  {
    title: '兑换时间',
    dataIndex: 'gmt_exchange',
    render: val => formatTime(val),
  },
  {
    title: '领用人',
    dataIndex: 'nick_name',
    render: val => !!val ? val : ' -- ',
  },
  {
    title: '已兑换',
    dataIndex: 'has_exchanged',
    render: val => (<span>{val ? '是' : '否'}</span>),
  },
  {
    title: '使用时间',
    dataIndex: 'gmt_used',
    render: val => formatTime(val),
  },
  {
    title: '已使用',
    dataIndex: 'has_used',
    render: val => (<span>{val ? '是' : '否'}</span>),
  }
];

const CreateForm = Form.create()((props) => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      fieldsValue.couponInvalidTime = fieldsValue.couponInvalidTime.valueOf()
      console.log(fieldsValue)
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      title="添加抵用券"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 15 }}
        label="抵用券码"
      >
        {form.getFieldDecorator('couponCode', {
          rules: [{ required: true, message: '请输入抵用券码' }],
        })(
          <Input placeholder="请输入" />
        )}
      </FormItem>
      <FormItem
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 15 }}
        label="抵用券金额"
      >
        {form.getFieldDecorator('couponMoney', {
          rules: [{ required: true, message: '请输入抵用券金额' }],
        })(
          <Input placeholder="请输入" />
        )}
      </FormItem>
      <FormItem
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 15 }}
        label="抵用券失效时间"
      >
        {form.getFieldDecorator('couponInvalidTime', {
          rules: [{ required: true, message: '请选择抵用券失效时间' }],
        })(
          <DatePicker />
        )}
      </FormItem>
      <FormItem
        labelCol={{ span: 7 }}
        wrapperCol={{ span: 15 }}
        label="抵用券类型"
      >
        {form.getFieldDecorator('couponType', {
          initialValue: 'all',
          rules: [{ required: true, message: '请选择抵用券类型' }],
        })(
          <Select>
            <Option value="all">全部类型有效</Option>
            <Option value="3">擦玻璃免单</Option>
          </Select>
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ coupons, loading }) => ({
  coupons,
  loading: loading.models.coupons,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'coupons/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'coupons/fetch',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'coupons/fetch',
      payload: {},
    });
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'coupons/fetch',
        payload: values,
      });
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  handleAdd = (fields) => {
    const { dispatch } = this.props
    dispatch({
      type: 'coupons/add',
      payload: {
        ...fields
      }
    });

    message.success('添加成功');
    setTimeout(() => {
      dispatch({
        type: 'coupons/fetch'
      });
    }, 1000);
    this.setState({
      modalVisible: false
    });
  }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        {/* <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则编号">
              {getFieldDecorator('no')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
            </span>
          </Col>
        </Row> */}
      </Form>
    );
  }

  render() {
    const { coupons: { data }, loading } = this.props;
    const { selectedRows, modalVisible } = this.state;

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderSimpleForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm
          {...parentMethods}
          modalVisible={modalVisible}
        />
      </PageHeaderLayout>
    );
  }
}
