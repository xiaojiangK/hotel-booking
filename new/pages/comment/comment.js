var app = getApp();
import { postData, formatDate } from '../../utils/util-1.js';

Page({
  data: {
    //  评价
    comment: {},
    orderId: 0,
    uniacId: 0
  },
  onLoad(opts) {
    this.setData({
      orderId: opts.orderId,
      uniacId: opts.uniacId
    });
  },
  onShow() {
    this.getAssess();
  },
  // 获取评论列表
  getAssess() {
    postData('xcx_pay/AssessList', { token:app.globalData.token, uniacid:this.data.uniacId, order_id:this.data.orderId }).then(res => {
      if (res.list instanceof Array) {
        const comment = res.list.map(item => {
          return {
            ...item,
            speaker: "酒店回复：",
            time: formatDate(item.time * 1000),
            img: item.img && item.img.map(item => item),
            reply_time: formatDate(item.reply_time * 1000),
            arrival_time: formatDate(item.arrival_time * 1000)
          }
        });
        this.setData({ comment: comment[0] });
      }
    });
  },
  //  转发
  onShareAppMessage: function () {
  }
})