import { postData, getData, isPhone } from '../../utils/utils.js';
var isUnpaid = true;
var isPay = false;
var price = 0;
var app =  getApp();

Page({
    data: {
        pupupVisible: true,
        time: '14:00',
        roomNum: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        roomIdx: 0,
        contacts: [''],
        phone: '',
        gold: 0,
        total: 0,
        totalPrice: 0,
        isDiscount: true,
        isOpenVip: true,
        details: {},
        roomId: '',
        priceDetail: [],
        flag: true,
        token: '',
        isOrder: false,
        use_gold: 0,
        order_id: '',
        rebatePrice: ''
    },
    onLoad(op) {
        this.initData(op);
    },
    initData(op) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        const token = app.globalData.token;
        this.data.token = token;
        if (op.orderId) {
            this.setData({
                isOrder: true,
                order_id: op.orderId
            });
            if (op.coin > 0) {
                // 订单去支付所使用的金币
                this.setData({ use_gold: op.coin });
            } else {
                this.setData({ isDiscount: false });
            }
        } else {
            postData('xcx_pay/count_order', { token }).then(res => {
                if (res.error_no == 200) {
                    this.data.Unpaid = res.data.Unpaid;
                }
            });
        }
        getData(`1/User/info?token=${token}`).then(res => {
            if (res.code == 100000) {
                if (!res.result.vip_endtime) {
                    this.setData({ isOpenVip: false });
                } else if ((res.result.vip_endtime * 1000) < Date.now()) {
                    this.setData({ isOpenVip: false });
                } else {
                    this.setData({ isOpenVip: true });
                }
            }
        });

        getData(`1/User/Score?token=${token}`).then(res => {
            if (res.code == 100000) {
                this.setData({
                    gold: Number.parseInt(res.result)
                });
                postData('xcx_pay/date_order', {hotel_id: op.hotel_id, goods_id: op.goods_id, check_in_time: op.start, departure_time: op.end, number_of_rooms: op.number}).then(res => {
                    if (res.error_no == 200) {
                        let total = 0;
                        let totalPrice = 0;
                        const priceDetail = res.data.map(item => {
                            total += item.salePrice / 100;
                            totalPrice += item.salePrice / 100;
                            return {
                                ...item,
                                salePrice: Math.ceil(item.salePrice / 100)
                            }
                        });
                        price = totalPrice;
                        this.setData({
                            priceDetail,
                            total: Math.ceil(total),
                            totalPrice: Math.ceil(totalPrice)
                        });
                        this.getRebate();
                    } else if (res.error_no == 400) {
                        wx.showModal({
                            title: '房间数量不足',
                            content: '抱歉，此房间已满房，请选择其他房间!',
                            showCancel: false,
                            confirmText: '确定',
                            success: (res) => {
                                wx.navigateBack({ delta: 1 });
                            }
                        });
                    }
                });
            }
            wx.hideLoading();
        });
        
        getData(`1/lib/room_info?id=${op.id}&token=${token}`).then((res) => {
            if (res.code == 100000) {
                this.setData({
                    details: {
                        ...res.result,
                        rebatePrice: Math.floor(op.rebatePrice),
                        avgPrice: Math.ceil(op.price),
                        startDate: op.start.split('-'),
                        endDate: op.end.split('-'),
                        startWeek: op.startWeek,
                        endWeek: op.endWeek,
                        dayNum: op.dayNum
                    }
                });
                this.data.roomId = res.result.id;
                wx.getStorage({
                    key: 'orderInfo',
                    success: (res) => {
                        const data = res.data;
                        if (op.roomId == data.roomId) {
                            let contacts = [];
                            for (let i of data.contacts) {
                                contacts.push(i);
                            }
                            this.setData({
                                contacts,
                                roomIdx: data.roomIdx,
                                phone: data.phone,
                                time: data.time
                            });
                        }
                    }
                });
            }
        });
    },
    getRebate() {
        getData(`1/Rebate/Get?token=${this.data.token}`).then(res => {
            if (res.code == 100000) {
                this.setData({ rebatePrice: Math.floor((res.result / 100) * price * (this.data.roomIdx + 1)) });
            }
        });
    },
    showPupup() {
        this.setData({ pupupVisible: false });
    },
    closepupup() {
        this.setData({ pupupVisible: true });
    },
    roomNumChange(e) {
        const roomIdx = Number.parseInt(e.detail.value);
        this.setData({ roomIdx });
        this.getRebate();
    },
    inputChange(e) {
        const idx = e.currentTarget.dataset.idx;
        let contacts = this.data.contacts;
        for (let i = 0; i < this.data.roomIdx + 1; i++) {
            if (i == idx) {
                contacts[i] = e.detail.value;
            }
        }
        if (idx == 'phone') {
            this.setData({ phone: e.detail.value });
            return;
        }
        this.setData({ contacts });
    },
    timeChange(e) {
        this.setData({
            time: e.detail.value
        });
    },
    switchChange(e) {
        const isDiscount = e.detail.value;
        this.setData({ isDiscount });
        this.getRebate();
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
        wx.getStorage({
            key: 'location',
            success: (res)=>{
                const details = this.data.details;
                const startDate = `${details.startDate[0]}-${details.startDate[1]}-${details.startDate[2]}`;
                const endDate = `${details.endDate[0]}-${details.endDate[1]}-${details.endDate[2]}`;
                wx.navigateTo({
                    url: `../hotel/detail?id=${details.hotelId}&startDate=${startDate}&endDate=${endDate}&latitude=${res.data.latitude}&longitude=${res.data.longitude}`
                });
            }
        });
    },
    pay(op) {
        const data = this.data;
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
                            wx.navigateTo({
                                url: '../order/list?state='
                            });
                        } else {
                            this.goDetail();
                        }
                    }
                });
                isUnpaid = false;
            },
            fail: (err)=>{
                wx.showToast({
                    title: '支付失败，请稍等',
                    icon: 'none'
                });
                wx.setStorage({
                    key: 'orderInfo',
                    data: {
                        contacts: data.contacts,
                        roomId: data.roomId,
                        roomIdx: data.roomIdx,
                        phone: data.phone,
                        time: data.time
                    }
                });
            },
            complete: () => {
                isPay = true;
            }
        });
    },
    goPayment() {
/*
      var myDate = new Date();

      if (myDate.getHours() < 18){
        wx.showToast({
          title: '今日活动还未开始!',
          icon: 'none'
        });
        return;
      }
      if (myDate.getHours() > 21) {
        wx.showToast({
          title: '今日活动已结束!',
          icon: 'none'
        });
        return;
      }
      */
        const data = this.data;
        if (!data.time) {
            wx.showToast({
                title: '请选择预计入住时间!',
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
        for (let i of data.contacts) {
            if (i == '') {
                wx.showToast({
                    title: '名字不能为空!',
                    icon: 'none'
                });
                return;
            }
        }if (this.isRepeat(data.contacts)) {
            wx.showToast({
                title: '入住人姓名不能相同!',
                icon: 'none'
            });
            return;
        }
        // if (isPay || (data.Unpaid > 0 && !data.isOrder)) {
        //     wx.showModal({
        //         title: '温馨提示',
        //         showCancel: false,
        //         content: '您有待支付的订单，请先处理待支付订单!',
        //         confirmText: '查看订单',
        //         success: (result) => {
        //             if(result.confirm){
        //                 wx.navigateTo({
        //                     url: '../order/list?state=1'
        //                 });
        //             }
        //         }
        //     });
        //     return;
        // }
        if (!this.data.flag) return;
        this.setData({ flag: false });
        const details = data.details;
        const resData = {
            token: data.token,
            roomId: details.id,
            cell_phone: data.phone,
            contacts: data.contacts,
            hotel_id: details.hotelId,
            estimated_time: data.time,
            coin: data.isDiscount ? data.gold : 0,
            member: data.isOpenVip ? 1 : 0,
            number_of_rooms: data.roomIdx+1,
            cancelType: details.cancelRules[0].cancelType,
            check_in_time: `${details.startDate[0]}-${details.startDate[1]}-${details.startDate[2]}`,
            departure_time: `${details.endDate[0]}-${details.endDate[1]}-${details.endDate[2]}`,
            total_sum: details.avgPrice ? details.avgPrice : 100,
            goods_id: details.goodsId
        };
        wx.showLoading({
            title: '支付中...',
            mask: true
        });
        if (data.isOrder) {
            postData('xcx_pay/pay_order', { id: data.order_id, token: data.token }).then(res => {
                if (res.error_no == 200) {
                    this.pay(res.result);
                } else {
                    wx.showModal({
                        title: '预定失败',
                        content: res.result_code,
                        showCancel: false,
                        confirmText: '确定',
                        success: (result) => {
                            if(result.confirm){
                                wx.navigateBack({
                                    delta: 1
                                });
                            }
                        }
                    });
                }
            });
            wx.hideLoading();
            this.setData({ flag: true });
            return;
        }
        postData('xcx_pay/generate_order', resData).then(res => {
            if (res.error_no == 200) {
                if (!res.result) {
                    wx.showModal({
                        title: '提示',
                        cancelText: '继续预定',
                        confirmText: '查看订单',
                        content: '支付成功，等待酒店确认',
                        success:(res) => {
                            if (res.confirm) {
                                wx.navigateTo({
                                    url: '../order/list?state='
                                });
                            } else {
                                this.goDetail();
                            }
                        }
                    });
                    wx.hideLoading();
                    this.setData({ flag: true });
                    isUnpaid = false;
                    isPay = true;
                    return;
                }
                this.pay(res.result);
            } else if (res.error_no == 400) {
                wx.showModal({
                    title: '预订失败',
                    content: '抱歉，此房间已满房，请选择其他房间!',
                    showCancel: false,
                    success: () => {
                        wx.navigateBack({
                            delta: 1
                        });
                    }
                });
            } else {
                wx.showModal({
                    title: '预定失败',
                    content: res.msg,
                    showCancel: false,
                    confirmText: '确定',
                    success: (result) => {
                        if(result.confirm){
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    }
                });
            }
            wx.hideLoading();
            this.setData({ flag: true });
        });
    },
    backPage() {
        if (isUnpaid) {
            wx.showModal({
                title: '提示',
                content: '订单尚未提交，确定放弃?',
                success(res) {
                    if (res.confirm) {
                        wx.navigateBack({
                            delta: 1
                        });
                    }
                }
            });
        } else {
            wx.navigateBack({
                delta: 1
            });
        }
    },
    onShow() {
        postData('xcx_pay/count_order', { token: this.data.token }).then(res => {
            if (res.error_no == 200) {
                isPay = res.data.Unpaid;
                this.data.Unpaid = res.data.Unpaid;
            }
        });
    }
});
