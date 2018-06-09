const mapStyle = 'terrain';
const mapCenter = {lat: 47.378177, lng: 8.540192};
const mapZoom = 12;
const stationsFile = '/resources/stations.csv';
const latesByHour = '/resources/stations_by_hour.csv';

var markers = [];

function rowConverterStations(d) {
    return {
        name: d.HALTESTELLEN_NAME,
        id: parseInt(d.BPUIC),
        types: d.PRODUKT_ID,
        coords: {'lat': parseFloat(d.lat), 'lng': parseFloat(d.lon)},
        size: parseInt(d.avg_trip_day),
        late: parseFloat(d.avg_p_late)
    }
}

function rowsConverterHour(d) {
    return {
        hour: parseInt(d.HOUR_OF_DAY),
        id: parseInt(d.BPUIC),
        trips_hour: parseFloat(d.count),
        late: parseFloat(d.p_late)
    }
}


function initMap() {
    const options = {
        zoom: mapZoom,
        center: mapCenter,
        mapTypeId: mapStyle
    };
    googleMap = new google.maps.Map(document.getElementById('map'), options);

    d3.queue()
        .defer(d3.csv, stationsFile)
        .await(function (error, stations) {
            stations = stations.map(rowConverterStations);

            const max_trips_day = math.max.apply(Math, stations.map(x => x.size));
            const min_trips_day = math.min.apply(Math, stations.map(x => x.size));

            const max_p_late = math.max.apply(Math, stations.map(x => x.late));
            const min_p_late = math.min.apply(Math, stations.map(x => x.late));

            var radioScaler = d3.scaleLinear().domain([min_trips_day, max_trips_day]).range([50, 300]);
            var colorScaler = d3.scaleLinear().domain([min_p_late, max_p_late]).range(['blue', 'red']);

            function addMarker(station) {
                var marker = new google.maps.Circle({
                    strokeWeight: 0,
                    fillColor: colorScaler(station.late),
                    fillOpacity: 0.7,
                    map: googleMap,
                    center: station.coords,
                    position: station.coords,
                    radius: radioScaler(station.size),
                    content: station.name
                });
                marker.addListener('click', function () {
                    var infoWindow = new google.maps.InfoWindow({
                        content: station.name
                    });
                    infoWindow.open(googleMap, marker);
                });
                markers.push(marker)
            }

            for (var i = 0; i < stations.length; i++) {
                addMarker(stations[i])
            }

        });
}


var locationForm = document.getElementById('form');
locationForm.addEventListener('submit', change);


function change(e) {
    e.preventDefault();

    const inputedHour = document.getElementById('hour-input').value;

    d3.queue()
        .defer(d3.csv, stationsFile)
        .await(function (error, stations) {
            stations = stations.map(rowConverterStations);

            d3.queue()
                .defer(d3.csv, latesByHour)
                .await(function (error, latesByHour) {
                    var latesByHour = latesByHour.map(rowsConverterHour);

                    var treatLatesByHour = [];

                    for (h = 0; h < 24; h++) {
                        var latesNow = latesByHour.filter(x => x.hour == h);

                        var mergedLatesNow = stations.map(function (d) {
                            var lates = latesNow.filter(x => x.id == d.id);

                            return {
                                id: d.id,
                                coords: d.coords,
                                name: d.name,
                                late: (lates.length == 1) ? lates[0].late : 0,
                                size: (lates.length == 1) ? lates[0].trips_hour : 0
                            }
                        });
                        treatLatesByHour.push(mergedLatesNow);
                    }

                    const max_trips_hour = math.max.apply(Math, latesByHour.map(x => x.trips_hour));
                    const min_trips_hour = math.min.apply(Math, latesByHour.map(x => x.trips_hour));

                    const max_p_late = math.max.apply(Math, latesByHour.map(x => x.late));
                    const min_p_late = math.min.apply(Math, latesByHour.map(x => x.late));

                    var radioScaler = d3.scaleLinear().domain([min_trips_hour, max_trips_hour]).range([50, 300]);
                    var colorScaler = d3.scaleLinear().domain([min_p_late, max_p_late]).range(['blue', 'red']);


                    var latesNow = treatLatesByHour[inputedHour];

                    markers.map(function (d, i) {
                        d.setOptions({
                            radius: radioScaler(latesNow[i].size),
                            fillColor: colorScaler(latesNow[i].late)
                        })
                    });
                });
        });

}
