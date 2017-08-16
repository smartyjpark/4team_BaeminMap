import ShopList from './ShopList'
import Map from './Map'
import Data from './Data'


// const myData = new Data();
// const myMap = new Map();
// myData.getShopList([1], myMap.currentLocation)
// myMap.setShopMarker(myData.shopListObj);

``

function getToken() {
    const baseUrl = "http://localhost:8080/";
    const tokenUrl = "http://auth-beta.baemin.com/oauth/authorize?response_type=token&redirect_uri=http://localhost:8080&client_id=techCampTeamB&scope=read";
    let apiToken = "";

    function checkToken() {
        console.log("checkToken")
        if (document.location.href === baseUrl) {
            redirectPage(tokenUrl)
        } else {
            parseToken()
        }
    }

    function redirectPage(url) {
        if (apiToken === '') {
            location.href = url
        }
    }

    function parseToken() {
        apiToken = location.href.split("#access_token=")[1].split("&")[0];
        console.log(apiToken)
    }

    checkToken()

    return apiToken
}

function filterEventOn(tar) {
    const eventHTML = document.querySelector(tar);
    eventHTML.addEventListener("click", function (e) {
        let target = e.target;
        if (target.className === "category selected") {
            target.className = "category"
        } else if (target.className === "category") {
            target.className = "category selected"
        }

    })
}


document.addEventListener('DOMContentLoaded', () => {
    const token = getToken()
    navigator.geolocation.getCurrentPosition((position) => {
        const data = new Data();
        const map = new Map(data, token);
        const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
        console.log('get position: ', pos)

        map.reloadMap(pos, data, token)
    })
    filterEventOn(".category-list")
})