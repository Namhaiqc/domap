mapboxgl.accessToken =
  "pk.eyJ1IjoibmFtaGFpcXUiLCJhIjoiY2x3N3hxc2F1MWZxbTJtcnpoaWIzNHNqbyJ9.pqFAMHce7XsTP_tH_p10tQ";

// Initialize the Mapbox map
let map = new mapboxgl.Map({
  container: "map", // HTML container ID for the map
  style: "mapbox://styles/mapbox/streets-v11", // Map style URL
  center: [10.75194559095554, 59.911011088089296], // Initial map center [longitude, latitude]
  zoom: 14, // Initial map zoom level
});

map.on('load', function () {
  // The rest of your map initialization code...

  // Check if the browser supports geolocation
  if (navigator.geolocation) {
    // Get the user's current position
    navigator.geolocation.getCurrentPosition(function(position) {
      const userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      console.log(userLocation); // Logs the user's location

      // Use userLocation here to center the map, add a marker, etc.
        // Use flyTo to move the map to the user's location
  map.flyTo({
    center: userLocation,
    zoom: 14, // This sets the zoom level after the "fly to" animation. Adjust as needed.
  });

    }, function() {
      console.log('Failed to retrieve user location');
    });

  } else {
    console.log('Geolocation is not supported by this browser.');
  }

  // The rest of your map initialization code...
});
// Add navigation controls to the map (zoom and rotation)
map.addControl(new mapboxgl.NavigationControl());

// Define points of interest (admin points) with coordinates, descriptions, and custom images
const adminPoints = [
  {
    coordinates: [10.735056746809901, 59.91204666956201],
    description: "do 2",
    imageUrl:
      "https://i.pinimg.com/736x/32/d5/b0/32d5b098ae45df5ad62a2560c99aae61.jpg",
  },
  {
    coordinates: [10.742902710528648, 59.912061730389624],
    description: "do 1",
    imageUrl:
      "https://i.pinimg.com/736x/32/d5/b0/32d5b098ae45df5ad62a2560c99aae61.jpg", // Add your custom image URL here
  },
];

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
      setRoute(userLocation, chosenDestination);
    }
  });
});

// Initialize Mapbox Directions plugin
var directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken, // Mapbox access token
  unit: "metric", // Unit of measurement for distances
  profile: "mapbox/driving", // Routing profile (driving)
  interactive: false, // Make the directions control non-interactive
  language: "norsk",
});

// Add the directions control to the map
map.addControl(directions, "top-left");

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

// Function to set the route from the user's location to the destination
function setRoute(userLocation, destination) {
  if (userLocation && trackUser) {
    directions.setOrigin(userLocation); // Set the origin to the user's location
  }
  if (destination) {
    directions.setDestination(destination); // Set the destination
  }
}


// Check if the browser supports geolocation
if (navigator.geolocation) {
  // Watch the user's position and update it continuously
  var watchId = navigator.geolocation.watchPosition(
    (position) => {
      userLocation = [position.coords.longitude, position.coords.latitude]; // Update the user's location

      // Remove the previous user marker if it exists
      if (userMarker) {
        userMarker.remove();
      }

      // Add the user marker to the map at the user's location
      var el = document.createElement("img"); // Create an HTML image element
      el.src =
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxIQEhUQEBAVFhUVFRUXFxUWFRcVFxUVFRUWGBUVFxUYHiggGBolHRUXITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OFxAQGisfHSAtLS4tLS0tLS0tLS0tLS0tLS8tKy0tKy0tLS0tLS0vLS0tLy0tLS0tLS0tLTcrLysrLf/AABEIAK0BIwMBIgACEQEDEQH/xAAbAAACAgMBAAAAAAAAAAAAAAAAAQIEAwUGB//EADoQAAIBAgMFBgMHAwQDAAAAAAABAgMRBCExBRJBUWEGE3GBkaEiMvAUI0JScrHRYoLBM7Lh8UOiwv/EABkBAQADAQEAAAAAAAAAAAAAAAABAgMEBf/EACgRAQEAAgIBAwIGAwAAAAAAAAABAhEDIRIxQVEE8CIyQmGh0XGRsf/aAAwDAQACEQMRAD8A9vABkgAAIAAAAgACQAAMBAAAa/bNDehvLWOflxObrRujspK+TOU2hQdObjwvl4PQ5+bH3dPBl+lwvbPBOVGe6rtZpc7cDQ16Do06dG/yK0v1NXk/W/sei43DqSZw234pSzdrr9rr68SeLLrSObHvbm8RknZmmlSdapGC469EvmfobbGu+aaYYOh3UXNxtOotPyw1S8Xr6GrGniZJZR0Ssl0SyK0NbvgSqNtksMlvcyUFj5W+H6+tTWwXwtlvFzu2V5q1PzIqYhUdoLqVKNGVSUacFeUnupdf44+RmxU8kuSO17Gdn3SXf1V8clkn+CL/APp8fJczPPLxaYYeV03mxNlxoUo048Fm+b4yfiy/UyLCSSKWIdzktd+MV6kh0adxKnctU42KL+iVOn9clxPRtiYBUaSSzckpSfNtZW6I80xNJVozowlaWV+q4x/a56R2arueHp73zRSi+OaS/wAWO3h4/Gbrg+o5fK+MbSJMiiaN3MaGhDIDAAAQDAAGIYAAAAAAAAAACBgDJCEMQAazbeG3o761j+31/k2QpK+TIym5pON1duNkcD2q2ZKpXSWUdW+mZ6NtDDOnJx4cOq4Gj2rhHOLs7S4cuDs+mRy43xy7dec88enASwMYLfnH9MefK/Q1mIvJtt69TbbQW9Nxd7JtehrcXBrgdNu3JrShNWeRkoqyYrO4b1r5hKpUV2QxbXd5fmMlR28yOAwU8VP7PD8VnKX5Ip5yf7JcXYi3SZN1texmxe/n9oqRvCD+BPSU0/mtyi/fwPR4QSRh2bgY0acacFaMUkl0S9/EdetY488t3bvww1NI16pTk7iqVLhSMvVtJpkhA1m3NtKgt2Ocrq75JtZeL9iG2dtKD7qk/i0b/L0XX9jncbSdRW1s0735NNpvwzOrh4d91yc/Pr8MdBsjb8Jzi2rPJN/zzPVOydX/AFI/oa5aWdvY8BdF0almraNZntnYSpdrPWivVbp1OJ2iJIiiSIEkSEhgAAMBAAAAxDAAAAAAAABgJgAMAAiA2RZIBMBAa7blK9Pe4xfs8v4OUxWmufI7mpBSTi9GrM4zE0tyUovg2vQ5uad7dX0+W5pxe18I1Ny3XZ6rl1Oe2jWUU30552PSMVQUkcztTsdGvLvO9lCLWaVmmvB6eIw5NTVTnxeV3HB06u8r+hCtWSO+2f2QwlP7tRc8rtzk5W5XWi9ODM0+y2ETyw9N/wBiYvLIicFeXb8pyVOmnKcnZRWbb8D0zsnsJYWn8VnVnZzkuL4RX9Kv53b4mywOzKdLOFOMX0il+xbkrZmeWfk1w4/HtKayNXiXmZa+LleyRrdq46NCDqVZWXu3wSXF9DK9+jederJvJas5nbvaCUounhJwzylU3kmukOv9XpzWqxm2p4luMZQUONKd4t/qej8NCvGOHi0qtGVKT0s7xfg9H5HTx8MneTk5vqN9YqtKFem4uSk48/mT81cvYDacoVJucW4zk3bj09jebGcIru4S3rvilnxtr7lqG0oxu1TUHHVtO6+nY6dONm2jgo1KMJwT+HdtdW+GWay4W09Dv+wicaiX9Fut1FfwcDsvEupNtN55y4q1/wDpdT0DsbfvVrpLX9LJo7gkhEkVSkhiQwAYhgIAAAGIYAAAAAAAAAACAYgAiyRFgRZEbIkgOX7R00qu8uKTfRrL/COlqzsmzl9tSvnfiY835W3B+ZQp/E1FLU5ftptfu493Sd56RUbtuXCyWvKxtcVUlZqMt3K1/HrdGv2ZsKFGp383v1HlFyz3b6yV27O2S8XzOaV3ya7Wuz2FqUqEVWd6sviqdJP8P9qsvFPmbGUSU5JcczFUkyKaqMlYwValhVKpHfTISp1Ha70Su8+mrOH23gMVia0pOnJ06cmo5WiksnJX1u1rxVuB31XBSxKdGknuvKU8t2K4q/FvSyT1dy/R7I4fdSqqU7L880vSLSNuOa7c3Nlvp5bDCKWVSEZW0us/J/wXKGFp2cFJ7vGE/jg/BSPTavZ7C2t3Ml/dN/uzQ7R7HXd6Fbyqxvb+5fwdGOfy5Lh8OIqbMhTe9SqulnxvOCf+6PubjZ2JcnuYhU2n/wCSE15Nxepi2hsTF4a7nS3ocZ03vxt1WUo+at1KOEjBu9ra6XWduSdi8vwr4/LtcFh6We7OKzS4Lgnl5M6nslbvlZ6KXrbT0u/I87w2E3H8zadnrbXXj0PSewmGdpVHGyStF823m/b3FQ7BEkJDRCUkMSGAAAAAAAAADAAAAAAAAAAABDEAmJjZFkiLIsGQqysrgUNpNt5Satwsmn9eJzu1JN6+v1obrEzNPjc01fP64GGfbfDppKSSzlonlnq/4/4K9LEurXtF5Q+KT9d1eLfsmR2/jI06Tbdst5+LWfsjHhF9npKDyk/iqPnNq7XllHyOZ6HtspVt6u4qTdlvNedjNW2ld2eXQ0uwp7zrYpv/AFJOnTXKnTbUpec7+UUV4U3KpVk5WhFqKz1aV5P3t5MaNty6vHmWsFSptp16qhF6Q3rTn1trGPo30WsNjbMdXdk6d46rebUFy3uNR/0rJaPPJdZRwrX4rfpVkaY4e7m5OX2jDhsZQSUYSSS0Si1Fe1i7TkpK8WmujTIzjUS+GSfiVpYmUH8dO39St/g1c68glTTMFLGQlxM+7yYGPuFqjW47s5hq13Oir8ZR+Bv9W783mbeJJx0X1l9ICngdiUKdrUo3XFred/GVzodm2autLteayZQTaTss9F1byXubbDUVCKgtIqxfFTJmQ0JEkXUNDEhgAhiAAAQE0AIAAQASAYAQAAEACYyLAGQY2yLJCZSxlTgWqkrK5rK9ZcmUyq2MVqzNbi2nk0/S5axGKem67c0VJST0frkZVrHI7XwsJV6V3eKnFvO6e7Les+V7WsartTi/hlut7020ud3e9vK50faCje0uK4+HVHDbUt3kZNWipJ63Uc17GVx7dWHJ122len9kpU6d/khCCXBysv3dzc9nuzcZwjOtKUoXbcErRm+Lcr5pvN2VnpfVFDYWxXj6/fVJxeHpSd92V+8mllHL8NpXb8EtcvSN1JWSyWWWSXQtjj71nycn6YVNR4EhWXIDRgkmw3uhFsVwI1MLCX4bPoQjQnH5XdGQd+bIScaj5lilnmU3C5YoS3eGRMRV3DxvKMeV5eUdPdr0NtEoYCN3KXhFeWd//b2L6NMfRlkaJISGkWQaGAAADEAgGAAAAAAAAAxAAAAAJkWyTIMCLZFsbItkjFiJWRQqSLOJkU5tcWZ5XteMUyliIJluosss/A1uJqviZ1pGq2tC8Wkef7Tg23ld8lx6WPQcTUNTsbZSq4xP8NL7x+P4F65/2sp7r+zquzmyo4TD06OSaV5vnOWc36u3gkbHd5MhOKf8mGUZLR39maM2dEWYPtlvnizNTqwl8siEk2G8yUoGNsBuTE2QlLxJU1xAyUzPey08FzbyS83kYYl3Z1LenfhD/c1kvJO/nEtIi1ssHR3IKN7tLN8282/W5ZSIomjViaRISGAAMAAAABAAAAAMBAAAAAAAIYARuRkSaISAi2YmycjFNkinXldlecjJORhqSMa1irXpRebjnzWT9Ua/ERlH5akl0laS98y9Wvws/PM1WKm1xqQ8lKPuUq8UMVN/ijF9Y3i/TQ2vZrDbtOVV61Hlf8sbpe7l7Gnl3s5Rgo06m87cYPq8uWvkdYoqEVCOkUkvBZIjH5Tl8IzZByFKRByLKpN31K9TDxemT6GV1HyRBy6pBKu6tWno95fXAnS2mnlJpdHkNzgtZGKXdy0jfyISs96n8r/gzQKtKKWiSLNMmIrPor2b6LVvgl1ehvMBQcIJP5tZW/M83bpwXRIqbMw/4n5fybSKNcYxyqUUTQkiSLKmMQwAAAABgDAQAADAEACABgIYAACGIBMi0TIsDDNFes8mWZlTE6C+iYoSZhqMyyMFRmNaxSxKXFemprK2tqdTP8rf+GbKuzUY2nvZODfK3PgZ1pFvYdCbnKc9IqyytdvN+i/c2tRkMHhu5pxppt2Wbbu23m8xSkW9Ir61GRBjlIxuQA2Ypq+o5SMEpLkwk33S1d/InFrgsjFfkrE4gZ6ZsMDRc2l9JFOjC50mAw25Hq9f4L4zamV0s0oWVkZ4ohBGVI1YmhgADAAAAAAAQxAIAuICaNftjbFPCxTqXcpO0KcFvTnLlGJffQ5RqOCbxuPn3uJqPdhGmr7q/JRi7cHm3z652xm2PNncZ11+99J9+0bLZ/aKNSqqFWjVoVJJuCqxSU7aqMk9VyL2L2rQpS3KtenCTSajKcYuzyTs3pkznNvbQhXngKkH9y8RGffJXSkso0mlmnJuzvy8TJtXDVqmNqRpQpPewkIt1d7dSdSppZO7z0yLeMYTnyksn4u5q/5m/b/rpaeLhKbpxknKMYyaXCMr7r87MzHCVtlSpfaIRq1U6GCo7soSlDenTjUte2quvlvx8DHtjaVW+9F1Y1IRwzXx1Envbjm4Uox3HHNpub1y5IeG/Qv1dxm88fvv+nfiOMxMavc4+t3tbfhVrQppTkoxjaDvGK8deHDiYtp4epD7Vu18R91So1YfeSf3st7efVfCvh0z00I8P3Wv1Nn6fvv+nV19r4enN054ilGasnGU4qSbs1k3fivUtyOJeJUMbiHOtGnvToO0sPKrv/dQvaSyjyBY6o8XFxdWN8RUhOMp1Jvc3Z2vS3VTjHJONm2+pPgifVd9/Ov519+jsJFPGM5DButONWnCrVnUVFzVWNSrbvITTSnTqJd3N5qydrXyNlsnFvEd5iby3akkqcW3aMYRUW0uF5b3oVzx1GnD9TM8pNev3/HX+12bKtaRmnIp4iZzV3xTxUjHsbDb1R1G3aGivk5P+F+6MGLqm7wtHu4KPHV/qev10KTurXqJzZXnInORgnMshGUjHKZGcupXlUCWSVTpcg6s+cV4ZsxOT5MUPBIhLNDqWKUTHTibbZmD330WpaTatulzZGE/G/L+TcRRGEbZIyxRvJqMLdpxRNCiiQQBiGAAAAAAAAyLGyLAQEbjAyGOeHhKUZyhFyhfdk0m472tnwvYyACzbR9mtjzoOrVquKlWnvOnTv3ULabqesnxZvRDJt2px4TDHxhDBiIXMQAAEJskzHMCtjKKqwcJ33ZKztJxfqndGqq0o00qdOKjGKskuCRuJGjxss2VzvSccZvfuwVJGuxdQsVZmrxszDKujGHs2n3lZN6Q+J+K+X3z8jeVZGs2AvgnLi528opW/dlurJiehfVCpMrVZkpVbkd25IrVJeHmVqlV6J58kjYzwsNWr+ZQxOPVN7sKcV11ZCYg6c/xt+BbwsbplOlUbacm3ct4eW7PLiIVscFQcmkjqMLQUI2X/bNfsegknLjextYm+E0wzu6yRRlijHEyxLKJIYIYAAAAAAAIABgJkJMkzHJgJsCIAf/Z"; // Set the source to a base64 encoded image or your custom image URL
      el.style.width = "50px"; // Set the image width
      el.style.height = "50px"; // Set the image height

      userMarker = new mapboxgl.Marker({ element: el })
        .setLngLat(userLocation)
        .addTo(map);

      // If a destination is chosen, set the route
      if (chosenDestination) {
        setRoute(userLocation, chosenDestination);
      }
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
