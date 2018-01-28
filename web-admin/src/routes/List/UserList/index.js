import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');
const columns = [
  {
    title: '分类',
    dataIndex: 'no',
  },
  {
    title: '描述',
    dataIndex: 'description',
  },
  {
    title: '价格',
    dataIndex: 'description',
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    sorter: true,
    render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
  },
  {
    title: '操作',
    render: () => (
      <Fragment>
        <a href="">查看详情</a>
      </Fragment>
    ),
  },
];

const CreateForm = Form.create()((props) => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      title="新建规则"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="描述"
      >
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: 'Please input some description...' }],
        })(
          <Input placeholder="请输入" />
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
@Form.create()
export default class UserLIst extends PureComponent {
  state = {
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/fetch',
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
      type: 'rule/fetch',
      payload: params,
    });
  }

  // handleMenuClick = (e) => {
  //   const { dispatch } = this.props;
  //   const { selectedRows } = this.state;

  //   if (!selectedRows) return;

  //   switch (e.key) {
  //     case 'remove':
  //       dispatch({
  //         type: 'rule/remove',
  //         payload: {
  //           no: selectedRows.map(row => row.no).join(','),
  //         },
  //         callback: () => {
  //           this.setState({
  //             selectedRows: [],
  //           });
  //         },
  //       });
  //       break;
  //     default:
  //       break;
  //   }
  // }

  // handleModalVisible = (flag) => {
  //   this.setState({
  //     modalVisible: !!flag,
  //   });
  // }

  // handleAdd = (fields) => {
  //   this.props.dispatch({
  //     type: 'rule/add',
  //     payload: {
  //       description: fields.desc,
  //     },
  //   });

  //   message.success('添加成功');
  //   this.setState({
  //     modalVisible: false,
  //   });
  // }

  render() {
    const { rule: { data }, loading } = this.props;
    const { selectedRows, modalVisible } = this.state;

    // const menu = (
    //   <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
    //     <Menu.Item key="remove">删除</Menu.Item>
    //     <Menu.Item key="approval">批量审批</Menu.Item>
    //   </Menu>
    // );

    // const parentMethods = {
    //   handleAdd: this.handleAdd,
    //   handleModalVisible: this.handleModalVisible,
    // };

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            {/* <StandardTable
              loading={loading}
              data={data}
              columns={columns}
              onChange={this.handleStandardTableChange}
            /> */}
          </div>
        </Card>
        {/* <CreateForm
          {...parentMethods}
          modalVisible={modalVisible}
        /> */}
      </PageHeaderLayout>
    );
  }
}
