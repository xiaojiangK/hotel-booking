/**
 *  入住期限
 */
const util = require('./../../utils/util');
var app = getApp();

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    today: {
      type: String
    },
    tomorrow: {
      type: String
    }
  },
  //  组件的内部数据
  data: {
    today: '',
    tomorrow: '',
    days: app.globalData.days
  },
  //  生命周期函数
  lifetimes: {
    ready () {
      let { today, tomorrow } = util.formatDuration();
      this.setData({
        today,
        tomorrow
      });
    }
  },
  //  组件的方法
  methods: {
  }
})