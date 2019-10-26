/**
 *  酒店详情相册页
 */
import { getData } from './../../utils/util-1';
const app = getApp();

Page({
  data: {
    hotel: {}
  },
  //  页面加载
  onLoad (opt){
    // 酒店详情
    getData(`1/special/hotel_info?token=${app.globalData.token}&hotel_id=${opt.id}`).then(res => {
      if (res.code == 100000) {
        this.setData({ hotel: res.result });
      }
    });
  },
  //  图片预览
  goPreview(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.src,
      urls: this.data.hotel.img
    });
  }
})
