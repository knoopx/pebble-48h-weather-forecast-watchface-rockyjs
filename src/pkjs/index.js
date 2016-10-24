var API_KEY = 'b10ab596261f9eaf470c34a77676aeb1'

var CACHE_TIME = 3600 * 1000 // 1 hour

function fetch(url, resolve, reject){
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.onload = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        reject(new Error('Error while fetching ' + url))
      }
    }
  }
  xhr.send(null)
}

function fetchAndCache(url, resolve, reject) {
  fetch(url, function(data) {
    localStorage.setItem("expiresAt", Date.now() + CACHE_TIME)
    localStorage.setItem("data", JSON.stringify(data))
    resolve(data)
  }, reject)
}

function fetchFromCache(url, resolve, reject){
  var expiresAt = localStorage.getItem("expiresAt")

  if (expiresAt && (Date.now() > expiresAt)) {
    fetchAndCache(url, resolve, reject)
  } else {
    const data = localStorage.getItem("data")
    if (data) {
      resolve(JSON.parse(data))
    } else {
      fetchAndCache(url, resolve, reject)
    }
  }
}

function fetchWeather(latitude, longitude) {
  var url = 'https://api.darksky.net/forecast/' + API_KEY + '/' + latitude + ',' + longitude + '?units=ca&exclude=minutely,currently,flags'
  fetchFromCache(url, function(data){
    Pebble.postMessage({
      icon: data.daily.data[0].icon,
      temperature: data.hourly.data.map(function (data) { return Math.round(data.temperature) }),
      precipitation: data.hourly.data.map(function (data) { return Math.round((data.precipProbability || 0) * 100) })
    })
  }, function(err){
    console.warn(err)
  })
}

function requestLocation() {
  navigator.geolocation.getCurrentPosition(function (pos) {
    var coordinates = pos.coords
    fetchWeather(coordinates.latitude, coordinates.longitude)
  }, function (err) {
    console.warn(err)
  }, {
    timeout: 5000,
    maximumAge: 60000
  })
}

Pebble.addEventListener('message', requestLocation)
