Page({
    data: {
        keyword: '',
        page: ''
    },
    onShow() {
        wx.getStorage({
            key: 'keyword',
            success: (res)=>{
                this.setData({ keyword: res.data });
            },
            fail: () => {
                this.setData({ keyword: '' });
            }
        });
    },
    onLoad(option) {
        this.setData({ page: option.page });
    },
    searchInput(e) {
        this.setData({
            keyword: e.detail.value
        });
    },
    search() {
        wx.setStorage({
            key: 'keyword',
            data: this.data.keyword
        });
        if (this.data.page == 'index') {
            wx.switchTab({
                url: '../index'
            });
        } else {
            wx.navigateBack({
                delta: 1
            });
        }
    }
});