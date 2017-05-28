function Survey(lat, lon, state)
{
    this.Lat = lat;
    this.Lon = lon;
    this.State = state;

    this.getCoordsWGS =
    function()
    {
        return [this.Lat, this.Lon];
    }
}

function SurveyController(map)
{
    var Surveys = new Array();
    var SurveyIcons = new Array();
    var Map = map;
    var popup = L.popup();

    this.initSurveys =
    function (surveyList)
    {
        var listLength = surveyList.length;
        for (var i = 0; i < listLength; i++)
        {
            Surveys.push( new Survey(
                surveyList[i].getAttribute("lat").replace(",", "."),
                surveyList[i].getAttribute("lon").replace(",", "."),
                surveyList[i].getAttribute("state")
                ));
        }
        this.drawSurveysOnMap();
    }

    this.drawSurveysOnMap =
    function()
    {
        var listLength = SurveyIcons.length;
        if (listLength > 0)
        {
            for (var i = 0; i < listLength; i++)
            {
                Map.removeLayer(SurveyIcons[i]);
            }
            SurveyIcons = new Array();
        }
        listLength = Surveys.length;
        for (var i = 0; i < listLength; i++)
        {
            if (Surveys[i].State == 0)
            {
                SurveyIcons.push(new L.marker(Surveys[i].getCoordsWGS(), { icon: customerActive }));
            }
            else if (Surveys[i].State == 1)
            {
                SurveyIcons.push(new L.marker(Surveys[i].getCoordsWGS(), { icon: customerFalse }));
            }
            else
            {
                SurveyIcons.push(new L.marker(Surveys[i].getCoordsWGS(), { icon: customerOk }));
            }
            Map.addLayer(SurveyIcons[i]);
            SurveyIcons[i].bindPopup("<b>Állapot: </b>" + Surveys[i].State + "<br />" + "<b>Bázis</b><br />");
        }
    }
}