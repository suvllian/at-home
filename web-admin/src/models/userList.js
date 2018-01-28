import { getUserList } from '../services/api';

export default {
  namespace: 'userList',

  state: {
    data: [],
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getUserList, payload);
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
