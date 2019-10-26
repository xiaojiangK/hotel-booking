/**
 *  个人中心页
 */
import { postData, getData, formatDate } from '../../utils/util-1';
var app =  getApp();

Page({
    data: {
        user: {
            avatarUrl: '',
            nickName: '用户名',
            date:'',
        },
        phone: '',
        goldNum: 0,
        orderNum: '',
        isOpenVip: false,
        isAuthorize: false,
        isAuthorizeNumber: false
    },
    onShareAppMessage () {
      return app.onShareApp({
        title: '我的钱包'
      });
    },
    goCall() {
        wx.makePhoneCall({
            phoneNumber: '01083421725'
        });
    },
    goVip() {
        wx.navigateTo({
            url: '/pages/accountPrivilege/accountPrivilege'
        });
    },
    goGold() {
        wx.navigateTo({
            url: `/pages/accountCoin/accountCoin?gold=${this.data.goldNum}`
        });   
    },
    // 绑定手机
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
    // 用户登录
    bindGetUserInfo(e) {
        if (e.detail.errMsg == 'getUserInfo:ok') {
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
                                                wx.showToast({
                                                    title: '登录成功',
                                                    icon: 'none'
                                                });
                                                wx.setStorage({
                                                    key: 'token',
                                                    data: res.result
                                                });
                                                // 返现比例
                                                getData(`1/special/Conf_List?token=${res.result}`).then(res => {
                                                    if (res.code == 100000) {
                                                        for (let i of res.result) {
                                                            if (i.conf_key == 'tonight_commission_rate_user') {
                                                            app.globalData.rebate = i.conf_val;
                                                            }
                                                        }
                                                    }
                                                });
                                                app.globalData.token = res.result;
                                                this.setData({ isAuthorize: true });
                                                this.loadData();
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
        }
    },
    loadData() {
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
        });

        const token = app.globalData.token;
        if (token) {
            getData(`1/User/Score?token=${token}`).then(res => {
                if (res.code == 100000) {
                    this.setData({ goldNum: Number.parseInt(res.result) });
                }
            });
            getData(`1/User/info?token=${token}`).then(res => {
                if (res.code == 100000) {
                    const data = res.result;
                    if (!data.vip_endtime) {
                        this.setData({ isOpenVip: false });
                    } else if ((data.vip_endtime * 1000) < Date.now()) {
                        this.setData({ isOpenVip: false });
                    } else {
                        this.setData({
                            isOpenVip: true,
                            "user.date": formatDate(data.vip_endtime * 1000)
                        });
                    }
                    this.setData({
                        "user.avatarUrl": data.header_img,
                        "user.nickName": data.nick_name
                    });
                    postData('/xcx_pay/member', { token, mobile: data.mobile }).then(res => {
                        const userInfo = {
                            ...data,
                            vip: res.data
                        };
                        app.globalData.userInfo = userInfo;
                        wx.setStorage({
                            key: 'userInfo',
                            data: userInfo
                        });
                    });
                    postData('xcx_pay/Udate_user', { token, uid: data.id });
                }
            });
            postData('xcx_pay/count_order', { token }).then(res => {
                if (res.code == 200) {
                    this.setData({ orderNum: res.data.Unpaid });
                }
            });
            this.setData({
                isAuthorize: true
            });
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
        }
    },
    onPullDownRefresh() {
        this.loadData();
    },
    onShow() {
        this.loadData();
    }
});
