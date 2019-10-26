
var city = require('../../utils/allcity.js');
// 引入SDK核心类
var QQMapWX = require('../../utils/qqmap-wx.js');
var qqmapsdk;

Page({
    data: {
        city: [],
        config: {
          horizontal: true,
          animation: true,
          search: true,
          searchHeight: 45,
          suctionTop: true
        },
        address: ''
    },
    cityChange(e) {
        var address = e.detail.name;
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
                            address = addressRes.result.address_component.street_number;
                            
                            wx.getStorage({
                                key: 'hotelData',
                                success: (res) => {
                                    wx.setStorage({
                                        key: 'hotelData',
                                        data: {
                                            ...res.data,
                                            address,
                                            cityData,
                                            now: Date.now(),
                                            citySelect: false,
                                            customer_lat: re.latitude,
                                            customer_lon: re.longitude
                                        }
                                    });
                                },
                                fail: () => {
                                    wx.setStorage({
                                        key: 'hotelData',
                                        data: {
                                            address,
                                            cityData,
                                            now: Date.now(),
                                            citySelect: false,
                                            customer_lat: re.latitude,
                                            customer_lon: re.longitude
                                        }
                                    });
                                }
                            });
                            this.setData({ address });
                            wx.navigateBack({ delta: 1 });
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
            return;
        }
        wx.getStorage({
            key: 'hotelData',
            success: (res) => {
                wx.setStorage({
                    key: 'hotelData',
                    data: {
                        ...res.data,
                        address,
                        now: Date.now(),
                        customer_lat: '',
                        customer_lon: '',
                        cityData: address,
                        citySelect: true
                    }
                });
            },
            fail: () => {
                wx.setStorage({
                    key: 'hotelData',
                    data: {
                        address,
                        now: Date.now(),
                        customer_lat: '',
                        customer_lon: '',
                        cityData: address,
                        citySelect: true
                    }
                });
            }
        });
        this.setData({ address });
        wx.navigateBack({ delta: 1 });
    },
    onLoad() {
        // 实例化腾讯地图API核心类
        qqmapsdk = new QQMapWX({
            key: 'S7NBZ-VWWK6-WN3SQ-EI754-AYHC6-WVB6J' // 必填
        });
        this.setData({ city });
    }
});