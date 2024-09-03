// Initialize the map and set its view to a chosen geographical coordinates and a zoom level
var map = L.map('map').setView([37.09, -95.71], 5);

// Add a tile layer (the background map image) to our map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
}).addTo(map);

// URL for the GeoJSON data
var geojsonUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Function to determine marker size based on magnitude
function getRadius(magnitude) {
    return magnitude * 4;  // Adjust this value for better visualization
}

// Function to determine marker color based on depth
function getColor(depth) {
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' :
                        '#1a9850';
}

// Fetch the GeoJSON data and create the map
fetch(geojsonUrl)
    .then(response => response.json())
    .then(data => {
        // Creating a GeoJSON layer with the retrieved data
        var earthquakeLayer = L.geoJSON(data, {
            // Create circle markers for each earthquake
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, {
                    radius: getRadius(feature.properties.mag),
                    fillColor: getColor(feature.geometry.coordinates[2]),
                    color: "#000",  // Outline color
                    weight: 1,      // Outline width
                    opacity: 1,
                    fillOpacity: 0.8
                });
            },
            // Add popups to each marker
            onEachFeature: function (feature, layer) {
                layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Date: ${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]} km</p>`);
            }
        });

        // Add the earthquake layer to the map
        earthquakeLayer.addTo(map);

        // Fit the map view to the bounds of the earthquake markers
        map.fitBounds(earthquakeLayer.getBounds());

        // Add a legend to the map
        var legend = L.control({ position: "bottomright" });

        legend.onAdd = function () {
            var div = L.DomUtil.create('div', 'info legend'),
                depths = [0, 10, 30, 50, 70, 90],
                labels = [];

            // Loop through our depth intervals and generate a label with a colored square for each interval
            for (var i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + getColor(depths[i] + 1) + '"></i> ' +
                    depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + ' km<br>' : '+ km');
            }

            return div;
        };

        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching the GeoJSON data: ', error));