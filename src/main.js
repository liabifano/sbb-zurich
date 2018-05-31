function initMap() {
    var options = {
        zoom: 13,
        center: {lat: 47.378177, lng: 8.540192},
        mapTypeId: 'satellite'
    }
    var map = new google.maps.Map(document.getElementById('map'), options);
}