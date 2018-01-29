import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider, Table } from 'antd';
import StandardTable from '../../../components/StandardTable';
import PageHeaderLayout from '../../../layouts/PageHeaderLayout';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const CreateForm = Form.create()((props) => {
  const { modalVisible, editPriceItem = {}, form, handleEdit, handleModalVisible } = props;
  const { id: editPriceId = 0, type_price = 0 } = editPriceItem;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      fieldsValue.editPriceId = editPriceId;
      if (err) return;
      handleEdit(fieldsValue);
    });
    form.resetFields();
  };
  return (
    <Modal
      title="修改价格"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="新价格"
      >
        {form.getFieldDecorator('newPrice', {
          initialValue: type_price,
          rules: [{ required: true, message: '请输入价格' }],
        })(
          <Input placeholder="请输入" />
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ userList, loading }) => ({
  userList,
  loading: loading.models.rule,
}))
@Form.create()
export default class UserList extends PureComponent {
  state = {
    editPriceItem: {},
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userList/fetch',
    });
  }

  renderCloumn() {
    return [
      {
        title: '用户姓名',
        dataIndex: 'nick_name',
      },
      {
        title: '联系电话',
        dataIndex: 'phone',
      },
      {
        title: '会员类型',
        dataIndex: 'member_description',
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (value, record) => {
          return (
            <Fragment>
              <a href={`#/profile?id=${record.id}`}>查看详情</a>
            </Fragment>
          );
        },
      },
    ];
  }

  render() {
    const { userList: { data }, loading } = this.props;
    const { selectedRows, modalVisible, editPriceItem } = this.state;

    const parentMethods = {
      handleEdit: this.handleEdit,
      handleModalVisible: this.handleModalVisible,
    };
    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div>
            <Table
              columns={this.renderCloumn()}
              dataSource={data}
            />
          </div>
        </Card>
        <CreateForm
          {...parentMethods}
          modalVisible={modalVisible}
          editPriceItem={editPriceItem}
        />
      </PageHeaderLayout>
    );
  }
}
