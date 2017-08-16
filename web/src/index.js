import ShopList from './ShopList'
import Map from './Map'
import ApiData from './ApiData'

function filterReset(filterChecker, targetArr){
    const allOption = document.querySelectorAll(".selected");
    allOption.forEach((e) => {
        e.classList.remove("selected")
    })
    filterChecker.forEach((e) => {
        e.classList.add("selected");
    });
}

function categoryFilterEvent(tar){
    const eventHTML = document.querySelector(tar);
    const categoryAll = document.querySelector("#category-all");

    eventHTML.addEventListener("click", function (e) {
        let target = e.target;
        if (target.tagName !== "LI"){
            return false
        }
        if (target.id === "category-all" && !target.classList.contains("selected")){
            const selectedCategoryArr = document.querySelectorAll(".category.selected");
            selectedCategoryArr.forEach((e)=>{
                e.classList.remove("selected");
            });
            target.classList.add("selected");
        } else if (target.id !== "category-all" && target.classList.contains("selected")){
            target.classList.remove("selected");
        } else if (!target.classList.contains("selected")){
                categoryAll.classList.remove("selected");
                target.classList.add("selected");
        }
    })
}

function filterEvent(arr, filter, layer, map, pos, apidata, condition) {
    const overLayer = document.querySelector(layer)
    const filterSection = document.querySelector(filter)
    let filterChecker;
    arr.forEach((e)=>{
        const target = document.querySelector(e)
        target.addEventListener("click", function(){
            if (e === arr[0]){
                filterSection.style.transform = "translateY(calc(100% - 50px))";
                overLayer.style.zIndex = "1";
                filterChecker = document.querySelectorAll(".option.selected");
            } else if (e === arr[1]){
                filterSection.style.transform = "translateY(0)";
                overLayer.style.zIndex = "0";
                //필터링 취소버튼을 누르면 필터값이 초기화된다.
                filterReset(filterChecker, [".category", ".sort-option", "distance-option"]);
            } else if (e === arr[2]){
                filterSection.style.transform = "translateY(0)";
                overLayer.style.zIndex = "0";
                //현재의 필터/정렬 옵션을 저장한다
                filterChecker = document.querySelectorAll(".option.selected");
                //TODO : 여기에 필터 적용해서 소트 요청하는 로직 구현
                const distanceElement = document.querySelector('.distance-option-list > .selected')
                const distance = parseFloat(distanceElement.dataset['distance'])
                map.reloadMap(distance, pos, apidata, condition)
            }
        })
    })
}

function sortByOption(tar, option){
    const eventTarget = document.querySelector(tar)
    eventTarget.addEventListener("click", function(e){
        let target = e.target;
        if (target.tagName === "LI" && target.classList.contains("sort-option") && option === "sort"){
            document.querySelector(".sort-option.selected").classList.remove("selected");
            target.classList.add("selected");
        } else if (target.tagName === "LI" && target.classList.contains("distance-option") && option === "distance") {
            document.querySelector(".distance-option.selected").classList.remove("selected");
            target.classList.add("selected");
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }
        const apidata = new ApiData(pos);
        const map = new Map(apidata);
        // Default search range: 300m(0.3km)
        const distanceElement = document.querySelector('.distance-option-list > .selected')
        const distance = parseFloat(distanceElement.dataset['distance'])
        // Default Condition: distance
        let condition = 'distance'
        // Get all data and render them
        map.reloadMap(distance, pos, apidata, condition)
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
    })
})