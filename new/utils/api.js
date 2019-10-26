const config = require('./../config/index');
const QQMapWX = require('./../lib/qqmap-wx-jssdk.min');

//  绑定
let bindAPI = (apiName, bindObj = wx) => (o = {}) => new Promise((resolve, reject) => {
  bindObj[apiName](Object.assign({}, o, {
    success: resolve,
    fail: reject
  }))
});

//  接口的命名空间
let apiSpace = {
  //  网络
  net: [
    'request',
    'uploadFile',
    'downloadFile',
    'connectSocket',
    'sendSocketMessage',
    'closeSocket',
    'onSocketOpen',
    'onSocketClose',
    'onSocketMessage',
    'onSocketError'
  ],
  //  数据缓存
  dataCache: [
    'getStorage',
    'getStorageSync',
    'setStorage',
    'setStorageSync',
    'removeStorage',
    'removeStorageSync',
    'clearStorage',
    'clearStorageSync',
    'getStorageInfo',
    'getStorageInfoSync'
  ],
  //  媒体
  media: [
    //  预览图片
    'previewImage',
    //  选择图片
    'chooseImage'
  ],
  //  位置
  location: [
    'getLocation',
    'openLocation',
    'chooseLocation'
  ],
  //  设备
  device: [
    //  网络
    'getNetworkType',
    //  电话
    'makePhoneCall',
    //  扫码
    'scanCode'
  ],
  //  界面
  userface: [
    //  交互
    'showToast',
    'hideToast',
    'showLoading',
    'hideLoading',
    'showModal',
    'showActionSheet',
    //  下拉刷新
    'stopPullDownRefresh',
    'setNavigationBarTitle'
  ],
  //  开放接口
  openAPI: [
    //  登录
    'login',
    'checkSession',
    //  小程序跳转
    'navigateToMiniProgram',
    //  用户信息
    'getUserInfo',
    //  支付
    'requestPayment',
    //  授权
    'authorize',
    //  设置
    'getSetting',
    'openSetting'
  ],
  //  地图
  map: [
    'createMapContext',
    'moveToLocation',
    'translateMarker'
  ],
  //  路由
  route: [
    'navigateTo',
    'navigateBack',
    'redirectTo',
    'switchTab',
    'reLaunch'
  ]
}

let rawNameArr = [];

for (let key in apiSpace) {
  rawNameArr = [...rawNameArr, ...apiSpace[key]]
}

const apis = rawNameArr.reduce((accu, elt) => {
  if (Object.prototype.toString.call(elt) === '[object String]') {
    accu[elt] = bindAPI(elt)
  } else {
    // elt.names.forEach(name=>{
    //   accu[name] = bindAPI(elt.name, elt.thisArg)
    // })
    accu[elt.name] = bindAPI(elt.name, elt.thisArg)
  }
  return accu;
}, {});

// qqwx 地图 api
apis.createQQMap = () => {
  let ins = new QQMapWX({ key: config.QQMapWXKey });
  return [
    'search',
    'getSuggestion',
    'reverseGeocoder',
    'geocoder',
    'getCityList',
    'getDistrictByCityId',
    'calculateDistance'
  ].reduce((accu, name) => {
    accu[name] = bindAPI(name, ins);
    return accu;
  }, {});
};

module.exports = apis;