function distance(lat1, lat2, lon1, lon2) {
    function deg2rad(deg) {
        return deg * (Math.PI / 180)
    }

    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1);  // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d
}

function check10KM(loc) {
    const lat1 = mapCenter.lat, lon1 = mapCenter.lng, lat2 = loc.lat, lon2 = loc.lng;
    var d = distance(lat1, lat2, lon1, lon2);
    return d <= 10;
}


function rowConverterLatLon(d) {
    return {
        id: parseInt(d.BPUIC),
        lat: parseFloat(d.lat),
        lon: parseFloat(d.lon)
    }
}