const api = require('./../../utils/api');

Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    comment: {
      type: Object
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
  },
  /**
   * 组件的方法列表
   */
  methods: {
     //  预览图片
    previewImage: function (e) {
      let { index } = e.currentTarget.dataset;
      api.previewImage({
        current: this.properties.comment.img[index],
        urls: this.properties.comment.img 
      });
    }
  }
})
