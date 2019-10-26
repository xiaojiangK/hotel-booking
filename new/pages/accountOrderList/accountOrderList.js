/**
 *  个人中心订单列表页
 */
import { postData, formatDateTime, formatDate } from './../../utils/util-1';
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
        state: ''
    },
    onPullDownRefresh() {
        this.getList();
    },
    bindCancel() {
        this.getList();
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
        postData(`xcx_pay/list_order`, { token, status: state }).then((res) => {
            if (res.code == 200) {
                const list = res.data.map(item => {
                    // 大于下单时间半个小时，则取消订单
                    if (item.status == 1) {
                        if (Date.now() - item.time * 1000 > (60 * 30 * 1000)) {
                            item.status = 3;
                            this.getList();
                            postData('xcx_pay/cancel_order', { id: item.id, token });
                        }
                    }
                    return {
                        ...item,
                        create_at: formatDateTime(item.time * 1000),
                        check_in_time: formatDate(item.arrival_time * 1000),
                        departure_time: formatDate(item.departure_time * 1000)
                    }
                });
                this.setData({ list });
            }
            wx.hideLoading();
            wx.stopPullDownRefresh();
            wx.hideNavigationBarLoading();
        });
    },
    tabSwitch(e) {
        this.data.state = e.currentTarget.dataset.id;
        this.getList();
    },
    onLoad(option) {
        this.data.state = option.state;
    },
    onShow() {
        this.getList();
    }
});
