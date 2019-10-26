import { getData, integer } from '../../utils/utils.js';
var app =  getApp();
var services = [{id:101006,title:"停车场"},{id:101007,title:"信用卡/银联卡收费"},{id:101038,title:"叫醒服务"},{id:101039,title:"洗衣服务"},{id:101040,title:"送餐服务"},{id:101041,title:"24小时前台接待服务"},{id:101042,title:"旅游服务"},{id:101044,title:"擦鞋服务"},{id:101045,title:"行李寄存"},{id:101047,title:"外币兑换"},{id:101048,title:"专职行李员"},{id:101049,title:"医疗支援"},{id:101050,title:"接送机服务"},{id:101051,title:"自行车租借"},{id:101052,title:"多种语言服务人员"},{id:101053,title:"雨伞租借服务"},{id:101101,title:"租车服务"},{id:101102,title:"叫车服务"},{id:101103,title:"代订机票"},{id:101104,title:"代订火车票"},{id:101106,title:"看护小孩服务"},{id:101128,title:"公共区域wifi"},{id:101135,title:"宠物携带"},{id:101170,title:"泊车服务"},{id:101197,title:"可加折叠床"}];
var facilities = [{id:101054,title:"卫浴设施"},{id:101056,title:"拖鞋"},{id:101057,title:"电吹风"},{id:101058,title:"浴衣/浴袍"},{id:101059,title:"浴缸"},{id:101060,title:"空调"},{id:101063,title:"DVD机"},{id:101064,title:"电水壶"},{id:101065,title:"小冰箱"},{id:101066,title:"保险箱"},{id:101067,title:"台式电脑"},{id:101068,title:"迷你酒吧"},{id:101070,title:"麻将桌"},{id:101072,title:"写字台"},{id:101074,title:"电话"},{id:101075,title:"电子称"},{id:101077,title:"洗衣机"},{id:101079,title:"厨房"},{id:101080,title:"微波炉"},{id:101081,title:"阳台"},{id:101107,title:"熨斗"},{id:101108,title:"熨衣板"},{id:101109,title:"沙发"},{id:101110,title:"座椅"},{id:101112,title:"暖气"},{id:101113,title:"24小时热水"},{id:101114,title:"独立卫生间"},{id:101115,title:"办公用品（笔、便签）"},{id:101116,title:"茶艺工具"},{id:101117,title:"电视（卫星频道）"},{id:101118,title:"有线电视"},{id:101125,title:"淋浴"},{id:101126,title:"洗漱用具"}];

Page({
    data: {
        detailVisible: false,
        details: {},
        roomDetail: {},
        current: 0,
        phone: '',
        option: {},
        endDate: '',
        startDate: '',
        roomId: '',
        dateVisible: true
    },
    goAlbum(e) {
        wx.navigateTo({
            url: `album?id=${e.currentTarget.dataset.id}`
        });
    },
    goMap() {
        const data = this.data.details.hotel;
        const latitude = Number.parseFloat(data.latitude);
        const longitude = Number.parseFloat(data.longitude);
        wx.openLocation({
            name: data.hotelName,
            address: data.address,
            latitude,
            longitude,
            scale: 18
        });
    },
    swiperchange(e) {
        this.setData({
            current: e.detail.current
        });
    },
    toDetail(e) {
        let avgPrice = '';
        let rebatePrice = '';
        if (e) {
            const id = e.currentTarget.dataset.id;
            this.data.roomId = id;
        }
        this.data.details.room.map(item => {
            if (item.id == this.data.roomId) {
                avgPrice = item.avgPrice;
                rebatePrice = item.rebatePrice;
            }
        });
        this.setData({ current: 0 });
        getData(`1/lib/room_info?id=${this.data.roomId}&token=${app.globalData.token}`).then(res => {
            const data = res.result;
            if (res.code == 100000) {
                let facilitie = [];
                for (let i in data.roomFacilities) {
                    for (let j of facilities) {
                        if (i == j.id) {
                            facilitie.push({
                                ...j, desc: data.roomFacilities[i]
                            });
                        }
                    }
                }
                this.setData({
                    roomDetail: {
                        ...data,
                        avgPrice,
                        facilitie,
                        rebatePrice,
                        floor: data.floor.split(',')
                    },
                });
            }
        });
        this.setData({ detailVisible: true });
    },
    closeDetail() {
        this.setData({ detailVisible: false });
    },
    goPlaceOrder(e) {
        const data = this.data.details;
        const res = e.currentTarget.dataset.data;
        const startDate = `${data.startDate[0]}-${data.startDate[1]}-${data.startDate[2]}`;
        const endDate = `${data.endDate[0]}-${data.endDate[1]}-${data.endDate[2]}`;
        let startWeek = integer(new Date(startDate).getDay());
        let endWeek = integer(new Date(endDate).getDay());
        if (startWeek == 0) {
            startWeek = '日'
        }
        if (endWeek == 0) {
            endWeek = '日'
        }
        wx.navigateTo({
            url: `../place-order/index?id=${res.id}&startWeek=${data.startWeek}&endWeek=${data.endWeek}&dayNum=${data.dayNum}&start=${startDate}&end=${endDate}&price=${res.avgPrice}&rebatePrice=${res.rebatePrice}&hotel_id=${res.hotelId}&goods_id=${res.goodsId}&number=1`
        });
    },
    goCall() {
        wx.makePhoneCall({
            phoneNumber: this.data.phone
        });
    },
    getDetail(ev) {
        const data = this.data;
        getData('1/Xiubao/phone').then(res => {
            data.phone = res.result;
        });
        wx.showLoading({
            title: '加载中...',
            mask: true
        });
        const token = app.globalData.token;
        getData(`1/lib/img_cnt?token=${token}&id=${ev.id}`).then(res => {
            if (res.code == 100000) {
                this.setData({ gridsLen: res.result });
            }
        });
        getData(`1/lib/hotel_info?id=${ev.id}&startDate=${data.startDate}&endDate=${data.endDate}&customer_lat=${ev.latitude}&customer_lon=${ev.longitude}&token=${token}`).then(res => {
            if (res.code == 100000) {
                const data = res.result;
                let service = [];
                if (data){
                    for (let i in data.hotel.service) {
                        for (let j of services) {
                            if (i == j.id) {
                                service.push(j.title);
                            }
                        }
                    }
                    let startDate = '';
                    let endDate = '';
                    let startWeek = '';
                    let endWeek = '';
                    let dayNum = 0;
                    wx.getStorage({
                        key: 'Date',
                        success: (res) => {
                            const date = res.data;
                            dayNum = date[1].chaDay;
                            startDate = date[0].data.split('-');
                            endDate = date[1].data.split('-');
                            startWeek = integer(new Date(date[0].data).getDay());
                            endWeek = integer(new Date(date[1].data).getDay());
                        },
                        fail: () => {
                            dayNum = data.dayNum;
                            startDate = data.startDate.split('-'),
                            endDate = data.endDate.split('-')
                            startWeek = integer(new Date(data.startDate).getDay());
                            endWeek = integer(new Date(data.endDate).getDay());
                        },
                        complete: () => {
                            if (startWeek == 0) {
                                startWeek = '日'
                            }
                            if (endWeek == 0) {
                                endWeek = '日'
                            }
                            const room = data.room.map(item => {
                                return {
                                    ...item,
                                    rebatePrice: Math.floor(item.rebatePrice / 100),
                                    avgPrice: Math.ceil(item.avgPrice / 100)
                                }
                            });
                            const details = {
                                room,
                                service,
                                startWeek,
                                endWeek,
                                hotel: {
                                    ...data.hotel,
                                    avgScore: (data.hotel.avgScore / 10).toFixed(1)
                                },
                                dayNum,
                                startDate,
                                endDate
                            }
                            this.setData({ details });
                            if (ev.roomType) {
                                this.setData({ detailVisible: true });
                                this.data.roomId = ev.roomType;
                                this.toDetail();
                            }
                        }
                    });
                }
            }
            wx.hideLoading();
        });
        this.setData({ dateVisible: true });
    },
    selectDate(){
        this.yunxin();
    },
    yunxin(){
        var that = this;
        this.setData({ dateVisible: false });
        that.rili = that.selectComponent("#rili");
        var dayNum = '';
        var startWeek = '';
        var endWeek = '';
        that.rili.xianShi({
            data: function (res) {
                if (res && res.length == 2) {
                    console.log(res);   //选择的日期
                    const d = new Date();
                    const startDate = res[0].data.split('-');
                    const endDate = res[1].data.split('-');
                    const toDay = d.getDate();
                    const toMonth = d.getMonth() + 1;
                    if (d.getHours() >= 12 && (startDate[1] == toMonth && startDate[2] == toDay)) {
                        wx.showModal({
                            title: '提示',
                            content: '超过中午12点只能选择明天开始!',
                            showCancel: false
                        });
                        return;
                    }
                    const date = new Date(res[0].data).getDay();
                    const date2 = new Date(res[1].data).getDay();
                    if (date == 0) {
                        startWeek = '日'
                    } else {
                        startWeek = integer(date);
                    }
                    if (date2 == 0) {
                        endWeek = '日'
                    } else {
                        endWeek = integer(date2);
                    }
                    dayNum = res[1].chaDay;
                    if (dayNum > 30) {
                        wx.showToast({
                            title: '离店日期与当前日期相差不能超过30天',
                            icon: 'none'
                        });
                    } else {
                        const details = {
                            ...that.data.details,
                            dayNum,
                            startWeek,
                            endWeek,
                            startDate,
                            endDate,
                        }
                        wx.setStorage({
                            key: 'Date',
                            data: {...res, now: Date.now()}
                        });
                        that.setData({
                            details,
                            startDate: res[0].data,
                            endDate: res[1].data
                        });
                        that.getDetail(that.data.option);
                    }

                }
            }
        })
    },
    onLoad(option) {
        this.setData({
            option,
            endDate: option.endDate,
            startDate: option.startDate
        });
        this.getDetail(option);
    },
    onShow() {
        wx.getStorage({
            key: 'Date',
            success: (res) => {
                const cur = new Date(res.data.now).getDate();
                const date = new Date().getDate();
                if (date - cur >= 1) {
                    wx.removeStorage({
                        key: 'Date'
                    });
                }
            }
        });
    }
});