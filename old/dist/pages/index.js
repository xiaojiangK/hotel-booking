import { postData, formatDate, formatMonth, integer, getData } from '../utils/utils.js';
var QQMapWX = require('../utils/qqmap-wx.js');
var qqmapsdk;
var inTime = '';
var outTime = '';
var app =  getApp();

Page({
    data: {
        showViewjdzd: true,
        showViewmtjd: false,
        search_keyword:'',
        jdzdTab: true,
        mtjdTag: false,    	
        starVisible: false,
        starData: [{
            id: '',
            title: '星级'
        }, {
            id: '',
            title: '价格'
        }],
        cityData: '',
        citySelect: false,
        search: '',
        starSelect: false,
        priceId: '',
        starId: [],
        tipVisible: true,
        address: '广州',
        week: {
            day: "1",
            start: '周二',
            end: '周五'
        },
        date: {
            starTime: "02月26日",
            endTime: "02月27日",
            inDate: '今天',
            outDate: '明天'
        },
        latitude: '',
        longitude: '',
        isAuthorize: true,
        isAuthorizeNumber: false,
        banner: [],
        dateVisible: true        
    },
    onChangeShowjdzd: function () {

         this.setData({
             showViewjdzd: true,
             showViewmtjd: false
         })
    },  
    onChangeShowmtjd: function () {
        this.setData({
            showViewjdzd: false,
            showViewmtjd: true
        })
    },
    search_keyword(e) {
        this.data.search_keyword = e.detail.value;
    },       
    formSubmitjdzd() {

      wx.request({
        url: 'https://u.showboom.cn/ucenter/wxsmall/sulvqrcode/hitLog?hit_source=1', 
        data: {

        },
        header: {
          'content-type': 'application/json'
        },
        method: "GET",
        success: function (res) {

        },
        fail: function (err) { },//请求失败
        complete: function () { }//请求完成后执行的函数
      });



	    const data = this.data;
	    wx.navigateTo({
        url: `xbjdzd/jdzd?customer_lon=${data.longitude}&customer_lat=${data.latitude}&startDate=${inTime}&endDate=${outTime}&price=${data.priceId}&hotelStar=${data.starId}&citySelect=${data.citySelect}&address=${data.address}&cityData=${data.cityData}&search=${data.search_keyword}`
	    });
  	},
    closeTip() {
        this.setData({ tipVisible: false });
    },
    cityToggle() {
        wx.navigateTo({ url: 'city/index' });
    },
    starToggle() {
        this.setData({ starVisible: true });
    },
    formSubmit() {

        wx.request({
          url: 'https://u.showboom.cn/ucenter/wxsmall/sulvqrcode/hitLog?hit_source=2',
          data: {

          },
          header: {
            'content-type': 'application/json'
          },
          method: "GET",
          success: function (res) {

          },
          fail: function (err) { },//请求失败
          complete: function () { }//请求完成后执行的函数
        });

        const data = this.data;
        wx.navigateTo({
            url: `hotel/list?customer_lon=${data.longitude}&customer_lat=${data.latitude}&startDate=${inTime}&endDate=${outTime}&price=${data.priceId}&hotelStar=${data.starId}&citySelect=${data.citySelect}&address=${data.address}&cityData=${data.cityData}&search=${data.search}`
        });
    },
    closeStar() {
        this.setData({ starVisible: false });
    },
    submitStar(ev) {
        let priceId = '';
        let starId = [];
        const price = ev.detail.price.map(item => {
            priceId = item.id;
            return item;
        });
        const star = ev.detail.star.map(item => {
            starId.push(item.title);
            return item;
        });
        if (price.length == 0 && star.length == 0) {
            this.setData({
                starData:[{
                    id: '',
                    title: '星级'
                }, {
                    id: '',
                    title: '价格'
                }],
                priceId: '',
                starId: '',
                starVisible: false,
                starSelect: false
            });
            return;
        }
        this.setData({
            starVisible: false,
            starData: [...price, ...star],
            starSelect: true,
            priceId,
            starId
        });
    },
    closeSearch(e) {
        if (e.currentTarget.dataset.id == 'search') {
            this.setData({ search: '' });
            wx.removeStorage({
                key: 'keyword'
            });
            return;
        }
        this.setData({
            starData:[{
                id: '',
                title: '星级'
            }, {
                id: '',
                title: '价格'
            }],
            priceId: '',
            starId: '',
            starVisible: false,
            starSelect: false
        });
    },
    selectDate(){
        this.yunxin();
    },
    loadDay(day) {
        const toDay = new Date().getDate();
        if (day == toDay) {
            return '今天'
        } else if (day == (toDay + 1)) {
            return '明天'
        } else if (day == (toDay + 2)) {
            return '后天'
        } else {
            return day + '号'
        }
    },
    yunxin(){
        var that = this;
        this.setData({ dateVisible: false });
        that.rili = that.selectComponent("#rili")
        var starTime, endTime, day, start, end, inDate, outDate = '';
        that.rili.xianShi({
            data: function (res) {
                if (res && res.length == 2) {
                    console.log(res);   //选择的日期
                    const d = new Date();
                    const inTime = res[0].data;
                    const outTime = res[1].data;
                    const startDate = inTime.split('-');
                    const endDate = outTime.split('-');
                    starTime = `${startDate[1]}月${startDate[2]}日`;
                    endTime = `${endDate[1]}月${endDate[2]}日`;
                    const toDay = d.getDate();
                    const toMonth = d.getMonth() + 1;
                    if (d.getHours() >= 12 && (startDate[1] == toMonth && startDate[2] == toDay)) {
                        wx.showModal({
                            title: '提示',
                            content: '超过中午12点只能选择明天开始!',
                            showCancel: false
                        });
                        return;
                    }
                    inDate = that.loadDay(startDate[2]);
                    outDate = that.loadDay(endDate[2]);
                    const date = new Date(inTime).getDay();
                    const date2 = new Date(outTime).getDay();
                    if (date == 0) {
                        start = '周日'
                    } else {
                        start = '周' + integer(date);
                    }
                    if (date2 == 0) {
                        end = '周日'
                    } else {
                        end = '周' + integer(date2);
                    }
                    day = res[1].chaDay;
                    if (day > 30) {
                        wx.showToast({
                            title: '离店日期与当前日期相差不能超过30天',
                            icon: 'none'
                        });
                    } else {
                        that.setData({
                            date: {
                                starTime,
                                endTime,
                                inDate,
                                outDate
                            },
                            week: {
                                day,
                                start,
                                end
                            },
                            dateVisible: true
                        });
                        wx.setStorage({
                            key: 'Date',
                            data: {...res, now: Date.now()}
                        });
                    }

                }
            }
        });
    },
    getPhoneNumber(e) {
        wx.login({
            success: (re) => {
                if (re.code) {
                    if (e.detail.errMsg == "getPhoneNumber:ok") {
                        wx.getStorage({
                            key: 'token',
                            success:(res) => {
                                const data = {
                                    code: re.code,
                                    token: res.data,
                                    iv: e.detail.iv,
                                    encrypted_data: e.detail.encryptedData
                                }
                                postData('1/User/BindPhone', data).then(res => {
                                    if (res.code == 100000) {
                                        wx.setStorage({
                                            key: 'isAuthorizeNumber',
                                            data: true
                                        });
                                        this.setData({ isAuthorizeNumber: true });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        });
    },
    initDay(date, time) {
        const toDay = new Date().getDate();
        if (date == toDay) {
            return '今天';
        } else if (date ==  (toDay + 1)) {
            return '明天';
        } else if (date ==  (toDay + 2)) {
            return '后天';
        } else {
            return (time < 10 ? '0'+time : time) + '号';
        }
    },
    initDate() {

        const date = new Date();
        let w = date.getDay();
        let starTime = '';
        let endTime = '';
        let inDate = '';
        let outDate = '';
        let start = '';
        let end = '';
        let day = 1;
        wx.getStorage({
            key: 'Date',
            success: (res) => {
                const date = res.data;
                const statDate = new Date(date[0].getTime).getDate();
                const endDate = new Date(date[1].getTime).getDate();
                const w = new Date(date[0].getTime).getDay();
                const w2 = new Date(date[1].getTime).getDay();
                starTime = formatMonth(date[0].getTime);
                endTime = formatMonth(date[1].getTime);
                inTime = formatMonth(date[0].getTime);
                outTime = formatMonth(date[1].getTime);
                inDate = this.initDay(statDate, statDate);
                outDate = this.initDay(endDate, endDate);
                day = date[1].chaDay;
                if (w == 0) {
                    start = '周日';
                } else {
                    start = '周' + integer(w);
                }
                if (w2 == 0) {
                    end = '周日';
                } else {
                    end = '周' + integer(w2);
                }
            },
            fail: () => {

                    inDate = '今天';
                    outDate = '明天';
                    w = date.getDay();
                    starTime = formatMonth(Date.now());
                    endTime = formatMonth(Date.now() + 1000*60*60*24);
                    // 传输数据
                    inTime = formatDate(Date.now());
                    outTime = formatDate(Date.now() + 1000*60*60*24);
                    if (w == 0) {
                        start = '周日';
                    } else {
                        start = '周' + integer(w);
                    }
                    if (w == 0) {
                        end = '周一';
                    } else if (w == 6){
                        end = '周日';
                    } else {
                        end = '周' + integer((w+1));
                    }
                
            },
            complete: () => {
                this.setData({
                    date: {
                        starTime,
                        endTime,
                        inDate,
                        outDate
                    },
                    week: {
                        start,
                        end,
                        day,
                    }
                });
            }
        });
    },
    loadData() {
        wx.getStorage({
            key: 'isAuthorizeNumber',
            success: (res) => {
                this.setData({
                    isAuthorizeNumber: res.data
                });
            }
        });
        this.initDate();
        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: 'S7NBZ-VWWK6-WN3SQ-EI754-AYHC6-WVB6J' // 必填
        });
        // 获取banner
        getData('1/Banner/list?type=0').then(res => {
            if (res.code == 100000) {
                this.setData({ banner: res.result });
            }
        });
    },
    getLocation() {
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
                        const address = addressRes.result.address_component.street_number;
                      this.setData({ address, cityData });

                        const data = this.data;
                        data.citySelect = false;
                        data.cityData = cityData;
                        data.latitude = re.latitude;
                        data.longitude = re.longitude;
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
                                        address,
                                        cityData,
                                        customer_lat: re.latitude,
                                        customer_lon: re.longitude,
                                        now: Date.now(),
                                        citySelect: false
                                    }
                                });
                            }
                        });
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
    },
    login() {
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
                                            wx.setStorage({
                                                key: 'token',
                                                data: res.result
                                            });
                                            app.globalData.token = res.result;
                                            this.setData({ isAuthorize: true });
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
    },
    bindGetUserInfo(e) {
        if (e.detail.errMsg == 'getUserInfo:ok') {
            this.login();
        }
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
    onLoad(option) {
        wx.getStorage({
            key: 'Date',
            success: (res) => {
                const cur = new Date(res.data.now).getDate();
                const date = new Date().getDate();
                if (date - cur >= 1) {
                    wx.removeStorage({
                        key: 'Date'
                    });
                }
            },
            complete: () => {
                this.loadData();
            }
        });
        this.login();
    },
    onShow() {
        this.initDate();
        wx.getStorage({
            key: 'hotelData',
            success: (res) => {
                const data = res.data;
                const cur = new Date(data.now).getDate();
                const date = new Date().getDate();
                if (date - cur >= 1) {
                    wx.removeStorage({
                        key: 'hotelData'
                    });
                    this.getLocation();
                } else {
                    const res = this.data;
  
                  this.setData({ address: data.address, cityData: data.cityData });
                    res.citySelect = data.citySelect;
                    res.cityData = data.cityData;
                    res.latitude = data.customer_lat;
                    res.longitude = data.customer_lon;
                }
            },
            fail: () => {
                this.getLocation();
            }
        });
        wx.getStorage({
            key: 'keyword',
            success: (res)=>{
                this.setData({ search: res.data });
            },
            fail: () => {
                this.setData({ search: '' });
            }
        });
    }
});