const mapCenter = {lat: 47.378177, lng: 8.540192};
const mapZoom = 12;
const stationsFile = '/resources/stations.csv';
const keyMatrixDistance =;
const keyGeoLoc = ;
const humidityForSun = .5;
const totalTime = 15*60;


function initMap() {
    const options = {
        zoom: mapZoom,
        center: mapCenter
    };

    googleMap = new google.maps.Map(document.getElementById('map'), options);
    // var styledMapType = new google.maps.StyledMapType(mapStyle);
    // map.mapTypes.set('styled_map', styledMapType);
    // map.setMapTypeId('styled_map');
}

const colorProbScale = d3.scaleLinear().domain([0, 1]).range(['red', 'blue']);

var markers = [];

function addPath(path, p) {
    var googlePath = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: colorProbScale(p),
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: googleMap
    });
    markers.push(googlePath);
}


function addWalkingPath(path) {
    console.log(path)
    var lineSymbol = {
        path: 'M 0,-0.03 0,0.03',
        strokeOpacity: 1,
        scale: 0.1
    };
    var googlePath = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: 'black',
        strokeOpacity: 0.9,
        strokeWeight: 1,
        map: googleMap,
        icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '0.1px'
        }]
    });
    markers.push(googlePath);
}


function addMarkerIcon(loc, icon, text) {
    var marker = new google.maps.Marker({
        position: loc,
        map: googleMap,
        icon: icon
    });
    marker.addListener('click', function () {
        var infowindow = new google.maps.InfoWindow({
            content: text
        });
        infowindow.open(googleMap, marker);
    });
    markers.push(marker);
}

function addMarkerStation(station) {
    var marker = new google.maps.Marker({
        position: station[1],
        center: station[1],
        icon: 'resources/subway-station.svg',
        map: googleMap
    });
    marker.addListener('click', function () {
        var infoWindow = new google.maps.InfoWindow({
            content: station[0]
        });
        infoWindow.open(googleMap, marker);
    });
    markers.push(marker);
}


function rowConverterLatLon(d) {
    return {
        name: d.HALTESTELLEN_NAME,
        id: parseInt(d.BPUIC),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon)
    }
}

function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

function clearMarkers() {
    setMapOnAll(null);
}


var locationForm = document.getElementById('form');
locationForm.addEventListener('submit', geocode);

function geocode(e) {
    e.preventDefault();
    clearMarkers();

    const location = document.getElementById('location-input').value;
    const temperature = document.getElementById('temperature-input').value;
    const weather = document.getElementById('weather-input').value;
    const humidity = (weather == 'Sunny') ? humidityForSun : 1;
    const weekday = document.getElementById('weekday-input').value;
    const probability = document.getElementById('probability-input').value;
    const searchType = document.getElementById('search-input').value;

    axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
            address: location,
            key: keyGeoLoc
        }
    }).then(function (response) {
        const startCoords = {
            'lat': response.data.results[0].geometry.location.lat,
            'lng': response.data.results[0].geometry.location.lng
        };

        const validPosition = check10KM(startCoords);

        if (validPosition) {

            d3.queue()
                .defer(d3.csv, stationsFile)
                .await(function (error, stations) {
                    stations = stations.map(rowConverterLatLon);

                    const origins = startCoords.lat.toString().concat(',', startCoords.lng.toString());
                    const filteredStations = stations.filter(function (d) {
                        return distance(d.lat, startCoords.lat, d.lng, startCoords.lng) < .5 // 15 min walking
                    });

                    if (filteredStations.length > 0) {

                        var destinations = '';
                        for (i = 0; i < filteredStations.length; i++) {
                            var d = filteredStations[i].lat.toString().concat('%2C', filteredStations[i].lng.toString());
                            if (i != filteredStations - 1) {
                                d = d.concat('%7C')
                            }
                            destinations = destinations.concat(d)
                        }

                        // omg, this is so nasty
                        const request = ("https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins="
                            .concat(origins, '&destinations=', destinations, '&mode=walking', '&key=', keyMatrixDistance));

                        // Add Allow-Control-Allow-Origin: * plugin
                        axios.get(request, {headers: {"Access-Control-Allow-Origin": "*"}})
                            .then(function (response) {
                                const distances = response.data.rows[0].elements.map(function (d) {
                                    return d.duration.value
                                });
                                console.log(response);

                                const closestStation = filteredStations[distances.indexOf(Math.min.apply(Math, distances))];
                                closestStation.timeToReachIt = Math.min.apply(Math, distances);
                                const timeInTransit = totalTime - closestStation.timeToReachIt

                                // addMarkerIcon({
                                //     'lat': closestStation.lat,
                                //     'lng': closestStation.lng
                                // }, 'resources/bus-station.svg',
                                //     closestStation.name);

                                var minutesToReach = parseInt(closestStation.timeToReachIt / 60);
                                var firstStatioName = closestStation.name.split(" ")[1]
                                const textYou = `You are here! ;) <br> You have ${minutesToReach} minutes to get to ${firstStatioName} <br> Hurry up!!`;
                                addMarkerIcon(startCoords, '/resources/unisex.svg', textYou);

                                addWalkingPath([{'lat': closestStation.lat, 'lng': closestStation.lng}, startCoords]);

                                axios.post("http://localhost:5000/paths",
                                    {
                                        'station_id': '8297389',
                                        'humidity': humidity,
                                        'temperature': temperature,
                                        'weekday': weekday,
                                        'probability': probability,
                                        'search': searchType,
                                        'time_in_transit': timeInTransit
                                    }
                                ).then(function (response) {
                                    const paths = response.data['paths'];
                                    const stations = response.data['stations'];

                                    for (var i = 0; i < paths.length; i++) {
                                        addPath([paths[i]['p1'], paths[i]['p2']], paths[i]['probability']);
                                    }

                                    for (var i = 0; i < stations.length; i++) {
                                        addMarkerStation(stations[i])
                                    }


                                }).catch(function (error) {
                                    console.log(error)
                                })
                            }).catch(function (error) {
                            console.log(error)
                        });


                    }
                    else {
                        alert('You are more than 500m far from any listed station')
                    }
                })
        } else {
            alert("Invalid Position, you must be 10KM from Zurich center");
        }

    }).catch(function (error) {
        console.log(error)

    })
}
