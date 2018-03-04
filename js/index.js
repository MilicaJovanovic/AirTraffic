// Defining constant IMG elements with airplane icons
const planeLeft = "<img style='width: 25px; height: 25px;' src='../images/plane-left.png' />";
const planeRight = "<img style='width: 25px; height: 25px;' src='../images/plane-right.png' />";
var lat = 0.0;
var lng = 0.0;

$(document).ready(() => {
  $('#locationModal').modal('show');
});

/*
 * If user clicks Yes, this function is called
 * I hides modal, and load data
 */
geolocationAllowed = () => {
  $('#locationModal').modal('hide');
  getLocation();
  loadAirplaneData();
  document.getElementById("description").innerHTML = "Here you can see all the airplanes that are flying over you location. In the list above you can see fligth details available and sort airplanes by altitude they are flying at.";
  document.getElementById("table-part").style.display = "block";
}

/*
 * If user clicks No, this function is called
 * It hides modal, and show message
 */
geolocationNotAllowed = () => {
  $('#locationModal').modal('hide');
  document.getElementById("description").innerHTML = "It is necessary to allow location to use the app!";
}

/*
 * Retrieves user location with Geolocation API
 */
getLocation = () => {
  if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(getLatLong);
  } else {
      console.log("ne moze");
  }
}

/*
 * Gets user longitude and latitude
 */
getLatLong = (position) => {
  lat = position.coords.latitude;
  lng = position.coords.longitude;
  console.log("Latitude: " + typeof(position.coords.latitude) + 
  "<br>Longitude: " + position.coords.longitude);
}

/* 
 * Loads airplane data from API by using fetch
 */
loadAirplaneData = () => {
  setTimeout(() => {
    fetch('https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=' + lat + '&lng=' + lng + '&fDstL=0&fDstU=100')
    .then((response) => {
      response.json()
      .then((data) => {
        const airplaneList = data.acList;
        const table = document.getElementById('data-table');

        // Creating table content
        airplaneList.forEach((element) => {
          const tableRow = generateTableRow(element);
          table.appendChild(tableRow);
        });
      });
    })
    .catch((err) => {
      console.log('error ' + err);
    });
  }, 1500);
}

/*
 * Creates HTML elements for airplane data
 * to form a table row, with table data
 */
generateTableRow = (airplaneData) => {
  let tableRow = document.createElement('tr');

  let tdAirplaneDirection = document.createElement('td');
  if (calculateAirplaneDirection(airplaneData) === 'W') {
    tdAirplaneDirection.innerHTML = planeLeft;
  } else {
    tdAirplaneDirection.innerHTML = planeRight;
  }

  let tdAltitude = document.createElement('td');
  tdAltitude.innerHTML = airplaneData.Alt;

  let tdEmail = document.createElement('td');
  tdEmail.innerHTML = airplaneData.Reg;

  tableRow.appendChild(tdAirplaneDirection);
  tableRow.appendChild(tdAltitude);
  tableRow.appendChild(tdEmail);

  return tableRow;
}

/*
 * Returns airplane nose direction based on
 * Trak data provided by the API.
 * Trek data represents angle of airplane nose from
 * 0 degrees North. If airplane nose is in rage from
 * 0 to 180 degrees returns W - west,
 * otherwise returns E - east
 */
calculateAirplaneDirection = (airplaneData) => {
  if (airplaneData.Trak > 0.0 && airplaneData.Trak < 180.0) {
    return 'W';
  }
  return 'E';
}
