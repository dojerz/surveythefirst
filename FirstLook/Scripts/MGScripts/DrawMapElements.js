
// init the map

var centerOnInitLat = 47.501;
var centerOnInitLon = 19.053;
var zoomLevOnInit = 8;

var map = L.map('Map').setView([centerOnInitLat, centerOnInitLon], zoomLevOnInit);

var ggl = new L.gridLayer.googleMutant({ type: 'satellite' });
var gglTerra = new L.gridLayer.googleMutant('TERRAIN');
var gglRoad = new L.gridLayer.googleMutant({ type: 'roadmap' });

var MapBoxTiles = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
});
map.addLayer(MapBoxTiles);
map.addControl(new L.Control.Layers({ 'Google road': gglRoad, 'Google SAT': ggl, 'MapBox': MapBoxTiles }, {}));

// tower icons

var towerIconUnselected;
var towerIconSelected;

// draw functions

/*var surveyMarker;
var baseIcons;
var circle;
var surveyLine;*/

function drawElementsOnMap() {

    var lat = getLatForClient();
    var lon = getLonForClient();
    var r = getRadiusForClient();
    var usBCoords = getUnSelectedBasesCoords();
    if (baseIcons.length > 0)
    {
        for (var i = 0; i < baseIcons.length; i++)
        {
            map.removeLayer(baseIcons[i]);
        }
        baseIcons = new Array();
    }
    for (var i = 0; i < usBCoords.length; i++)
    {
        baseIcons.push(new L.marker(usBCoords[i], { icon: towerIconUnselected, baseID: i }).on('click', clickOnBaseEvent));
    }
    /*for (var i = 0; i < baseIcons.length; i++)
    {
        alert(baseIcons[i].options.baseID);
    }*/
    if (selectedRowIndex)
    {
        var sBCoords = getSelectedBaseCoords();
        baseIcons.push(new L.marker(sBCoords, { icon: towerIconSelected }));
    }
    for (var i = 0; i < baseIcons.length; i++)
    {
        map.addLayer(baseIcons[i]);
    }
    drawSurveyMarker(lat, lon, r);
    drawSurveyLine(lat, lon);
    getAngle(lat, lon);
}

/*function clickOnBaseEvent()
{
    alert("click");
    var iconName = this.options.icon;
    if( iconName == towerIconUnselected )
    {
        this.options.icon = towerIconSelected;
    }
    else
    {
        this.options.icon = towerIconUnselected;
    }
}*/

function drawSurveyMarker(lat, lon, r)
{
    var circleMeter = r * 1000;
    if (surveyMarker)
    {
        map.removeLayer(surveyMarker);
        map.removeLayer(circle);
    }
    surveyMarker = new L.marker([lat, lon], { draggable: true });
    map.addLayer(surveyMarker);
    drawCircle(lat, lon, circleMeter);
    surveyMarker.on('drag', function (e)
    {
        map.removeLayer(circle);
        drawCircle(this.getLatLng().lat, this.getLatLng().lng, circleMeter);
        drawSurveyLine(this.getLatLng().lat, this.getLatLng().lng);
    });
    surveyMarker.on('dragend', function (e)
    {
        setLatInputValue(this.getLatLng().lat.toString());
        setLonInputValue(this.getLatLng().lng.toString());
        getInput();
    });
}

function drawCircle(lat, lon, radius) {
    circle = L.circle([lat, lon], radius, {
        color: '#cc0000',
        fillColor: '#ffb3b3',
        fillOpacity: 0.2
    });
    map.addLayer(circle);
}

function drawSurveyLine(lat, lon)
{
    if (surveyLine) {
        map.removeLayer(surveyLine);
    }
    if (selectedRowIndex) {
        var sBCoords = getSelectedBaseCoords();
        surveyLine = new L.polyline([[lat, lon], sBCoords], { color: '#cc6600' });
        map.addLayer(surveyLine);
    }
}

function initDrawElements()
{
    baseIcons = new Array();

    towerIconUnselected = L.icon({
        iconUrl: towerIconUrlUnselected,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    towerIconSelected = L.icon({
        iconUrl: towerIconUrlSelected,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    customerActive = L.icon({
        iconUrl: customerIconUrlActive,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    customerOk = L.icon({
        iconUrl: customerIconUrlOk,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });

    customerFalse = L.icon({
        iconUrl: customerIconUrlFalse,
        iconSize: [32, 32], // size of the icon
        iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
        popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
    });
}

function getAngle(surveyLat, surveyLon, baseLat, baseLon)
{
    return calcAngle(surveyLat, surveyLon, baseLat, baseLon);
    /*if (selectedRowIndex)
    {
        var sBCoords = getSelectedBaseCoords();
        var angle = calcAngle(surveyLat, surveyLon, sBCoords[0], sBCoords[1]);
        jQuery('#MapAngle').val(angle);
    }
    else
    {
        jQuery('#MapAngle').val("-");
    }*/
}

function calcAngle(sLat, sLon, baseLat, baseLon) {
    var basePoint = L.latLng(baseLat, baseLon);
    var surveyPoint = L.latLng(sLat, sLon);
    var angle = L.GeometryUtil.bearing(basePoint, surveyPoint);
    if (angle < 0)
    {
        angle = 360 + angle;
    }
    return angle;
}