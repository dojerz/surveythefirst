function ElevationType(dist, calculatedElev, googleElev) {
    this.dist = dist;
    this.calculatedElev = calculatedElev;
    this.googleElev = googleElev;
}

function elevationCalculator(elev, dist, sHeight, bHeight, getOnlyLos)
{
    if (!getOnlyLos)
    {
        var ElevationTypeList = new Array();
    }
    var baseUnit = dist / elev.length;
    var surveyPointHeight = elev[0].elevation + sHeight;
    var baseHeight = elev[elev.length - 1].elevation + bHeight;

    var diffPerUnit = Math.abs(surveyPointHeight - baseHeight) / dist;
    var gElevation;
    var calcElevation;
    var calcElevationFunc;
    if (surveyPointHeight > baseHeight)
    {
        calcElevationFunc = decMethod;
    }
    else
    {
        calcElevationFunc = incMethod;
    }

    for (var i = 1; i < elev.length - 1; i++)
    {
            gElevation = elev[i].elevation;
            calcElevation = calcElevationFunc();
            if (getOnlyLos)
            {
                if (gElevation >= calcElevation)
                {
                    return false;
                }
            }
            else
            {
                ElevationTypeList.push(new ElevationType((i * baseUnit), calcElevation, gElevation));
            }
    }
    if (getOnlyLos)
    {
        return true;
    }
    else
    {
        return ElevationTypeList;
    }

    function decMethod()
    {
        return surveyPointHeight - i * baseUnit * diffPerUnit;
    }

    function incMethod()
    {
        return surveyPointHeight + i * baseUnit * diffPerUnit;
    }
}

function drawCurveTypes(elev, chartDiv) {

    var data = new google.visualization.DataTable();
    data.addColumn('number', 'X');
    data.addColumn('number', 'LOS');
    data.addColumn('number', 'Domborzat');

    for (var i = 0; i < elev.length; i++) {
        data.addRows([[elev[i].dist, elev[i].calculatedElev, elev[i].googleElev]]);
    }

    var options = {
        hAxis: {
            title: 'Távolság (m)',
            minValue: 0,
            textPosition: 'in'
        },
        vAxis: {
            title: 'Magasság (m)'
        },
        series: {
            1: { curveType: 'function' }
        },
        fontSize: 11,
        height: 110,
        chartArea: {
            width: 900,
            left: 70
        }

    };
    var chart = new google.visualization.LineChart(document.getElementById('LineOfSight'));
    chart.draw(data, options);
}