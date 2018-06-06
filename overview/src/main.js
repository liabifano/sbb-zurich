const mapStyle = 'terrain';
const mapCenter = {lat: 47.378177, lng: 8.540192};
const mapZoom = 12;
const stationsFile = '/resources/stations.csv';
const latesByHour = '/resources/stations_by_hour.csv';

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
        trips_day: parseInt(d.total_count),
        late: parseFloat(d.p_all_late)
    }
}

function initMap() {
    const options = {
        zoom: mapZoom,
        center: mapCenter,
        mapTypeId: mapStyle
    };
    const map = new google.maps.Map(document.getElementById('map'), options);

    // function addMarker(station){
    //     const marker = new google.maps.Marker({
    //         position: station.coords,
    //         map: map,
    //         content: station.name,
    //         draggable: true
    //     });
    //
    //     const infoWindow = new google.maps.InfoWindow({
    //         content: station.name
    //     });
    //
    // }

    d3.queue()
        .defer(d3.csv, stationsFile)
        .await(function (error, stations) {
            stations = stations.map(rowConverterStations);
            console.log(stations)

            const max_trips_day = math.max.apply(Math, stations.map(x => x.size));
            const min_trips_day = math.min.apply(Math, stations.map(x => x.size));

            const max_p_late = math.max.apply(Math, stations.map(x => x.late));
            const min_p_late = math.min.apply(Math, stations.map(x => x.late));

            const radioScaler = d3.scaleLinear().domain([min_trips_day, max_trips_day]).range([50, 300]);
            const colorScaler = d3.scaleLinear().domain([min_p_late, max_p_late]).range(['blue', 'red']);

            console.log(colorScaler(stations[2].late));
            console.log(colorScaler(stations[883].late));

            for (var i=0; i<stations.length; i++) {

                var stationCircle = new google.maps.Circle({
                    strokeWeight: 0,
                    fillColor: colorScaler(stations[i].late),
                    fillOpacity: 0.7,
                    map: map,
                    center: stations[i].coords,
                    radius: radioScaler(stations[i].size),
                    content: stations[i].name
                });

                var infoWindow = new google.maps.InfoWindow({
                    content: stations[i].name
                });

                // google.maps.event.addListener(stationCircle, 'click', function(ev) {
                //     console.log(stationCircle)
                //     infoWindow.setPosition(ev.latLng);
                //     infoWindow.open(map);
                // });

                google.maps.event.addListener(stationCircle, 'click', function(ev){
                    infoWindow.setPosition(stationCircle.getCenter());
                    infoWindow.open(map);
                });
            }
        });

    // d3.queue()
    //     .defer(d3.csv, latesByHour)
    //     .await(function (error, latesByHour) {
    //         latesByHour = latesByHour.map(rowsConverterHour);
    //         console.log(latesByHour)
    //
    //     })
    // for (var i=0; i< stations.length; i++) {
    //     addMarker(stations[i]);
    // }
    //
    // var svg = d3.select("map").append("svg");
    //
    // svg.selectAll("circle")
    //     .data(aa, bb).enter()
    //     .append("circle")
    //     .attr("cx", aa[0])
    //     .attr("cy", aa[1])
    //     .attr("r", "8px")
    //     .attr("fill", "red")

}