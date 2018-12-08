import React, {Component} from 'react';
import VenueList from './VenueList';

class App extends Component {
    /**
     * Constructor
     */
    constructor(props) {
        super(props);
        this.state = {
            'alllocations': [
                {
                    'name': "Chowmahala Palace",
                    'type': "Heritage",
                    'latitude': 17.3578,
                    'longitude': 78.4717,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Charminar",
                    'type': "Monument",
                    'latitude': 17.3616,
                    'longitude': 78.4747,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Hussain Sagar",
                    'type': "Lake",
                    'latitude': 17.4239,
                    'longitude': 78.4738,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Birla Mandir",
                    'type': "Temple",
                    'latitude': 17.4062,
                    'longitude': 78.4691,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Nehru Zoological Park",
                    'type': "Park",
                    'latitude': 17.3507,
                    'longitude': 78.4513,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Salar Jung Museum",
                    'type': "Museum",
                    'latitude': 17.3713,
                    'longitude': 78.4084,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Golconda Fort",
                    'type': "Fort",
                    'latitude': 17.3833,
                    'longitude': 78.4011,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Secunderabad",
                    'type': "Transportation",
                    'latitude': 17.4337,
                    'longitude': 78.5016,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Cyber Towers",
                    'type': "Business Center",
                    'latitude': 17.4505,
                    'longitude': 78.3809,
                    'streetAddress': "Hyderabad,Telangana"
                },
                {
                    'name': "Shilparamam",
                    'type': "Art-Village",
                    'latitude': 17.4515,
                    'longitude': 78.3778,
                    'streetAddress': "Hitech city, Hyderabad"
                },
                {
                  'name': "IMAX",
                  'type': "Entertainment",
                  'latitude': 17.4129,
                  'longitude': 78.4659,
                  'streetAddress': "Hyderabad,Telangana"
                }

            ],
            'map': '',
            'infowindow': '',
            'prevmarker': ''
        };

        // retain object instance when used in the function
        this.initMap = this.initMap.bind(this);
        this.openInfoWindow = this.openInfoWindow.bind(this);
        this.closeInfoWindow = this.closeInfoWindow.bind(this);
    }

    componentDidMount() {
        // Connect the initMap() function within this class to the global window context,
        // so Google Maps can invoke it
        window.initMap = this.initMap;
        // Asynchronously load the Google Maps script, passing in the callback reference
        loadMapJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyCnzM0AtE2VxsJjrZ_oQLjrwwNeyjVj30Q&callback=initMap')
    }

    /**
     * Initialise the map once the google map script is loaded
     */
    initMap() {
        var self = this;

        var mapview = document.getElementById('map');
        mapview.style.height = window.innerHeight + "px";
        var map = new window.google.maps.Map(mapview, {
            center: {lat: 17.377631, lng: 78.478603},
            zoom: 12,
            mapTypeControl: false
        });

        var InfoWindow = new window.google.maps.InfoWindow({});

        window.google.maps.event.addListener(InfoWindow, 'closeclick', function () {
            self.closeInfoWindow();
        });

        this.setState({
            'map': map,
            'infowindow': InfoWindow
        });

        window.google.maps.event.addDomListener(window, "resize", function () {
            var center = map.getCenter();
            window.google.maps.event.trigger(map, "resize");
            self.state.map.setCenter(center);
        });

        window.google.maps.event.addListener(map, 'click', function () {
            self.closeInfoWindow();
        });

        var alllocations = [];
        this.state.alllocations.forEach(function (location) {
            var longname = location.name + ' - ' + location.type;
            var marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(location.latitude, location.longitude),
                animation: window.google.maps.Animation.DROP,
                map: map
            });

            marker.addListener('click', function () {
                self.openInfoWindow(marker);
            });

            location.longname = longname;
            location.marker = marker;
            location.display = true;
            alllocations.push(location);
        });
        this.setState({
            'alllocations': alllocations
        });
    }

    /**
     * Open the infowindow for the marker
     * @param {object} location marker
     */
    openInfoWindow(marker) {
        this.closeInfoWindow();
        this.state.infowindow.open(this.state.map, marker);
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
        this.setState({
            'prevmarker': marker
        });
        this.state.infowindow.setContent('Loading Data...');
        this.state.map.setCenter(marker.getPosition());
        this.state.map.panBy(0, -200);
        this.getMarkerInfo(marker);
    }

    /**
     * Retrive the location data from the foursquare api for the marker and display it in the infowindow
     * @param {object} location marker
     */
    getMarkerInfo(marker) {
        var self = this;
        var clientId = "HKJN5VKHHSEDSXSY35QJSKTMT2FWKJLRLHIKV51ZIHP0FP4C";
        var clientSecret = "FNGK0R4NW2SKMR2301VJ04L4D245QZHTB3JCFOLLVZ55GNQW";
        var url = "https://api.foursquare.com/v2/venues/search?client_id=" + clientId + "&client_secret=" + clientSecret + "&v=20130815&ll=" + marker.getPosition().lat() + "," + marker.getPosition().lng() + "&limit=1";
        fetch(url)
            .then(
                function (response) {
                    if (response.status !== 200) {
                        self.state.infowindow.setContent("Sorry data can't be loaded");
                        return;
                    }

                    // Examine the text in the response
                    response.json().then(function (data) {
                        var location_data = data.response.venues[0];
                        var verified = '<b>Verified Location: </b>' + (location_data.verified ? 'Yes' : 'No') + '<br>';
                        var checkinsCount = '<b>Number of CheckIn: </b>' + location_data.stats.checkinsCount + '<br>';
                       var readMore = '<a href="https://foursquare.com/v/'+ location_data.id +'" target="_blank">Read More on Foursquare Website</a>'
                      self.state.infowindow.setContent(checkinsCount + verified + readMore);
                    });

                }
            )
            .catch(function (err) {
                self.state.infowindow.setContent("Sorry data can't be loaded");
            });
    }

    /**
     * Close the infowindow for the marker
     * @param {object} location marker
     */
    closeInfoWindow() {
        if (this.state.prevmarker) {
            this.state.prevmarker.setAnimation(null);
        }
        this.setState({
            'prevmarker': ''
        });
        this.state.infowindow.close();
    }

    /**
     * Render function of App
     */
    render() {
        return (
            <div>
                <VenueList key="100" alllocations={this.state.alllocations} openInfoWindow={this.openInfoWindow}
                              closeInfoWindow={this.closeInfoWindow}/>
                <div id="map"></div>
            </div>
        );
    }
}

export default App;

/**
 * Load the google maps Asynchronously
 * @param {url} url of the google maps script
 */
function loadMapJS(src) {
    var ref = window.document.getElementsByTagName("script")[0];
    var script = window.document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = function () {
        document.write("Google Maps can't be loaded");
    };
    ref.parentNode.insertBefore(script, ref);
}
