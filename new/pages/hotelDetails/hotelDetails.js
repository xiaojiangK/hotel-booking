/**
 *  酒店详情页
 */
import { getData, postData, formatDate, integer } from '../../utils/util-1';
const util = require('../../utils/util');
var app = getApp();

Page({
  data: {
    today: [],
    tomorrow: [],
    endWeek: '',
    startWeek: '',
    hotel: {},
    roomList: [],
    // 酒店详情轮播
    swiper: [],
    isAuthorizeNumber: false,
    //  Tab 索引
    tabIndex: 0,
    //  是否显示房间详情
    isShowRoomDetail: false,
    //  详情滑块图片索引
    roomSwiperIndex: 0,
    //  评论标签索引
    commentTagIndex: 0,
    //  评论列表
    commentList: [],
    assessCount: {},
    commentImgList: [],
    page: 1,
    distance: '',
    roomDetail: {},
    refundPolicy: ''
  },
  //  页面加载
  onLoad: function (opt) {
    this.setData({
      distance: opt.distance,
      hotelId: opt.id
    });
    this.initDate();
  },
  onShow() {
    this.loadData();
  },
  onReachBottom() {
    if (this.data.tabIndex == 2) {
      this.getAssess(++this.data.page);
    }
  },
  // 获取评论数量
  getAssessCount() {
    postData('xcx_pay/AssessCount', { token:app.globalData.token, user_id:app.globalData.userInfo.id, uniacid:this.data.hotel.uniacid }).then(res => {
      if (res instanceof Object) {
        this.setData({ assessCount: res });
      }
    });
  },
  // 获取评论列表
  getAssess(page = 1) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    postData('xcx_pay/AssessList', { token:app.globalData.token, page, uniacid:this.data.hotel.uniacid, img_type:this.data.commentTagIndex }).then(res => {
      this.setData({
        hotel: {
          ...this.data.hotel,
          score: res.score
        }
      });
      if (res.list instanceof Array) {
        if (page > 1 && res.list.length == 0) {
          wx.showToast({
            title: '没有更多数据',
            icon: 'none'
          });
          return;
        }
        const commentList = res.list.map(item => {
          return {
            ...item,
            speaker: "酒店回复：",
            time: formatDate(item.time * 1000),
            img: item.img && item.img.map(item => item),
            reply_time: formatDate(item.reply_time * 1000),
            arrival_time: formatDate(item.arrival_time * 1000)
          }
        });
        if (this.data.commentTagIndex) {
          let comment = this.data.commentImgList;
          this.setData({ commentImgList: [...comment, ...commentList] });
        } else {
          let comment = this.data.commentList;
          this.setData({ commentList: [...comment, ...commentList] });
        }
        wx.hideLoading();
      } else {
        wx.hideLoading();
      }
    });
  },
  //  初始化日期
  initDate() {
    let { today, tomorrow } = util.formatDuration();
    let startWeek = '';
    let endWeek = '';
    const date = new Date();
    const w = date.getDay();
    if (w == 0) {
      startWeek = '周日';
    } else {
      startWeek = '周' + integer(w);
    }
    if (w == 0) {
      endWeek = '周一';
    } else if (w == 6){
      endWeek = '周日';
    } else {
      endWeek = '周' + integer((w+1));
    }
    this.setData({
      today,
      endWeek,
      tomorrow,
      startWeek
    });
  },
  goAlbum() {
    wx.navigateTo({
      url: `/pages/hotelDetailsAlbum/hotelDetailsAlbum?id=${this.data.hotel.id}`
    });
  },
  //  加载数据
  loadData() {
    wx.getStorage({
      key: 'isAuthorizeNumber',
      success: (res) => {
          this.setData({ isAuthorizeNumber: res.data });
      }
    });
    // 退款政策
    getData(`xcx_pay/RefundPolicy?token=${app.globalData.token}`).then(res => {
      if (res.data) {
        this.setData({ refundPolicy: res.data });
      }
    });
    // 酒店详情
    getData(`1/special/hotel_info?token=${app.globalData.token}&hotel_id=${this.data.hotelId}`).then(res => {
      if (res.code == 100000) {
        const data = res.result;
        let service = [];
        let facilities = [];
        if (data.service) {
          for (let i in data.service) {
            service.push({
              id: i,
              val: data.service[i]
            });
          }
        }
        if (data.facilities) {
          for (let i in data.facilities) {
            facilities.push({
              id: i,
              val: data.facilities[i]
            });
          }
        }
        const hotel = {
          ...data,
          service,
          facilities,
          coordinates: res.result.coordinates.split(',')
        };
        this.setData({ hotel });
        this.getAssess();
        this.getAssessCount();
      }
    });
    // 房间详情
    getData(`1/special/room_list?token=${app.globalData.token}&hotel_id=${this.data.hotelId}`).then(res => {
      if (res.code == 100000) {
        let swiper = [];
        const vip = app.globalData.userInfo.vip;
        const roomList = res.result.map(item => {
          if (item.num > 0 && item.state == 1) {
            swiper.push(item.logo);
          }
          var price = Math.ceil(item.price);
          return {
            ...item,
            price,
            rate: vip.tonignt_bookorder_price_rate,
            min_price: (price * vip.tonignt_bookorder_price_rate).toFixed(2)
          }
        });
        this.setData({ swiper, roomList });
      }
    });
  },
  // 绑定用户手机
  getPhoneNumber(e) {
    wx.login({
      success: (re) => {
        if (re.code) {
          if (e.detail.errMsg == "getPhoneNumber:ok") {
            const data = {
              code: re.code,
              iv: e.detail.iv,
              token: app.globalData.token,
              encrypted_data: e.detail.encryptedData
            }
            postData('1/User/BindPhone', data).then(res => {
              if (res.code == 100000) {
                wx.setStorage({
                  key: 'isAuthorizeNumber',
                  data: true
                });
                wx.showToast({
                  title: '绑定成功',
                  icon: 'none'
                });
                this.setData({ isAuthorizeNumber: true });
              }
            });
          }
        }
      }
    });
  },
  //  地图导航
  goLocation() {
    const coordinates = this.data.hotel.coordinates;
    wx.openLocation({
      latitude: Number.parseFloat(coordinates[0]),
      longitude: Number.parseFloat(coordinates[1]),
      scale: 18,
      name: this.data.hotel.name,
      address: this.data.hotel.address,
    });
  },
  //  选择TAB标签
  chooseTab: function (e) {
    let { index } = e.currentTarget.dataset;
    this.setData({
      tabIndex: index
    });
  },
  //  选择日期
  selectDate(){
    wx.navigateTo({
      url: '/pages/calendar/index'
    });
  },
  //  格式化周
  formatWeek(w) {
    if (w == 0) {
      return '周日';
    } else {
      return '周' + app.integer(w);
    }
  },
  //  查看房间详情
  toggleDetail: function (e) {
    this.setData({
      isShowRoomDetail: !this.data.isShowRoomDetail
    });
    const id = e.currentTarget.dataset.id;
    if (id) {
      getData(`1/special/room_info?token=${app.globalData.token}&id=${id}`).then(res => {
        const data = res.result;
        if (data) {
          let facilities = [];
          if (data.facilities) {
            for (let i of Array.from(data.facilities)) {
              for (let j in i) {
                facilities.push({
                  id: j,
                  value: i[j]
                });
              }
            }
          }
          const price = Math.ceil(data.price);
          const vip = app.globalData.userInfo.vip;
          const roomDetail = {
            ...data,
            price,
            facilities,
            rate: vip.tonignt_bookorder_price_rate,
            min_price: (price * vip.tonignt_bookorder_price_rate).toFixed(2),
            img: data.img ? data.img : [] 
          }
          this.setData({ roomDetail });
        }
      });
    }
  },
  //  详情滑块切换
  roomSwiperChange: function (e) {
    let { current } = e.detail;
    this.setData({
      roomSwiperIndex: current
    });
  },
  //  拨打电话
  goCall() {
    wx.makePhoneCall({
      phoneNumber: this.data.hotel.tel
    });
  },
  //  选择评论标签
  chooseCommentTag: function (e) {
    let { index } = e.currentTarget.dataset;
    this.data.commentList = [];
    this.data.commentImgList = [];
    this.setData({
      page: 1,
      commentTagIndex: index
    });
    this.getAssess();
  },
  // 去支付
  goPay(e) {
    const room = e.currentTarget.dataset.room;
    wx.setStorage({
      key: 'room',
      data: room
    });
    wx.setStorage({
      key: 'hotel',
      data: this.data.hotel
    });
    wx.navigateTo({
      url: '/pages/hotelOrderConfirm/hotelOrderConfirm'
    });
  }
})