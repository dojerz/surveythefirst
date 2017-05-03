
var WgsLATCellIndexInTableRow = 6;
var WgsLONCellIndexInTableRow = 7;
var selectedRowIndex;
var selectedBaseID;
var allTablerows = $('#FilterTable tbody tr');
//var angleCellIndex = 7;

var bases;

var table = jQuery('#FilterTable');
var rows = $('#FilterTable tbody tr.notSelected').length;

function setBasesByTableRows(tableRows)
{
    bases = new BaseController(tableRows);
    bases.initBases();
}

function fillAngleInTable(surveyLat, surveyLon, tableRows, angleCellIndex)
{
    var rowsLength = tableRows.length;
    var baseLat;
    var baseLon;
    var angle;
    for(var i = 0; i < rowsLength; i++)
    {
        baseLat = tableRows[i].getAttribute("lat").replace(",", ".");
        baseLon = tableRows[i].getAttribute("lon").replace(",", ".");
        angle = getAngle(surveyLat, surveyLon, baseLat, baseLon);
        angle = Math.round(angle * 10) / 10;
        angle = angle.toString().replace(".", ",");
        tableRows[i].cells[angleCellIndex].innerHTML = angle;
    }
}

function selectFunction(x) {
    if (selectedRowIndex) {
        if (x.rowIndex == selectedRowIndex) {
            selectedRowIndex = null;
            selectedBaseID = null;
            changeRowSelection(x, false);
        }
        else {
            changeRowSelection(rows[selectedRowIndex], false);
            selectedRowIndex = x.rowIndex;
            selectedBaseID = getSelectedBaseID();
            changeRowSelection(x, true);
        }
        drawElementsOnMap();
        return;
    }
    selectedRowIndex = x.rowIndex;
    selectedBaseID = getSelectedBaseID();
    changeRowSelection(x, true);
    drawElementsOnMap();
}

function changeRowSelection(rowObject, setSelected) {
    if (setSelected) {
        rowObject.className = "selected";
    }
    else {
        rowObject.className = "unSelected";
    }
}

function getSelectedBaseID() {
    return rows[selectedRowIndex].getAttribute("baseID");
}

function getUnSelectedBasesCoords() {
    var usRows = $('#FilterTable tbody tr.unSelected');
    var listLength = usRows.length;
    var coords = [];
    var lat;
    var lon;

    for (var i = 0; i < listLength; i++) {
        lat = usRows[i].getAttribute("lat").replace(",", ".");
        lon = usRows[i].getAttribute("lon").replace(",", ".");
        coords.push([lat, lon]);
        //coords.push([usRows[i].cells[WgsLATCellIndexInTableRow].innerHTML.replace(",", "."), usRows[i].cells[WgsLONCellIndexInTableRow].innerHTML.replace(",", ".")]);
    }
    return coords;
}

function getSelectedBaseCoords() {
    var sRows = $('#FilterTable tbody tr.selected');
    return [sRows[0].getAttribute("lat").replace(",", "."), sRows[0].getAttribute("lon").replace(",", ".")];
}

function initTablevalues()
{
    selectedRowIndex = null;
    selectedBaseID = null;
}

function refreshTableSelection()
{
    if(selectedBaseID)
    {
        var rIndex = $('#FilterTable tbody tr[baseID =' + selectedBaseID + ']');
        if (rIndex.length > 0) {
            rIndex[0].className = "selected";
            selectedRowIndex = rIndex[0].rowIndex;
        }
        else {
            selectedRowIndex = null;
        }
    }
}