/**
 *  今夜特价页
 */
const api = require('./../../utils/api');
import { getData, postData } from '../../utils/util-1';
var app = getApp();

Page({
  data: {
    isAuthorize: false,
    //  城市
    city: '北京市',
    //  搜索内容
    searchText: '',
    //  是否显示选择面板
    isChoose: false,
    //  选择内容
    chooseText: '',
    star: '',
    starList: [
      {
        id: 2,
        status: false,
        title: '经济型'
      },
      {
        id: 3,
        status: false,
        title: '舒适/三星'
      },
      {
        id: 4,
        status: false,
        title: '高档/四星'
      },
      {
        id: 5,
        status: false,
        title: '豪华/五星'
      }
    ],
    //  价格区间
    priceIndex: -1,
    price: '',
    priceText: '',
    priceList: [
      {
        min: 0,
        max: 150,
        text: '150以下'
      },
      {
        min: 150,
        max: 300,
        text: '150-300'
      },
      {
        min: 300,
        max: 450,
        text: '300-450'
      },
      {
        min: 450,
        max: 600,
        text: '450-600'
      },
      {
        min: 600,
        max: 1000,
        text: '600-1000'
      },
      {
        min: 1000,
        max: 10000,
        text: '1000以上'
      }
    ],
    //  价格滑块最小值
    slideMin: 0,
    //  价格滑块最大值
    slideMax: 1000,
    //  价格滑块初始最小值
    slideMinValue: 0,
    //  价格滑块初始最大值
    slideMaxValue: 1000,
    //  是否开售
    onSale: '',
    //  倒计时内容
    countdownStr: '',
    //  倒计时定时器
    countdownTimer: null,
    regionText: '',
    hotText: ''
  },
  //  页面显示
  onShow: function () {
    this.judgeSale();
    this.loadData();
    // 获取城市
    wx.getStorage({
      key: 'city',
      success: (res) => {
        this.setData({ city: res.data });
      }
    });
    // 获取搜索内容
    wx.getStorage({
      key: 'searchText',
      success: (res) => {
        this.setData({ searchText: res.data });
      }
    });
    wx.getStorage({
      key: 'regionText',
      success: (res) => {
        this.setData({ regionText: res.data });
      }
    });
    wx.getStorage({
      key: 'hotText',
      success: (res) => {
        this.setData({ hotText: res.data });
      }
    });
    // 获取星级
    wx.getStorage({
      key: 'starPrice',
      success: (res) => {
        const data = res.data;
        if (data.star || data.price) {
          const star = data.star;
          const priceText = data.price;
          if (star && priceText) {
            this.setData({
              chooseText: [`￥${priceText}`,star].join('，')
            });
          } else {
            this.setData({
              chooseText: `${priceText ? `￥${priceText}` : ''}` + star
            });
          }

          const starList = this.data.starList.map(function (item){
            item.status = false;
            for (let i of star) {
              if (i == item.title) {
                item.status = true;
              }
            }
            return item;
          });

          let priceIndex = -1;
          this.data.priceList.map(function (item, index){
            if (item.text == priceText) {
              priceIndex = index;
            }
          });
          this.setData({
            priceIndex,
            priceText,
            starList,
            star
          });
        } else {
          this.setData({
            priceIndex: -1,
            priceText: '',
            chooseText: '',
            star: ''
          });
        }
      }
    });
  },
  //  渲染完成
  onReady: function () {
    app.getLocation(this);
    this.duration = this.selectComponent('#duration');
    this.switchCity = this.selectComponent('#switchCity');
    this.slider = this.selectComponent('#zy-slider');
  },
  //  页面卸载
  onUnload: function () {
    this.endCountdown();
  },
  // 用户登录
  bindGetUserInfo: function (e) {
    if (e.detail.errMsg == 'getUserInfo:ok') {
      wx.login({
        success: (re) => {
          if (re.code) {
            wx.getSetting({
              success: (res) => {
                if (res.authSetting['scope.userInfo']) {
                  wx.getUserInfo({
                    success: (res) => {
                      const data = {
                        code: re.code,
                        encrypted_data: res.encryptedData,
                        iv: res.iv
                      }
                      postData('1/User/Login', data).then(res => {
                        if (res.code == 100000) {
                          const token = res.result;
                          wx.showToast({
                            title: '登录成功',
                            icon: 'none'
                          });
                          wx.setStorage({
                            key: 'token',
                            data: token
                          });
                          // 返现比例
                          getData(`1/special/Conf_List?token=${token}`).then(res => {
                            if (res.code == 100000) {
                                for (let i of res.result) {
                                    if (i.conf_key == 'tonight_commission_rate_user') {
                                      app.globalData.rebate = i.conf_val;
                                    }
                                }
                            }
                          });
                          app.globalData.token = token;
                          this.setData({ isAuthorize: true });
                          getData(`1/User/info?token=${token}`).then(res => {
                            if (res.code == 100000) {
                              const data = res.result;
                              postData('/xcx_pay/member', { token, mobile: data.mobile }).then(res => {
                                const userInfo = {
                                  ...data,
                                  vip: res.data
                                };
                                app.globalData.userInfo = userInfo;
                                wx.setStorage({
                                  key: 'userInfo',
                                  data: userInfo
                                });
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                } else {
                  this.setData({ isAuthorize: false });
                }
              }
            });
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      });
    }
  },
  //  加载数据
  loadData: function () {
    wx.getStorage({
      key: 'token',
      success: (res) => {
        // 返现比例
        getData(`1/special/Conf_List?token=${res.data}`).then(res => {
          if (res.code == 100000) {
              for (let i of res.result) {
                  if (i.conf_key == 'tonight_commission_rate_user') {
                    app.globalData.rebate = i.conf_val;
                  }
              }
          }
        });
        const userInfo = app.globalData.userInfo;
        postData('/xcx_pay/member', { token: res.data, mobile: userInfo.mobile }).then(res => {
          app.globalData.userInfo = {
            ...userInfo,
            vip: res.data
          }
        });
        wx.getStorage({
          key: 'userInfo',
          success: (res) => {
            const user = res.data;
            wx.request({
              url: 'https://j.showboom.cn/app/index.php?i=4&t=1&v=1.0.0&from=wxapp&c=entry&a=wxapp&do=wxUserAccessLog&m=zh_jdgjb',
              data: {
                uid: user.id,
                wxopenid: user.openid,
                wx_unionid: user.unionid,
                wx_nick_name: user.nick_name,
                sourcefrom: 'tonight_mp',
                access_page: 'index'
              },
              header: {
                'content-type': 'application/x-www-form-urlencoded',
              },
              method: 'POST'
            });
          }
        });
        this.setData({ isAuthorize: true });
      }
    });
  },
  //  搜索
  search: function () {
    api.navigateTo({
      url: `/pages/search/search?city=${this.data.city}`
    });
  },
  //  清空搜索项
  clearSearch: function () {
    this.setData({
      searchText: '',
      regionText: '',
      hotText: ''
    });
    api.setStorage({
      key: 'regionText',
      data: ''
    });
    api.setStorage({
      key: 'hotText',
      data: ''
    });
    api.setStorage({
      key: 'searchText',
      data: ''
    });
  },
  //  显示/隐藏选择
  toggleChoose: function () {
    this.setData({
      isChoose: !this.data.isChoose
    });
  },
  stopTop(){
    console.log('阻止冒泡')
  },
  //  清空选择项
  clearChoose: function () {
    this.setData({
      chooseText: '',
      priceIndex: -1,
      slideMinValue: 0,
      slideMaxValue: 1000
    });
    wx.setStorage({
      key: 'starPrice',
      data: {price: '', star: []}
    });
  },
  //  选择星级
  chooseStar: function (e) {
    let star  = [];
    let { idx } = e.currentTarget.dataset;
    const starList = this.data.starList.map((item, index) => {
        if (idx == index) {
          item.status = item.status ? false : true;
        }
        if (item.status) {
          star.push(item.title);
        }
        return item;
    });
    this.setData({
      star,
      starList
    });
  },
  //  选择价格
  choosePrice: function (e) {
    let { index } = e.currentTarget.dataset;
    if (index === this.data.priceIndex) {
      this.setData({
        priceIndex: -1,
        price: '',
        priceText: ''
      });
    } else {
      this.setData({
        priceIndex: index,
        price: this.data.priceList[index].min + this.data.priceList[index].max,
        priceText: '￥' + this.data.priceList[index].text
      });
      this.slider.reset();
    }
  },
  //  滑块低值
  slideLowChange: function (e) {
    this.setData({
      slideMinValue: e.detail.lowValue,
      priceIndex: -1,
      price: `${e.detail.lowValue}-${this.data.slideMaxValue}`,
      priceText: `￥${e.detail.lowValue}-${this.data.slideMaxValue}`
    });
  },
  //  滑块高值
  slideHighChange: function (e) {
    this.setData({
      slideMaxValue: e.detail.heighValue,
      priceIndex: -1,
      price: `${this.data.slideMinValue}-${e.detail.heighValue}`,
      priceText: `￥${this.data.slideMinValue}-${e.detail.heighValue}`
    });
  },
  //  重置选择
  resetChoose: function () {
    const starList = this.data.starList.map(item => {
      return {
        ...item,
        status: false
      }
    });
    this.setData({
      starList,
      priceIndex: -1,
      star: [],
      priceText: '',
      slideMinValue: 0,
      slideMaxValue: 1000
    });
    wx.setStorage({
      key: 'starPrice',
      data: {price: '', star: []}
    });
  },
  //  完成选择
  finishChoose: function () {
    let { star, priceText } = this.data;
    if (star && priceText) {
      this.setData({
        chooseText: [priceText,star].join('，')
      });
    } else {
      this.setData({
        chooseText: priceText + star
      });
    }
    wx.setStorage({
      key: 'starPrice',
      data: {price: priceText.replace('￥', ''), star}
    });
    this.toggleChoose();
  },
  //  判断开售
  judgeSale: function () {
    let hour = new Date().getHours();
    //  18:00 - 22:00 开售
    if ( hour >= 18 && hour < 22 ) {
      this.setData({
        onSale: 'Y'
      });
    } else {
      this.setData({
        onSale: 'N'
      });
      this.startCountdown();
    }
  },
  //  开始计时
  startCountdown: function () {
    this.countdown();
    this.data.countdownTimer = setInterval(() => {
      this.countdown();
    }, 1000);
  },
  //  结束计时
  endCountdown: function () {
    clearInterval(this.data.countdownTimer);
    this.setData({
      countdownTimer: null
    });
  },
  //  倒计时设置值
  countdown: function () {
    let currentHours = new Date().getHours();
    let endDate;
    //  当前时间当天18点前
    if (currentHours < 18) {
      endDate = new Date().setHours(18, 0, 0, 0);
    }
    //  当前时间当天22点后
    if (currentHours >= 22) {
      endDate = new Date(new Date().setHours(18, 0, 0, 0) + 24 * 60 * 60 * 1000);
    }
    let nowDate = new Date();
    let totalSeconds = parseInt((endDate - nowDate) / 1000);
    //  倒计时结束
    if (totalSeconds === 0) {
      this.setData({
        onSale: 'Y'
      });
      this.endCountdown();
      return;
    }
    let modulo = totalSeconds % (60 * 60 * 24);
    let hours = Math.floor(modulo / (60 * 60));
    modulo = modulo % (60 * 60);
    let minutes = Math.floor(modulo / 60);
    let seconds = modulo % 60;
    hours = hours >= 10 ? hours : '0' + hours;
    minutes = minutes >= 10 ? minutes : '0' + minutes;
    seconds = seconds >= 10 ? seconds : '0' + seconds;
    this.setData({
      countdownStr: hours + ':' + minutes + ':' + seconds
    });
  },
  //  查询酒店
  query: function () {
    const data = this.data;
    if (this.data.onSale === 'Y') {
      wx.navigateTo({
        url: `/pages/hotelList/hotelList?&city=${this.data.city}&hot=${data.hotText}&region=${data.regionText}`
      });
    }
  },
  //  转发
  onShareAppMessage: function () {
    return app.onShareApp({
      title: '今夜特价'
    });
  }
})
