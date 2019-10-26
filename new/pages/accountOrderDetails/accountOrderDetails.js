/**
 *  个人中心订单详情页
 */
import { getData, postData, formatDateTime, formatMonth, formatDate, } from './../../utils/util-1';
import { countDown } from '../../utils/util-1.js';
var timer = null;
var app =  getApp();

Page({
    data: {
        detailVisible: true,
        order: {},
        phone: '',
        time: '',
        orderId: '',
        isVip: false,
        isReply: false,
        isAssess: false,
        days: app.globalData.days
    },
    // 获取评论列表
    getAssess() {
        if (this.data.order.status == 4) {
            postData('xcx_pay/AssessList', { token:app.globalData.token, uniacid:this.data.order.uniacid, order_id:this.data.orderId }).then(res => {
                if (res.list instanceof Array) {
                    for (let i of res.list) {
                        if (i.reply) {
                            this.setData({
                                isReply: true
                            });
                        }
                    }
                    if (res.list.length > 0) {
                        this.setData({
                            isAssess: true
                        });
                    }
                }
            });
        }
    },
    // 查看评论
    viewComment() {
        wx.navigateTo({
            url: `/pages/comment/comment?orderId=${this.data.orderId}&uniacId=${this.data.order.uniacid}`
        });
    },
    goComment() {
      const item = this.data.order;
      wx.navigateTo({
        url: `/pages/submitComment/submitComment?roomId=${item.room_id}&orderId=${item.id}&uniacId=${this.data.order.uniacid}`
      });
    },
    seeDetail() {
        this.setData({ detailVisible: !this.data.detailVisible });
    },
    goDetail() {
        const data = this.data.order;
        wx.getLocation({
            type: 'wgs84',
            success: (res)=>{
                getData(`1/special/hotel_info?token=${app.globalData.token}&hotel_id=${data.seller_id}&customer_lat=${res.latitude}&customer_lon=${res.longitude}`).then(res => {
                    if (res.code == 100000) {
                        wx.navigateTo({
                            url: `/pages/hotelDetails/hotelDetails?id=${data.seller_id}&distance=${res.result.distance}`
                        });
                    }
                });
            }
        });
    },
    goCall() {
        wx.makePhoneCall({
            phoneNumber: '01083421725'
        });
    },
    goMap() {
        const data = this.data.order;
        const latitude = Number.parseFloat(data.coordinates[0]);
        const longitude = Number.parseFloat(data.coordinates[1]);
        wx.openLocation({
            scale: 18,
            latitude,
            longitude,
            name: data.seller_name,
            address: data.seller_address
        });
    },
    startCountDown(){
        timer = setInterval(() => {
          countDown(this.data.order.time, this);
        }, 1000);
    },
    cancel(id, token) {
        postData('xcx_pay/cancel_order', { id, token }).then(res => {
            if (res.code == 200) {
                wx.showToast({
                    title: '已取消订单',
                    icon: 'none',
                });
                this.getDetail(id);
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                });
            }
        });
    },
    cancelOrder() {
        const data = this.data.order;
        wx.showModal({
            title: '提示',
            content: '您确定要取消该订单吗？',
            showCancel: true,
            success: (result) => {
                if(result.confirm){
                    const token = app.globalData.token;
                    if (data.status == 1) {
                        this.cancel(data.id, token);
                    } else if (data.status == 2) {
                        if (data.total_sum <= 0) {
                            this.cancel(data.id, token);
                            return;
                        }
                        postData('xcx_pay/retreat_order', { token, acancelCheck: '其他原因', id: data.id }).then(res => {
                            if (res.code == 200) {
                                wx.showToast({
                                    title: '取消成功！订单金额将在7天内原路返回到你的账户上',
                                    icon: 'none',
                                });
                                this.getDetail(data.id);
                            } else {
                                wx.showModal({
                                    title: '提示',
                                    content: res.data.result_code,
                                    showCancel: false,
                                    confirmText: '确定'
                                });
                            }
                        });
                    }
                }
            }
        });
    },
    goReserve() {
        const data = this.data.order;
        wx.getLocation({
            type: 'wgs84',
            success: (res)=>{
                getData(`1/special/hotel_info?token=${app.globalData.token}&hotel_id=${data.seller_id}&customer_lat=${res.latitude}&customer_lon=${res.longitude}`).then(res => {
                    if (res.code == 100000) {
                        wx.navigateTo({
                            url: `/pages/hotelDetails/hotelDetails?id=${data.seller_id}&distance=${res.result.distance}`
                        });
                    }
                });
            }
        });
    },
    goPay() {
        const data = this.data.order;
        let flag = true;
        // 酒店详情
        getData(`1/special/hotel_info?token=${app.globalData.token}&hotel_id=${data.seller_id}`).then(res => {
            if (res.code == 100000) {
                const hotel = {
                    ...res.result,
                    coordinates: res.result.coordinates.split(',')
                };
                wx.setStorage({
                    key: 'hotel',
                    data: hotel
                });
            }
        });
        // 房间详情
        getData(`1/special/room_list?token=${app.globalData.token}&hotel_id=${data.seller_id}`).then(res => {
            if (res.code == 100000) {
                const vip = app.globalData.userInfo.vip;
                res.result.map(item => {
                    if(item.room_id == data.room_id) {
                        wx.setStorage({
                            key: 'room',
                            data: {
                                ...item,
                                tel: data.tel,
                                contacts: data.name,
                                price: Math.ceil(item.price),
                                rebate: (item.price * vip.tonignt_bookorder_price_rate).toFixed(2)
                            },
                            success: () => {
                                if (flag) {
                                    wx.navigateTo({
                                        url: `/pages/hotelOrderConfirm/hotelOrderConfirm?orderId=${data.id}&coin=${data.integral}`
                                    });
                                    flag = false;
                                }
                            }
                        });
                    }
                });
            }
        });
    },
    getDetail(id) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        getData('1/Xiubao/phone').then(res => {
            this.data.phone = res.result;
        });
        postData(`xcx_pay/order_details`, { token: app.globalData.token, id }).then((res) => {
            if (res.code == 200) {
                const data = res.data;
                const price = data.price;
                const unit_price = [{
                    date: formatDate(Date.now()),
                    salePrice: price
                }];
                // let coupon = 0;
                // let coupon_cost = 0;
                const roomNum = data.num;
                const vip = app.globalData.userInfo.vip;
                const coupon_cost = (price * roomNum * vip.tonignt_bookorder_price_rate).toFixed(2);
                const coupon = (price * roomNum - (price * roomNum * vip.tonignt_bookorder_price_rate)).toFixed(2);
                const order = {
                    ...data,
                    coupon,
                    unit_price,
                    coupon_cost,
                    isVip: vip.is_vip,
                    name: data.name.split(','),
                    coordinates: data.coordinates.split(','),
                    create_at: formatDateTime(data.time * 1000),
                    arrival_time: formatMonth(data.arrival_time * 1000),
                    departure_time: formatMonth(data.departure_time * 1000),
                    rebate: Math.floor((price * roomNum) * app.globalData.rebate),
                    invoice: (price * roomNum * vip.tonight_bookorder_tax_rate).toFixed(2),
                    totalPrice: Number.parseFloat(data.total_cost) + Number.parseFloat(data.open_vip)
                };
                this.setData({ order });
                if (order.status == 1) {
                    this.startCountDown();
                }
                this.getAssess();
            }
            wx.hideLoading();
        });
    },
    onLoad(option) {
        this.data.orderId = option.id;
        this.getDetail(option.id);
    },
    onShow() {
        if (this.data.order.status == 1) {
           this.startCountDown();
        }
    },
    onHide() {
        clearInterval(timer);
    }
});