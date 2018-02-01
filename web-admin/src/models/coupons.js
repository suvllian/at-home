import { getSendCouponsList, addCoupon } from '../services/api';

export default {
  namespace: 'coupons',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(getSendCouponsList, payload);
      yield put({
        type: 'save',
        payload: {
          list: response && response.data,
        },
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addCoupon, payload);
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
