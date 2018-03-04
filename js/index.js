// Defining constant IMG elements with airplane icons
const planeLeft = "<img style='width: 25px; height: 25px;' src='../images/plane-left.png' />";
const planeRight = "<img style='width: 25px; height: 25px;' src='../images/plane-right.png' />";
var lat = 0.0;
var lng = 0.0;
let lastPlaneListId = 0;

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
  setInterval(() => {
    loadAirplaneData(lastPlaneListId);
  }, 5000);
  document.getElementById("description").innerHTML = "Here you can see all the airplanes that are flying over you location. In the list above you can see fligth details available and sort airplanes by altitude they are flying at.";
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
}

/* 
 * Loads airplane data from API by using fetch
 */
loadAirplaneData = (lastDv) => {
  let url = 'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=' + lat + '&lng=' + lng + '&fDstL=0&fDstU=100';

  if (lastDv != 0) {
    url = url + '&ldv=' + lastDv;
  }

  setTimeout(() => {
    fetch(url)
    .then((response) => {
      response.json()
      .then((data) => {
        const airplaneList = data.acList;
        const table = document.getElementById('data-table');

        // Creating table content
        airplaneList.forEach((element) => {
          if (element.Alt !== undefined) {
            const tableRow = generateTableRow(element);
            table.appendChild(tableRow);
          }
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
  tableRow.style.border = '1px solid black';
  tableRow.onclick = () => showFlightDetails(airplaneData);

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

/*
 * Going from fliht details page back to
 * list of all flighs
 */
back = () => {
  $.get('/templates/index.html', function(template, textStatus, jqXhr) {
    $('#route-view').html(Mustache.render($(template).filter('#index').html()))
  });
  loadAirplaneData(lastPlaneListId);
}

/*
 * Loading new Muctache template for showing
 * flight details
 */
showFlightDetails = (airplaneData) => {
  const pageParams = {
    airplaneModel: airplaneData.Mdl,
    airportFrom: airplaneData.From,
    airportTo: airplaneData.To,
    airline: airplaneData.Op,
    onclick: function() {
      alert('remo');
    }
  }
  $.get('../templates/flight-details.html', function(template, textStatus, jqXhr) {
    $('#route-view').html(Mustache.render($(template).filter('#flight-details').html(), pageParams))
  });
}