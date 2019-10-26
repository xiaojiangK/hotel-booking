import { getData, postData } from '../../utils/utils.js';
var city = require('../../utils/allcity.js');
var QQMapWX = require('../../utils/qqmap-wx.js');
var qqmapsdk;
var now = '';
var keyword = '';
var startDate = '';
var endDate = '';
var app =  getApp();

Page({
    data: {
        cityVisible: false,
        city: [],
        config: {
          horizontal: true,
          animation: true,
          search: true,
          searchHeight: 45,
          suctionTop: false
        },
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
                { id: '1000,100000', title: '1000以上', active: false }
            ]
        },
        sortList: [
            { id: 0, title: '智能排序', active: true },
            { id: 1, title: '距离 近到远', active: false },
            { id: 2, title: '评分 高到低', active: false },
            { id: 3, title: '价格 低到高', active: false },
            { id: 4, title: '价格 高到低', active: false },
            { id: 5, title: '返现 高到低', active: false }
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
        banner: '',
        dateVisible: true
    },
    goSearch() {
        wx.navigateTo({
            url: '../search/index?page=list'
        });
        this.setData({ page: 1 });
    },
    goDetail(e) {
        wx.getStorage({
            key: 'location',
            success: (res)=>{
                wx.navigateTo({
                    url: `detail?id=${e.currentTarget.dataset.id}&startDate=${startDate}&endDate=${endDate}&latitude=${res.data.latitude}&longitude=${res.data.longitude}`
                });
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
        this.setData({
            page: 1,
            dataList: [],
            priceVisible: false,
            starLength: data.length
        });
        this.loadList();
    },
    cityToggle() {
        this.setData({
            city,
            cityVisible: true,
            addressVisible: false,
            priceVisible: false,
            sortVisible: false,
            screenVisible: false
        });
    },
    sendFromId(e) {
        postData('xcx_pay/fromId', {
            token: app.globalData.token,
            form_id: e.detail.formId
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
                            const data = this.data;
                            data.latitude = re.latitude;
                            data.longitude = re.longitude;
                            data.cityData = cityData;
                            this.setData({
                                cityName,
                                address: '位置区域',
                                distance: true
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
                        },
                        fail: (res) => {
                            wx.showToast({
                                title: res.message,
                                icon: 'none'
                            });
                        },        
                        complete: (res) => {
                            this.setData({cityVisible: false, dataList: []});
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
            cityName,
            dataList: [],
            address: '位置区域',
            distance: false,
            cityVisible: false
        });
        const data = this.data;
        data.cityData = cityName;
        data.longitude = '';
        data.latitude = '';
        this.getDistrict(cityName);
    },
    selectDate(){
        this.yunxin();
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
                this.setData({ addressList, page: 1 });
                this.loadList();
            }
        });
    },
    yunxin(){
        var that = this;
        this.setData({ dateVisible: false });
        that.rili = that.selectComponent("#rili")
        var starTime = [];
        var endTime = [];
        that.rili.xianShi({
            data: function (res) {
                if (res && res.length == 2) {
                    console.log(res);   //选择的日期
                    const date = new Date();
                    starTime = res[0].data.split('-');
                    endTime = res[1].data.split('-');
                    startDate = res[0].data;
                    endDate = res[1].data;
                    const toDay = date.getDate();
                    const toMonth = date.getMonth() + 1;
                    if (date.getHours() >= 12 && (starTime[1] == toMonth && starTime[2] == toDay)) {
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
                            page: 1,
                            starTime,
                            endTime,
                            dataList: []
                        });
                        now = Date.now();
                        wx.setStorage({
                            key: 'Date',
                            data: {...res, now: Date.now()}
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
                        district = item.value;
                    }
                });
            }
        });
        // 星级/价格
        let star = [];
        let price = '';
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
            getData(`1/lib/search?token=${app.globalData.token}&customer_lon=${data.longitude}&customer_lat=${data.latitude}&cityName=${data.cityData}&startDate=${startDate}&endDate=${endDate}&count=5&page=${page}&keywords=${data.search}&locationId=${district}&range=${range}&sort=${sort}&price=${price}&hotelStar=${star}&roomType=${roomType}&is_xhprof=1`).then(res => {
                if (res.code == 100000) {
                    const data = page === 1 ? [] : this.data.dataList;
                    if (res.result.data[0] == '维护中...') {
                        this.data.flag = true;
                        this.setData({ loading: false });
                        return;
                    };
                    const newData = res.result.data.map(item => {
                        return {
                            ...item,
                            avgScore: (item.avgScore / 10).toFixed(1),
                            avgPrice: Math.ceil(Math.floor(item.avgPrice * 100) / 100 / 100),
                            rebatePrice: Math.floor(item.rebatePrice / 100)
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
            this.data.flag = true;
            this.setData({ loading: false });
            wx.showToast({
                title: e.message,
                icon: 'none'
            });
        } finally {
            this.setData({ dateVisible: true });
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
                const data = this.data;
                let selStar = [];
                const star = data.priceList.star.map(item => {
                    if (op.hotelStar == item.title) {
                        selStar.push(item);
                        item.active = true;
                    }
                    return item;
                });
                const price = data.priceList.price.map(item => {
                    if (item.id == op.price){
                        selStar.push(item);
                        item.active = true
                    }
                    return item;
                });
                this.setData({
                    starTime,
                    endTime,
                    cityName,
                    distance,
                    search,
                    priceList: {
                        star, price
                    },
                    starLength: selStar.length
                });
                data.latitude = latitude;
                data.longitude = longitude;
                data.cityData = cityData;
            }
        });
        this.getDistrict(op.cityData || op.address);
    },
    onLoad(options) {
        wx.getStorage({
            key: 'keyword',
            success: (res)=>{
                this.setData({
                    page: 1,
                    dataList: [],
                    search: res.data
                });
            },
            fail: () => {
                this.setData({ search: '' });
            }
        });
        if (JSON.stringify(options) != "{}") {
            this.loadData(options);
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
    },
    onShow() {
        wx.getStorage({
            key: 'Date',
            success: (res)=>{
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
                if (now != data.now) {
                    this.setData({
                        page: 1,
                        dataList: []
                    });
                    this.loadList();
                }
                now = data.now;
            },
            complete: () => {
                wx.getStorage({
                    key: 'keyword',
                    success: (res)=>{
                        this.setData({ search: res.data });
                        if (keyword != res.data) {
                            this.setData({
                                page: 1,
                                dataList: []
                            });
                            this.loadList();
                        }
                        keyword = res.data;
                    },
                    fail: () => {
                        this.setData({ search: '' });
                    }
                });
            }
        });
    },
    onHide() {
        if (!this.data.search) {
            wx.removeStorage({
                key: 'keyword'
            });
        }
    }
});