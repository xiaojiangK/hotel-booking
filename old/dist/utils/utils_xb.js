// var baseUrl = 'http://api.xiubao.cc/';


export function getjsonData() {
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


