/**
 *  选择城市页
 */
const api = require('./../../utils/api');

Page({
  data: {
    city: [],
    keyword:''
  },
  //  选择城市
  select: function (e) {
    let { city } = e.currentTarget.dataset;
    wx.setStorage({
      key: 'city',
      data: city
    });
    //  返回上一页
    api.navigateBack({
      delta: 1
    });
  },
  onLoad() {
    this.getCityList()
  },
  getCityList(){
    wx.request({
      url: 'https://u.showboom.cn/ucenter/device/api/index',
      data: {
        service: 'directHotelGetCityList',
        city: this.data.keyword,
        wxapp:'tonight'
      },
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: (res) => {
        this.setData({ city: res.data.data.cityList });
      }
    });
  },
  searchInput(e){
    let value = e.detail.value;
    this.setData({
      keyword: value
    });
  },
  //  清空搜索关键字
  clearSearch: function () {
    this.setData({
      keyword: ''
    })
    this.getCityList()
  }
})