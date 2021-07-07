
var apiKey = "7bbe0bc97d207eda76a06b5be7274f19"

searchBtnEl.addEventListener("click", searchCity);

function searchCity(e) {
    e.preventDefault();
    if (userInputEl.value != "") {
        getAPI1(userInputEl.value)
    }
}

function getAPI1(city) {

   var bgWidth = 1600
   var bgHeight = 900
    if (window.screen.width <= 700) {
    bgWidth = 700
    bgHeight = 900
    }


    document.body.style.backgroundImage = "url('https://source.unsplash.com/"
    + bgWidth 
    + "x"
    + bgHeight 
    + "/?" + city + "')"

    fetch("https://api.openweathermap.org/data/2.5/weather?q="
        + city
        + "&units=imperial&appid="
        + apiKey)

        .then(function (response) {
            console.log("R1: " + response.status);

            if (response.status !== 200) {
                response.text.textContent = response.status;
            }
            else {

                recentSearch = city
                searchHistory(recentSearch)
            }

            return response.json()

        })
        .then(function (data) {
            console.log(data)
            displayWeather1(data)
            console.log("api1 lat = " + data.coord.lat)
            console.log("api1 lon = " + data.coord.lon)

            getAPI2(data.coord.lat, data.coord.lon)

        });
}