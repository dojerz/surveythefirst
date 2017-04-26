
var WgsLATCellIndexInTableRow = 6;
var WgsLONCellIndexInTableRow = 7;
var selectedRowIndex;
var selectedBaseID;
var rows;

var table = jQuery('#FilterTable');
var rows = $('#FilterTable tbody tr.notSelected').length;


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
    return rows[selectedRowIndex].getAttribute("id");
}

function getUnSelectedBasesCoords() {
    var usRows = $('#FilterTable tbody tr.unSelected');
    var listLength = usRows.length;
    var coords = [];

    for (var i = 0; i < listLength; i++) {
        coords.push([usRows[i].cells[WgsLATCellIndexInTableRow].innerHTML.replace(",", "."), usRows[i].cells[WgsLONCellIndexInTableRow].innerHTML.replace(",", ".")]);
    }
    return coords;
}

function getSelectedBaseCoords() {
    var sRows = $('#FilterTable tbody tr.selected');
    return [sRows[0].cells[WgsLATCellIndexInTableRow].innerHTML.replace(",", "."), sRows[0].cells[WgsLONCellIndexInTableRow].innerHTML.replace(",", ".")];
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
        var rIndex = $('#FilterTable tbody tr[id =' + selectedBaseID + ']');
        if (rIndex.length > 0) {
            rIndex[0].className = "selected";
            selectedRowIndex = rIndex[0].rowIndex;
        }
        else {
            selectedRowIndex = null;
        }
    }
}