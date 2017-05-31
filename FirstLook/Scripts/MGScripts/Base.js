function Base(baseID, lat, lon, name, settlement, building, transmission, capacity, altitude, distance, numOfBPhotos, numOfNPhotos, numOfFPhotos)
{
    var BaseID = baseID;
    var Lat = lat;
    var Lon = lon;
    var Name = name;
    var Settlement = settlement;
    var Building = building;
    var Transmission = transmission;
    var Capacity = capacity;
    var Altitude = altitude;
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
    this.getAltitude = function () { return Altitude; }
    this.getDistance = function () { return Distance; }
    this.getNumOfBPhotos = function () { return NumOfBPhotos; }
    this.getNumOfNPhotos = function () { return NumOfNPhotos; }
    this.getNumOfFPhotos = function () { return NumOfFPhotos; }
    this.getAngle = function () { return Angle; }
    this.setTableRowIndex = function (value) { TableRowIndex = value; }
    this.getTableRowIndex = function () { return TableRowIndex; }
    this.hasLineOfSight = function() { return HasLineOfSight; }
    
    this.calculateAngleBySurveyCoords =
    function(surveyLat, surveyLon)
    {
        angle = getAngle(surveyLat, surveyLon, Lat, Lon);
        angle = Math.round(angle * 10) / 10;
        angle = angle.toString().replace(",", ".");
        Angle = angle;
    }

    this.calculateLineOfSight =
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
                HasLineOfSight = elevationCalculator(elevations, Distance * 1000, surveyAltitude, Altitude, true);
            }
            else
            {
                alert("Átlátás vizsgálata nem sikerült!");
            }
        }
    }

    this.drawElevationToSurveyPoint =
    function (surveyLat, surveyLon, surveyAltitude, chart)
    {
        var elevator = new google.maps.ElevationService;
        var path = [
                { lat: Number(surveyLat), lng: Number(surveyLon) },
            	{ lat: Number(Lat), lng: Number(Lon) }];
        elevator.getElevationAlongPath({ 'path': path, 'samples': 120 }, elevationLoader);

        function elevationLoader(elevations, status)
        {
            if (status == 'OK') {
                var elevation = elevationCalculator(elevations, Distance * 1000, surveyAltitude, Altitude, false);
                drawCurveTypes(elevation, chart);
            }
            else {
                alert("Átlátás vizsgálata nem sikerült!");
            }
        }
    }
}

function BaseController(map, tableBody, bpb, npb, fpb, los)
{
    var Btrs;
    var Bases = new Array();
    var BaseIcons = new Array();
    var Map = map;
    var TableBody = tableBody;
    var BasePhotosButton = bpb;
    var NearPhotosButton = npb;
    var FarPhotosButton = fpb;
    var LineOfSightChart = los;
    var selectedBaseID = null;

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

    this.initBases =
    function (surveyLat, surveyLon, surveyAltitude, baseList)
    {
        Btrs = baseList;
        var listLength = Btrs.length;
        var baseID;
        var lat;
        var lon;
        var name;
        var settlement;
        var building;
        var transmission;
        var capacity;
        var altitude;
        var distance;
        var numOfBPhotos;
        var numOfNPhotos;
        var numOfFPhotos;
        var base;
        Bases = new Array();
        for (var i = 0; i < listLength; i++)
        {
            baseID = Btrs[i].getAttribute("baseid");
            lat = Btrs[i].getAttribute("lat").replace(",", ".");
            lon = Btrs[i].getAttribute("lon").replace(",", ".");
            name = Btrs[i].getAttribute("name");
            settlement = Btrs[i].getAttribute("settlement");
            building = Btrs[i].getAttribute("building");
            transmission = Btrs[i].getAttribute("transmission");
            capacity = Btrs[i].getAttribute("capacity");
            altitude = Btrs[i].getAttribute("altitude");
            distance = Btrs[i].getAttribute("distance");
            numOfBPhotos = Btrs[i].getAttribute("numofbphotos");
            numOfNPhotos = Btrs[i].getAttribute("numofnphotos");
            numOfFPhotos = Btrs[i].getAttribute("numoffphotos");
            base = new Base(baseID, lat, lon, name, settlement, building, transmission, capacity, altitude, distance, numOfBPhotos, numOfNPhotos, numOfFPhotos);
            base.calculateAngleBySurveyCoords(surveyLat, surveyLon);
            base.setTableRowIndex(i);
            base.calculateLineOfSight(surveyLat, surveyLon, surveyAltitude);
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
                BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelected, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent));
            }
            else
            {
                BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent));
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
                row.className = "selected";
                setPhotoButtonsToBase(Bases[i]);
            }
            else
            {
                row.className = "unSelected";
            }
            row.insertCell(0).innerHTML = Bases[i].getName();
            row.insertCell(1).innerHTML = Bases[i].getSettlement();
            row.insertCell(2).innerHTML = Bases[i].getBuilding();
            row.insertCell(3).innerHTML = Bases[i].getTransmission();
            row.insertCell(4).innerHTML = Bases[i].getCapacity();
            row.insertCell(5).innerHTML = Bases[i].getAltitude();
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
            TableBody.rows[i].setAttribute("class", "unSelected");
            BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent);
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
                    TableBody.rows[j].setAttribute("class", "unSelected");
                    Map.removeLayer(BaseIcons[j]);
                    BaseIcons[j] = new L.marker(Bases[j].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[j].getBaseID(), rowIndex: Bases[j].getTableRowIndex() }).on('click', clickOnBaseEvent);
                    Map.addLayer(BaseIcons[j]);
                    BaseIcons[j].bindPopup("<b>Bázis</b><br />");
                }
            }
            Bases[i].drawElevationToSurveyPoint(getLatForClient(), getLonForClient(), getAltitude(), LineOfSightChart);
            TableBody.rows[i].setAttribute("class", "selected");
            selectedBaseID = Bases[i].getBaseID();
            BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelected, baseID: Bases[i].getBaseID(), rowIndex: Bases[i].getTableRowIndex() }).on('click', clickOnBaseEvent);
            setPhotoButtonsToBase(base);
        }
        Map.addLayer(BaseIcons[i]);
        BaseIcons[i].bindPopup("<b>Bázis</b><br />");
        surveyMarker.drawSurvey(Map);
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
}