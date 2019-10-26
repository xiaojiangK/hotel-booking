import { postData, getData, formatDate } from '../../utils/utils.js';
var app =  getApp();

Page({
    data: {
        user: {
            avatarUrl: '',
            nickName: '用户名',
            date:'',
            mobile: '1380013800'
        },
        phone: '',
        goldNum: 0,
        orderNum: '',
        isOpenVip: false,
        isAuthorize: true,
        isAuthorizeNumber: false
    },
    goCall() {
        wx.makePhoneCall({
            phoneNumber: this.data.phone
        });
    },
    openVip() {
        wx.getStorage({
            key: 'isAuthorizeNumber',
            success: (res) => {
                if (res.data) {
                    wx.navigateTo({
                        url: 'introduce'
                    });         
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
    goGold(e) {
        if (!this.data.isOpenVip){
            wx.getStorage({
                key: 'isAuthorizeNumber',
                success: (res) => {
                    if (res.data) {
                        wx.navigateTo({
                            url: `../gold-coin/index?gold=${e.currentTarget.dataset.gold}`
                        });       
                    }
                }
            });
            return;
        }
        wx.navigateTo({
            url: `../gold-coin/index?gold=${e.currentTarget.dataset.gold}`
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
        wx.showNavigationBarLoading();
        wx.getStorage({
            key: 'isAuthorizeNumber',
            success: (res) => {
                this.setData({ isAuthorizeNumber: res.data });
            }
        });
        // 获取手机号
        getData('1/Xiubao/phone').then(res => {
            this.data.phone = res.result;
        }).catch(err => {
            wx.showToast({
                title: err.errMsg,
                icon: 'none'
            });
        });
        wx.login({
            success: (re) => {
              if (re.code) {
                wx.getSetting({
                    success: (res) => {
                        if (res.authSetting['scope.userInfo']) {
                            this.setData({ isAuthorize: true });
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
        wx.getStorage({
            key: 'token',
            success:(res) => {
                const token = res.data;
                getData(`1/User/Score?token=${token}`).then(res => {
                    if (res.code == 100000) {
                        this.setData({ goldNum: Number.parseInt(res.result) });
                    }
                });
                getData(`1/User/info?token=${token}`).then(res => {
                    if (res.code == 100000) {
                        if (!res.result.vip_endtime) {
                            this.setData({ isOpenVip: false });
                        } else if ((res.result.vip_endtime * 1000) < Date.now()) {
                            this.setData({ isOpenVip: false });
                        } else {
                            this.setData({
                                isOpenVip: true,
                                "user.date": formatDate(res.result.vip_endtime * 1000)
                            });
                        }
                        this.setData({
                            "user.avatarUrl": res.result.header_img,
                            "user.nickName": res.result.nick_name,
                            "user.mobile": res.result.mobile
                        });
                    }
                });
                postData('xcx_pay/count_order', { token }).then(res => {
                    if (res.error_no == 200) {
                        const data = res.data;
                        const orderNum = data.Unpaid;
                        this.setData({ orderNum });
                    }
                });
                this.setData({
                    isAuthorize: true
                });
                wx.hideNavigationBarLoading();
            }
        });
    },
    onPullDownRefresh() {
        this.getUserInfo();
    },
    onShow() {
        this.getUserInfo();
    }
});
