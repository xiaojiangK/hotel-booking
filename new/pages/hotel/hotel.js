/**
 *  酒店列表页
 */
var app = getApp();
import { getData } from '../../utils/util-1';

Page({
  data: {
    //  入住开始日期
    today: '',
    //  入住结束日期
    tomorrow: '',
    //  城市
    city: '北京市',
    isScrollTop: false,
    loading: false,
    people: 1,
    roomNum: 1,
    hotelList: []
  },
  //  页面加载
  onLoad: function (opt) {
    this.data.people = opt.people;
    this.data.roomNum = opt.roomNum;
    this.setData({ city: opt.city });
    this.getHotelList();
  },
  //  页面显示
  onShow: function () {
    // 获取城市
    wx.getStorage({
      key: 'city',
      success: (res) => {
        this.setData({ city: res.data });
        this.getHotelList();
      }
    });
  },
  //  渲染完成
  onReady: function () {
    this.duration = this.selectComponent('#duration');
    this.switchCity = this.selectComponent('#switchCity');
  },
  //  列表滚动
  scroll: function (e) {
    let { scrollTop } = e.detail;
    if (scrollTop > 100 ) {
      this.setData({
        isScrollTop: true
      });
    } else {
      this.setData({
        isScrollTop: false
      });
    }
  },
  //  获取酒店列表
  getHotelList: function () {
    this.setData({ loading: true });
    wx.getLocation({
      type: 'wgs84',
      success: (res)=>{
        try {
          const data = this.data;
          getData(`1/special/hotel_list?token=${app.globalData.token}&roomNum=${data.roomNum}&city=${this.data.city}&people=${data.people}&customer_lon=${res.longitude}&customer_lat=${res.latitude}`).then(res => {
            if (res.code == 100000) {
              const vip = app.globalData.userInfo.vip;
              const hotelList = res.result.map(item => {
                return {
                  ...item,
                  price: Math.ceil(item.price),
                  rebate: (item.price * vip.tonignt_bookorder_price_rate).toFixed(2)
                }
              });
              this.setData({ hotelList });
            }
          });
        } finally {
          this.setData({ loading: false });
        }
      }
    });
  }
})