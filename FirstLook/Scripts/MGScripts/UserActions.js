
$(document).ready(function () {

    surveyLat = jQuery('#InputLat');
    surveyLon = jQuery('#InputLon');
    surveyRadius = jQuery('#InputRadius');
    surveyAddress = jQuery('#InputAddress');

    surveyLat.val("");
    surveyLon.val("");
    surveyRadius.val("");
    surveyAddress.val("");

    addressButton = jQuery('#AddressButton');
    getClosePicturesButton = jQuery('#GetClosePicturesButton');
    getFarPicturesButton = jQuery('#GetFarPicturesButton');

    surveyLat.on('input', function (e) {
        getInput();
    });
    surveyLon.on('input', function (e) {
        getInput();
    });
    surveyRadius.on('input', function (e) {
        getInput();
    });
    addressButton.on('click', function (e) {
        geoCoding(getAddress());
    });
    getClosePicturesButton.on('click', function (e) {
        //alert("Közeli képek a " + getSelectedBaseID() + " azonosítóval rendelkező bázisról.");
        var baseID = bases.getSelectedBaseID();
        if (baseID)
        {
            var options = {
                url: 'data-original'
            };
            var $images = $('#' + baseID + '.near');
            alert($images.length);
            $images.viewer();
            alert(3);
        }
        else
        {
            alert("Nincs kijelölve bázis!");
        }
        /*var options = {
            url: 'data-original'
        };
        $('.docs-pictures').on({}).viewer(options);*/
    });
    getFarPicturesButton.on('click', function (e) {
        //alert("Távoli képek a " + getSelectedBaseID() + " azonosítóval rendelkező bázisról.");
    });

});

function geoCoding(addr)
{
    geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': addr }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK)
        {
            var res = results[0].geometry.location;
            setLatInputValue(res.lat().toString());
            setLonInputValue(res.lng().toString());
            getInput();
        }
    });
}

function checkText(text, requiredLength, message1)
{
    if (text.length < requiredLength)
    {
        if (message1)
        {
            alert(message1);
        }
        return false;
    }
    return true;
}

function setLatInputValue(string)
{
    surveyLat.val(string);
}
function setLonInputValue(string)
{
    surveyLon.val(string);
}
function setRadiusInputValue(string)
{
    surveyRadius.val(string);
}

function getLatForServer()
{
    var value = surveyLat.val();
    return value.replace(".", ",");
}

function getLatForClient()
{
    var value = surveyLat.val();
    return value.replace(",", ".");
}

function getLonForServer()
{
    var value = surveyLon.val();
    return value.replace(".", ",");
}

function getLonForClient()
{
    var value = surveyLon.val();
    return value.replace(",", ".");
}

function getRadiusForServer()
{
    var value = surveyRadius.val();
    return value.replace(".", ",");
}

function getRadiusForClient()
{
    var value = surveyRadius.val();
    return value.replace(",", ".");
}

function getAddress()
{
    var value = surveyAddress.val();
    return value;
}