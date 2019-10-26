// components/orderItem/orderItem.js
import { countDown, getData, postData } from '../../utils/util-1.js';
var app = getApp();
var timer = null;

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    data: {
      type: Object,
      observer(newVal, oldVal) {
        this.setData({ data: newVal });
      }
    }
  },
  pageLifetimes: {
    hide() {
      clearInterval(timer);
    },
    show() {
        if (this.data.data.status == 1) {
            this.startCountDown();
        }
        this.getAssess();
    }
  },
  ready() {
    if (this.data.data.status == 1) {
        this.startCountDown();
    }
    this.getAssess();
  },
  /**
   * 组件的初始数据
   */
  data: {
    data: {},
    time: '',
    isReply: false,
    isAssess: false,
    days: app.globalData.days
  },
  /**
   * 组件的方法列表
   */
  methods: {
    startCountDown(){
      timer = setInterval(() => {
        countDown(this.data.data.time, this);
      }, 1000);
    },
    // 获取评论列表
    getAssess() {
        if (this.data.data.status == 4) {
            postData('xcx_pay/AssessList', { token:app.globalData.token, uniacid:this.data.data.uniacid, order_id:this.data.data.id }).then(res => {
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
        url: `/pages/comment/comment?orderId=${this.data.data.id}&uniacId=${this.data.data.uniacid}`
      });
    },
    // 去评论
    goComment() {
      const item = this.data.data;
      wx.navigateTo({
        url: `/pages/submitComment/submitComment?roomId=${item.room_id}&orderId=${item.id}&uniacId=${this.data.data.uniacid}`
      });
    },
    cancel(id, token) {
        postData('xcx_pay/cancel_order', { id, token }).then(res => {
            if (res.code == 200) {
                wx.showToast({
                    title: '已取消订单',
                    icon: 'none',
                });
                this.triggerEvent('bindCancel');
                this.setData({ data: {...this.data.data, status: 3} });
            } else {
                wx.showToast({
                    title: res.msg,
                    icon: 'none',
                });
            }
        });
    },
    cancelOrder() {
        const data = this.data.data;
        const state = data.status;
        const id = data.id;
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
                        if (data.price <= 0) {
                            this.cancel(id, token);
                            return;
                        }
                        postData('xcx_pay/retreat_order', { token, acancelCheck: '其他原因', id }).then(res => {
                            if (res.code == 200) {
                                wx.showToast({
                                    title: '取消成功！订单金额将在7天内原路返回到你的账户上',
                                    icon: 'none',
                                });
                                this.triggerEvent('bindCancel');
                                this.setData({ data: {...this.data.data, status: 3} });
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
        const data = this.data.data;
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
        const data = this.data.data;
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
                                rebate: (item.price * vip.tonignt_bookorder_price_rate).toFixed(2),
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
    }
  }
})
