import ShopList from './ShopList'
import * as _ from "lodash";

class Map {
    constructor(data) {
        this.currentLocation = {lat: 37.5759879, lng: 126.9769229};
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 17,
            center: this.currentLocation,
            minZoom: 14,
            maxZoom: 19,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl : false
        });
        this.searchPosition();
        this.data = data
        this.markers = []
        this.userMarker = null
        this.shopDetailTemplate = null
        this.shopFoodDetailTemplate = null
        this.getShopDetailTemplate()
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getShopDetailTemplate() {
        if (!this.shopDetailTemplate) {
            await axios.get('/src/templates/shop_detail.ejs')
                .then((response) => {
                this.shopDetailTemplate = response.data
            })
        }
        if (!this.shopFoodDetailTemplate) {
            await axios.get('/src/templates/shop_detail_foods.ejs')
                .then((response) => {
                this.shopFoodDetailTemplate = response.data
            })
        }
    }

    updatePosition(position) {
        this.setUserMarker(position)
        this.map.setCenter(position);
        this.currentLocation = position
    }

    setUserMarker(position) {
        if (this.userMarker) {
            this.userMarker.setMap(null)
        }
        this.userMarker = new google.maps.Marker({
            position: position,
            map: this.map,
            title: "my location",
            zIndex: 0
        })
    }

    searchPosition() {
        const map = this.map;
        const distanceElement = document.querySelector('.distance-option-list > .selected')
        const distance = parseFloat(distanceElement.dataset['distance'])
        const input = document.getElementById('pac-input');
        const searchBox = new google.maps.places.SearchBox(input);
        map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

        // Bias the SearchBox results towards current map's viewport.
        map.addListener('bounds_changed', () => {
            searchBox.setBounds(map.getBounds());
        });

        // TODO: on map 'zoom_changed', then change markers!
        map.addListener('zoom_changed', () => {
            this.resetMarkerAndInfo()
            const overFiftyMarkersArr = this.markers.slice(50)
            if (map.zoom >= 17) {
                // 건물수준(좁게보기)
                overFiftyMarkersArr.forEach((marker) => {
                    marker.setIcon(marker.categoryIcon)
                })
            } else {
                // 도로 구 수준(넓게보기)
                overFiftyMarkersArr.forEach((marker) => {
                    marker.setIcon(marker.pinIcon)
                    marker.zIndex = 0;
                })
            }
        })

        // Listen for the event fired when the user selects a prediction and retrieve
        // more details for that place.
        searchBox.addListener('places_changed', () => {
            const places = searchBox.getPlaces();

            if (places.length === 0) {
                return;
            }

            // For each place, get the icon, name and location.
            const bounds = new google.maps.LatLngBounds();
            places.forEach((place) => {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }

                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            map.fitBounds(bounds);
            const pos = {
                lat: this.map.center.lat(),
                lng: this.map.center.lng()
            };
            this.reloadMap(distance, pos, this.data, 'distance')
        });
    }

    resetMarkerAndInfo() {
        if (this.infowindow) {
            this.infowindow.close();
            this.xMarker.setIcon((map.zoom >= 17) ? this.xMarker.categoryIcon : this.xMarker.pinIcon)
            this.xMarker.setZIndex((this.map.zoom >= 17) ? 1 : 0)
        }
    }

    setShopMarker(arr, apidata) {
        this.markers.forEach((i) => {
            i.setMap(null)
        })
        this.markers = []

        arr.forEach((e) => {
            const position = {"lat": e.location.latitude, "lng": e.location.longitude}
            const iconImg = '../static/WebMarker/' + e.categoryEnglishName + '.png';
            const SelectedIconImg = '../static/WebMarker/' + e.categoryEnglishName + 'Fill.png'
            const marker = new google.maps.Marker({
                position: position,
                map: this.map,
                zIndex: 1,
                category: e.categoryEnglishName,
                shopNumber: e.shopNumber,
                categoryIcon: {
                    url: iconImg,
                    scaledSize: new google.maps.Size(40, 35)
                },
                filledIcon: {
                    url: SelectedIconImg,
                    scaledSize: new google.maps.Size(40, 35)
                },
                pinIcon: {
                    url: "./static/pin.png",
                    scaledSize: new google.maps.Size(10, 10)
                },
                icon: {
                    url: iconImg,
                    scaledSize: new google.maps.Size(40, 35)
                }
                // TODO: 기본 아이콘 변경
            })
            marker.addListener('click', async () => {
                while (!this.shopDetailTemplate || !this.shopFoodDetailTemplate) {
                    await this.sleep(200)
                }
                const infowindow = new google.maps.InfoWindow({
                    content: _.template(this.shopDetailTemplate)(e) // TODO: 여기에 template rendering 넣어주기
                });
                this.resetMarkerAndInfo()
                this.map.setCenter(marker.getPosition());
                infowindow.open(map, marker);
                // TODO: shop_detail_foods.ejs 렌더링 & innerHTML
                apidata.getShopFoodData(e.shopNumber).then((response) => {
                    const foodDetails = document.querySelector('#foodDetails')
                    const foodDetailsContent = _.template(this.shopFoodDetailTemplate)({
                        allCategoryFoodList: response.data
                    })
                    foodDetails.innerHTML = foodDetailsContent
                })

                this.infowindow = infowindow;
                this.xMarker = marker;
                this.xMarkerIcon = marker.icon
                //선택된 마커를 fill 마커로 변경
                marker.setIcon(marker.filledIcon);
                // 선택된 마커 z-index 값 부여를 통해 지도 위에서 가시성 확보
                marker.setZIndex(2);
                //리스트 연동부분
                if (document.querySelector(".selected-shop")) {
                    document.querySelector(".selected-shop").classList.remove("selected-shop");
                }
                document.querySelector(".shop-list").scrollTop += document.getElementById(e.shopNumber).getBoundingClientRect().top - 50;
                document.getElementById(e.shopNumber).childNodes[1].classList.add("selected-shop");
            });
            this.markers.push(marker)
        });
    }

    reloadMap(distance, pos, apidata, key, order, categoryList) {
        // Reset markers
        for (let i of this.markers) {
            i.setMap(null)
        }
        this.markers = []

        // Update my Position
        this.updatePosition(pos)
        // if starPointAverage: reverse
        if (key === 'distance') {
            order = 'asc'
        } else {
            order = 'desc'
        }

        // Get new data from my new position
        apidata.getShopData(pos)
        let sortedData = null
        if (categoryList) {
            sortedData = apidata.getShopListByCategoryList(distance, categoryList, key, order)
        } else {
            sortedData = apidata.getShopListAll(distance, key, order)
        }
        sortedData.then((filteredData) => {
            this.setShopMarker(filteredData, apidata)
            new ShopList("#shopList", filteredData, this.markers)
        })
    }
}

export default Map