const config = require('../config/index');
import dayjs from 'dayjs.js';

export function getData(url) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: config.baseURL + url,
            method: 'GET',
            header: {
                "Content-Type": "json"
            },
            success: (res) => {
                resolve(res.data);
            },
            fail: (error) => {
                reject(error)
            }
        });
    });
}

export function getXBData(url) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: url,
      method: 'GET',
      header: {
        "Content-Type": "json"
      },
      success: (res) => {
        resolve(res.data);
      },
      fail: (error) => {
        reject(error)
      }
    });
  });
}

export function postData(url, data) {
    return new Promise(function (resolve, reject) {
        wx.request({
            url: config.baseURL + url,
            method: 'POST',
            data,
            header: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            success: function (res) {
                resolve(res.data);
            },
            fail: function (error) {
                reject(error)
            }
        });
    });
}

export function postXBData(data) {
  return new Promise(function (resolve, reject) {
    wx.request({
      url: "https://u.showboom.cn/ucenter/device/api/index",
      method: 'POST',
      data:data,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: function (res) {
        resolve(res.data);
      },
      fail: function (error) {
        reject(error)
      }
    });
  });
}
// 小写转大写
export function integer(num) {
    let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
    let unit = ["", "十", "百", "千", "万"];
    num = parseInt(num);
    let getWan = (temp) => {
        let strArr = temp.toString().split("").reverse();
        let newNum = "";
        for (var i = 0; i < strArr.length; i++) {
            newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
        }
        return newNum;
    }
    let overWan = Math.floor(num / 10000);
    let noWan = num % 10000;
    if (noWan.toString().length < 4) noWan = "0" + noWan;
    return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
}

// 验证手机号
export function isPhone(phone) {
    let myreg = /^1[23456789][0-9]{9}$/;
    return myreg.test(phone);
}

// 倒计时
export function countDown(time, that) {
    const date1 = dayjs(time * 1000 + (60 * 30 * 1000));
    const date2 = dayjs(Date.now());
    if (date1 > date2) {
        const hour = date1.diff(date2, 'hour');
        const date3 = date2.add(hour, 'hour');
        const minute = date1.diff(date3, 'minute');
        const date4 = date3.add(minute, 'minute');
        const second = date1.diff(date4, 'second');
        that.setData({
            time: (minute < 10 ? '0'+minute : minute || '00') +':'+ (second < 10 ? '0'+second : second || '00')
        });
    }
}

export function formatDateTime(time) {
    const date = new Date(time);
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const h = date.getHours();
    const n = date.getMinutes();
    const s = date.getSeconds();
    return `${date.getFullYear()}-${m < 10 ? '0'+m : m}-${d < 10 ? '0'+d : d} ${h < 10 ? '0'+h : h}:${n < 10 ? '0'+n : n}:${s < 10 ? '0'+s : s}`;
}

export function formatTime(time) {
    const date = new Date(time);
    const h = date.getHours();
    const n = date.getMinutes();
    const s = date.getSeconds();
    return `${h < 10 ? '0'+h : h}:${n < 10 ? '0'+n : n}:${s < 10 ? '0'+s : s}`;
}

export function formatDate(time) {
    const date = new Date(time);
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${date.getFullYear()}-${m < 10 ? '0'+m : m}-${d < 10 ? '0'+d : d}`;
}

export function formatMonth(time) {
    const date = new Date(time);
    const m = date.getMonth() + 1;
    const d = date.getDate();
    return `${m < 10 ? '0'+m : m}月${d < 10 ? '0'+d : d}日`;
}
