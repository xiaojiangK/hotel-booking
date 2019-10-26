//  格式化入住期限
const formatDuration = () => {
  let currentDate = new Date();
  let tomorrowDate = new Date(currentDate.getTime() + 24*60*60*1000);
  let cMonth = currentDate.getMonth() +1;
  let cDate = currentDate.getDate();
  let tMonth = tomorrowDate.getMonth() +1;
  let tDate = tomorrowDate.getDate();
  return {
    today: `${cMonth < 10 ? '0' + cMonth : cMonth}月${cDate < 10 ? '0' + cDate : cDate}日`,
    tomorrow: `${tMonth < 10 ? '0' + tMonth : tMonth}月${tDate < 10 ? '0' + tDate : tDate}日`
  };
}

const wxPromisify = fn => {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        resolve(res)
      }
      obj.fail = function (res) {
        reject(res)
      }
      fn(obj)
    })
  }
}

module.exports = {
  formatDuration,
  wxPromisify: wxPromisify
}
