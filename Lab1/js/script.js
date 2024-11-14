// Initialize the Leaflet map, centered on Morocco
const map = L.map('map').setView([31.110094, -8.37], 5); // Center on Morocco

// Add OpenStreetMap tiles for street view
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Earthquake data API
const apiUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';

let dataPoints = [];

// Fetch and process earthquake data
fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        // Process earthquake data from GeoJSON
        dataPoints = data.features
            .filter(feature => feature.properties.mag !== null && feature.geometry.coordinates[2] !== null)
            .map(feature => ({
                name: feature.properties.place,
                coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]], // [lat, lon]
                magnitude: parseFloat(feature.properties.mag),
                depth: parseFloat(feature.geometry.coordinates[2]),
                time: new Date(feature.properties.time).toLocaleString() // Convert timestamp to readable format
            }));
        
        addDataPointsToMap(); // Call function to add points to the map
    })
    .catch(error => console.error("Error fetching data:", error));

// Color-coding function based on earthquake depth
function getColor(depth) {
    return depth > 90 ? "rgb(255,13,13)" :
           depth > 70 ? "rgb(255,78,17)" :
           depth > 50 ? "rgb(255,142,21)" :
           depth > 30 ? "rgb(250,183,51)" :
           depth > 10 ? "rgb(172,179,52)" :
                        "rgb(105,179,76)";
}

// Function to add data points to the map with popups
function addDataPointsToMap() {
    dataPoints.forEach(d => {
        const circle = L.circleMarker(d.coordinates, {
            radius: d.magnitude * 2, // Scale radius based on earthquake magnitude
            color: "black",
            fillColor: getColor(d.depth),
            fillOpacity: 0.7
        }).addTo(map);

        // Bind a popup to each circle with earthquake information
        circle.bindPopup(`
            <strong>Location:</strong> ${d.name}<br>
            <strong>Magnitude:</strong> ${d.magnitude}<br>
            <strong>Depth:</strong> ${d.depth} km<br>
            <strong>Time:</strong> ${d.time}
        `);
    });
}

// Add a legend for depth color coding
const legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    const div = L.DomUtil.create("div", "legend");
    const depthRanges = [
        { limit: 90, color: "rgb(255,13,13)", text: "> 90" },
        { limit: 70, color: "rgb(255,78,17)", text: "70-90" },
        { limit: 50, color: "rgb(255,142,21)", text: "50-70" },
        { limit: 30, color: "rgb(250,183,51)", text: "30-50" },
        { limit: 10, color: "rgb(172,179,52)", text: "10-30" },
        { limit: 0, color: "rgb(105,179,76)", text: "0-10" }
    ];

    div.innerHTML = "<strong>Depth (km)</strong><br>";
    depthRanges.forEach(range => {
        div.innerHTML += `<span> <div style="background:${range.color}"/> ${range.text} </span>`;
    });
    return div;
};

legend.addTo(map);