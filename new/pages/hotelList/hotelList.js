import { getData, postData } from '../../utils/util-1.js';
const util = require('../../utils/util');
const api = require('./../../utils/api');
var app =  getApp();

Page({
    data: {
        cityName: '广州',
        today: "02-26",
        tomorrow: "02-27",
        addressVisible: false,
        priceVisible: false,
        sortVisible: false,
        screenVisible: false,
        range: '1',
        addressList: [
            {
                id: 1,
                title: '距离我',
                active: true,
                list: [
                    { id: '', title: '全城', active: true },
                    { id: 1, title: '1km', active: false },
                    { id: 3, title: '3km', active: false },
                    { id: 5, title: '5km', active: false },
                    { id: 10, title: '10km', active: false }
                ]
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
                { id: '2', title: '经济型', active: false },
                { id: '3', title: '舒适/三星', active: false },
                { id: '4', title: '高档/四星', active: false },
                { id: '5', title: '豪华/五星', active: false }
            ],
            price: [
                { id: '0,150', title: '150以下', active: false },
                { id: '150,300', title: '150-300', active: false },
                { id: '300,450', title: '300-450', active: false },
                { id: '450,600', title: '450-600', active: false },
                { id: '600,1000', title: '600-1000', active: false },
                { id: '1000,10000', title: '1000以上', active: false }
            ]
        },
        sortList: [
            { id: 0, title: '智能排序', active: true },
            { id: 1, title: '距离 近到远', active: false },
            { id: 2, title: '评分 高到低', active: false },
            { id: 3, title: '价格 低到高', active: false },
            { id: 4, title: '价格 高到低', active: false },
            // { id: 5, title: '返现 高到低', active: false }
        ],
        screenList: [
            {
                id: 1,
                title: '房型',
                active: true,
                list: [
                    { id: 0, title: '大床间', active: false },
                    { id: 1, title: '单人间', active: false },
                    { id: 2, title: '双床间', active: false },
                    { id: 3, title: '三人间', active: false },
                    { id: 4, title: '套房', active: false },
                    { id: 5, title: '独栋', active: false },
                    { id: 6, title: '床位房', active: false }
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
        bareaName: '',
        region: ''
    },
    // 加载数据
    loadData () {
      const date = util.formatDuration();
      const today = date.today.replace('日','').split('月');
      const tomorrow = date.tomorrow.replace('日','').split('月');
      this.setData({
        today,
        tomorrow
      });

      // 获取城市
      wx.getStorage({
        key: 'city',
        success: (res) => {
          this.setData({ cityName: res.data });
        }
      });
      
      // 获取搜索内容
      wx.getStorage({
        key: 'searchText',
        success: (res) => {
          this.setData({ search: res.data });
        }
      });

      // 获取经纬度
      wx.getLocation({
        type: 'wgs84',
        success: (res) => {
          this.data.latitude = res.latitude;
          this.data.longitude = res.longitude;
          this.getDistrict()
        }
      });
    },
    goSearch() {
      wx.navigateTo({
          url: '/pages/search/search'
      });
      this.setData({ page: 1 });
    },
    //  清空搜索项
    clearSearch: function () {
      this.setData({
        page: 1,
        search: '',
        dataList: []
     });
      api.setStorage({
        key: 'searchText',
        data: ''
      });
      this.loadList();
    },
    goDetail(e) {
        const item = e.currentTarget.dataset.item;
        wx.navigateTo({
            url: `/pages/hotelDetails/hotelDetails?id=${item.id}&distance=${item.distance}`
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
        this.loadList(this.data.page += 1);
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
          page: 1,
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
            page: 1,
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
                item.active = item.active ? false : true;
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
        this.setData({
            page: 1,
            dataList: [],
            screenVisible: false,
            screenLength: screen.length
        });
        this.loadList();
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
        this.setData({
            price: '',
            "priceList.star": star,
            "priceList.price": price
        });
    },
    submitStar() {
        let data = [];
        let starPrice = {price: '', star: []};
        this.data.priceList.star.filter(item => {
            if (item.active) {
                data.push(item.title);
                starPrice.star.push(item.title);
            }
        });
        this.data.priceList.price.filter(item => {
            if (item.active) {
                data.push(item.title);
                starPrice.price = item.title;
            }
        });
        wx.setStorage({
            key: 'starPrice',
            data: starPrice
        });
        this.setData({
            page: 1,
            dataList: [],
            priceVisible: false,
            starLength: data.length
        });
        this.loadList();
    },
    // 获取行政区
    getDistrict() {
        getData(`1/Region/GetDistrictsForName?name=${this.data.cityName}`).then(res => {
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

                let addressList = this.data.addressList.filter(item => {
                    if (item.id == 1) {
                        item.active = !this.data.distance ? false : true;
                    } else {
                        item.active = !this.data.distance ? true : false;
                    }
                    return item;
                });

                if (this.data.region) {
                    addressList[1].active = true;
                    addressList[0].active = false;
                    addressList[1].list.map(item => {
                        if (item.title == this.data.region) {
                            item.active = true;
                        } else {
                            item.active = false;
                        }
                        return item;
                    });
                }
                this.setData({ addressList, page: 1 });
                this.loadList();
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
    goTop () {
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
        const data = this.data;
        if (!data.flag) return;
        let range = '';
        let district = '';
        data.flag = false;
        this.setData({ loading: true });
        // 位置区域
        data.addressList.map((item, index) => {
          if (index == 0 && item.active) {
            item.list.map(item => {
              if (item.active) {
                range = item.id;
              }
            });
          } else if (item.active) {
            item.list.map(item => {
              if (item.active) {
                district = item.title;
              }
            });
          }
        });
        // 星级/价格
        let star = [];
        let price = data.price;
        data.priceList.star.map(item => {
          if (item.active) {
            star.push(item.id);
          }
        });
        data.priceList.price.map(item => {
          if (item.active) {
            price = item.id;
          }
        });
        // 排序
        let sort = '0';
        data.sortList.map(item => {
          if (item.active) sort = item.id
        });
        // 房型筛选
        let roomType = '';
        data.screenList[0].list.map(item => {
          if (item.active) roomType = item.id;
        });
        try {
            getData(`1/special/search?token=${app.globalData.token}&customer_lon=${data.longitude}&customer_lat=${data.latitude}&cityName=${data.cityName}&count=5&page=${page}&keywords=${data.search}&location=${district}&range=${range}&sort=${sort}&price=${price}&hotelStar=${star}&roomType=${roomType}&bareaName=${data.bareaName}&is_xhprof=1`).then(res => {
              if (res.code == 100000) {
                const vip = app.globalData.userInfo.vip;
                const data = page === 1 ? [] : this.data.dataList;
                const newData = res.result.data.map(item => {
                    const min_price = Math.ceil(item.min_price);
                    const rebate = vip.tonignt_bookorder_price_rate;
                  return {
                    ...item,
                    rebate,
                    min_price,
                    price: min_price * rebate
                  }
                });
                this.setData({
                  dataList:[...data, ...newData],
                  loading: false
                });
                this.data.flag = true;
              }
            });
        } catch (e) {
          this.setData({ loading: false });
          wx.showToast({
            title: e.message,
            icon: 'none'
          });
        } finally {
          this.data.flag = true;
        }
    },
    getStarPrice(opts) {
        let star = [];
        let price = [];
        let starLen = [];
        let starPrice = {};
        const data = this.data;
        let _this = this
        // 获取星级
        wx.getStorage({
            key: 'starPrice',
            success: (res) => {
                starPrice = res.data;
                star = data.priceList.star.map(item => {
                    for (let i of starPrice.star) {
                        if (i == item.title) {
                            starLen.push(item);
                            item.active = true;
                        }
                    }
                    return item;
                });
                price = data.priceList.price.map(item => {
                  if (starPrice.price == item.title){
                    starLen.push(item);
                    item.active = true
                  }
                  return item;
                });
            },
            fail(){
             _this.setData({
               priceList: {
                 star: [
                   { id: '2', title: '经济型', active: false },
                   { id: '3', title: '舒适/三星', active: false },
                   { id: '4', title: '高档/四星', active: false },
                   { id: '5', title: '豪华/五星', active: false }
                 ],
                 price: [
                   { id: '0,150', title: '150以下', active: false },
                   { id: '150,300', title: '150-300', active: false },
                   { id: '300,450', title: '300-450', active: false },
                   { id: '450,600', title: '450-600', active: false },
                   { id: '600,1000', title: '600-1000', active: false },
                   { id: '1000,10000', title: '1000以上', active: false }
                 ]
               },
             })
            },
            complete: () => {
              if (price.length>0){
                  let region = opts.region ? opts.region : '';
                  let bareaName = opts.hot ? opts.hot : '';
                  this.setData({
                    region,
                    bareaName,
                    priceList: {
                      star, price
                    },
                    price: starPrice.price,
                    starLength: starLen.length
                  });
                }
            }
        });
    },
    onLoad(opts) {
      this.getStarPrice(opts);
    },
    onShow() {
      this.loadData();
    }
});