function SurveyMarker(map, inputAddress, startButton, inputWGSLat, inputWGSLon, inputRadius, inputHeight)
{
    var WgsLat;
    var WgsLon;
    var Radius;
    var surveyIcon = null;
    var circle;
    var surveyLine = null;
    var Height = null;
    var Address = null;
    var Geocoder = new google.maps.Geocoder();
    var Map = map;
    var Views;
    var TempVisibility;
    initControls();


    this.addViews =
    function (views) {
        Views = views;
    }

    // Felhasználói inputok kezelése
    function initControls()
    {
        startButton.on('click', function (e)
        {
            var value = inputAddress.val();
            if (value.length > 1)
            {
                Address = inputAddress.val();
                geoCoding(Address);
            }
            else
            {
                Address = null;
                queryBases();
            }
        });
        inputWGSLat.on('input', function (e)
        {
            inputWGSLat.val(checkInputValueNumber(convertNumberStringForClient(inputWGSLat.val())));
            var value = inputWGSLat.val();
            if (value.length > 1) {
                WgsLat = convertNumberStringForClien(inputWGSLat.val());
                putMarkerOnMap();
            }
            else {
                WgsLat = null;
            }
        });
        inputWGSLon.on('input', function (e)
        {
            inputWGSLon.val(checkInputValueNumber(convertNumberStringForClien(inputWGSLon.val())));
            var value = inputWGSLon.val();
            if (value.length > 1) {
                WgsLon = convertNumberStringForClien(inputWGSLon.val());
                putMarkerOnMap();
            }
            else {
                WgsLon = null;
            }
        });
        inputRadius.val(3);
        Radius = convertNumberStringForClien(inputRadius.val())
        inputRadius.on('input', function (e)
        {
            inputRadius.val(checkInputValueNumber(convertNumberStringForClien(inputRadius.val())));
            var value = inputRadius.val();
            if (value.length > 0) {
                Radius = convertNumberStringForClien(inputRadius.val());
                queryBases();
            }
            else {
                Radius = null;
            }
        });
        inputHeight.on('input', function (e)
        {
            inputHeight.val(checkInputValueNumber(convertNumberStringForClien(inputHeight.val())));
            var value = inputHeight.val();
            if (value.length > 0)
            {
                Height = convertNumberStringForClien(inputHeight.val());
                queryBases();
            }
            else
            {
                Height = null;
            }
        });

        function geoCoding(addr)
        {
            Geocoder.geocode({ 'address': addr }, function (results, status) {
                if (status == google.maps.GeocoderStatus.OK) {
                    var res = results[0].geometry.location;
                    inputWGSLat.val(res.lat().toString());
                    inputWGSLon.val(res.lng().toString());
                    WgsLat = inputWGSLat.val();
                    WgsLon = inputWGSLon.val();
                    queryBases();
                }
            });
        }

        // Ellenőrzi, hogy számmá lehet-e alakítani a bevitt karaktersorozatot. ha nem, akkor törli az utolsó karaktert
        function checkInputValueNumber(value) {
            if (isNaN(value)) {
                if (value.length == 1) {
                    return "";
                }
                return value.slice(0, -1).replace(".", ",");
            }
            return value.replace(".", ",");
        }
    }


    // Megfelelőek-e az adatok a bázisok lekérdezéséhez
    function queryBases()
    {
        putMarkerOnMap();
        if (WgsLat && WgsLon && Radius && Height)
        {
            queryBasesFromDatabase();
        }
    }


    function putMarkerOnMap() {
        if (WgsLat && WgsLon && Radius) {
            drawMarkerOnMapPrivate();
        }
    }


    function convertNumberStringForClien(numberString) { return numberString.replace(",", "."); }
    function convertNumberStringForServer(numberString) { return numberString.toString().replace(".", ","); }


    this.getWgsLat = function () { return WgsLat;}

    this.getWgsLatForServer =
    function ()
    {
        if(WgsLat)
        {
            return convertNumberStringForServer(WgsLat);
        }
    }


    this.getWgsLon = function () { return WgsLon; }

    this.getWgsLonForServer =
    function ()
    {
        if (WgsLon)
        {
            return convertNumberStringForServer(WgsLon);
        }
    }


    this.getRadius = function () { return Radius; }

    this.getRadiusForServer =
    function ()
    {
        if (Radius)
        {
            return convertNumberStringForServer(Radius);
        }
    }


    this.getHeight = function () { return Height; }


    this.getAddress =
    function()
    {
        if (Address == null)
        {
            return "";
        }
        return Address;
    }


    function drawMarkerOnMapPrivate()
    {
        if (surveyIcon) {
            map.removeLayer(surveyIcon);
            map.removeLayer(circle);
        }
        surveyIcon = new L.marker([WgsLat, WgsLon], { draggable: true });
        map.addLayer(surveyIcon);
        surveyIcon.bindPopup("<button>Nesze</button>");
        drawCircle();
        drawSurveyLinePrivate();

        surveyIcon.on('drag', function (e) {
            map.removeLayer(circle);
            WgsLat = this.getLatLng().lat;
            WgsLon = this.getLatLng().lng;
            drawCircle();
            drawSurveyLinePrivate();
            //drawSurveyLine(this.getLatLng().lat, this.getLatLng().lng);
        });
        surveyIcon.on('dragend', function (e) {
            WgsLat = this.getLatLng().lat;
            WgsLon = this.getLatLng().lng;
            inputWGSLat.val(this.getLatLng().lat.toString());
            inputWGSLon.val(this.getLatLng().lng.toString());
            queryBases();
        });
    }


    this.drawMarkerOnMap =
    function ()
    {
        drawMarkerOnMapPrivate();
    }


    function drawCircle()
    {
        circle = L.circle([WgsLat, WgsLon], Radius * 1000, {
            color: '#cc0000',
            fillColor: '#ffb3b3',
            fillOpacity: 0.2
        });
        map.addLayer(circle);
    }


    function drawSurveyLinePrivate()
    {
        if (surveyLine) {
            map.removeLayer(surveyLine);
        }
        var sBCoords = bases.getSelectedBaseCoords();
        if (sBCoords) {
            if (bases.getSelectedBaseLOS())
            {
                surveyLine = new L.polyline([[WgsLat, WgsLon], sBCoords], { color: '#cc6600' });
            }
            else
            {
                surveyLine = new L.polyline([[WgsLat, WgsLon], sBCoords], { color: '#e60000' });
            }
            map.addLayer(surveyLine);
        }
    }

    this.drawSurveyLine =
    function()
    {
        drawSurveyLinePrivate();
    }


    this.changeViewVisibility =
    function (viewID) {
        if (viewID <= Views.length - 1) {
            if (Views[viewID].is(":visible")) {
                Views[viewID].hide();
            }
            else {
                Views[viewID].show();
            }
        }
        else {
            alert("SurveyMarker hiba: " + viewID + " azonosítóval rendelkező view nem létezik!");
        }
    }

    this.saveVisibility =
    function () {
        TempVisibility = new Array();
        var listLength = Views.length;
        for (var i = 0; i < listLength; i++) {
            if (Views[i].is(":visible")) {
                TempVisibility.push(true);
            }
            else {
                TempVisibility.push(false);
            }
        }
    }

    this.restoreVisibility =
    function () {
        var listLength = TempVisibility.length;
        for (var i = 0; i < listLength; i++) {
            if (TempVisibility[i]) {
                Views[i].show();
            }
            else {
                Views[i].hide();
            }
        }
    }

    this.hideAllViews =
    function (isUserAction) {
        var listLength = Views.length;
        if (!isUserAction) {
            this.saveVisibility();
        }
        for (var i = 0; i < listLength; i++) {
            Views[i].hide();
        }
    }







    this.setCoordsWGS =
    function(lat, lon)
    {
        WgsLat = lat;
        WgsLon = lon;
    }

    this.getCoordsWGS =
    function()
    {
        return [WgsLat, WgsLon];
    }

    this.setAltitude = function (value) { Altitude = value; }
    this.getAltitude = function () { return Altitude; }

    this.setRadius =
    function(r)
    {
        Radius = r;
    }

    this.drawSurvey =
    function(map)
    {
        drawSurveyLine(map);
    }
}