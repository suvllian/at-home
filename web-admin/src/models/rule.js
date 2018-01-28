import { queryOrderTypeInfor, editOrderTypeInfor } from '../services/api';

export default {
  namespace: 'rule',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryOrderTypeInfor, payload);
      yield put({
        type: 'save',
        payload: {
          list: response && response.data
        },
      });
    },
    *edit({ payload, callback }, { call, put }) {
      const response = yield call(editOrderTypeInfor, payload);
      if (callback) callback()
    }
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload
      };
    }
  }
};
