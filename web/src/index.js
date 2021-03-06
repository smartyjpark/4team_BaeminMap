import ShopList from './ShopList'
import Map from './Map'
import ApiData from './ApiData'

function filterReset(filterChecker, targetArr) {
    if (!filterChecker) {
        return false
    }
    const allOption = document.querySelectorAll(".selected");
    allOption.forEach((e) => {
        e.classList.remove("selected")
    })
    filterChecker.forEach((e) => {
        e.classList.add("selected");
    });
}

function categoryFilterEvent(tar) {
    const eventHTML = document.querySelector(tar);
    const categoryAll = document.querySelector("#category-all");

    eventHTML.addEventListener("click", function (e) {
        let target = e.target;
        if (target.tagName !== "LI") {
            return false
        }
        if (target.id === "category-all" && !target.classList.contains("selected")) {
            const selectedCategoryArr = document.querySelectorAll(".category.selected");
            selectedCategoryArr.forEach((e) => {
                e.classList.remove("selected");
            });
            target.classList.add("selected");
        } else if (target.id !== "category-all" && target.classList.contains("selected")) {
            target.classList.remove("selected");
            if (document.querySelectorAll(".category.selected")[0] === undefined) {
                document.querySelector('#category-all').classList.add("selected")
            }
        } else if (!target.classList.contains("selected")) {
            categoryAll.classList.remove("selected");
            target.classList.add("selected");
        }
    })
}

function filterEvent(arr, filter, layer, map, pos, apidata, condition) {
    const overLayer = document.querySelector(layer)
    const filterSection = document.querySelector(filter)
    let filterChecker;
    arr.forEach((e) => {
        const target = document.querySelector(e)
        target.addEventListener("click", function () {
            if (e === arr[0]) {
                // 필터 화면 보기 버튼
                filterSection.classList.add('show')
                overLayer.classList.add('show')
                filterChecker = document.querySelectorAll(".option.selected");
            } else if (e === arr[1]) {
                // 필터 내 취소 버튼
                filterSection.classList.remove('show')
                overLayer.classList.remove('show')
                //필터링 취소버튼을 누르면 필터값이 초기화된다.
                filterReset(filterChecker, [".category", ".sort-option", "distance-option"]);
            } else if (e === arr[2]) {
                //필터 내 적용버튼
                //현재 설정 창을 업데이트
                updateCurrentSettingHTML('.sort-option', '.distance-option')
                filterSection.classList.remove('show')
                overLayer.classList.remove('show')
                //현재의 필터/정렬 옵션을 저장한다
                filterChecker = document.querySelectorAll(".option.selected");
                //TODO : 여기에 필터 적용해서 소트 요청하는 로직 구현
                // 순서 정렬
                condition = document.querySelector('.sort-option.selected').id.replace('sort-option-', '')
                // 카테고리정렬
                let categoryList = []
                for (const i of filterChecker) {
                    const _categoryId = parseInt(i.id.replace('category-', ''))
                    if (typeof _categoryId === 'number' && !isNaN(_categoryId)) {
                        categoryList.push(_categoryId)
                    }
                }
                categoryList = (categoryList[0] === undefined) ? null : categoryList
                // 거리별 정렬
                const distanceElement = document.querySelector('.distance-option-list > .selected')
                const distance = parseFloat(distanceElement.dataset['distance'])
                //shop-list 스크롤 초기화
                map.reloadMap(distance, (map.currentLocation) ? map.currentLocation : pos, apidata, condition, null, categoryList)
            }
        })
    })
}

function sortByOption(tar, option) {
    const eventTarget = document.querySelector(tar)
    eventTarget.addEventListener("click", function (e) {
        let target = e.target;
        if (target.tagName === "LI" && target.classList.contains("sort-option") && option === "sort") {
            document.querySelector(".sort-option.selected").classList.remove("selected");
            target.classList.add("selected");
        } else if (target.tagName === "LI" && target.classList.contains("distance-option") && option === "distance") {
            document.querySelector(".distance-option.selected").classList.remove("selected");
            target.classList.add("selected");
        }
    });
}

function toggleCSSOnClick(el, target, css) {
    document.querySelector(el).addEventListener('click', (e) => {
        const list = document.querySelector(target)
        if (list.classList.contains(css)) {
            list.classList.remove(css)
        } else {
            list.classList.add(css)
        }
    })
}

function moveMyCurrentLocation(target, map){
    document.querySelector(target).addEventListener('click', () => {
        map.updatePosition(map.currentLocation);
        map.gmap.setZoom(18)
    })
}

function updateCurrentSettingHTML(sortClass, distanceClass) {
    const sortOption = document.querySelector(sortClass+".selected");
    const distanceOption = document.querySelector(distanceClass+".selected");
    const sortHTML = document.querySelector('.filter-current-sort');
    const distanceHTML = document.querySelector('.filter-current-distance')
    sortHTML.innerHTML = sortOption.title
    distanceHTML.innerHTML = distanceOption.title
}

function setScrollTopButtonEvent(buttonClass, shopListClass) {
    const shopList = document.querySelector(shopListClass)
    const button = document.querySelector(buttonClass)
    button.addEventListener('click', () => {
        shopList.scrollTop = 0;
    })
    shopList.addEventListener('scroll', (e)=>{
        if (e.target.scrollTop === 0 ){
            map.setScrollTopButtonHidden()
        } else {
            button.classList.add('show')
        }
    })
}

// document.addEventListener('DOMContentLoaded', () => {
const options = {
    enableHighAccuracy: false,
    timeout: 50,
    maximumAge: Infinity
};

const indicator = document.querySelector('#indicator')
const shopIndicator = document.querySelector('#shopIndicator')
let apidata;
let map;

navigator.geolocation.getCurrentPosition((position) => {
    const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
    }
    apidata = new ApiData(pos);
    map = new Map(apidata);
    // Default search range: 300m(0.3km)
    const distanceElement = document.querySelector('.distance-option-list > .selected')
    const distance = parseFloat(distanceElement.dataset['distance'])
    // Default Condition: distance
    let condition = 'distance'
    // Get all data and render them
    map.reloadMap(distance, pos, apidata, condition, undefined, undefined, true)
    categoryFilterEvent(".category-list");
    sortByOption(".sort-option-list", "sort");
    sortByOption(".distance-option-list", condition);
    filterEvent(
        [".filter-button-wrapper", ".cancel-filter-button", ".apply-filter-button"],
        ".filter-controller",
        ".layer",
        map,
        pos,
        apidata,
        condition
    );
    setScrollTopButtonEvent('.move-top-scroll-button', '.shop-list')
    moveMyCurrentLocation('.my-location', map)
})
// Add Events on Click
// click el, target, css class
toggleCSSOnClick('#listOnOff', '#list', 'mobile-hidden')
toggleCSSOnClick('#filterOnOff', '.filter-controller', 'show')
document.querySelector("#listOnOff").addEventListener("click", () => {
    const card = document.querySelector("#card")
    const floatButton = document.querySelector('.floating-button')
    if (card.style.display === "block") {
        card.style.display = "none";
        floatButton.style.bottom = "40px";
    }
})

function cardClickListener() {
    document.querySelector("#card").addEventListener("click", (e) => {
        const shopNumber = e.target.dataset.shopnumber;
        const data = map.filteredData.filter((i) => {
            return i.shopNumber == shopNumber
        })[0]
        map.showModal(shopNumber)
    })
}

cardClickListener()

const toggleFloatingButtonLocation = (floatButton, visibleTarget) => {
    if (visibleTarget.style.display !== 'block') {
        return
    }
    const floatButtonBottom = parseInt(floatButton.style.bottom.replace("px", ""))
    if (floatButtonBottom > 100) {
        floatButton.style.bottom = "40px";
    } else {
        floatButton.style.bottom = "140px";
    }
}

//When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    const span = document.getElementsByClassName("close")[0];
    if (event.target === modal || event.target === span) {
        modal.style.display = "none"
        if(window.innerWidth > 480 && event.target === span && map.isDuplicatedList === true){
            map.setMapOverLayerShow();
        }else if(window.innerWidth > 480){
            map.resetMarkerAndInfo();
            map.setMapOverLayerHidden();
            map.resetHiddenList();
        }
    }
    if (window.innerWidth > 480) return true;
    const xm = map.xMarker
    xm.setIcon(map.xMarkerIcon)
    const floatButton = document.querySelector('.floating-button')
    const visibleTarget = document.querySelector('#card')
    toggleFloatingButtonLocation(floatButton, visibleTarget)
    visibleTarget.style.display = 'none'
}
