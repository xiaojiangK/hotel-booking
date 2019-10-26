Component({
    properties: {
        visible: {
            type: Boolean,
            value: false
        },
        priceId: {
            type: String,
            value: '',
            observer: function(newVal, oldVal) {
                if (newVal == '') {
                    const price = this.data.price.map(item => {
                        return {
                            ...item,
                            active: false
                        }
                    });
                    this.setData({ price });
                }
            }
        },
        starId: {
            type: String,
            value: '',
            observer: function(newVal, oldVal) {
                if (newVal == '') {
                    const star = this.data.star.map(item => {
                        return {
                            ...item,
                            active: false
                        }
                    });
                    this.setData({ star });
                }
            }
        }
    },
    data: {
        star: [
            {
                id: '2',
                title: '经济型',
                active: false
            },
            {
                id: '3',
                title: '舒适/三星',
                active: false
            },
            {
                id: '4',
                title: '高档/四星',
                active: false
            },
            {
                id: '5',
                title: '豪华/五星',
                active: false
            }
        ],
        price: [
            {
                id: '0,150',
                title: '150以下',
                active: false
            },
            {
                id: '150,300',
                title: '150-300',
                active: false
            },
            {
                id: '300,450',
                title: '300-450',
                active: false
            },
            {
                id: '450,600',
                title: '450-600',
                active: false
            },
            {
                id: '600,1000',
                title: '600-1000',
                active: false
            },
            {
                id: '1000,100000',
                title: '1000以上',
                active: false
            }
        ]
    },
    methods: {
        closeStar() {
            this.triggerEvent('close');
        },    
        // 星级筛选
        selectStar(ev) {
            const star = this.data.star.map((item, index) => {
                if (ev.target.dataset.idx == index) {
                    item.active ? item.active = false : item.active = true;
                }
                else {
                    item.active = false;
                }
                return item;
            });
            this.setData({ star });
        },
        selectPrice(ev) {
            const price = this.data.price.map((item, index) => {
                if (ev.target.dataset.idx == index) {
                    item.active ? item.active = false : item.active = true;
                }
                else {
                    item.active = false;
                }
                return item;
            });
            this.setData({ price });
        },
        resetStar() {
            const star = this.data.star.map(item => {
                return {
                    ...item,
                    active: false
                };
            });
            const price = this.data.price.map((item, index) => {
                return {
                    ...item,
                    active: false
                };
            });
            this.setData({ star, price });
        },
        submitStar() {
            const star = this.data.star.filter(item => item.active);
            const price = this.data.price.filter(item => item.active);
            this.triggerEvent('submit', { star, price });
        }
    }
  })