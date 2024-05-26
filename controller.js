
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

// Function to update distances for all admin points
function updateDistances(userLocation) {
  // Clear the content-block div before updating
  contentBlock.innerHTML = '';

  // Loop through adminPoints in pairs
  for (let i = 0; i < adminPoints.length; i += 2) {
    const point1 = adminPoints[i];
    const point2 = adminPoints[i + 1];

    // Calculate distance for point1
    const distance1 = calculateDistance(userLocation, point1.coordinates);
    let distanceText1;
    if (distance1 < 1000) {
      distanceText1 = `${Math.round(distance1)} meters`; // Display distance in meters if less than 1 kilometer
    } else {
      distanceText1 = `${(distance1 / 1000).toFixed(2)} km`; // Display distance in kilometers
    }

    // Create elements for point1
    const adminLink1 = document.createElement('a');
    adminLink1.href = '#';
    adminLink1.className = 'popAdress';
    adminLink1.textContent = point1.description;

    const distancePara1 = document.createElement('p');
    distancePara1.className = 'distanceAdress';
    distancePara1.textContent = distanceText1;

    // Append elements for point1 to the content-block div
    contentBlock.appendChild(adminLink1);
    contentBlock.appendChild(distancePara1);

    if (point2) {
      // Calculate distance for point2
      const distance2 = calculateDistance(userLocation, point2.coordinates);
      let distanceText2;
      if (distance2 < 1000) {
        distanceText2 = `${Math.round(distance2)} meters`; // Display distance in meters if less than 1 kilometer
      } else {
        distanceText2 = `${(distance2 / 1000).toFixed(2)} km`; // Display distance in kilometers
      }

      // Create elements for point2
      const adminLink2 = document.createElement('a');
      adminLink2.href = '#';
      adminLink2.className = 'popAdress';
      adminLink2.textContent = point2.description;

      const distancePara2 = document.createElement('p');
      distancePara2.className = 'distanceAdress';
      distancePara2.textContent = distanceText2;

      // Append elements for point2 to the content-block div
      contentBlock.appendChild(adminLink2);
      contentBlock.appendChild(distancePara2);
    }
  }
}



// Call the updateDistances function with the user's location once it's available
navigator.geolocation.getCurrentPosition(function(position) {
  const userLocation = [position.coords.latitude, position.coords.longitude];
  updateDistances(userLocation);
});

var userMarker; // Variable to store the user's marker
var chosenDestination = null; // Variable to store the selected destination coordinates
var userLocation = null; // Variable to store the user's location
var trackUser = true; // Flag to indicate whether to track the user's location

// Loop through each admin point and add a custom marker to the map
adminPoints.forEach((point) => {
  // Create a custom HTML element for the marker
  var el = document.createElement("div");
  el.className = "custom-marker";

  // Create an image element for the marker
  var img = document.createElement("img");
  img.src = point.imageUrl; // Set the image URL
  img.style.width = "50px"; // Set the image width
  img.style.height = "50px"; // Set the image height
  el.appendChild(img);

  // Add the marker to the map
  const marker = new mapboxgl.Marker(el)
    .setLngLat(point.coordinates) // Set the marker's coordinates
    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${point.description}</h3>`)) // Set the popup with the description
    .addTo(map); // Add the marker to the map

// Add a click event listener to the marker
marker.getElement().addEventListener("click", () => {
  marker.togglePopup(); // Toggle the popup on click
  chosenDestination = point.coordinates; // Set the chosen destination

  // If the user's location is known, set the route
  if (userLocation) {
    setRouteFromStartToEnd(userLocation, chosenDestination); // Update this line
    map.flyTo({
      center: userLocation,
      zoom: 22,
    });
  }
});
});
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
        setRouteFromStartToEnd(userLocation, chosenDestination);
      }
            // Center the map on the user's location and follow
            map.setCenter(userLocation);
    },
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
