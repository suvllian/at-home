import { getUserInfo } from '../services/api';

export default {
  namespace: 'profile',

  state: {
    data: {}
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getUserInfo, payload);
      yield put({
        type: 'getInfo',
        payload: response,
      });
    },
  },

  reducers: {
    getInfo(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
