function Base(selection, dbID, baseID, lat, lon, angle, trIndex)
{
    this.IsSelected = selection;
    this.UnSelectedName = "unSelected";
    this.SelectedName = "selected";
    this.DbID = dbID;
    this.BaseID = baseID;
    this.Lat = lat;
    this.Lon = lon;
    this.Angle = angle;
    this.TableRowIndex = trIndex;

    this.getCoordsWGS =
    function()
    {
        return [lat, lon];
    }
}

function BaseController()
{
    var Btrs;
    var Bases = new Array();
    var BaseIcons = new Array();
    var Map;
    var selectedBaseID = null;

    var popup = L.popup();

    this.initBases =
    function (baseTableRows, map)
    {
        Btrs = baseTableRows;
        Map = map;
        var listLength = Bases.length;
        if (listLength > 0)
        {
            Bases = new Array();
        }
        var angleIndexInTable = 7;
        var selection;
        var dbID;
        var baseID;
        var lat;
        var lon;
        var angle;
        listLength = Btrs.length;
        for (var i = 0; i < listLength; i++)
        {
            if (selectedBaseID)
            {
                if (Btrs[i].getAttribute("baseID") == selectedBaseID)
                {
                    Btrs[i].setAttribute("class", "selected");
                }
            }
            selection = Btrs[i].getAttribute("class");
            if (selection == "unSelected")
            {
                selection = false;
            }
            else
            {
                selection = true;
            }
            dbID = Btrs[i].getAttribute("id");
            baseID = Btrs[i].getAttribute("baseID");
            lat = Btrs[i].getAttribute("lat").replace(",", ".");
            lon = Btrs[i].getAttribute("lon").replace(",", ".");
            angle = Btrs[i].cells[angleIndexInTable].innerHTML.replace(",", ".");
            Bases.push(new Base(selection, dbID, baseID, lat, lon, angle, i));
        }
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
            if (Bases[i].IsSelected)
            {
                BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelected, baseID: Bases[i].BaseID, rowIndex: Bases[i].TableRowIndex }).on('click', clickOnBaseEvent);
            }
            else
            {
                BaseIcons.push(new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[i].BaseID, rowIndex: Bases[i].TableRowIndex }).on('click', clickOnBaseEvent));
            }
            Map.addLayer(BaseIcons[i]);
            BaseIcons[i].bindPopup("<b>Bázis</b><br />");
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
        if (base.IsSelected)
        {
            selectedBaseID = null;
            Btrs[i].setAttribute("class", "unSelected");
            base.IsSelected = false;
            BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[i].BaseID, rowIndex: Bases[i].TableRowIndex }).on('click', clickOnBaseEvent);
            BaseIcons[i].bindPopup("<b>Bázis</b><br />");
        }
        else
        {
            if (selectedBaseID)
            {
                otherBase = getBaseByBaseID(selectedBaseID);
                if (otherBase)
                {
                    j = otherBase.TableRowIndex;
                    otherBase.IsSelected = false;
                    Btrs[j].setAttribute("class", "unSelected");
                    Map.removeLayer(BaseIcons[j]);
                    BaseIcons[j] = new L.marker(Bases[j].getCoordsWGS(), { icon: towerIconUnselected, baseID: Bases[j].BaseID, rowIndex: Bases[j].TableRowIndex }).on('click', clickOnBaseEvent);
                    Map.addLayer(BaseIcons[j]);
                    BaseIcons[j].bindPopup("<b>Bázis</b><br />");
                }
            }
            Btrs[i].setAttribute("class", "selected");
            base.IsSelected = true;
            selectedBaseID = Bases[i].BaseID;
            BaseIcons[i] = new L.marker(Bases[i].getCoordsWGS(), { icon: towerIconSelected, baseID: Bases[i].BaseID, rowIndex: Bases[i].TableRowIndex }).on('click', clickOnBaseEvent);
        }
        Map.addLayer(BaseIcons[i]);
        BaseIcons[i].bindPopup("<b>Bázis</b><br />");
        surveyMarker.drawSurvey(Map);
        checkPhotos();
    }

    function clickOnBaseEvent()
    {
        handleBaseSelection(this.options.baseID);
    }

    this.baseTableEvent =
    function(x)
    {
        handleBaseSelection(x.getAttribute("baseID"));
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
}