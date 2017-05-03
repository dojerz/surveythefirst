function SurveyMarker()
{
    var WgsLat;
    var WgsLon;
    var Radius;
    var surveyIcon = null;
    var circle;
    var surveyLine = null;

    this.setCoordsWGS =
    function(lat, lon)
    {
        WgsLat = lat;
        WgsLon = lon;
    }

    this.setRadius =
    function(r)
    {
        Radius = r;
    }

    this.drawMarker =
    function(map)
    {
        if (surveyIcon)
        {
            map.removeLayer(surveyIcon);
            map.removeLayer(circle);
        }
        surveyIcon = new L.marker([WgsLat, WgsLon], { draggable: true });
        map.addLayer(surveyIcon);
        surveyIcon.bindPopup("<button>Nesze</button>");
        drawCircle(map);
        drawSurveyLine(map);

        surveyIcon.on('drag', function (e) {
            map.removeLayer(circle);
            WgsLat = this.getLatLng().lat;
            WgsLon = this.getLatLng().lng;
            drawCircle(map);
            drawSurveyLine(map);
            //drawSurveyLine(this.getLatLng().lat, this.getLatLng().lng);
        });
        surveyIcon.on('dragend', function (e) {
            WgsLat = this.getLatLng().lat;
            WgsLon = this.getLatLng().lng;
            setLatInputValue(this.getLatLng().lat.toString());
            setLonInputValue(this.getLatLng().lng.toString());
            getInput();
        });
    }

    this.drawSurvey =
    function(map)
    {
        drawSurveyLine(map);
    }

    function drawCircle(map)
    {
        circle = L.circle([WgsLat, WgsLon], Radius*1000, {
            color: '#cc0000',
            fillColor: '#ffb3b3',
            fillOpacity: 0.2
        });
        map.addLayer(circle);
    }

    function drawSurveyLine(map)
    {
        if (surveyLine)
        {
            map.removeLayer(surveyLine);
        }
        var sBCoords = bases.getSelectedBaseCoords();
        if (sBCoords)
        {
            surveyLine = new L.polyline([[WgsLat, WgsLon], sBCoords], { color: '#cc6600' });
            map.addLayer(surveyLine);
        }
    }

}