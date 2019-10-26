const config = require('./../config/index');
const api = require('./api');

//  接口地址前缀
const baseURL = config.baseURL;

//  GET 请求
let get = (op = {}) => {
  return api.request({
    url: baseURL + op.path,
    ...op,
    header: {
      token: wx.getStorageSync('token') || ''
    },
    method: 'GET'
  }).then(res => {
    return res.data;
  });
};

//  POST 请求
let post = (op = {}) => {
  if (!op.header) {
    op.header = {}
  }
  return api.request({
    url: baseURL + op.path,
    ...op,
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...op.header,
      token: wx.getStorageSync('token') || ''
    },
    method: 'POST'
  }).then(res => {
    return res.data;
  });
};

/*
 *  用户
 *  用户登录
 */
exports.userLogin = code => {
  return post({
    path: '',
    data: {
      code
    }
  })
};
