
$(document).ready(function () {

    surveyLat = jQuery('#InputLat');
    surveyLon = jQuery('#InputLon');
    surveyRadius = jQuery('#InputRadius');
    surveyAddress = jQuery('#InputAddress');
    surveyAltitude = jQuery('#InputHeight');

    surveyLat.val("");
    surveyLon.val("");
    surveyRadius.val(3);
    surveyAddress.val("");

    addressButton = jQuery('#AddressButton');
    getBasePicturesButton = jQuery('#GetBasePicturesButton');
    getNearPicturesButton = jQuery('#GetNearPicturesButton');
    getFarPicturesButton = jQuery('#GetFarPicturesButton');
    //getBasePicturesButton.prop("disabled", true);
    //getNearPicturesButton.prop("disabled", true);
    //getFarPicturesButton.prop("disabled", true);

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
    getNearPicturesButton.on('click', function (e) {
        //getPhotos(1);
        getPhotos('k');
    });
    getFarPicturesButton.on('click', function (e) {
        //getPhotos(2);
        getPhotos('t');
    });
    getBasePicturesButton.on('click', function (e) {
        //getPhotos(0);
        getPhotos('b');
    });

});

/*function checkPhotos()
{
    var baseID = bases.getSelectedBaseID();
    if (baseID)
    {
        if ($('#' + baseID + '.base' + ' li' + ' img').length > 0)
        {
            getBasePicturesButton.prop("disabled", false);
            getBasePicturesButton.removeClass().addClass("enabledButton");
        }
        else
        {
            getBasePicturesButton.prop("disabled", true);
            getBasePicturesButton.removeClass().addClass("disabledButton");
        }
        if ($('#' + baseID + '.near' + ' li' + ' img').length > 0)
        {
            getNearPicturesButton.prop("disabled", false);
            getNearPicturesButton.removeClass().addClass("enabledButton");
        }
        else
        {
            getNearPicturesButton.prop("disabled", true);
            getNearPicturesButton.removeClass().addClass("disabledButton");
        }
        if ($('#' + baseID + '.far' + ' li' + ' img').length > 0)
        {
            getFarPicturesButton.prop("disabled", false);
            getFarPicturesButton.removeClass().addClass("enabledButton");
        }
        else
        {
            getFarPicturesButton.prop("disabled", true);
            getFarPicturesButton.removeClass().addClass("disabledButton");
        }
    }
    else
    {
        getBasePicturesButton.prop("disabled", true);
        getBasePicturesButton.removeClass().addClass("disabledButton");
        getNearPicturesButton.prop("disabled", true);
        getNearPicturesButton.removeClass().addClass("disabledButton");
        getFarPicturesButton.prop("disabled", true);
        getFarPicturesButton.removeClass().addClass("disabledButton");
    }
}*/

/*function getPhotos(type)
{
    var baseID = bases.getSelectedBaseID();
    if (baseID)
    {
        var angle;
        var imageContainer;
        var images;
        var index;
        if (type == 0)
        {
            imageContainer = $('#' + baseID + '.base');
            index = 0;
        }
        else if (type == 1)
        {
            angle = bases.getSelectedBaseAngle();
            imageContainer = $('#' + baseID + '.near');
            images = $('#' + baseID + '.near' + ' li' + ' img');
            index = getNearestPhotoIndex(images, angle);
        }
        else
        {
            angle = bases.getSelectedBaseAngle();
            imageContainer = $('#' + baseID + '.far');
            images = $('#' + baseID + '.far' + ' li' + ' img');
            index = getNearestPhotoIndex(images, angle);
        }

        imageContainer.viewer(
        {
            url: 'data-original',
            shown: function () {
                $(this).viewer('view', index);
            },
            hidden: function (e) {
                $(this).viewer('destroy');
            }
        }).viewer('show');
    }
    else
    {
        alert("Nincs kijelölve bázis!");
    }*/

    function getNearestPhotoIndex(images, angleB)
    {
        var angle = Number(angleB);
        var listLength = images.length;
        var nearestValue;
        var index;
        var value;
        var x;
        for(var i = 0; i < listLength; i++)
        {
            value = Number(images[i].getAttribute("angle").replace(",", "."));
            x = Math.abs(angle - value);
            if (x > 180)
            {
                x = 360 - x;
            }
            if( nearestValue )
            {
                if (nearestValue > x)
                {
                    nearestValue = x;
                    index = i;
                }
            }
            else
            {
                nearestValue = x;
                index = i;
            }
        }
        return index;
    }
//}

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

function getAltitude()
{
    return surveyAltitude.val();
}