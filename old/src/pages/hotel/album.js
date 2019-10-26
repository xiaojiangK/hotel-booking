import { getData } from '../../utils/utils.js';
var app =  getApp();

Page({
    data: {
        grids: []
    },
    goPreview(e) {
        wx.previewImage({
            current: e.currentTarget.dataset.src,
            urls: this.data.grids.map(item => item.src)
        });
    },
    onLoad (options){
        let grids = [];
        getData(`1/lib/hotel_img?id=${options.id}&token=${app.globalData.token}`).then(res => {
            for (let i of res.result) {
                for (let j of i[1]) {
                    grids.push({
                        title: i[0],
                        src: j
                    });
                }
            }
            this.setData({ grids });
        });
    }
});