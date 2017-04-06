
window.onerror = function (msg, url, linenumber) {
    alert('Error message: ' + msg + '\nURL: ' + url + '\nLine Number: ' + linenumber);
    return true;
}

var basesSection = document.getElementById("Bases");
var surveyButton = document.getElementById("SurveyButton");
// The addEventListener() method is not supported in Internet Explorer 8 and earlier versions.
//surveyButton.addEventListener("click", startSurvey);

$(document).ready(function () {
    alert("OK");
    jQuery('#SurveyButton').on('click', function (e) {
        alert("Go");
        jQuery('#Bases').load('@Url.Action("Index", "Base", null )');
    });
});

function startSurvey()
{
    //alert("Hello Script!");
    //basesSection.onload('@(Url.Action("Index", "BaseController", null)');
    //jQuery('#Bases').load('@Url.Action( "FilteredBases", "BaseController", null, Request.Url.Scheme )');
    //jQuery('#Bases').load("~/Controllers/BaseController/FilteredBases");
    //jQuery('#Bases').text('@Url.Action( "Index", "BaseController")');
    //jQuery('#Bases').text("Mi??");
}