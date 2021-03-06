import axios from 'axios'

export default class ApiData {
    constructor(position) {
        this.baseURL = "https://pzldoy5f61.execute-api.ap-northeast-2.amazonaws.com/latest"
        this.getShopURL = this.baseURL + "/shops"
        this.initData(position)
    }

    initData(position) {
        this.data = null
        this.shopData = null
        if (position) {
            this.position = position
        } else {
            this.position = {
                lat: '37.5169697',
                lng: '127.1137412'
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    compareValues(key, order) {
        return function (a, b) {
            if (!a.hasOwnProperty(key) ||
                !b.hasOwnProperty(key)) {
                return 0;
            }

            const varA = a[key]
            const varB = b[key]

            let comparison = 0;
            if (varA > varB) {
                comparison = 1;
            } else if (varA < varB) {
                comparison = -1;
            }
            return (
                (order === 'desc') ?
                    (comparison * -1) : comparison
            );
        };
    }

    async getShopData(position) {
        this.data = null
        const body = Object.assign(position, {type: 1})
        const response = await axios.post(
            this.getShopURL,
            body
        )
        this.data = response.data
    }

    getShopFoodData(shopNumber) {
        return axios.get(
            this.baseURL + "/menu/" + shopNumber
        )
    }

    async getShopListAll(distance, key, order) {
        while (!this.data) {
            await this.sleep(200)
        }
        const _list = this.data.shopArray
        const result = _list.sort(this.compareValues(key, order)).filter((el) => {
            return el.distance < distance
        })
        return result
    }

    async getShopListByCategoryList(distance, categoryList, key, order) {
        while (!this.data) {
            await this.sleep(200)
        }
        const _list = []
        for (const i of categoryList) {
            for (const j of this.data.shops[i]) {
                _list.push(j)
            }
        }
        return _list.sort(this.compareValues(key, order)).filter((el) => {
            return el.distance < distance
        })
    }
}
