var app = getApp();
const api = require('./../../utils/api');
import { postData } from './../../utils/util-1';

Page({
  data: {
    //  分数
    score: 0,
    //  内容
    content: '',
    //  字数限制
    countLimit: 100,
    //  字数
    count: 0,
    //  图片数限制
    imageLimit: 4,
    //  照片临时列表
    photoListTemp: [],
    //  照片列表
    photoList: [],
    //  是否匿名
    isAnonymous: false,
    roomId: '',
    orderId: '',
    uniacId: ''
  },
  onLoad(opts) {
    this.setData({
      orderId: opts.orderId,
      uniacId: opts.uniacId,
      roomId: opts.roomId
    });
  },
  //  打分
  chooseScore: function (e) {
    let { index } = e.currentTarget.dataset;
    this.setData({
      score: index + 1
    });
  },
  //  内容输入
  contentChange: function (e) {
    let { value } = e.detail;
    this.setData({
      content: value,
      count: value.length
    });
  },
  //  选择图片
  chooseImage: function (e) {
    api.chooseImage({
      count: this.data.imageLimit - this.data.photoListTemp.length
    })
    .then(res => {
      if (res.errMsg === 'chooseImage:ok') {
        let tempFilePaths = res.tempFilePaths;
        for (let i = 0; i < tempFilePaths.length; i++) {
          this.data.photoListTemp.push(tempFilePaths[i]);
        }
        this.setData({
          photoList: this.data.photoListTemp
        });
      }
    });
  },
  //  删除图片
  deleteImage: function (e) {
    let { index } = e.currentTarget.dataset;
    api.showModal({
      title: '提示',
      content: '点击确定后，将删除图片'
    })
    .then(res => {
      if (res.confirm) {
        this.data.photoListTemp.splice(index, 1);
        this.setData({
          photoList: this.data.photoListTemp
        });
      }
    });
  },
  //  预览图片
  previewImage: function (e) {
    let { index } = e.currentTarget.dataset;
    api.previewImage({
      current: this.data.photoListTemp[index],
      urls: this.data.photoListTemp 
    });
  },
  //  匿名发布
  anonymous: function () {
    this.setData({
      isAnonymous: !this.data.isAnonymous
    });
  },
  //  取消
  cancel: function () {
    api.showModal({
      title: '提示',
      content: '点击确定后，编辑内容将清空'
    })
    .then(res => {
      if (res.confirm) {
        api.navigateBack({
          delta: 1
        });
      }
    });
  },
  //  发布
  submit: function () {
    if (!this.data.score) {
      //  未打分
      api.showToast({
        title: '请打分',
        icon: 'none'
      });
    } else if (!this.data.content || this.data.content.length < 5) {
      //  未填写内容
      api.showToast({
        title: '请您输入5~100个字符',
        icon: 'none'
      });
    } else {
      postData('1/xiubao/getaccess').then(res => {
        wx.request({
          url: `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${res.access}`,
          data: {
            content: this.data.content
          },
          method: 'POST',
          success: (res)=>{
            if (res.data.errcode > 0) {
              wx.showToast({
                title: '内容含有违法违规内容',
                icon: 'none'
              });
            } else {
              wx.showLoading({
                title: '上传中...',
                mask: true,
              });
              // 上传图片
              let img = [];
              const list =  this.data.photoList;
              if (list.length == 0) {
                this.saveAssess();
                return;
              }
              for (let i of list) {
                wx.uploadFile({
                  url: `https://api.sulvtrip.cn/xcx_pay/Upload?upfile=${i}&token=${app.globalData.token}`,
                  filePath: i,
                  header: {  
                    "Content-Type": "multipart/form-data",
                    'accept': 'application/json',
                  },
                  name: 'file',
                  success: (res) => {
                    img.push(res.data);
                  },
                  complete: () => {
                    if (img.length == list.length) {
                      this.saveAssess(img);
                    }
                    wx.hideLoading();
                  }
                });
              }
            }
          }
        });
      });
    }
  },
  //  提交评价
  saveAssess(img = []) {
    const data = {
      img: img.join(','),
      score: this.data.score,
      room_id: this.data.roomId,
      uniacid: this.data.uniacId,
      order_id: this.data.orderId,
      content: this.data.content,
      token: app.globalData.token,
      user_id: !this.data.isAnonymous ? app.globalData.userInfo.id : ''
    };
    postData('xcx_pay/SaveAssess', data).then(res => {
      api.showToast({
        title: '上传成功',
        icon: 'none'
      });
      api.navigateBack({
        delta: 1
      });
    }).catch(err => {
      api.showToast({
        title: '上传失败，请重试',
        icon: 'none'
      });
    });
  },
  //  转发
  onShareAppMessage: function () {
  }
})