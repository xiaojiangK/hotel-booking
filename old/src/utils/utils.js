// var baseUrl = 'http://api.xiubao.cc/';
var baseUrl = 'https://api.sulvtrip.cn/'
import dayjs from 'dayjs.js';

export function getData(url) {
    return new Promise((resolve, reject) => {
        wx.request({
            url: baseUrl + url,
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
            url: baseUrl + url,
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
export function setTime(time) {
    const date1 = dayjs(time * 1000 + (60 * 30 * 1000));
    const date2 = dayjs(Date.now());
    if (date1 > date2) {
        const hour = date1.diff(date2, 'hour');
        const date3 = date2.add(hour, 'hour');
        const minute = date1.diff(date3, 'minute');
        const date4 = date3.add(minute, 'minute');
        const second = date1.diff(date4, 'second');
        return [minute < 10 ? '0'+minute : minute || '00', second < 10 ? '0'+second : second || '00'];
    }
    else {
        return [];
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

export function xxx() {
  // private property
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  // public method for encoding
  this.encode = function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = _utf8_encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output +
        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
    }
    return output;
  }
  // public method for decoding
  this.decode = function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = _keyStr.indexOf(input.charAt(i++));
      enc2 = _keyStr.indexOf(input.charAt(i++));
      enc3 = _keyStr.indexOf(input.charAt(i++));
      enc4 = _keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = _utf8_decode(output);
    return output;
  }

  // private method for UTF-8 encoding
  var _utf8_encode = function (string) {
    string = string.replace(/\r\n/g, "\n");
    var utftext = "";
    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }

    }
    return utftext;
  }

  // private method for UTF-8 decoding
  var _utf8_decode = function (utftext) {
    var string = "";
    var i = 0;
    var c = 0, c1 = 0, c2 = 0, c3 = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if ((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
}

export function base64_decode(input) {
  var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";  
  var output = "";
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
  while (i < input.length) {
    enc1 = _keyStr.indexOf(input.charAt(i++));
    enc2 = _keyStr.indexOf(input.charAt(i++));
    enc3 = _keyStr.indexOf(input.charAt(i++));
    enc4 = _keyStr.indexOf(input.charAt(i++));
    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;
    output = output + String.fromCharCode(chr1);
    if (enc3 != 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 != 64) {
      output = output + String.fromCharCode(chr3);
    }
  }
  output = utf8_decode(output);
  return output;
} 

export function utf8_decode (utftext) {
  var string = "";
  var i = 0;
  var c = 0, c1 = 0, c2 = 0, c3 = 0;
  while (i < utftext.length) {
    c = utftext.charCodeAt(i);
    if (c < 128) {
      string += String.fromCharCode(c);
      i++;
    } else if ((c > 191) && (c < 224)) {
      c2 = utftext.charCodeAt(i + 1);
      string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
      i += 2;
    } else {
      c2 = utftext.charCodeAt(i + 1);
      c3 = utftext.charCodeAt(i + 2);
      string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
      i += 3;
    }
  }
  return string;
}

export function strspace(str, n) {
  var Newstr = '';
  if (!str) { return '- -'; }
  for (var i = 0; i < str.length - 1; i++) {
    Newstr += str.substring(i, i + 1)
    if ((i + 1) % n == 0) {
      Newstr += ' ';
    }
  }
  Newstr += str.substring(str.length - 1, str.length);
  return Newstr;
}