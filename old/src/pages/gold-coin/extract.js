Page({
    data: {
        gold: 0,
        qrcode: 'https://pbwci.qun.hk/FmvYFQkxz-FG4-AegkKEMcxTbMn1',
        preview: 'https://pbwci.qun.hk/FkvtiU4sH1Vc4kOcaBVr2KWTfpIl'
    },
    onLoad(option) {
        this.setData({ gold: option.gold });
    },
    preview() {
        wx.previewImage({
            current: this.data.preview,
            urls: [this.data.preview]
        });
    }
});