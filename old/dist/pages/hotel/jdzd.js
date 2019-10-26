
import { getData, postData, postXBData } from '../../utils/utils.js';
var city = require('../../utils/allcity.js');
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx.js');
var qqmapsdk;
var startDate = '';
var endDate = '';
var tmpstr = '';
var isVipMember = '';
Page({
  data: {
    hotel_list: {},
    user: {
      avatarUrl: '',
      nickName: '用户名',
      date: '',
      mobile: '1380013800'
    },
    uid: '',
    cityVisible: false,
    city: [],
    config: {
      horizontal: true,
      animation: true,
      search: true,
      searchHeight: 45,
      suctionTop: false
    },
    isVipMember :'',
    cityVisible: false,
    cityName: '广州',
    cityData: '',
    starTime: "02-26",
    endTime: "02-27",
    addressVisible: false,
    priceVisible: false,
    sortVisible: false,
    screenVisible: false,
    range: '1',
    keywords: '',
    addressList: [
      {
        id: 1,
        title: '距离我',
        active: true,
        list: [{
          id: '',
          title: '全城',
          active: true
        }, {
          id: 1,
          title: '1km',
          active: false
        }, {
          id: 3,
          title: '3km',
          active: false
        }, {
          id: 5,
          title: '5km',
          active: false
        }, {
          id: 10,
          title: '10km',
          active: false
        }]
      },
      {
        id: 2,
        title: '行政区',
        active: false,
        list: []
      }
    ],
    address: '位置区域',
    priceList: {
      star: [
        {
          id: '2',
          title: '经济型',
          active: false
        },
        {
          id: '3',
          title: '舒适/三星',
          active: false
        },
        {
          id: '4',
          title: '高档/四星',
          active: false
        },
        {
          id: '5',
          title: '豪华/五星',
          active: false
        }
      ],
      price: [
        {
          id: '0,150',
          title: '150以下',
          active: false
        },
        {
          id: '150,300',
          title: '150-300',
          active: false
        },
        {
          id: '300,450',
          title: '300-450',
          active: false
        },
        {
          id: '450,600',
          title: '450-600',
          active: false
        },
        {
          id: '600,1000',
          title: '600-1000',
          active: false
        },
        {
          id: '1000,100000',
          title: '1000以上',
          active: false
        }
      ]
    },
    sortList: [{
      id: 0,
      title: '智能排序',
      active: true
    }, {
      id: 1,
      title: '距离 近到远',
      active: false
    }, {
      id: 2,
      title: '评分 高到低',
      active: false
    }, {
      id: 3,
      title: '价格 低到高',
      active: false
    }, {
      id: 4,
      title: '价格 高到低',
      active: false
    }, {
      id: 5,
      title: '返现 高到低',
      active: false
    }],
    screenList: [
      {
        id: 1,
        title: '房型',
        active: true,
        list: [
          {
            id: 0,
            title: '大床间',
            active: false
          },
          {
            id: 1,
            title: '单人间',
            active: false
          },
          {
            id: 2,
            title: '双床间',
            active: false
          },
          {
            id: 3,
            title: '三人间',
            active: false
          },
          {
            id: 4,
            title: '套房',
            active: false
          },
          {
            id: 5,
            title: '独栋',
            active: false
          },
          {
            id: 6,
            title: '床位房',
            active: false
          }
        ]
      }
    ],
    scrollTop: 0,
    page: 1,
    size: 10,
    loading: true,
    dataList: [],
    topVisible: false,
    search: '',
    latitude: '',
    longitude: '',
    sortTitle: '',
    starLength: 0,
    screenLength: 0,
    flag: true,
    distance: true,
    banner: ''
  },
  goSearch() {
    wx.navigateTo({
      url: '../search/index?page=list'
    });
  },
  bindGetUserInfo(e) {
    if (e.detail.errMsg == 'getUserInfo:ok') {
      this.setData({
        isAuthorize: true,
        "user.avatarUrl": e.detail.userInfo.avatarUrl,
        "user.nickName": e.detail.userInfo.nickName
      });
      this.getUserInfo();
    }
  },
  getUserInfo() {
    wx.getStorage({
      key: 'isAuthorizeNumber',
      success: (res) => {
        this.setData({ isAuthorizeNumber: res.data });
      }
    });
  },


  goDetail(e) {
    wx.getStorage({
      key: 'location',
      success: (res) => {
        //console.log(this.data.hotel_list.data[1].address);
        console.log(e.currentTarget.dataset);
        if (this.data.isVipMember == 1) {
          wx.navigateTo({
            url: `jdzdDetail?id=${e.currentTarget.dataset.id}&startDate=${startDate}&endDate=${endDate}&latitude=${res.data.latitude}&longitude=${res.data.longitude}&hotel_id=${e.currentTarget.dataset.id}&avgprice=${e.currentTarget.dataset.avgprice}&avgscore=${e.currentTarget.dataset.avgscore}&hotelname=${e.currentTarget.dataset.hotelname}&rebate=${e.currentTarget.dataset.rebate}&address=${e.currentTarget.dataset.address}&uid=${this.data.uid}`
          });
        }
        else {
          console.log("2");
          wx.navigateTo({
            url: '../user/introduce'
          });
        }
      }
    });
  },
  menuToggle(e) {
    const visible = this.data[e.currentTarget.dataset.id];
    this.setData({
      addressVisible: false,
      priceVisible: false,
      sortVisible: false,
      screenVisible: false,
      [e.currentTarget.dataset.id]: !visible
    });
  },
  onReachBottom() {
    if (this.data.flag) {
      this.loadList(this.data.page += 1);
    }
  },
  // 位置区域
  menuItemTap(e) {
    const id = e.currentTarget.dataset.id;
    const arr = e.currentTarget.dataset.arr;
    const data = this.data[e.currentTarget.dataset.arr];
    const list = data.map(item => {
      if (id == item.id) {
        if (arr == 'sortList') {
          this.setData({ sortTitle: item.title });
        }
        item.active = true;
      } else {
        item.active = false;
      }
      return item;
    });
    if (arr == 'sortList') {
      this.setData({ sortVisible: false });
    }
    this.setData({
      [arr]: list,
      dataList: []
    });
    this.loadList();
  },
  menuItemTap2(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.addressList;
    let title = '';
    for (let i of list) {
      for (let j of i.list) {
        if (id == j.id) {
          title = j.title;
          j.active = true;
        }
        else {
          j.active = false;
        }
      }
    }
    this.setData({
      addressList: list,
      address: title,
      addressVisible: false,
      dataList: []
    });
    this.loadList();
  },
  // 星级筛选
  selectStar(ev) {
    const star = this.data.priceList.star.map((item, index) => {
      if (ev.target.dataset.idx == index) {
        item.active ? item.active = false : item.active = true;
      } else {
        item.active = false;
      }
      return item;
    });
    this.setData({ "priceList.star": star });
  },
  selectPrice(ev) {
    const price = this.data.priceList.price.map((item, index) => {
      if (ev.target.dataset.idx == index) {
        item.active ? item.active = false : item.active = true;
      } else {
        item.active = false;
      }
      return item;
    });
    this.setData({ "priceList.price": price });
  },
  // 筛选选择
  selectScreen(e) {
    const title = e.currentTarget.dataset.title;
    const screenList = this.data.screenList;
    for (let i of screenList) {
      for (let j of i.list) {
        if (title == j.title) {
          j.active = true;
        } else {
          j.active = false;
        }
      }
    }
    this.setData({ screenList });
  },
  resetScreen() {
    const screenList = this.data.screenList.map((item, idx) => {
      idx == 0 ? item.active = true : item.active = false;
      item.list.map(j => {
        j.active = false;
        return j;
      });
      return item;
    });
    this.setData({ screenList });
  },
  submitScreen() {
    let screen = [];
    for (let i of this.data.screenList) {
      if (i.active) {
        i.list.filter(item => {
          if (item.active) {
            screen.push(item.title);
          }
        });
      }
    }
    this.loadList();
    this.setData({
      dataList: [],
      screenVisible: false,
      screenLength: screen.length
    });
  },
  resetStar() {
    const star = this.data.priceList.star.map(item => {
      return {
        ...item,
        active: false
      };
    });
    const price = this.data.priceList.price.map((item, index) => {
      return {
        ...item,
        active: false
      };
    });
    this.setData({ "priceList.star": star, "priceList.price": price });
  },
  submitStar() {
    const data = [];
    this.data.priceList.star.filter(item => {
      if (item.active) {
        data.push(item.title);
      }
    });
    this.data.priceList.price.filter(item => {
      if (item.active) {
        data.push(item.title);
      }
    });
    this.loadList();
    this.setData({
      dataList: [],
      priceVisible: false,
      starLength: data.length
    });
  },
  cityToggle() {
    this.setData({ city, cityVisible: true });
  },
  sendFromId(e) {
    wx.getStorage({
      key: 'token',
      success: (res) => {
        postData('xcx_pay/fromId', {
          token: res.data,
          form_id: e.detail.formId
        });
      }
    });
  },

  cityChange(e) {
    var cityName = e.detail.name;
    if (e.detail.key == '我的定位') {
      wx.getSetting({
        success(res) {
          if (res.authSetting && !res.authSetting['scope.userLocation']) {
            wx.openSetting({
              success(res) {
                if (res.authSetting && res.authSetting['scope.userLocation']) {
                  wx.showToast({
                    title: '已授权地理位置',
                    icon: 'none',
                  });
                } else {
                  wx.showModal({
                    title: '提示',
                    content: '为了您更好的体验请授权地理位置',
                    showCancel: false,
                    confirmText: '确定'
                  });
                }
              }
            });
          }
        }
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
              const cityData = addressRes.result.ad_info.city;
              cityName = addressRes.result.address_component.street_number;
              this.setData({
                cityName,
                cityData,
                address: '位置区域',
                distance: true,
                latitude: re.latitude,
                longitude: re.longitude
              });
              wx.setStorage({
                key: 'location',
                data: {
                  latitude: re.latitude,
                  longitude: re.longitude
                }
              });
              wx.getStorage({
                key: 'hotelData',
                success: (res) => {
                  wx.setStorage({
                    key: 'hotelData',
                    data: {
                      ...res.data,
                      now: Date.now(),
                      citySelect: false,
                      customer_lat: re.latitude,
                      customer_lon: re.longitude,
                      address: cityName,
                      cityData: cityData
                    }
                  });
                }
              });
              this.getDistrict(cityData);
              this.loadList();
            },
            fail: (res) => {
              wx.showToast({
                title: res.message,
                icon: 'none'
              });
            },
            complete: (res) => {
              this.setData({ cityVisible: false, dataList: [] });
            }
          });
        }
      });
      return;
    }
    wx.getStorage({
      key: 'hotelData',
      success: (res) => {
        wx.setStorage({
          key: 'hotelData',
          data: {
            ...res.data,
            customer_lon: '',
            customer_lat: '',
            now: Date.now(),
            citySelect: true,
            address: cityName,
            cityData: cityName
          }
        });
      }
    });
    this.setData({
      longitude: '',
      latitude: '',
      cityName,
      dataList: [],
      cityData: cityName,
      address: '位置区域',
      distance: false,
      cityVisible: false
    });
    this.getDistrict(cityName);
    this.loadList();
  },
  selectDate() {
    this.yunxin()//调用回调函数
  },
  getDistrict(cityName) {
    getData(`1/Region/GetDistrictsForName?name=${cityName}`).then(res => {
      if (res.code == 100000) {
        const data = res.result.map(item => {
          return {
            active: false,
            id: item.areaName,
            value: item.areaId,
            title: item.areaName
          }
        });
        this.setData({ "addressList[1].list": data });

        const addressList = this.data.addressList.filter(item => {
          if (item.title == '距离我') {
            item.active = !this.data.distance ? false : true;
          } else {
            item.active = !this.data.distance ? true : false;
          }
          return item;
        });
        this.setData({ addressList });
      }
    });
  },
  yunxin() {
    var that = this;
    that.rili = that.selectComponent("#rili")
    var starTime = [];
    var endTime = [];
    that.rili.xianShi({
      data: function (res) {
        if (res && res.length == 2) {
          console.log(res);   //选择的日期
          starTime = res[0].data.split('-');
          endTime = res[1].data.split('-');
          const toDay = new Date().getDate();
          if (new Date().getHours() >= 12 && starTime[2] == toDay) {
            wx.showModal({
              title: '提示',
              content: '超过中午12点只能选择明天开始!',
              showCancel: false
            });
            return;
          }
          if (res[1] && res[1].chaDay > 30) {
            wx.showToast({
              title: '离店日期与当前日期相差不能超过30天',
              icon: 'none'
            });
          } else {
            that.setData({
              starTime,
              endTime,
              dataList: []
            });
            wx.setStorage({
              key: 'Date',
              data: { ...res, now: Date.now() }
            });
            that.loadList();
          }
        }
      }
    });
  },
  onPageScroll(e) {
    if (e.scrollTop > 50) {
      this.setData({ topVisible: true });
    }
    else {
      this.setData({ topVisible: false });
    }
  },
  //回到顶部
  goTop() {
    if (wx.pageScrollTo) {
      wx.pageScrollTo({ scrollTop: 0 });
      this.setData({ scrollTop: 0 });
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      });
    }
  },
  loadList(page = 1) {
    var that = this;
    let range = '';
    let district = '';
    this.setData({
      flag: false,
      loading: true
    });
    // 位置区域
    this.data.addressList.map((item, index) => {
      if (index == 0 && item.active) {
        item.list.map(item => {
          if (item.active) {
            range = item.id;
          }
        });
      } else if (item.active) {
        item.list.map(item => {
          if (item.active) {
            district = item.value;
          }
        });
      }
    });
    // 星级/价格
    let star = [];
    let price = '';
    this.data.priceList.star.map(item => {
      if (item.active) {
        star.push(item.id);
      }
    });
    this.data.priceList.price.map(item => {
      if (item.active) {
        price = item.id;
      }
    });
    // 排序
    let sort = '0';
    this.data.sortList.map(item => {
      if (item.active) sort = item.id
    });
    // 房型筛选
    let roomType = '';
    this.data.screenList[0].list.map(item => {
      if (item.active) roomType = item.id;
    });
    try {
      var pdata = {
        "service": "getMpHotelList",
        "customer_lon": this.data.longitude,
        "customer_lat": this.data.latitude,
        "cityName": this.data.cityData,
        "startDate": startDate,
        "endDate": endDate,
        "count": 5,
        "page": page,
        "keywords": this.data.keywords,
        "locationId": district,
        "range": range,
        "sort": sort,
        "price": price,
        "hotelStar": star,
        "roomType": roomType,
        "is_xhprof": 1,
        "ruid": this.data.uid
      };
      console.log(pdata);
      wx.getStorage({
        key: 'token',
        success: (res) => {
          postXBData(pdata).then(res => {
            if (res.code == 100000) {
              isVipMember = res.result.isVipMember;
              const data = page === 1 ? [] : this.data.dataList;
              if (res.result.data[0] == '维护中...') {
                this.setData({
                  flag: true,
                  loading: false,
                  isVipMember: res.result.isVipMember
                });
                return;
              };
              const newData = res.result.data.map(item => {
                return {
                  ...item,
                  avgScore: item.avgScore,
                  avgPrice: item.avgPrice,
                  rebatePrice: Math.ceil(item.rebatePrice / 100)
                }
              });
              this.setData({
                dataList: [...data, ...newData],
                flag: true,
                loading: false,
                hotel_list: res.result
              });
            }
          });
        }
      });
    } catch (e) {
      this.setData({ flag: true, loading: false });
      wx.showToast({
        title: e.message,
        icon: 'none'
      });
    }
  },
  loadData(op) {
    // 实例化腾讯地图API核心类
    qqmapsdk = new QQMapWX({
      key: 'S7NBZ-VWWK6-WN3SQ-EI754-AYHC6-WVB6J' // 必填
    });
    // 获取banner
    getData('1/Banner/list?type=1').then(res => {
      if (res.code == 100000) {
        this.setData({ banner: res.result });
      }
    });
    let starTime = '';
    let endTime = '';
    wx.getStorage({
      key: 'Date',
      success: (res) => {
        const date = res.data;
        starTime = date[0].data.split('-');
        endTime = date[1].data.split('-');
        startDate = date[0].data;
        endDate = date[1].data;
      },
      fail: () => {
        starTime = op.startDate.split('-');
        endTime = op.endDate.split('-');
        startDate = `${starTime[0]}-${starTime[1]}-${starTime[2]}`;
        endDate = `${endTime[0]}-${endTime[1]}-${endTime[2]}`;
      },
      complete: () => {
        let distance = true;
        let search = this.data.search;
        let latitude = op.customer_lat;
        let longitude = op.customer_lon;
        if (op.citySelect == 'true') {
          distance = false;
          latitude = '';
          longitude = '';
        }
        const cityData = op.cityData;
        const cityName = op.address;
        wx.setStorage({
          key: 'hotelData',
          data: {
            now: Date.now(),
            citySelect: op.citySelect,
            startDate: op.startDate,
            endDate: op.endDate,
            customer_lat: latitude,
            customer_lon: longitude,
            address: op.address,
            price: op.price,
            cityData: op.cityData,
            hotelStar: op.hotelStar
          }
        });
        const star = this.data.priceList.star.map(item => {
          if (op.hotelStar == item.title) {
            item.active = true;
          }
          return item;
        });
        const price = this.data.priceList.price.map(item => {
          if (item.id == op.price) {
            item.active = true
          } else {
            item.active = false;
          }
          return item;
        });
        this.setData({
          starTime,
          endTime,
          cityName,
          latitude,
          longitude,
          distance,
          cityData,
          search,
          priceList: {
            star, price
          }
        });
      }
    });
    this.getDistrict(op.cityData || op.address);
  },
  onLoad(options) {
    var that = this;
    if (JSON.stringify(options) != "{}") {
      this.loadData(options);
      this.data.keywords = options.search

    } else {
      wx.getStorage({
        key: 'hotelData',
        success: (res) => {
          const cur = new Date(res.data.now).getDate();
          const date = new Date().getDate();
          
          if (date - cur >= 1) {
            wx.removeStorage({
              key: 'hotelData'
            });
          } else {
            this.loadData(res.data);
          }
        }
      });
    }
    wx.getStorage({//获取本地缓存
      key: "token",
      success: function (res) {
        getData(`1/User/info?token=` + res.data).then(res => {
          that.setData({uid: res.result.id });
        });
      },
    });
  },
  onShow() {
    wx.getStorage({
      key: 'Date',
      success: (res) => {
        const cur = new Date(res.data.now).getDate();
        const date = new Date().getDate();
        if (date - cur >= 1) {
          wx.removeStorage({
            key: 'Date'
          });
          return;
        }
        const data = res.data;

        startDate = data[0].data;
        endDate = data[1].data;
        this.setData({
          starTime: data[0].data.split('-'),
          endTime: data[1].data.split('-')
        });
      },
      complete: () => {
        console.log(this.data);
      }
      
    });
    wx.getStorage({
      key: 'keyword',
      success: (res) => {
        this.setData({ search: res.data });
      },
      fail: () => {
        this.setData({ search: '' });
      }
    });
    this.loadList();
  },
  onHide() {
    wx.removeStorage({
      key: 'keyword'
    });
    this.setData({ search: '' });
  }
});