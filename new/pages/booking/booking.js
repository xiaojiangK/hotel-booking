/**
 *  酒店直订页
 */
var app = getApp();
const api = require('./../../utils/api');

Page({
  data: {
  },
  onShareAppMessage () {
    return app.onShareApp({
      title: '酒店直订'
    });
  },
  //  跳转小程序
  navigate: function () {
    api.navigateToMiniProgram({
      appId: 'wx970c288350572a5f',
      path: 'pages/index/index'
    })
  }
})
