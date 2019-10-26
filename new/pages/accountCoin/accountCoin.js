/**
 *  个人中心金币页
 */
import { getData } from './../../utils/util-1';
var app =  getApp();

Page({
    data: {
        gold: 0,
        logs: [],
        pupupVisible: true
    },
    closepupup() {
        this.setData({ pupupVisible: false });
    },
    goExtract(e) {
        wx.navigateTo({
            url: `/pages/accountCoinWithdraw/accountCoinWithdraw?gold=${e.currentTarget.dataset.gold}`
        });
    },
    getScoreLog() {
        getData(`1/User/Score_Logs?token=${app.globalData.token}`).then(res => {
            if (res.code == 100000) {
                let logs = [];
                const score = res.result.scoreLogDatas;
                for (let i of score) {
                    const reduce = i.incr.split('-');
                    logs.push({...i, add: reduce.length == 1});
                }
                this.setData({ logs });
            }
        });
    },
    onLoad(option) {
        this.setData({ gold: option.gold });
        this.getScoreLog();        
    }
});