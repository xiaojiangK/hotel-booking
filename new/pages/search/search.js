/**
 *  搜索页
 */
var app = getApp();
import { getData } from '../../utils/util-1.js';
const api = require('./../../utils/api');

Page({
  data: {
    //  历史搜索
    historyList: [],
    //  标签列表
    tagList: [
      {
        title: '热门',
        list: []
      },
      {
        title: '行政区',
        list: []
      }
    ],
    //  是否正在搜索
    isSearch: false,
    //  搜索关键字
    keyword: '',
    //  搜索列表
    searchList: []
  },
  //  页面显示
  onShow: function () {
    wx.getStorage({
      key: 'historyList',
      success: (res) => {
        this.setData({
          historyList: res.data
        });
      }
    });
    wx.getStorage({
      key: 'city',
      success: (res)=>{
        this.data.city = res.data;
        // 获取热门
        getData(`1/special/circle_hot?token=${app.globalData.token}&cityName=${res.data}`).then(res => {
          this.setData({
            "tagList[0].list": res.result
          });
        });
        // 获取行政区
        getData(`1/Region/GetDistrictsForName?name=${res.data}`).then(res => {
          const region = res.result.map(item => item.areaName);
          this.setData({
            "tagList[1].list": region
          });
        });
      }
    });
  },
  onLoad(opts) {
    this.data.city = opts.city;
  },
  chooseHot(e) {
    const item = e.currentTarget.dataset.item;
    // 清楚其他搜索
    api.setStorage({
      key: 'searchText',
      data: ''
    });
    api.setStorage({
      key: 'regionText',
      data: ''
    });
    api.setStorage({
      key: 'hotText',
      data: item
    });
    //  返回上一页
    api.navigateBack({
      delta: 1
    });
  },
  chooseRegion(e) {
    const item = e.currentTarget.dataset.item;
    // 清楚其他搜索
    api.setStorage({
      key: 'hotText',
      data: ''
    });
    api.setStorage({
      key: 'searchText',
      data: ''
    });
    api.setStorage({
      key: 'regionText',
      data: item
    });
    //  返回上一页
    api.navigateBack({
      delta: 1
    });
  },
  chooseHotel(e) {
    const id = e.currentTarget.dataset.id;
    wx.getLocation({
      type: 'wgs84',
      success: (res)=>{
          getData(`1/special/hotel_info?token=${app.globalData.token}&hotel_id=${id}&customer_lat=${res.latitude}&customer_lon=${res.longitude}`).then(res => {
              if (res.code == 100000) {
                  wx.navigateTo({
                      url: `/pages/hotelDetails/hotelDetails?id=${id}&distance=${res.result.distance}`
                  });
              }
          });
      }
    });
  },
  //  清空历史搜索
  deleteHistory: function () {
    this.setData({
      historyList: []
    });
    wx.setStorage({
      key: 'historyList',
      data: []
    });
  },
  //  选择标签
  chooseTag: function (e) {
    let { item } = e.currentTarget.dataset;
    // 清楚其他搜索
    api.setStorage({
      key: 'hotText',
      data: ''
    });
    api.setStorage({
      key: 'regionText',
      data: ''
    });
    api.setStorage({
      key: 'searchText',
      data: item
    });
    wx.getStorage({
      key: 'historyList',
      success: (res) => {
        this.savaHistort(res.data);
      },
      fail: (res) => {
        this.savaHistort();
      }
    });
    //  返回上一页
    api.navigateBack({
      delta: 1
    });
  },
  //  开始搜索
  searchStart: function () {
    this.setData({
      isSearch: true
    });
  },
  //  搜索
  searchInput: function (e) {
    let value = e.detail.value;
    if (!value) {
      this.setData({
        keyword: '',
        searchList: []
      });
    } else {
      // 获取经纬度
      const data = this.data;
      wx.getLocation({
        type: 'wgs84',
        success: (res) => {
          getData(`1/special/search?token=${app.globalData.token}&customer_lon=${res.longitude}&customer_lat=${res.latitude}&cityName=${data.city}&count=10&page=1&keywords=${value}&is_xhprof=1`).then(res => {
            if (res.code == 100000) {
              this.setData({
                keyword: value,
                searchList: res.result.data
              });
            }
          });
        }
      });
    }
  },
  //  结束搜索
  searchEnd: function () {
    if (!this.data.keyword) {
      this.setData({
        isSearch: false
      });
    } else {
      wx.getStorage({
        key: 'historyList',
        success: (res) => {
          this.savaHistort(res.data);
        },
        fail: (res) => {
          this.savaHistort();
        }
      });
    }
  },
  savaHistort(arr = []) {
    const keyword = this.data.keyword;
    if (keyword) {
      const list = arr.filter((item, index) => {
        return index < 7 && item != keyword;
      });
      wx.setStorage({
        key: 'historyList',
        data: [keyword, ...list]
      });
    }
  },
  //  清空搜索关键字
  clearSearch: function () {
    this.setData({
      keyword: ''
    });
    this.searchEnd();
  }
})
