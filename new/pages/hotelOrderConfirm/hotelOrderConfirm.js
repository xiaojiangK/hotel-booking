/**
 *  订单确认页
 */
const api = require('./../../utils/api');
const util = require('./../../utils/util');
import { getData, postData, formatDate, isPhone } from '../../utils/util-1.js';
var app = getApp();
var flag = true;
var start = '';
var end = '';

Page({
    data: {
        //  入住开始日期
        today: '',
        //  入住结束日期
        tomorrow: '',
        //  房间数集合索引
        roomIndex: 0,
        //  房间数集合
        roomArray: [1,2,3,4,5,6,7,8,9,10],
        //  房间数
        roomNumber: 1,
        //  预计办理入住时间起始值
        startCheckInTime: new Date().getHours() + ':' + new Date().getMinutes(),
        //  
        endCheckInTime: '22:00',
        //  预计办理入住时间
        checkInTime: '',
        //  金币数
        coinNumber: 0.00,
        //  是否使用金币
        isCoin: false,
        // 金币抵扣
        integral: 0,
        phone: '',
        contacts: '',
        isOrder: false,
        order_id: '',
        use_gold: 0,
        vipPrice: 0,
        costPrice: 199,
        isOpenVip: true,
        priceDetail: [],
        total_cost: 0,
        totalPrice: 0,
        roomId: '',
        room: {},
        hotel: {},
        user: {},
        fromId: '',
        days: app.globalData.days
    },
    loadData(op) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });

        const token = app.globalData.token;
        this.data.token = token;
        // 订单去支付
        if (op.orderId) {
            this.setData({
                isOrder: true,
                order_id: op.orderId
            });
            if (op.coin > 0) {
                // 订单去支付所使用的金币
                this.setData({ use_gold: op.coin });
            } else {
                this.setData({ isCoin: false });
            }
        }

        //  设置入住日期
        const { today, tomorrow } = util.formatDuration();
        this.setData({ today, tomorrow });

        // 格式化时间
        start = formatDate(Date.now());
        end = formatDate(Date.now() + 60 * 60 * 24 * 1000);

        const user = app.globalData.userInfo;
        this.setData({ user });
        // 判断是否开通会员
        if (!user.vip_endtime) {
            this.setData({ isOpenVip: false, vipPrice: 0 });
        } else if ((user.vip_endtime * 1000) < Date.now()) {
            this.setData({ isOpenVip: false, vipPrice: 0 });
        } else {
            this.setData({ isOpenVip: true, vipPrice: 0 });
        }

        // 获取房间数量
        wx.getStorage({
            key: 'roomNumber',
            success: (res) => {
                this.setData({
                    roomNumber: res.data,
                    roomIndex: res.data - 1,
                });
            }
        });

        // 获取酒店信息
        wx.getStorage({
            key: 'hotel',
            success:(res) => {
                //  设置页面标题
                api.setNavigationBarTitle({
                    title: res.data.name
                });
                this.setData({ hotel: res.data });
            }
        });

        // 获取房型
        wx.getStorage({
            key: 'room',
            success:(res) => {
                const vip = app.globalData.userInfo.vip;
                const room = {
                    ...res.data,
                    rebate: Number.parseFloat(vip.tonignt_bookorder_price_rate)
                };
                const roomId = room.room_id ? room.room_id : room.id;
                this.data.roomId = roomId;
                const priceDetail = [{
                    date: start,
                    salePrice: room.price.toFixed(2)
                }];

                if (this.data.isOrder) {
                    // 获取订单信息
                    wx.getStorage({
                        key: 'orderInfo',
                        success: (res) => {
                            res.data.map(item => {
                                if (roomId == item.roomId && room.tel == item.tel && room.contacts == item.contacts) {
                                    this.setData({
                                        phone: item.tel,
                                        checkInTime: item.time,
                                        contacts: item.contacts,
                                        roomIndex: item.roomIndex,
                                        roomNumber: Number.parseInt(item.roomIndex)+1
                                    });
                                }
                            });
                        }
                    });
                }

                // 获取用户金币
                getData(`1/User/Score?token=${token}`).then(res => {
                    if (res.code == 100000) {
                        this.setData({
                            coinNumber: Number.parseInt(res.result)
                        });
                        // let coupon = 0;
                        // let coupon_cost = 0;
                        const vip = user.vip;
                        const price = room.price;
                        const roomNum = this.data.roomNumber;
                        const coupon_cost = (price * roomNum * vip.tonignt_bookorder_price_rate).toFixed(2);
                        const coupon = Number.parseFloat((price * roomNum - (price * roomNum * vip.tonignt_bookorder_price_rate)).toFixed(2));
                        this.setData({
                            room,
                            coupon,
                            coupon_cost,
                            priceDetail,
                            totalPrice: price,
                            total_cost: price,
                            rebate: Math.floor(room.rebate * this.data.roomNumber),
                            invoice: Number.parseFloat((price * roomNum * vip.tonight_bookorder_tax_rate).toFixed(2))
                        });
                        // 计算抵扣金币
                        this.computeCoin();
                    }
                    wx.hideLoading();
                });
            } 
        });
    },
    sendFromId(e) {
        this.setData({
            fromId: e.detail.formId
        });
    },
    computeCoin() {
        let integral = 0;
        const coinNumber = this.data.coinNumber;
        const roomNumber = this.data.roomNumber;
        const totalPrice = this.data.totalPrice;
        const invoice = this.data.invoice;
        const coupon = this.data.coupon;
        if (this.data.isCoin) {
            if (coinNumber - (totalPrice * roomNumber - coupon + invoice) > 0) {
                if (Number.isInteger(totalPrice * roomNumber)) {
                    integral = totalPrice * roomNumber - coupon + invoice;
                } else {
                    integral = Math.floor(totalPrice * roomNumber - coupon + invoice);
                }
            } else {
                integral = coinNumber;
            }
        }
        this.setData({ integral: integral.toFixed(2) });
    },
    inputChange(e) {
        const idx = e.currentTarget.dataset.idx;
        if (idx == 'phone') {
            this.setData({ phone: e.detail.value });
        } else if (idx == 'name') {
            this.setData({ contacts: e.detail.value });
        }
    },
    isRepeat(arr){
        var hash = {};
        for(var i in arr) {
            if(hash[arr[i]]) {
                return true;
            }
            hash[arr[i]] = true;
        }
        return false;
    },
    goDetail() {
        const h = this.data.hotel;
        wx.getLocation({
            type: 'wgs84',
            success: (res)=>{
                getData(`1/special/hotel_info?token=${app.globalData.token}&hotel_id=${h.id}&customer_lat=${res.latitude}&customer_lon=${res.longitude}`).then(res => {
                    if (res.code == 100000) {
                        wx.redirectTo({
                            url: `/pages/hotelDetails/hotelDetails?id=${h.id}&distance=${res.result.distance}`
                        });
                    }
                });
            }
        });
    },
    pay(op) {
        wx.requestPayment({
            timeStamp: op.timeStamp,
            nonceStr: op.nonceStr,
            package: op.package,
            signType: op.signType,
            paySign: op.paySign,
            success: (res) =>{
                wx.showModal({
                    title: '提示',
                    cancelText: '继续预定',
                    confirmText: '查看订单',
                    content: '支付成功，等待酒店确认',
                    success:(res) => {
                        if (res.confirm) {
                            wx.redirectTo({
                                url: '/pages/accountOrderList/accountOrderList?state='
                            });
                        } else {
                            this.goDetail();
                        }
                    }
                });
            },
            fail: (err)=>{
                wx.showToast({
                    title: '支付失败，请稍等',
                    icon: 'none'
                });
                wx.getStorage({
                    key: 'orderInfo',
                    success: (res) => {
                        this.saveOrderInfo(res.data);
                    },
                    fail: () => {
                        this.saveOrderInfo();
                    }
                });
            }
        });
    },
    saveOrderInfo(arr = []) {
        const data = this.data;
        wx.setStorage({
            key: 'orderInfo',
            data: [...arr, {
                contacts: data.contacts,
                roomIndex: data.roomIndex,
                time: data.checkInTime,
                roomId: data.roomId,
                tel: data.phone
            }]
        });
    },
    goPay() {
        const data = this.data;
        if (!data.contacts) {
            wx.showToast({
                title: '姓名不能为空!',
                icon: 'none'
            });
            return;
        }
        if (!isPhone(data.phone)) {
            wx.showToast({
                title: '手机号有误!',
                icon: 'none'
            });
            return;
        }
        // if (!data.checkInTime) {
        //     wx.showToast({
        //         title: '请选择到店时间!',
        //         icon: 'none'
        //     });
        //     return;
        // }
        wx.showLoading({
            title: '支付中...',
            mask: true
        });
        if (!flag) return;
        flag = false;
        // 订单去支付
        if (data.isOrder) {
            postData('xcx_pay/pay_order', { id: data.order_id, token: data.token }).then(res => {
                if (res.code == 200) {
                    this.pay(res.data);
                } else {
                    wx.showModal({
                        title: '预定失败',
                        content: res.msg,
                        showCancel: false,
                        confirmText: '确定'
                        // success: (result) => {
                        //     if(result.confirm){
                        //         wx.redirectTo({
                        //             url: '/pages/accountOrderList/accountOrderList?state='
                        //         });
                        //     }
                        // }
                    });
                }
            });
            wx.hideLoading();
            flag = true;
            return;
        }

        const h = data.hotel;                // 酒店信息
        const r = data.room;                 // 房间信息
        const vipPrice = data.vipPrice;      // 会员会费 
        const totalPrice = data.totalPrice;  // 支付价格
        const roomNumber = data.roomNumber;  // 房间数量
        const invoice = data.invoice;        // 发票费
        const coupon = data.coupon           // 折扣
        const integral = data.integral;       // 抵扣金币
        let total_cost = totalPrice * roomNumber - integral - coupon + invoice + vipPrice;                  // 支付总价
        if (totalPrice * roomNumber - integral - coupon + invoice < 0) {
            total_cost = 0;
        }
        postData('xcx_pay/generate_order', {
            days: 1,
            integral,
            room_type: r.name,
            token: data.token,
            uniacid: h.uniacid,
            user_id: data.user.id,
            rebate: r.rebate ? r.rebate * roomNumber : '',
            seller_id: h.id,
            room_id: data.roomId,
            price: r.price,
            seller_name: h.name,
            seller_address: h.address,
            coordinates: h.coordinates,
            arrival_time: start,
            departure_time: end,
            dd_time: data.checkInTime,
            tel: data.phone,
            name: data.contacts,
            from_id: data.fromId,
            num: roomNumber,
            total_cost
        }).then((res) => {
            if (res.code == 200) {
                if (!res.data) {
                    wx.showModal({
                        title: '提示',
                        cancelText: '继续预定',
                        confirmText: '查看订单',
                        content: '支付成功，等待酒店确认',
                        success:(res) => {
                            if (res.confirm) {
                                wx.redirectTo({
                                    url: '/pages/accountOrderList/accountOrderList?state='
                                });
                            } else {
                                this.goDetail();
                            }
                        }
                    });
                    wx.hideLoading();
                    flag = true;
                    return;
                }
                this.pay(res.data);
            } else {
                wx.showModal({
                    title: '预定失败',
                    content: res.msg,
                    showCancel: false,
                    confirmText: '确定'
                    // success: (result) => {
                    //     if(result.confirm){
                    //         wx.redirectTo({
                    //             url: '/pages/accountOrderList/accountOrderList?state='
                    //         });
                    //     }
                    // }
                });
            }
            wx.hideLoading();
            flag = true;
        });
    },
    //  页面加载
    onLoad: function (option) {
        this.loadData(option);
    },
    //  选择房间数
    roomChange: function (e) {
        this.setData({
            roomIndex: e.detail.value,
            roomNumber: this.data.roomArray[e.detail.value]
        });
        // let coupon_cost = 0;
        // let coupon = 0;
        const user = this.data.user;
        const roomNum = this.data.roomNumber;
        const price = this.data.room.price;
        const coupon_cost = Number.parseFloat((price * roomNum * user.vip.tonignt_bookorder_price_rate).toFixed(2));
        const coupon = Number.parseFloat((price * roomNum - (price * roomNum * user.vip.tonignt_bookorder_price_rate)).toFixed(2))
        this.setData({
            coupon,
            coupon_cost,
            rebate: Math.floor(price * roomNum),
            invoice: Number.parseFloat((price * roomNum * user.vip.tonight_bookorder_tax_rate).toFixed(2))
        });
        // 计算抵扣金币
        this.computeCoin();
    },
    //  选择预计办理入住时间
    timeChange: function (e) {
        this.setData({
            checkInTime: e.detail.value
        });
    },
    //  切换可用金币
    coinChange: function (e) {
        this.setData({
            isCoin: e.detail.value
        });
        // 计算抵扣金币
        this.computeCoin();
    }
})