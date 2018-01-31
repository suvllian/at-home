import { getAllOrderList } from '../services/api';

export default {
  namespace: 'orderList',

  state: {
    data: [],
  },

  effects: {
    *fetch({_}, { call, put }) {
      const response = yield call(getAllOrderList);
      yield put({
        type: 'queryList',
        payload: response && response.data,
      });
    },
  },

  reducers: {
    queryList(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
