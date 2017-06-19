function Base(baseID, lat, lon, name, settlement, building, transmission, capacity, height, distance, numOfBPhotos, numOfNPhotos, numOfFPhotos)
{
    var BaseID = baseID;
    var Lat = lat;
    var Lon = lon;
    var Name = name;
    var Settlement = settlement;
    var Building = building;
    var Transmission = transmission;
    var Capacity = capacity;
    var Height = height;
    var Distance = distance;
    var NumOfBPhotos = numOfBPhotos;
    var NumOfNPhotos = numOfNPhotos;
    var NumOfFPhotos = numOfFPhotos;
    var Angle;
    var TableRowIndex;
    var HasLineOfSight = null;

    this.getCoordsWGS = function() { return [Lat, Lon]; }
    this.getBaseID = function () { return BaseID; }
    this.getLat = function () { return Lat; }
    this.getLon = function () { return Lon; }
    this.getName = function () { return Name; }
    this.getSettlement = function () { return Settlement; }
    this.getBuilding = function () { return Building; }
    this.getTransmission = function () { return Transmission; }
    this.getCapacity = function () { return Capacity; }
    this.getHeight = function () { return Height; }
    this.getDistance = function () { return Distance; }
    this.getNumOfBPhotos = function () { return NumOfBPhotos; }
    this.getNumOfNPhotos = function () { return NumOfNPhotos; }
    this.getNumOfFPhotos = function () { return NumOfFPhotos; }
    this.setAngle = function (value) { Angle = value; }
    this.getAngle = function () { return Angle; }
    this.setTableRowIndex = function (value) { TableRowIndex = value; }
    this.getTableRowIndex = function () { return TableRowIndex; }
    this.setLineOfSight = function (value) { HasLineOfSight = value; }
    this.hasLineOfSight = function() { return HasLineOfSight; }
    
    this.calculateAngleBySurveyCoords =
    function(surveyLat, surveyLon)
    {
        angle = getAngle(surveyLat, surveyLon, Lat, Lon);
        angle = Math.round(angle * 10) / 10;
        angle = angle.toString().replace(",", ".");
        Angle = angle;
    }

    /*this.calculateLineOfSight =
    function(surveyLat, surveyLon, surveyAltitude)
    {
        var elevator = new google.maps.ElevationService;
        var path = [
                { lat: Number(surveyLat), lng: Number(surveyLon) },
            	{ lat: Number(Lat), lng: Number(Lon) }];
        elevator.getElevationAlongPath({ 'path': path, 'samples': 120 }, elevationLoader);

        function elevationLoader(elevations, status)
        {
            if (status == 'OK')
            {
                HasLineOfSight = elevationCalculator(elevations, Number(Distance * 1000), Number(surveyAltitude), Number(Altitude), true);
            }
            else
            {
                HasLineOfSight = false;
                alert("Átlátás vizsgálata nem sikerült!");
            }
        }
    }*/

    /*this.drawElevationToSurveyPoint =
    function (surveyLat, surveyLon, surveyHeight, chart)
    {
        var elevator = new google.maps.ElevationService;
        var path = [
                { lat: Number(surveyLat), lng: Number(surveyLon) },
            	{ lat: Number(Lat), lng: Number(Lon) }];
        elevator.getElevationAlongPath({ 'path': path, 'samples': 120 }, elevationLoader);

        function elevationLoader(elevations, status)
        {
            if (status == 'OK') {
                var elevation = elevationCalculator(elevations, Number(Distance * 1000), Number(surveyHeight), Number(Height), false);
                google.charts.load('current', { packages: ['corechart', 'line'] });
                google.charts.setOnLoadCallback(function () { drawCurveTypes(elevation, chart); });
            }
            else
            {
                alert("Átlátás vizsgálata nem sikerült!");
            }
        }
    }*/
}

function BaseController(map, tableBody, basePhotosButton, nearPhotosButton, farPhotosButton, lineOfSightChart)
{
    var Btrs;
    var Bases = new Array();
    var BaseIcons = new Array();
    var Map = map;
    var TableBody = tableBody;
    var BasePhotosButton = basePhotosButton;
    var NearPhotosButton = nearPhotosButton;
    var FarPhotosButton = farPhotosButton;
    var LineOfSightChart = lineOfSightChart;
    var selectedBaseID = null;
    var elevationService = new google.maps.ElevationService;
    var SurveyMarker;
    var Views;
    var TempVisibility;

    BasePhotosButton.on('click', function (e) {
        getPhotos('b');
    });
    NearPhotosButton.on('click', function (e) {
        getPhotos('k');
    });
    FarPhotosButton.on('click', function (e) {
        getPhotos('t');
    });

    var popup = L.popup();

    this.setToDefault =
    function()
    {
        setToDefaultPrivate();
    }

    function setToDefaultPrivate()
    {
        setPhotoButton(BasePhotosButton, false);
        setPhotoButton(NearPhotosButton, false);
        setPhotoButton(FarPhotosButton, false);
    }


    this.addViews =
    function(views)
    {
        Views = views;
    }


    function calculateAngleBetweenSurveyMarkerAndBase(base, surveyMarker)
    {
        var surveyLat = surveyMarker.getWgsLat();
        var surveyLon = surveyMarker.getWgsLon();
        var angle = calcAngle(surveyLat, surveyLon, base.getLat(), base.getLon());
        angle = Math.round(angle * 10) / 10;
        angle = angle.toString().replace(",", ".");
        return angle;

            function calcAngle(sLat, sLon, baseLat, baseLon)
            {
                var basePoint = L.latLng(baseLat, baseLon);
                var surveyPoint = L.latLng(sLat, sLon);
                var angle = L.GeometryUtil.bearing(basePoint, surveyPoint);
                if (angle < 0)
                {
                    angle = 360 + angle;
                }
                return angle;
            }
    }


    function calculateLineOfSightBetweenSurveyMarkerAndBase(base, surveyMarker)
    {
        var surveyLat = surveyMarker.getWgsLat();
        var surveyLon = surveyMarker.getWgsLon();
        var surveyHeight = surveyMarker.getHeight(); //alert("LOS: " + surveyLat + ", " + surveyLon + ", " + surveyHeight);
        var calculatedValue = null;
        var path = [
                    { lat: Number(surveyLat), lng: Number(surveyLon) },
            	    { lat: Number(base.getLat()), lng: Number(base.getLon()) }
                   ];
        elevationService.getElevationAlongPath({ 'path': path, 'samples': 120 }, elevationLoader);

        function elevationLoader(elevations, status) {
            if (status == 'OK') {
                base.setLineOfSight(elevationCalculator(elevations, Number(base.getDistance() * 1000), Number(surveyHeight), Number(base.getHeight()), true));
            }
            else if (status == 'INVALID_REQUEST')
            {
                alert('INVALID_REQUEST');
            }
            else if (status == 'OVER_QUERY_LIMIT') {
                alert('OVER_QUERY_LIMIT');
            }
            else if (status == 'REQUEST_DENIED') {
                alert('REQUEST_DENIED');
            }
            else if (status == 'UNKNOWN_ERROR') {
                alert('UNKNOWN_ERROR');
            }
            else {
                base.setLineOfSight(false);
                alert("Átlátás vizsgálata nem sikerült!");
            }
        }
    }


    function drawElevationToSurveyPoint(base, surveyMarker, chart)
    {
        var surveyLat = surveyMarker.getWgsLat();
        var surveyLon = surveyMarker.getWgsLon();
        var surveyHeight = surveyMarker.getHeight();
        var calculatedValue = null;
        var path = [
                { lat: Number(surveyLat), lng: Number(surveyLon) },
            	{ lat: Number(base.getLat()), lng: Number(base.getLon()) }];
        elevationService.getElevationAlongPath({ 'path': path, 'samples': 120 }, elevationLoader);

        function elevationLoader(elevations, status) {
            if (status == 'OK') {
                var elevation = elevationCalculator(elevations, Number(base.getDistance() * 1000), Number(surveyHeight), Number(base.getHeight()), false);
                google.charts.load('current', { packages: ['corechart', 'line'] });
                google.charts.setOnLoadCallback(function () { drawCurveTypes(elevation, chart); });
            }
            else {
                alert("Átlátás vizsgálata nem sikerült!");
            }
        }
    }


    this.initBases =
    function (surveyMarker, baseList)
    {
        SurveyMarker = surveyMarker;
        var listLength = baseList.length;
        var baseID;
        var lat;
        var lon;
        var name;
        var settlement;
        var building;
        var transmission;
        var capacity;
        var height;
        var distance;
        var numOfBPhotos;
        var numOfNPhotos;
        var numOfFPhotos;
        var base;
        Bases = new Array();
        for (var i = 0; i < listLength; i++)
        {
            baseID = baseList[i].getAttribute("baseid");
            lat = baseList[i].getAttribute("lat").replace(",", ".");
            lon = baseList[i].getAttribute("lon").replace(",", ".");
            name = baseList[i].getAttribute("name");
            settlement = baseList[i].getAttribute("settlement");
            building = baseList[i].getAttribute("building");
            transmission = baseList[i].getAttribute("transmission");
            capacity = baseList[i].getAttribute("capacity");
            height = baseList[i].getAttribute("altitude").replace(",", ".");
            distance = baseList[i].getAttribute("distance").replace(",", ".");
            numOfBPhotos = baseList[i].getAttribute("numofbphotos");
            numOfNPhotos = baseList[i].getAttribute("numofnphotos");
            numOfFPhotos = baseList[i].getAttribute("numoffphotos");
            base = new Base(baseID, lat, lon, name, settlement, building, transmission, capacity, height, distance, numOfBPhotos, numOfNPhotos, numOfFPhotos);
            base.setAngle(calculateAngleBetweenSurveyMarkerAndBase(base, surveyMarker));
            base.setTableRowIndex(i);
            calculateLineOfSightBetweenSurveyMarkerAndBase(base, surveyMarker, true);
            //base.calculateLineOfSight(surveyLat, surveyLon, surveyHeight);
            Bases.push(base);
        }

        if(!chechBaseValues())
        {
            timer = setInterval(chechBaseValues, 100);
        }
    }

    function chechBaseValues()
    {
        var listLength = Bases.length;
        for (var i = 0; i < listLength; i++)
        {
            if(Bases[i].hasLineOfSight() == null)
            {
                return;
            }
        }
        clearInterval(timer);
        viewMethods();
    }

    function viewMethods()
    {
        fillBaseTablePrivate();
        drawBasesOnMapPrivate();
        SurveyMarker.drawMarkerOnMap();
    }

    this.drawBasesOnMap =
    function()
    {
        drawBasesOnMapPrivate();
    }

    function drawBasesOnMapPrivate()
    {
        var listLength = BaseIcons.length;
        if (listLength > 0) {
            for (var i = 0; i < listLength; i++) {
                Map.removeLayer(BaseIcons[i]);      // clear bases from map
            }
            BaseIcons = new Array();
        }
        listLength = Bases.length;
        for (var i = 0; i < listLength; i++)
        {
            if (Bases[i].getBaseID() == selectedBaseID)
            {
                if (Bases[i].hasLineOfSight())
                {
                    BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelectedLOS, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent));
                }
                else
                {
                    BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelectedNLOS, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent));
                }
                drawElevationToSurveyPoint(Bases[i], SurveyMarker, LineOfSightChart);
            }
            else
            {
                if (Bases[i].hasLineOfSight())
                {
                    BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselectedLOS, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent));
                }
                else
                {
                    BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselectedNLOS, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent));
                }
            }
            Map.addLayer(BaseIcons[i]);
            BaseIcons[i].bindPopup("<b>Bázis</b><br />");
        }
    }

    this.fillBaseTable =
    function()
    {
        fillBaseTablePrivate();
    }

    function fillBaseTablePrivate()
    {
        var listLength = Bases.length;
        var row;
        setToDefaultPrivate();
        for(var i = 0; i < listLength; i++)
        {
            row = TableBody.insertRow(TableBody.rows.length);
            row.setAttribute("baseid", Bases[i].getBaseID());
            row.setAttribute("onclick", "bases.baseTableEvent(this)");
            if (Bases[i].getBaseID() == selectedBaseID)
            {
                if (Bases[i].hasLineOfSight())
                {
                    row.className = "selectedLos";
                }
                else
                {
                    row.className = "selectedNLos";
                }
                setPhotoButtonsToBase(Bases[i]);
            }
            else
            {
                if (Bases[i].hasLineOfSight())
                {
                    row.className = "unSelectedLos";
                }
                else
                {
                    row.className = "unSelectedNLos";
                }
            }
            row.insertCell(0).innerHTML = Bases[i].getName();
            row.insertCell(1).innerHTML = Bases[i].getSettlement();
            row.insertCell(2).innerHTML = Bases[i].getBuilding();
            row.insertCell(3).innerHTML = Bases[i].getTransmission();
            row.insertCell(4).innerHTML = Bases[i].getCapacity();
            row.insertCell(5).innerHTML = Bases[i].getHeight();
            row.insertCell(6).innerHTML = Bases[i].getDistance();
            row.insertCell(7).innerHTML = Bases[i].getAngle();
        }
    }

    function getBaseByBaseID(baseID)
    {
        var listLength = Bases.length;
        for(var i = 0; i < listLength; i++)
        {
            if(Bases[i].getBaseID() == baseID)
            {
                return Bases[i];
            }
        }
    }

    function handleBaseSelection(baseID)
    {
        var base = getBaseByBaseID(baseID);
        var otherBase;
        var j;
        var i = base.getTableRowIndex();
        Map.removeLayer(BaseIcons[i]);
        if (base.getBaseID() == selectedBaseID)
        {
            selectedBaseID = null;
            if (base.hasLineOfSight())
            {
                TableBody.rows[i].setAttribute("class", "unSelectedLos");
                BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselectedLOS, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent);
            }
            else
            {
                TableBody.rows[i].setAttribute("class", "unSelectedNLos");
                BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselectedNLOS, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent);
            }
            BaseIcons[i].bindPopup("<b>Bázis</b><br />");
            setToDefaultPrivate();
        }
        else
        {
            if (selectedBaseID)
            {
                otherBase = getBaseByBaseID(selectedBaseID);
                if (otherBase)
                {
                    j = otherBase.getTableRowIndex();
                    Map.removeLayer(BaseIcons[j]);
                    if (otherBase.hasLineOfSight())
                    {
                        TableBody.rows[j].setAttribute("class", "unSelectedLos");
                        BaseIcons[j] = new L.marker(Bases[j].getCoordsWGS(), { icon: towerIconUnselectedLOS, baseID: Bases[j].getBaseID(), rowIndex: Bases[j].getTableRowIndex() }).on('click', clickOnBaseEvent);
                    }
                    else
                    {
                        TableBody.rows[j].setAttribute("class", "unSelectedNLos");
                        BaseIcons[j] = new L.marker(Bases[j].getCoordsWGS(), { icon: towerIconUnselectedNLOS, baseID: Bases[j].getBaseID(), rowIndex: Bases[j].getTableRowIndex() }).on('click', clickOnBaseEvent);
                    }
                    Map.addLayer(BaseIcons[j]);
                    BaseIcons[j].bindPopup("<b>Bázis</b><br />");
                }
            }
            drawElevationToSurveyPoint(Bases[i], SurveyMarker, LineOfSightChart);
            var target/*.scrollIntoView()*/;
            selectedBaseID = Bases[i].getBaseID();
            if (Bases[i].hasLineOfSight())
            {
                TableBody.rows[i].setAttribute("class", "selectedLos");
                BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelectedLOS, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent);
                target = $(".selectedLos")[0];
                target.parentNode.scrollTop = (target.offsetTop - 50);
            }
            else
            {
                TableBody.rows[i].setAttribute("class", "selectedNLos");
                BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelectedNLOS, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent);
                target = $(".selectedNLos")[0];
                target.parentNode.scrollTop = (target.offsetTop - 50);
            }
            setPhotoButtonsToBase(base);
        }
        Map.addLayer(BaseIcons[i]);
        BaseIcons[i].bindPopup("<b>Bázis</b><br />");
        surveyMarker.drawSurveyLine();
        //checkPhotos();
    }

    function clickOnBaseEvent()
    {
        handleBaseSelection(this.options.baseID);
    }

    this.baseTableEvent =
    function(x)
    {
        handleBaseSelection(x.getAttribute("baseid"));
    }

    this.getSelectedBaseCoords =
    function()
    {
        if(selectedBaseID)
        {
            var selectedBase = getBaseByBaseID(selectedBaseID);
            if (selectedBase)
            {
                return [selectedBase.getLat(), selectedBase.getLon()];
            }
        }
    }

    this.getSelectedBaseID =
    function()
    {
        return selectedBaseID;
    }

    this.getSelectedBaseAngle =
    function()
    {
        if (selectedBaseID)
        {
            var selectedBase = getBaseByBaseID(selectedBaseID);
            if (selectedBase)
            {
                return selectedBase.getAngle();
            }
        }
    }

    this.getSelectedBaseLOS =
    function()
    {
        if (selectedBaseID) {
            var selectedBase = getBaseByBaseID(selectedBaseID);
            if (selectedBase) {
                return selectedBase.hasLineOfSight();
            }
        }
    }

    function setPhotoButton(photoButton, isEnabled)
    {
        if (isEnabled)
        {
            photoButton.prop("disabled", false);
            photoButton.removeClass().addClass("enabledButton");
        }
        else
        {
            photoButton.prop("disabled", true);
            photoButton.removeClass().addClass("disabledButton");
        }
    }

    function setPhotoButtonsToBase(base)
    {
        if (base.getNumOfBPhotos() > 0) {
            setPhotoButton(BasePhotosButton, true);
        }
        else {
            setPhotoButton(BasePhotosButton, false);
        }
        if (base.getNumOfNPhotos() > 0) {
            setPhotoButton(NearPhotosButton, true);
        }
        else {
            setPhotoButton(NearPhotosButton, false);
        }
        if (base.getNumOfFPhotos() > 0) {
            setPhotoButton(FarPhotosButton, true);
        }
        else {
            setPhotoButton(FarPhotosButton, false);
        }
    }


    this.changeViewVisibility =
    function (viewID)
    {
        if (viewID <= Views.length - 1)
        {
            if (Views[viewID].is(":visible")) {
                Views[viewID].hide();
            }
            else {
                Views[viewID].show();
            }
        }
        else
        {
            alert("BaseController hiba: " + viewID + " azonosítóval rendelkező view nem létezik!");
        }
    }

    this.saveVisibility =
    function()
    {
        TempVisibility = new Array();
        var listLength = Views.length;
        for(var i = 0; i < listLength; i++)
        {
            if (Views[i].is(":visible")) {
                TempVisibility.push(true);
            }
            else {
                TempVisibility.push(false);
            }
        }
    }

    this.restoreVisibility =
    function ()
    {
        var listLength = TempVisibility.length;
        for (var i = 0; i < listLength; i++)
        {
            if (TempVisibility[i]) {
                Views[i].show();
            }
            else {
                Views[i].hide();
            }
        }
    }

    this.hideAllViews =
    function(isUserAction)
    {
        var listLength = Views.length;
        if(!isUserAction)
        {
            this.saveVisibility();
        }
        for (var i = 0; i < listLength; i++)
        {
            Views[i].hide();
        }
    }
}