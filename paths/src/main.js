const addr = 'ETHZ, Rämistrasse 101, 8092 Zürich';
const mapCenter = {lat: 47.378177, lng: 8.540192};
const mapZoom = 12;
const stationsFile = '/resources/stations.csv';


function initMap() {
    const options = {
        zoom: mapZoom,
        center: mapCenter
    };

    map = new google.maps.Map(document.getElementById('map'), options);
    // var styledMapType = new google.maps.StyledMapType(mapStyle);
    // map.mapTypes.set('styled_map', styledMapType);
    // map.setMapTypeId('styled_map');
}


function addMarker(loc, icon) {
    var marker = new google.maps.Marker({
        position: loc,
        map: map,
        icon: icon
    });
    return marker
}


function rowConverterLatLon(d) {
    return {
        name: d.HALTESTELLEN_NAME,
        id: parseInt(d.BPUIC),
        lat: parseFloat(d.lat),
        lng: parseFloat(d.lon)
    }
}


var locationForm = document.getElementById('location-form');
locationForm.addEventListener('submit', geocode);

function geocode(e) {
    e.preventDefault();

    const location = document.getElementById('location-input').value;

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
            var marker = addMarker(startCoords, 'resources/unisex.svg');
            marker.addListener('click', function() {
                var infowindow = new google.maps.InfoWindow({
                    content: 'You are here!'
                });
                infowindow.open(map, marker);
            });

            d3.queue()
                .defer(d3.csv, stationsFile)
                .await(function (error, stations) {
                    stations = stations.map(rowConverterLatLon);

                    const origins = startCoords.lat.toString().concat(',', startCoords.lng.toString());
                    const filteredStations = stations.filter(function (d) {
                        return distance(d.lat, startCoords.lat, d.lng, startCoords.lng) < 1.5 // 15 min walking
                    });

                    var destinations = '';
                    for (i = 0; i < filteredStations.length; i++) {
                        var d = filteredStations[i].lat.toString().concat('%2C', filteredStations[i].lng.toString());
                        if (i != filteredStations - 1) {
                            d = d.concat('%7C')
                        }
                        destinations = destinations.concat(d)
                    }

                    // omg, this is so nasty
                    const request = ('https://maps.googleapis.com/maps/api/distancematrix/json?units=imperial&origins='
                        .concat(origins, '&destinations=', destinations, '&key=', keyMatrixDistance));

                    // Add Allow-Control-Allow-Origin: * plugin
                    axios.get(request)
                        .then(function (response) {
                            const distances = response.data.rows[0].elements.map(function (d) {
                                return d.duration.value
                            });

                            const closestStation = filteredStations[distances.indexOf(Math.min.apply(Math, distances))];
                            closestStation.timeToReachIt = Math.min.apply(Math, distances);
                            console.log(closestStation);

                            var marker = addMarker({'lat': closestStation.lat, 'lng': closestStation.lng}, 'resources/bus-station.svg');

                                marker.addListener('click', function() {
                                    var infowindow = new google.maps.InfoWindow({
                                        content: closestStation.name
                                    });
                                    infowindow.open(map, marker);
                                });

                            })

                            // TODO: Send station to python code


                        }).catch(function (error) {
                        console.log(error)
                    })


        } else {
            alert("Invalid Position, you must be 10KM from Zurich center");
        }

    }).catch(function (error) {
        console.log(error)

    })
}
