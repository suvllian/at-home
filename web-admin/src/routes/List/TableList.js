import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from '../../components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './TableList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

const CreateForm = Form.create()((props) => {
  const { modalVisible, editPriceItem = {}, form, handleEdit, handleModalVisible } = props;
  const { id: editPriceId = 0, type_price = 0 } = editPriceItem
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      fieldsValue['editPriceId'] = editPriceId
      if (err) return;
      handleEdit(fieldsValue);
    });
    form.resetFields()
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
          rules: [{ required: true, message: '请输入价格' }]
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
export default class TableList extends PureComponent {
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
      type: 'rule/fetch',
    });
  }

  renderCloumn () {
    return [
      {
        title: '分类',
        dataIndex: 'type_description',
      },
      {
        title: '描述',
        dataIndex: 'type_name',
      },
      {
        title: '价格',
        dataIndex: 'type_price',
      },
      {
        title: '操作',
        dataIndex: 'id',
        render: (value, record, index) => { 
          return (
          <Fragment>
            <a href="javascript:void(0)" onClick={this.handleChangePrice.bind(this, record)}>修改</a>
          </Fragment>
        )}
      }
    ]
  }

  // 修改价格
  handleChangePrice(editPriceItem = {}) {
    this.setState({
      editPriceItem
    })
    this.handleModalVisible()
  }

  //对话框
  handleModalVisible = () => {
    this.setState({
      modalVisible: !this.state.modalVisible
    });
  }

  // 修改价格
  handleEdit = (fields) => {
    const { dispatch } = this.props;
    const { formValues } = this.state
    dispatch({
      type: 'rule/edit',
      payload: {
        id: fields.editPriceId,
        newPrice: parseInt(fields.newPrice)
      }
    });

    setTimeout(() => {
      dispatch({
        type: 'rule/fetch',
        payload: formValues
      });
    }, 1000)

    this.setState({
      modalVisible: false
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

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf()
      };

      this.setState({
        formValues: values
      });

      dispatch({
        type: 'rule/fetch',
        payload: values
      });
    });
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="类型">
              {getFieldDecorator('orderParentType')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="">全部</Option>
                  <Option value="1">全屋保洁</Option>
                  <Option value="2">钟点保洁</Option>
                  <Option value="3">擦玻璃</Option>
                  <Option value="4">厨卫清洁</Option>
                  <Option value="5">家电清洗</Option>
                  <Option value="6">家居养护</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { rule: { data }, loading } = this.props;
    const { selectedRows, modalVisible, editPriceItem } = this.state;

    const parentMethods = {
      handleEdit: this.handleEdit,
      handleModalVisible: this.handleModalVisible
    };

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderAdvancedForm()}
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.renderCloumn()}
              onChange={this.handleStandardTableChange}
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
