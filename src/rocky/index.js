var rocky = require('rocky')

var TIME_FONT = '38px bold numbers Leco-numbers'
var DATE_FONT = '18px Gothic'
var FORECAST_HOURS = 48
var RING_GUTTER = 1.50
var RING_TICK_WIDTH = (360.00 / FORECAST_HOURS) - RING_GUTTER
var TEMPERATURE_TICK_HEIGHT = 18.00
var PRECIPITATION_TICK_HEIGHT = 6.00
var TEXT_COLOR = "white"
var BACKGROUND_COLOR = "black"

var data = {
  temperature: [],
  precipitation: [],
  icon: null
}

function getTemperatureColor(temp) {
  if (!temp) { return "#555555" }
  if (temp > 24) { return "#FF0000" }
  if (temp > 22) { return "#FF5500" }
  if (temp > 20) { return "#FFAA55" }
  if (temp > 18) { return "#FFFF55" }
  if (temp > 16) { return "#FFFFAA" }
  if (temp > 12) { return "#AAFFFF" }
  if (temp > 10) { return "#00AAFF" }
  if (temp < 0) { return "#FFFFFF" }
  return "#0000FF"
}

function getPrecipitationColor(precipitation) {
  if (precipitation > 50) { return "#AAFFFF" }
  if (precipitation > 25) { return "#00FFFF" }
  if (precipitation > 10) { return "#00AAFF" }
  if (precipitation > 5) { return "#0055AA" }
  return "#000000"
}

function getTemperatureTickHeight(i, date) {
  var offset = date.getHours()

  if ((i + offset) % 12 == 0) {
    return TEMPERATURE_TICK_HEIGHT + 6.0
  } else {
    if ((i + offset) % 6 == 0) {
      return TEMPERATURE_TICK_HEIGHT + 2.0
    } else {
      return TEMPERATURE_TICK_HEIGHT
    }
  }
}

function clearCanvas(ctx){
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight)
}

function getTimeText(date) {
  return date.toLocaleTimeString().split(' ')[0].split(':').slice(0, 2).join(':')
}

function getDateText(date) {
  var day = date.toLocaleDateString(undefined, ({day: 'numeric'}))
  var month = date.toLocaleDateString(undefined, ({month: 'long'}))
  return day + ' ' + month
}

function drawTimeAndDate(ctx, date) {
  var centerX = ctx.canvas.clientWidth / 2
  var centerY = ctx.canvas.clientHeight / 2

  var timeText = getTimeText(date)
  var dateText = getDateText(date)

  ctx.save()

  ctx.fillStyle = TEXT_COLOR
  ctx.textAlign = 'center'

  ctx.font = TIME_FONT
  var timeBounds = ctx.measureText(timeText)
  var timeY = centerY - (timeBounds.height / 2) - 10
  ctx.fillText(timeText, centerX, timeY)

  ctx.font = DATE_FONT
  ctx.fillText(dateText, centerX, timeY + timeBounds.height)

  ctx.restore()
}

function drawTick(ctx, innerRadius, outterRadius, start, end, color) {
  var x = ctx.canvas.clientWidth / 2
  var y = ctx.canvas.clientHeight / 2
  ctx.fillStyle = color
  ctx.rockyFillRadial(x, y, innerRadius, outterRadius, start * Math.PI/180, end * Math.PI/180)
}

function drawTemperatureRingTick(ctx, start, end, color, height) {
  var outterRadius = (ctx.canvas.clientWidth / 2)
  var innerRadius = outterRadius - height
  drawTick(ctx, innerRadius, outterRadius, start, end, color)
}

function drawPrecipitationRingTick(ctx, start, end, color, offset) {
  var outterRadius = (ctx.canvas.clientWidth / 2) - offset - RING_GUTTER
  var innerRadius = outterRadius - PRECIPITATION_TICK_HEIGHT
  drawTick(ctx, innerRadius, outterRadius, start, end, color)
}

function drawWeatherRing(ctx, date) {
  for (var i = 1; i < FORECAST_HOURS; i++) {
    var start = (360.00 / FORECAST_HOURS * i) - ((RING_TICK_WIDTH + RING_GUTTER) / 2) - 90
    var end = start + RING_TICK_WIDTH
    var tempTickHeight = getTemperatureTickHeight(i, date)
    drawTemperatureRingTick(ctx, start, end, getTemperatureColor(data.temperature[i]), tempTickHeight)
    drawPrecipitationRingTick(ctx, start, end, getPrecipitationColor(data.precipitation[i]), tempTickHeight)
  }
}

rocky.on('draw', function(event) {
  var ctx = event.context
  var date = new Date()

  clearCanvas(ctx)
  drawTimeAndDate(ctx, date)
  drawWeatherRing(ctx, date)
})

rocky.on('minutechange', function(event) {
  rocky.requestDraw()
})

rocky.on('hourchange', function(event) {
  rocky.postMessage({'fetch': true})
})

rocky.on("message", function(e){
  data = e.data
  rocky.requestDraw()
})
