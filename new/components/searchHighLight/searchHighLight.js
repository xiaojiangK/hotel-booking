Component({
  /**
   * 组件的属性列表
   */
  properties: {
    /**
     * {keyword:'关键字', name:'待匹配字符串'}
     */
    keyword: {
      type: String,
      observer: '_propertyKeywordChange'
    },
    name: {
      type: String,
      observer: '_propertyNameChange'
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    searchArray: [],
    keyStr: ''
  },
  /**
   * 组件的方法列表
   */
  methods: {
    _propertyNameChange: function (newName) {
      let searchArray = this.getHilightStrArray(newName, this.properties.keyword)
      this.setData({
        keyStr: this.properties.keyword,
        searchArray: searchArray
      })
    },
    _propertyKeywordChange: function (newKeyword) {
      let searchArray = this.getHilightStrArray(this.properties.name, newKeyword)
      this.setData({
        keyStr: newKeyword,
        searchArray: searchArray
      })
    },
    getHilightStrArray: function(name, keyword) {
      return name.replace(new RegExp(`${keyword}`, 'g'), `%%${keyword}%%`).split('%%');
    }
  }
})