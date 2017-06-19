
var FROMhd72TOwgs84_p2 = new Array(6378160, 6356774.516, 6378137, 6356752.3142);

var FROMwgs84TOhd72_p2 = new Array(6378137, 6356752.3142, 6378160, 6356774.516);

var FROMhd72TOwgs84_p3 = new Array(52.684, -71.194, -13.975, 0.3120, 0.1063, 0.3729, 0.0000010191);

function eovTOwgs84(a, b)
{
    var hd72_a = new Array();
    hd72_a = eovTOhd72(a, b);
    var wgsCoord = bursa_wolf(hd72_a, FROMhd72TOwgs84_p2, FROMhd72TOwgs84_p3);

    return wgsCoord;
}

function eovTOhd72(a, b)
{
    var x = 180 * 3600 / Math.PI;
    var c = 1.0007197049;
    var d = 19.048571778;
    var e = d * Math.PI / 180;
    var f = 47.1;
    var g = f * Math.PI / 180;
    var h = 6379296.419;
    var i = 47 + (7.0 / 60.0) + (20.0578 / 3600.0);
    var j = i * Math.PI / 180;
    var k = (a - 200000);
    var l = (b - 650000);

    var m = 2.0 * (Math.atan(Math.exp(k / h)) - Math.PI / 4.0);
    var n = l / h;
    var o = 47.0 + (1.0 / 6.0); 
    var p = Math.asin(Math.cos(g) * Math.sin(m) + Math.sin(g) * Math.cos(m) * Math.cos(n));
    var q = Math.asin(Math.sin(n) * Math.cos(m) / Math.cos(p));
    var r = 0.822824894115397;
    var s = (p - j) * x;
    var t = o * Math.PI / 180;
    var u = 6378160;
    var v = 6356774.516;

    var w = (u * u - v * v) * Math.cos(t) * Math.cos(t) / v / v;
    var y = Math.pow((1 + w), 0.5);

    var z = 1.5 * w * Math.tan(t) / x;
    var aa = 0.5 * w * (-1 + Math.tan(t) * Math.tan(t) - w + 5 * w * Math.tan(t) * Math.tan(t)) / y / x / x;
    var ab = t + s * y / x - s * s * z / x + s * s * s * aa / x;
    var ac = e + q / c;

    var ad = ab * 180 / Math.PI;
    var ae = ac * 180 / Math.PI;

    return [ ad, ae, 0 ];
}

function bursa_wolf(p1, p2, p3)
{
    var fi_deg = p1[0];
    var la_deg = p1[1];
    var h = p1[2];

    var a1 = p2[0];
    var b1 = p2[1];
    var a2 = p2[2];
    var b2 = p2[3];

    var dX = p3[0];
    var dY = p3[1];
    var dZ = p3[2];
    var eX = p3[3];
    var eY = p3[4];
    var eZ = p3[5];
    var k = p3[6];

    var f = (a1 - b1) / a1;
    var e2 = 2 * f - f * f;
    var fi = fi_deg * Math.PI / 180;
    var la = la_deg * Math.PI / 180;
    var N = a1 / Math.pow(1 - e2 * Math.sin(fi) * Math.sin(fi), 0.5);
    var X = (N + h) * Math.cos(fi) * Math.cos(la);
    var Y = (N + h) * Math.cos(fi) * Math.sin(la);
    var Z = (N * (1-e2) + h) * Math.sin(fi);
    var Xv = dX + (1 + k) * (X + deg2rad(eZ / 3600) * Y - deg2rad(eY / 3600) * Z);
    var Yv = dY + (1 + k) * (-X * deg2rad(eZ / 3600) + Y + Z * deg2rad(eX / 3600));
    var Zv = dZ + (1 + k) * (X * deg2rad(eY / 3600) - Y * deg2rad(eX / 3600) + Z);

    var f2 = (a2 - b2) / a2;
    var e22 = 2 * f2 - f2 * f2;
    var ev2 = (a2 * a2 - b2 * b2) / b2 / b2;
    var P = Math.pow(Xv * Xv + Yv * Yv, 0.5);
    var theta = Math.atan2(Zv * a2, P * b2);
    var FI2 = Math.atan2(Zv + ev2 * b2 * Math.sin(theta) * Math.sin(theta) * Math.sin(theta), P - e22 * a2 * Math.cos(theta) * Math.cos(theta) * Math.cos(theta));
    var LA2 = Math.atan2(Yv, Xv);
    var N2 = a2 / Math.pow(1 - e22 * Math.sin(FI2) * Math.sin(FI2), 0.5);
    var fi2 = rad2deg(FI2);
    var la2 = rad2deg(LA2);
    var h2 = P / Math.cos(FI2) - N2;

    return [ fi2, la2, h2 ];
}

function deg2rad(angle)
{
    return Math.PI * angle / 180.0;
}

function rad2deg(angle)
{
    return angle * (180.0 / Math.PI);
}

function negal(arr)
{
    var ret_a = new Array();
    var listLength = arr.length;
    for (var i = 0; i < listLength; i++)
    {
        ret_a.push(arr[i] * (-1));
    }

    return ret_a;
}