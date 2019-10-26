import { postData, formatDateTime, formatDate, integer, setTime } from '../../utils/utils.js';
let timer = null;
var app =  getApp();

Page({
    data: {
        tabs: [
            {
                id: '',
                title: '全部订单',
                active: true
            },
            {
                id: 1,
                title: '待支付',
                active: false
            },
            {
                id: 10,
                title: '待入住',
                active: false
            }
        ],
        list: [],
        state: '',
        countDown: []
    },
    onPullDownRefresh() {
        this.getList();
    },
    sendFromId(e) {
        postData('xcx_pay/fromId', {
            token: app.globalData.token,
            form_id: e.detail.formId
        });
    },
    getList() {
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        wx.showNavigationBarLoading();
        const state = this.data.state;
        const tabs = this.data.tabs.map((item, index) => {
            if (state == 1) {
                item = { ...item, active: index == 1 ? true : false };
            } else if (state == 10) {
                item = { ...item, active: index == 2 ? true : false };
            } else {
                item = { ...item, active: index == 0 ? true : false };
            }
            return item;
        });
        this.setData({ tabs });
        const token = app.globalData.token;
        postData(`xcx_pay/list_order`, { token, state }).then((res) => {
            if (res.error_no == 200) {
                const list = res.list.map(item => {
                    // 大于下单时间半个小时，则取消订单
                    if (item.order_state == 1) {
                        if (Date.now() - item.add_time * 1000 > (60 * 30 * 1000)) {
                            item.order_state = 4;
                            postData('xcx_pay/cancel_order', { id: item.id, token });
                        }
                    }
                    return {
                        ...item,
                        unit_price: JSON.parse(item.unit_price),
                        create_at: formatDateTime(item.add_time * 1000),
                        check_in_time: formatDate(item.check_in_time * 1000),
                        departure_time: formatDate(item.departure_time * 1000)
                    }
                });
                this.setData({ list });
                list.map(item => {
                    if (item.order_state == 1) {
                        clearInterval(timer);
                        timer = setInterval(() => {
                            this.setData({ countDown: setTime(item.add_time) });
                        }, 1000);
                    }
                });
            }
            wx.hideLoading();
            wx.hideNavigationBarLoading();
        });
    },
    tabSwitch(e) {
        this.data.state = e.currentTarget.dataset.id;
        this.getList();
    },
    cancel(id, token) {
        postData('xcx_pay/cancel_order', { id, token }).then(res => {
            if (res.error_no == 200) {
                wx.showToast({
                    title: '已取消订单',
                    icon: 'none',
                });
                this.getList();
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                });
            }
        });
    },
    cancelOrder(e) {
        const item = e.currentTarget.dataset.item;
        const total_sum = item.total_sum;
        const state = item.order_state;
        const id = item.id;
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
                        if (total_sum <= 0) {
                            this.cancel(id, token);
                            return;
                        }
                        postData('xcx_pay/retreat_order', { token, acancelCheck: '其他原因', id }).then(res => {
                            if (res.error_no == 200) {
                                wx.showToast({
                                    title: '取消成功！订单金额将在7天内原路返回到你的账户上',
                                    icon: 'none',
                                });
                                this.getList();
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
    goReserve(e) {
        const data = e.currentTarget.dataset.data;
        wx.getStorage({
            key: 'location',
            success: (res)=>{
                wx.navigateTo({
                    url: `../hotel/detail?id=${data.hotel_id}&startDate=${data.check_in_time}&endDate=${data.departure_time}&latitude=${res.data.latitude}&longitude=${res.data.longitude}`
                });
            }
        });
    },
    goPay(e) {
        const data = e.currentTarget.dataset.data;
        let startWeek = integer(new Date(data.check_in_time).getDay());
        let endWeek = integer(new Date(data.departure_time).getDay());
        if (startWeek == 0) {
            startWeek = '日'
        }
        if (endWeek == 0) {
            endWeek = '日'
        }
        const dayNum = data.unit_price.length;
        wx.navigateTo({
            url: `../place-order/index?id=${data.room_type}&startWeek=${startWeek}&endWeek=${endWeek}&dayNum=${dayNum}&start=${data.check_in_time}&end=${data.departure_time}&price=${data.order_total_sum}&rebatePrice=${data.return_gold}&hotel_id=${data.hotel_id}&goods_id=${data.goods_id}&number=${data.number_of_rooms}&roomId=${data.room_type}&coin=${data.gold_coin}&orderId=${data.id}`
        });
    },
    onLoad(option) {
        this.data.state = option.state;
    },
    onShow() {
        this.getList();
    },
    onHide() {
        clearInterval(timer);
    }
});