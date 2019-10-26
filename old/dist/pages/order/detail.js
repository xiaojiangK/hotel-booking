import { getData, postData, formatDateTime, formatMonth, formatDate, formatTime, integer, setTime } from '../../utils/utils.js';
let timer = null;
var app =  getApp();

Page({
    data: {
        detailVisible: false,
        details: {},
        phone: '',
        countDown: []
    },
    seeDetail() {
        this.setData({ detailVisible: !this.data.detailVisible });
    },
    goDetail(e) {
        let roomType = '';
        const id = e.currentTarget.dataset.id;
        if (id) {
            roomType = id;
        }
        wx.getStorage({
            key: 'location',
            success: (res)=>{
                const details = this.data.details;
                wx.navigateTo({
                    url: `../hotel/detail?id=${details.hotel_id}&startDate=${details.start}&endDate=${details.end}&latitude=${res.data.latitude}&longitude=${res.data.longitude}&roomType=${roomType}`
                });
            }
        });
    },
    goCall() {
        wx.makePhoneCall({
            phoneNumber: this.data.phone
        });
    },
    goMap() {
        const details = this.data.details;
        const latitude = Number.parseFloat(details.latitude);
        const longitude = Number.parseFloat(details.longitude);
        wx.openLocation({
            scale: 18,
            latitude,
            longitude,
            name: details.hotel_name,
            address: details.address,
            fail: (err) =>{
                wx.showToast({
                    title: err.errMsg,
                    icon: 'none'
                });
            }
        });
    },
    cancel(id, token) {
        postData('xcx_pay/cancel_order', { id, token }).then(res => {
            if (res.error_no == 200) {
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
    cancelOrder(e) {
        const state = e.currentTarget.dataset.state;
        const id = e.currentTarget.dataset.id;
        wx.showModal({
            title: '提示',
            content: '您确定要取消该订单吗？',
            showCancel: true,
            success: (result) => {
                if(result.confirm){
                    const token = app.globalData.token;
                    if (state == 1) {
                        this.cancel(id, token);
                    } else if (state == 2) {
                        if (this.details.total_sum <= 0) {
                            this.cancel(id, token);
                            return;
                        }
                        postData('xcx_pay/retreat_order', { token, acancelCheck: '其他原因', id }).then(res => {
                            if (res.error_no == 200) {
                                wx.showToast({
                                    title: '取消成功！订单金额将在7天内原路返回到你的账户上',
                                    icon: 'none',
                                });
                                this.getDetail(id);
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
        const data = this.data.details;
        wx.getStorage({
            key: 'location',
            success: (res)=>{
                wx.navigateTo({
                    url: `../hotel/detail?id=${data.hotel_id}&startDate=${data.start}&endDate=${data.end}&latitude=${res.data.latitude}&longitude=${res.data.longitude}`
                });
            }
        });
    },
    goPay() {
        const data = this.data.details;
        let startWeek = integer(new Date(data.start).getDay());
        let endWeek = integer(new Date(data.end).getDay());
        if (startWeek == 0) {
            startWeek = '日'
        }
        if (endWeek == 0) {
            endWeek = '日'
        }
        const dayNum = data.unit_price ? data.unit_price.length : 1;
        wx.navigateTo({
            url: `../place-order/index?id=${data.room_type}&startWeek=${startWeek}&endWeek=${endWeek}&dayNum=${dayNum}&start=${data.start}&end=${data.end}&price=${data.order_total_sum}&rebatePrice=${data.return_gold}&hotel_id=${data.hotel_id}&goods_id=${data.goods_id}&number=${data.number_of_rooms}&roomId=${data.room_type}&coin=${data.gold_coin}&orderId=${data.id}`
        });
    },
    getDetail(id) {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        getData('1/Xiubao/phone').then(res => {
            this.data.phone = res.result;
        }).catch(err => {
            wx.showToast({
                title: err.errMsg,
                icon: 'none'
            });
        });
        postData(`xcx_pay/order_details`, { token: app.globalData.token, id }).then((res) => {
            if (res.error_no == 200) {
                const data = res.list;
                let total = 0;
                for (let i of data.unit_price) {
                    total += i.salePrice;
                }
                if (data.open_vip == 0) {
                    total += 9;
                }
                const details = {
                    ...data,
                    total,
                    start: formatDate(data.check_in_time * 1000),
                    end: formatDate(data.departure_time * 1000),
                    create_at: formatDateTime(data.add_time * 1000),
                    check_in_time: formatMonth(data.check_in_time * 1000),
                    departure_time: formatMonth(data.departure_time * 1000),
                    estimated_time: formatTime(data.estimated_time * 1000)
                }
                this.setData({ details });
                if (details.order_state == 1) {
                    clearInterval(timer);
                    timer = setInterval(() => {
                        this.setData({ countDown: setTime(details.add_time) });
                    }, 1000);
                }
            }
            wx.hideLoading();
        }).catch(err => {
            wx.showToast({
                title: err.errMsg,
                icon: 'none'
            });
        });
    },
    onLoad(option) {
        this.getDetail(option.id);
    },
    onHide() {
        clearInterval(timer);
    }
});