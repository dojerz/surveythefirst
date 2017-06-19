function SurveyMarker(map, inputAddress, startSurveyButton, inputWGSLat, inputWGSLon, inputEOVX, inputEOVY, inputRadius, inputHeight,
                      convertEOVButton, placeByCoordButton, placeByAddressButton, lockAddressButton, BaseDataTabButton, SurveyDataTabButton, SandboxSurveyButton)
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
    var state = 0;      // 0 = ügyfél elhelyezése fázis, 1 = mérési fázis
    var CoreColor = "#ffffff";
    var WarningColor = "#ffff99";
    var ErrorColor = "#ff8080";
    var ValidationGate = [0, 0, 0, 0, 0, 0, 1];   // Address, Lat, Lon, EOVX, EOVY, Height, Radius
    var AddressIsLocked = false;
    var SandboxMode = false;
    var SurveyMode = false;
    initControls();

    this.addViews =
    function (views) {
        Views = views;
    }

    // Felhasználói inputok kezelése
    function initControls()
    {
        jQuery('#StartSurveyData1').hide();
        SurveyDataTabButton.addClass("active");
        lockAddressButton.attr('src', lockImage);
        convertEOVButton.attr('src', greyArrow);
        changeInputColor(inputAddress, ErrorColor);
        changeInputColor(inputWGSLat, ErrorColor);
        changeInputColor(inputWGSLon, ErrorColor);
        changeInputColor(inputEOVX, ErrorColor);
        changeInputColor(inputEOVY, ErrorColor);
        changeInputColor(inputHeight, ErrorColor);
        changeInputColor(inputRadius, CoreColor);
        validatePlaceByCoordButton();
        validatePlaceByAddressButton();
        validateStartSurveyButton();
        SandboxSurveyButton.attr('src', freeMarkerDisabledImage);

        SandboxSurveyButton.on('click', function (e) {
            if(SandboxMode)
            {
                SandboxMode = false;
                SandboxSurveyButton.attr('src', freeMarkerDisabledImage);
            }
            else
            {
                SandboxMode = true;
                SandboxSurveyButton.attr('src', freeMarkerEnabledImage);
            }
        });
        lockAddressButton.on('click', function (e) {
            if (ValidationGate[0] == 1)
            {
                if (AddressIsLocked) {
                    AddressIsLocked = false;
                    changeInputColor(inputAddress, CoreColor);
                }
                else {
                    AddressIsLocked = true;
                    changeInputColor(inputAddress, WarningColor);
                }
            }
        });
        BaseDataTabButton.on('click', function (e) {
            jQuery('#StartSurveyData2').hide();
            SurveyDataTabButton.removeClass("active");
            jQuery('#StartSurveyData1').show();
            BaseDataTabButton.addClass("active");
        });
        SurveyDataTabButton.on('click', function (e) {
            jQuery('#StartSurveyData1').hide();
            BaseDataTabButton.removeClass("active");
            jQuery('#StartSurveyData2').show();
            SurveyDataTabButton.addClass("active");
        });
        Map.on('click', function (e) {
            if (SandboxMode)
            {
                inputWGSLat.val(e.latlng.lat);
                inputWGSLon.val(e.latlng.lng);
                WgsLat = e.latlng.lat;
                WgsLon = e.latlng.lng;
                ValidationGate[1] = 1;
                ValidationGate[2] = 1;
                geoCodingLocation(WgsLat, WgsLon);
                drawMarkerOnMapPrivate();
                if(SurveyMode)
                {
                    queryBasesFromDatabase();
                }
            }
        });
        startSurveyButton.on('click', function (e)
        {
            if(SurveyMode)
            {
                SurveyMode = false;
                startSurveyButton.css('color', '#ffffff');
                startSurveyButton.css('background-color', '#8585ad');
            }
            else
            {
                SurveyMode = true;
                startSurveyButton.css('color', '#ffffff');
                startSurveyButton.css('background-color', '#1f7a1f');
                queryBasesFromDatabase();
            }

            /*var value = inputAddress.val();
            if (value.length > 1)
            {
                Address = inputAddress.val();
                geoCodingAddress(Address);
            }
            else
            {
                geoCodingLocation(inputWGSLat.val().replace(",", "."), inputWGSLon.val().replace(",", "."))
                //Address = null;
                queryBases();
            }*/
        });


        //Address
        inputAddress.on('input', function (e)
        {
            var value = inputAddress.val();
            if(value.length > 0)
            {
                validateAddress(true, true);
                Address = value;
            }
            else
            {
                validateAddress(false, false)
            }
            validatePlaceByAddressButton();
        });


        //WGS
        inputWGSLat.on('input', function (e)
        {
            var value = checkWGSInputValue(inputWGSLat);
            if(value && (Number(value) <= 90) && (Number(value) >= -90))
            {
                validateWgsLat(true, true);
            }
            else
            {
                validateWgsLat(false, false);
            }
            validatePlaceByCoordButton();
            validateStartSurveyButton();
        });
        inputWGSLon.on('input', function (e)
        {
            var value = checkWGSInputValue(inputWGSLon);
            if (value && (Number(value) <= 180) && (Number(value) >= -180)) {
                validateWgsLon(true, true);
            }
            else {
                validateWgsLon(false, false);
            }
            validatePlaceByCoordButton();
            validateStartSurveyButton();
        });


        //EOV
        convertEOVButton.on('click', function (e)
        {
            if ((ValidationGate[3] == 1) && (ValidationGate[4] == 1))
            {
                var wgsValues = eovTOwgs84(Number(getNumberStringFromInput(inputEOVX)), Number(getNumberStringFromInput(inputEOVY)));
                inputWGSLat.val(wgsValues[0]);
                inputWGSLon.val(wgsValues[1]);
                changeInputColor(inputWGSLat, CoreColor);
                ValidationGate[1] = 1;
                changeInputColor(inputWGSLon, CoreColor);
                ValidationGate[2] = 1;
                validatePlaceByCoordButton();
                validateStartSurveyButton();
            }
        });
        inputEOVX.on('input', function (e)
        {
            var value = checkEOVInputValue(inputEOVX);
            if (value) {
                changeInputColor(inputEOVX, CoreColor);
                ValidationGate[3] = 1;
            }
            else {
                changeInputColor(inputEOVX, ErrorColor);
                ValidationGate[3] = 0;
            }
            if ((ValidationGate[3] == 1) && (ValidationGate[4] == 1)) {
                convertEOVButton.attr('src', greenArrow);
                convertEOVButton.prop('disabled', false);
            }
            else {
                convertEOVButton.attr('src', greyArrow);
                convertEOVButton.prop('disabled', true);
            }
            
        });
        inputEOVY.on('input', function (e)
        {
            var value = checkEOVInputValue(inputEOVY);
            if (value) {
                changeInputColor(inputEOVY, CoreColor);
                ValidationGate[4] = 1;
            }
            else {
                changeInputColor(inputEOVY, ErrorColor);
                ValidationGate[4] = 0;
            }
            if ((ValidationGate[3] == 1) && (ValidationGate[4] == 1)) {
                convertEOVButton.attr('src', greenArrow);
                convertEOVButton.prop('disabled', false);
            }
            else {
                convertEOVButton.attr('src', greyArrow);
                convertEOVButton.prop('disabled', true);
            }
        });


        //Radius
        inputRadius.val(3);
        Radius = convertNumberStringForClien(inputRadius.val())
        inputRadius.on('input', function (e)
        {
            var value = getNumberStringFromInput(inputRadius);
            if (value && (Number(value) < 100) && (Number(value) >= 0)) {
                changeInputColor(inputRadius, CoreColor);
                ValidationGate[6] = 1;
            }
            else {
                changeInputColor(inputRadius, ErrorColor);
                ValidationGate[6] = 0;
            }
            validateStartSurveyButton();
        });


        //Height
        inputHeight.on('input', function (e)
        {
            var value = getNumberStringFromInput(inputHeight);
            if (value && (Number(value) >= 0)) {
                changeInputColor(inputHeight, CoreColor);
                ValidationGate[5] = 1;
                Height = value;
            }
            else {
                changeInputColor(inputHeight, ErrorColor);
                ValidationGate[5] = 0;
            }
            validateStartSurveyButton();
        });


        // Place survey marker buttons
        placeByCoordButton.on('click', function (e) {
            WgsLat = getNumberStringFromInput(inputWGSLat);
            WgsLon = getNumberStringFromInput(inputWGSLon);
            /*ValidationGate[1] = 1;
            ValidationGate[2] = 1;*/
            drawMarkerOnMapPrivate();

            //alert("coords");
            /*var wgsLat = getNumberStringFromInput(inputWGSLat);
            var wgsLon = getNumberStringFromInput(inputWGSLon);
            if ((wgsLat != null) && (wgsLat.length > 1))
            {
                changeInputColor(inputWGSLat, CoreColor);
                WgsLat = wgsLat;
            }
            else
            {
                changeInputColor(inputWGSLat, ErrorColor);
            }
            if ((wgsLon != null) && (wgsLon.length > 1))
            {
                changeInputColor(inputWGSLon, CoreColor);
                WgsLon = wgsLon;
            }
            else
            {
                changeInputColor(inputWGSLon, ErrorColor);
            }*/
        });
        placeByAddressButton.on('click', function (e) {
            //alert("address");
            geoCodingAddress();
        });

        // Ellenőrzi, hogy számmá lehet-e alakítani a bevitt karaktersorozatot. ha nem, akkor törli az utolsó karaktert
        function checkInputValueNumber(value)
        {
            if (isNaN(value)) {
                if (value.length == 1) {
                    return "";
                }
                return value.slice(0, -1).replace(".", ",");
            }
            return value.replace(".", ",");
        }

        function hasMinOneOfTheseStringParts(stringValue, stringPartsArray)
        {
            var listLength = stringPartsArray.length;
            for(var i = 0; i < listLength; i++)
            {
                if(stringValue.indexOf(stringPartsArray[i]) > -1)
                {
                    return true;
                }
            }
            return false;
        }

        function checkEOVInputValue(input)
        {
            var value = getNumberStringFromInput(input);
            if (value != null && (!hasMinOneOfTheseStringParts(value, ["."])) && (value.length == 6))
            {
                return value;
            }
            return null;
        }

        function checkWGSInputValue(input)
        {
            var value = getNumberStringFromInput(input);
            if (value != null && value.length > 1)
            {
                return value;
            }
            return null;
        }

        function checkWGSStringValue(value) {
            if ((!isNumber(value)) || (value.length < 2)) {
                return false;
            }
            return true;
        }
    }


    // Validation

    function validateAddress(validInput, validData)
    {
        if (validInput)
        {
            changeInputColor(inputAddress, CoreColor);
        }
        else
        {
            changeInputColor(inputAddress, ErrorColor);
        }
        if(validData)
        {
            ValidationGate[0] = 1;
        }
        else
        {
            ValidationGate[0] = 0;
        }
    }

    function validateHeight(validInput, validData)
    {
        if (validInput) {
            changeInputColor(inputHeight, CoreColor);
        }
        else {
            changeInputColor(inputHeight, ErrorColor);
        }
        if(validData)
        {
            ValidationGate[5] = 1;
        }
        else
        {
            ValidationGate[5] = 0;
        }
    }

    function validateRadius(validInput, validData)
    {
        if (validInput) {
            changeInputColor(inputRadius, CoreColor);
        }
        else {
            changeInputColor(inputRadius, ErrorColor);
        }
        if (validData) {
            ValidationGate[6] = 1;
        }
        else {
            ValidationGate[6] = 0;
        }
    }

    function validateWgsLat(validInput, validData) {
        if (validInput) {
            changeInputColor(inputWGSLat, CoreColor);
        }
        else {
            changeInputColor(inputWGSLat, ErrorColor);
        }
        if (validData) {
            ValidationGate[1] = 1;
        }
        else {
            ValidationGate[1] = 0;
        }
    }

    function validateWgsLon(validInput, validData) {
        if (validInput) {
            changeInputColor(inputWGSLon, CoreColor);
        }
        else {
            changeInputColor(inputWGSLon, ErrorColor);
        }
        if (validData) {
            ValidationGate[2] = 1;
        }
        else {
            ValidationGate[2] = 0;
        }
    }

    //



    function isNumber(value) {
        if (value.length > 0) {
            if (isNaN(value)) {
                return false;
            }
            return true;
        }
        return false;
    }

    function getNumberStringFromInput(input) {
        var numberString = input.val().replace(",", ".");
        if (isNumber(numberString)) {
            return numberString;
        }
        else {
            return null;
        }
    }

    function validatePlaceByCoordButton() {
        if ((ValidationGate[1] == 1) && (ValidationGate[2] == 1)) {
            placeByCoordButton.prop('disabled', false);
            placeByCoordButton.css('color', '#ffffff');
            placeByCoordButton.css('background-color', '#009900');
        }
        else {
            placeByCoordButton.prop('disabled', true);
            placeByCoordButton.css('color', '#ffffff');
            placeByCoordButton.css('background-color', '#5c5c8a');
        }
    }

    function validatePlaceByAddressButton() {
        if (ValidationGate[0] == 1) {
            placeByAddressButton.prop('disabled', false);
            placeByAddressButton.css('color', '#ffffff');
            placeByAddressButton.css('background-color', '#009900');
        }
        else {
            placeByAddressButton.prop('disabled', true);
            placeByAddressButton.css('color', '#ffffff');
            placeByAddressButton.css('background-color', '#5c5c8a');
        }
    }

    function validateStartSurveyButton()
    {
        if ((ValidationGate[1] == 1) && (ValidationGate[2] == 1) && (ValidationGate[5] == 1) && (ValidationGate[6] == 1))
        {
            startSurveyButton.prop('disabled', false);
            startSurveyButton.css('color', '#ffffff');
            startSurveyButton.css('background-color', '#1f7a1f');
        }
        else
        {
            startSurveyButton.prop('disabled', true);
            startSurveyButton.css('color', '#ffffff');
            startSurveyButton.css('background-color', '#8585ad');
        }
    }


    function changeInputColor(input, color) {
        input.css({ "background-color": color });
    }

    function geoCodingAddress() {
        addr = inputAddress.val();
        Geocoder.geocode({ 'address': addr }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var res = results[0].geometry.location;
                inputWGSLat.val(res.lat().toString());
                inputWGSLon.val(res.lng().toString());
                changeInputColor(inputWGSLat, CoreColor);
                ValidationGate[1] = 1;
                changeInputColor(inputWGSLon, CoreColor);
                ValidationGate[2] = 1;
                validatePlaceByCoordButton();
                validateStartSurveyButton();
                WgsLat = getNumberStringFromInput(inputWGSLat);
                WgsLon = getNumberStringFromInput(inputWGSLon);
                drawMarkerOnMapPrivate();
                //WgsLat = inputWGSLat.val();
                //WgsLon = inputWGSLon.val();
                //queryBases();
            }
            else {
                changeInputColor(inputAddress, ErrorColor);
                ValidationGate[0] = 0;
                //alert("Geocoder address geocoding failed: " + status);
            }
        });
    }

    function geoCodingLocation(lat, lng) {
        var latlng = { lat: Number(lat), lng: Number(lng) };
        Geocoder.geocode({ 'location': latlng }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                inputAddress.val(results[0].formatted_address);
                Address = inputAddress.val();
                //queryBases();
            }
            else {
                alert("Geocoder reverse geocoding failed: " + status);
            }
        });
    }


    // Megfelelőek-e az adatok a bázisok lekérdezéséhez
    function queryBases()
    {
        //alert("queryBases");
        //putMarkerOnMap(); //alert(WgsLat);
        if (WgsLat && WgsLon && Radius && Height)
        {
            //alert(2);
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
            geoCodingLocation(WgsLat, WgsLon);
            if (SurveyMode)
            {
                queryBasesFromDatabase();
            }
            //queryBases();
        });
    }


    this.drawMarkerOnMap =
    function ()
    {
        drawMarkerOnMapPrivate();
    }


    function drawCircle()
    {
        if (Radius > 0)
        {
            circle = L.circle([WgsLat, WgsLon], Radius * 1000, {
                color: '#cc0000',
                fillColor: '#ffb3b3',
                fillOpacity: 0.2
            });
            map.addLayer(circle);
        }
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