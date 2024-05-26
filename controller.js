
mapboxgl.accessToken =
  "pk.eyJ1IjoibmFtaGFpcXUiLCJhIjoiY2x3N3hxc2F1MWZxbTJtcnpoaWIzNHNqbyJ9.pqFAMHce7XsTP_tH_p10tQ";


// Initialize the Mapbox map
let map = new mapboxgl.Map({
  container: "map", // HTML container ID for the map
  style: "mapbox://styles/mapbox/streets-v11", // Map style URL
  center: [10.75194559095554, 59.911011088089296], // Initial map center [longitude, latitude]
  zoom: 14, // Initial map zoom level
  preserveDrawingBuffer: true // Preserve the drawing buffer to maintain map state

});

map.on('load', function() {
  // Get user's current position as start point
  navigator.geolocation.getCurrentPosition(function(position) {
    var start = [position.coords.longitude, position.coords.latitude];
    var end;
  });

  if (navigator.geolocation) {
    // Get the user's current position
    navigator.geolocation.getCurrentPosition(function(position) {
      const userLocation = [position.coords.longitude, position.coords.latitude];

      console.log(userLocation); // Logs the user's location

    });
  }
});



// Add navigation controls to the map (zoom and rotation)
map.addControl(new mapboxgl.NavigationControl(), 'top-left');

// Define points of interest (admin points) with coordinates, descriptions, and custom images
const adminPoints = [
  {
    coordinates: [10.735056746809901, 59.91204666956201],
    description: "do 2",
    imageUrl: "https://i.pinimg.com/736x/32/d5/b0/32d5b098ae45df5ad62a2560c99aae61.jpg",
  },
  {
    coordinates: [10.742902710528648, 59.912061730389624],
    description: "do 1",
    imageUrl: "https://i.pinimg.com/736x/32/d5/b0/32d5b098ae45df5ad62a2560c99aae61.jpg",
  },
  {
    coordinates: [10.73014853758133, 59.9206046301212],
    description: "do 1",
    imageUrl: "https://i.pinimg.com/736x/32/d5/b0/32d5b098ae45df5ad62a2560c99aae61.jpg",
  },
  {
    coordinates: [10.754196022038602, 59.91433440115406],
    description: "do 1",
    imageUrl: "https://i.pinimg.com/736x/32/d5/b0/32d5b098ae45df5ad62a2560c99aae61.jpg",
  },
];


// Get the content-block div
const contentBlock = document.querySelector('.content-block');

// Function to calculate the distance between two coordinates using the Haversine formula
function calculateDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371e3; // Radius of the Earth in meters
  const φ1 = lat1 * Math.PI / 180; // Convert latitude 1 to radians
  const φ2 = lat2 * Math.PI / 180; // Convert latitude 2 to radians
  const Δφ = (lat2 - lat1) * Math.PI / 180; // Difference in latitude
  const Δλ = (lon2 - lon1) * Math.PI / 180; // Difference in longitude

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters
  return distance;
}

function updateDistances(userLocation) {
  // Clear the content-block div before updating
  contentBlock.innerHTML = '';

  // Loop through all adminPoints
  adminPoints.forEach(point => {
    // Calculate distance for the current point
    const distance = calculateDistance(userLocation, point.coordinates);
    let distanceText;
    if (distance < 1000) {
      distanceText = `${Math.round(distance)} meters`; // Display distance in meters if less than 1 kilometer
    } else {
      distanceText = `${(distance / 1000).toFixed(2)} km`; // Display distance in kilometers
    }

    // Create elements for the current point
    const adminLink = document.createElement('a');
    adminLink.href = '#';
    adminLink.className = 'popAdress';
    adminLink.textContent = point.description;

    const distancePara = document.createElement('p');
    distancePara.className = 'distanceAdress';
    distancePara.textContent = distanceText;

    // Append elements for the current point to the content-block div
    contentBlock.appendChild(adminLink);
    contentBlock.appendChild(distancePara);

    adminLink.addEventListener('click', () => {
      // When clicked, calculate the route from userLocation to point.coordinates
      setRouteFromStartToEnd(userLocation, point.coordinates);
    });
  });
}



// Call the updateDistances function with the user's location once it's available
navigator.geolocation.getCurrentPosition(function(position) {
  const userLocation = [position.coords.latitude, position.coords.longitude];
  updateDistances(userLocation);
});

// Initialize variables for user location and marker
var userMarker;
var chosenDestination = null;
var userLocation = null;
var trackUser = true;

// Function to handle user location updates
function handleUserLocation(position) {
  userLocation = [position.coords.longitude, position.coords.latitude];

  if (!userMarker) {
    userMarker = new mapboxgl.Marker().setLngLat(userLocation).addTo(map);
  } else {
    userMarker.setLngLat(userLocation);
  }

  if (chosenDestination) {
    const distance = calculateDistanceToRoute(userLocation, chosenDestination);
    if (distance > 5) {
      getRoute(userLocation, chosenDestination);
    }
  }

  updateDistances(userLocation);
}


// Function to calculate the shortest distance from a point to a route
function calculateDistanceToRoute(userLocation, routeCoordinates) {
  let closestDistance = Infinity;
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const segmentStart = routeCoordinates[i];
    const segmentEnd = routeCoordinates[i + 1];
    const distance = turf.pointToLineDistance(turf.point(userLocation), turf.lineString([segmentStart, segmentEnd]), { units: 'meters' });
    if (distance < closestDistance) {
      closestDistance = distance;
    }
  }
  return closestDistance;
}
// Function to get the route between user location and destination
function getRoute(start, end) {
  const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      const route = data.routes[0].geometry.coordinates;
      map.getSource('route').setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: route
        }
      });
      chosenDestination = end;
    });
}

// Add source and layer for the route
map.on('load', () => {
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }
  });

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': 5,
      'line-opacity': 0.75
    }
  });
});
// Add source and layer for the route
map.on('load', () => {
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }
  });

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': 5,
      'line-opacity': 0.75
    }
  });
});

// Loop through all adminPoints to add markers and popups
adminPoints.forEach((point) => {
  // Create a marker element
  var markerElement = document.createElement("div");
  markerElement.className = "custom-marker";

  // Create an image element for the marker
  var img = document.createElement("img");
  img.src = point.imageUrl; // Set the image URL
  img.style.width = "50px"; // Set the image width
  img.style.height = "50px"; // Set the image height
  markerElement.appendChild(img);

  // Create a marker with the custom element
  const marker = new mapboxgl.Marker(markerElement)
    .setLngLat(point.coordinates) // Set the marker's coordinates
    .addTo(map); // Add the marker to the map

  // Create a popup with the description and button
  const popupContent = document.createElement('div');
  popupContent.innerHTML = `<h3>${point.description}</h3><button class="navigateBtn">Navigate</button>`;

  // Add a popup to the marker
  const popup = new mapboxgl.Popup({ offset: 25 }).setDOMContent(popupContent);
  marker.setPopup(popup);

  // Add click event listener to the navigate button inside the popup
  popupContent.querySelector(".navigateBtn").addEventListener("click", () => {
    setRouteFromStartToEnd(userLocation, point.coordinates);
  });
});


// Function to set the route from start to end point
function setRouteFromStartToEnd(start, end) {
  // Your code for setting the route
}
  // If the user's location is known, set the route
  if (userLocation) {
    setRouteFromStartToEnd(userLocation, chosenDestination); // Update this line
    map.flyTo({
      center: userLocation,
      zoom: 22,
    });
  }


// Initialize Mapbox Directions plugin
var directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken, // Mapbox access token
  unit: "metric", // Unit of measurement for distances
  profile: "mapbox/walking", // Routing profile (walking)
  interactive: false, // Make the directions control non-interactive
  language: "norsk",
});

// Add the directions control to the map

// Event listener for changes to the origin in the directions control
directions.on("origin", function (event) {
  if (event.feature) {
    // Check if the new origin matches the user's location
    if (
      event.feature.geometry.coordinates[0] === userLocation[0] &&
      event.feature.geometry.coordinates[1] === userLocation[1]
    ) {
      trackUser = true; // Enable user tracking if the origin is the user's location
    } else {
      trackUser = false; // Disable user tracking if the origin is different
    }
  } else {
    // Enable user tracking if the origin input is cleared
    trackUser = true;
    if (userLocation) {
      // Manually set the origin to the user's location
      directions.setOrigin(userLocation);
    }
  }
});
// Function to update marker position along the route
function updateMarkerAlongRoute(coordinates) {
  // Remove the previous marker if it exists
  if (userMarker) {
    userMarker.remove();
  }

  // Create a new marker at the current coordinates
  var le = document.createElement("div");
  le.className = "custom-marker";

  // Create an image element for the marker
  var img = document.createElement("img");
  img.src = "https://photos.peopleimages.com/picture/202305/2829513-idea-pointing-and-portrait-of-black-man-for-question-and-deal-on-an-isolated-and-transparent-png-background.-target-solution-and-sales-with-hand-gesture-of-guy-for-discount-decision-and-choice-fit_400_400.jpg"; // Set the image URL
  img.style.width = "50px"; // Set the image width
  img.style.height = "50px"; // Set the image height
  le.appendChild(img);

  // Add the marker to the map
  userMarker = new mapboxgl.Marker({ element: el })
    .setLngLat(coordinates)
    .addTo(map);
}


// Function to set the route from start to end point
// Function to set the route from start to end point
function setRouteFromStartToEnd(start, end) {
  // Fetch route from start to end point from Mapbox Directions API
  var url = 'https://api.mapbox.com/directions/v5/mapbox/walking/' + encodeURIComponent(start[0]) + ',' + encodeURIComponent(start[1]) + ';' + encodeURIComponent(end[0]) + ',' + encodeURIComponent(end[1]) + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;

  fetch(url)
  .then(response => response.json())
  .then(data => {
    // Extract distance and duration from the route data
    let distance = data.routes[0].distance;
    const duration = data.routes[0].duration;
  
    // Convert distance to kilometers if it's more than 1 km
    let distanceText;
    if (distance >= 1000) {
      distance = (distance / 1000).toFixed(2);
      distanceText = `${distance} km`;
    } else {
      distance = Math.round(distance);
      distanceText = `${distance} meters`;
    }
  
    // Convert duration to minutes
    const durationInMinutes = Math.round(duration / 60);
  
    var route = data.routes[0].geometry.coordinates;
    var geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: route
      }
    };
  
    // Check if the route source already exists, update it if it does, otherwise add it
    if (map.getSource('route')) {
      map.getSource('route').setData(geojson);
    } else {
      map.addSource('route', {
        type: 'geojson',
        data: geojson
      });
  
      // Add a new layer using the data source.
      map.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        paint: {
          'line-color': '#888',
          'line-width': 8
        }
      });
    }
    map.flyTo({
      center: start,
      zoom: 16,
      essential: true // Allow the map to stay at the specified zoom level
    });

    // Set the trackUser flag to true to enable continuous tracking
    trackUser = true;
    // Update the directions element with the new directions
    var steps = data.routes[0].legs[0].steps;
    var directions = steps.map((step, index) => {
      return `Step ${index + 1}: ${step.maneuver.instruction}`;
    }).join('<br>');
    document.getElementById('directions').innerHTML = directions;


  // Update the content of the estimate div with the adjusted distance text
  document.getElementById('estimate').innerHTML = `Distance: ${distanceText}, Duration: ${durationInMinutes} minutes`;
});

  updateMarkerAlongRoute(route[0]); // Update the marker position to the start of the route
}

document.getElementById("recenterBtn").addEventListener("click", () => {
  if (userLocation) {
    map.flyTo({
      center: userLocation,
      zoom: 16, // Adjust the zoom level as needed
    });
  } else {
    console.log("User location is not available.");
  }
});
// Check if the browser supports geolocation
if (navigator.geolocation) {
  // Watch the user's position and update it continuously
  var watchId = navigator.geolocation.watchPosition(
    (position) => {
      userLocation = [position.coords.longitude, position.coords.latitude]; // Update the user's location
      updateDistances(userLocation); // Update distances

      // Remove the previous user marker if it exists
      if (userMarker) {
        userMarker.remove();
      }

      // Add the user marker to the map at the user's location
      var el = document.createElement("img"); // Create an HTML image element
      el.src =
        "https://photos.peopleimages.com/picture/202305/2829513-idea-pointing-and-portrait-of-black-man-for-question-and-deal-on-an-isolated-and-transparent-png-background.-target-solution-and-sales-with-hand-gesture-of-guy-for-discount-decision-and-choice-fit_400_400.jpg"
      el.style.width = "50px"; // Set the image width
      el.style.height = "50px"; // Set the image height

      userMarker = new mapboxgl.Marker({ element: el })
        .setLngLat(userLocation)
        .addTo(map);

// If a destination is chosen, set the route
if (chosenDestination) {
  getRoute(userLocation, chosenDestination);

    (error) => {
      console.error("Error watching position:", error); // Handle geolocation errors
    },
    {
      enableHighAccuracy: true, // Enable high accuracy for geolocation
      timeout: 10000, // Timeout after 10 seconds
      maximumAge: 0, // Do not use cached positions
    }
  );
} else {
  console.error("Geolocation is not supported by this browser."); // Handle unsupported geolocation
}
