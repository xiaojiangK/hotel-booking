
var qqmapsdk;
const config = require('./config/index');
const QQMapWX = require('./lib/qqmap-wx-jssdk.min.js');

App({
  globalData: {
    days: 1,
    token: '',
    rebate: 0,
    userInfo: null,
    imgUrl: 'https://static.hotel.showboom.cn/'
  },
  onLaunch: function () {
    this.getLocation();
    wx.getStorage({
      key: 'token',
      success: (res) => {
        this.globalData.token = res.data;
      }
    });
    wx.getStorage({
      key: 'userInfo',
      success: (res) => {
        this.globalData.userInfo = res.data;
      }
    });
  },
  // 分享
  onShareApp (e) {
    var pages = getCurrentPages(); //获取加载的页面
    var current = pages[pages.length-1]; //获取当前页面的对象
    return {
      title: e.title,
      path: current.route
    }
  },
  getLocation(that = '') {
    wx.getStorage({
      key: 'city',
      fail: () => {
        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
          key: config.QQMapWXKey // 必填
        });
        wx.getLocation({
          type: 'wgs84',
          success: (re) => {
            // 根据坐标获取当前位置名称，显示在顶部:腾讯地图逆地址解析
            qqmapsdk.reverseGeocoder({
              location: {
                latitude: re.latitude,
                longitude: re.longitude
              },
              success: (addressRes) => {
                const city = addressRes.result.ad_info.city
                wx.setStorage({
                  key: 'city',
                  data: city
                });
                if (that) {
                  that.setData({ city });
                }
              },
              fail: (res) => {
                wx.showToast({
                  title: res.message,
                  icon: 'none'
                });
              }
            });
          }
        });
      }
    });
  },
  // 小写转大写
  integer(num) {
    let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
    let unit = ["", "十", "百", "千", "万"];
    num = parseInt(num);
    let getWan = (temp) => {
        let strArr = temp.toString().split("").reverse();
        let newNum = "";
        for (var i = 0; i < strArr.length; i++) {
            newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
        }
        return newNum;
    }
    let overWan = Math.floor(num / 10000);
    let noWan = num % 10000;
    if (noWan.toString().length < 4) noWan = "0" + noWan;
    return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
  }
})