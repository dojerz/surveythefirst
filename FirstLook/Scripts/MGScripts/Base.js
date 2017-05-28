function Base(baseID, lat, lon, name, settlement, building, transmission, capacity, altitude, distance, numOfBPhotos, numOfNPhotos, numOfFPhotos)
{
    this.BaseID = baseID;
    this.Lat = lat;
    this.Lon = lon;
    this.Name = name;
    this.Settlement = settlement;
    this.Building = building;
    this.Transmission = transmission;
    this.Capacity = capacity;
    this.Altitude = altitude;
    this.Distance = distance;
    this.NumOfBPhotos = numOfBPhotos;
    this.NumOfNPhotos = numOfNPhotos;
    this.NumOfFPhotos = numOfFPhotos;
    this.Angle;
    this.TableRowIndex;

    this.getCoordsWGS =
    function()
    {
        return [this.Lat, this.Lon];
    }

    this.calculateAngleBySurveyCoords =
    function(surveyLat, surveyLon)
    {
        angle = getAngle(surveyLat, surveyLon, this.Lat, this.Lon);
        angle = Math.round(angle * 10) / 10;
        angle = angle.toString().replace(",", ".");
        this.Angle = angle;
    }
}

function BaseController(map, tableBody, bpb, npb, fpb)
{
    var Btrs;
    var Bases = new Array();
    var BaseIcons = new Array();
    var Map = map;
    var TableBody = tableBody;
    var BasePhotosButton = bpb;
    var NearPhotosButton = npb;
    var FarPhotosButton = fpb;
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
        setToDefaultPr();
    }

    function setToDefaultPr()
    {
        setPhotoButton(BasePhotosButton, false);
        setPhotoButton(NearPhotosButton, false);
        setPhotoButton(FarPhotosButton, false);
    }

    this.initBases =
    function (surveyLat, surveyLon, baseList)
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
            base.TableRowIndex = i;
            Bases.push(base);
        }
        this.fillBaseTable();
        this.drawBasesOnMap();
    }

    this.drawBasesOnMap =
    function()
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
            if (Bases[i].BaseID == selectedBaseID)
            {
                BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelected, baseID: Bases[i].BaseID, rowIndex: Bases[i].TableRowIndex }).on('click', clickOnBaseEvent));
            }
            else
            {
                BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[i].BaseID, rowIndex: Bases[i].TableRowIndex }).on('click', clickOnBaseEvent));
            }
            Map.addLayer(BaseIcons[i]);
            BaseIcons[i].bindPopup("<b>Bázis</b><br />");
        }
    }

    this.fillBaseTable =
    function()
    {
        var listLength = Bases.length;
        var row;
        this.setToDefault();
        for(var i = 0; i < listLength; i++)
        {
            row = TableBody.insertRow(TableBody.rows.length);
            row.setAttribute("baseid", Bases[i].BaseID);
            row.setAttribute("onclick", "bases.baseTableEvent(this)");
            if (Bases[i].BaseID == selectedBaseID)
            {
                row.className = "selected";
                setPhotoButtonsToBase(Bases[i]);
            }
            else
            {
                row.className = "unSelected";
            }
            row.insertCell(0).innerHTML = Bases[i].Name;
            row.insertCell(1).innerHTML = Bases[i].Settlement;
            row.insertCell(2).innerHTML = Bases[i].Building;
            row.insertCell(3).innerHTML = Bases[i].Transmission;
            row.insertCell(4).innerHTML = Bases[i].Capacity;
            row.insertCell(5).innerHTML = Bases[i].Altitude;
            row.insertCell(6).innerHTML = Bases[i].Distance;
            row.insertCell(7).innerHTML = Bases[i].Angle;
        }
    }

    function getBaseByBaseID(baseID)
    {
        var listLength = Bases.length;
        for(var i = 0; i < listLength; i++)
        {
            if(Bases[i].BaseID == baseID)
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
        var i = base.TableRowIndex;
        Map.removeLayer(BaseIcons[i]);
        if (base.BaseID == selectedBaseID)
        {
            selectedBaseID = null;
            TableBody.rows[i].setAttribute("class", "unSelected");
            BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[i].BaseID, rowIndex: Bases[i].TableRowIndex }).on('click', clickOnBaseEvent);
            BaseIcons[i].bindPopup("<b>Bázis</b><br />");
            setToDefaultPr();
        }
        else
        {
            if (selectedBaseID)
            {
                otherBase = getBaseByBaseID(selectedBaseID);
                if (otherBase)
                {
                    j = otherBase.TableRowIndex;
                    TableBody.rows[j].setAttribute("class", "unSelected");
                    Map.removeLayer(BaseIcons[j]);
                    BaseIcons[j] = new L.marker(Bases[j].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[j].BaseID, rowIndex: Bases[j].TableRowIndex }).on('click', clickOnBaseEvent);
                    Map.addLayer(BaseIcons[j]);
                    BaseIcons[j].bindPopup("<b>Bázis</b><br />");
                }
            }
            TableBody.rows[i].setAttribute("class", "selected");
            selectedBaseID = Bases[i].BaseID;
            BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelected, baseID: Bases[i].BaseID, rowIndex: Bases[i].TableRowIndex }).on('click', clickOnBaseEvent);
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
                return [selectedBase.Lat, selectedBase.Lon];
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
                return selectedBase.Angle;
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
        if (base.NumOfBPhotos > 0) {
            setPhotoButton(BasePhotosButton, true);
        }
        else {
            setPhotoButton(BasePhotosButton, false);
        }
        if (base.NumOfNPhotos > 0) {
            setPhotoButton(NearPhotosButton, true);
        }
        else {
            setPhotoButton(NearPhotosButton, false);
        }
        if (base.NumOfFPhotos > 0) {
            setPhotoButton(FarPhotosButton, true);
        }
        else {
            setPhotoButton(FarPhotosButton, false);
        }
    }
}