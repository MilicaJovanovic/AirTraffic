// Defining constant IMG elements with airplane icons
const planeLeft = "<img style='width: 25px; height: 25px;' src='../images/plane-left.png' />";
const planeRight = "<img style='width: 25px; height: 25px;' src='../images/plane-right.png' />";
var lat = 0.0;
var lng = 0.0;
let lastPlaneListId = 0;
let dataInterval = null;

$(document).ready(() => {
  $('#locationModal').modal('show');
});

/*
 * If user clicks Yes, this function is called
 * I hides modal, and load data
 */
geolocationAllowed = () => {
  $('#locationModal').modal('hide');
  document.getElementById("loading").style.display = 'block';
  getLocation();
  const locationFinder = setInterval(() => {
    if (lat != 0.0 && lng != 0.0) {
      document.getElementById("loading").style.display = 'none';
      loadAirplaneData(lastPlaneListId);
      clearInterval(locationFinder);
    }
  }, 1000);
  dataInterval = setInterval(() => {
    loadAirplaneData(lastPlaneListId);
  }, 60*1000);
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
  // let url = 'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=' + lat + '&lng=' + lng + '&fDstL=0&fDstU=100';
  let url = 'https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=33.433638&lng=-112.008113&fDstL=0&fDstU=100';
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
        
        // Emptying table to refresh with new data
        $("#data-table").empty();
        table.appendChild(generateTableHeader());

        //Sorting list
        airplaneList.sort(altitudeSorter);

        // Creating table content
        airplaneList.forEach((element) => {
          if (element.Alt !== undefined) {
            table.appendChild(generateTableRow(element));
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
 * Sorts airplane list by altitude
 * by checking higher number
 */
altitudeSorter = (a, b) => {
  var x = a.Alt;
  var y = b.Alt;
  return ((x > y) ? -1 : ((x < y) ? 1 : 0));
}

/*
 * Generating table header
 */
generateTableHeader = () => {
  const tableHeader = document.createElement('thead');
  let headerDirection = document.createElement('th');
  headerDirection.innerHTML = 'Direction';
  headerDirection.style.textAlign = 'center';
  let headerAltitude = document.createElement('th');
  headerAltitude.innerHTML = 'Altitude';
  headerAltitude.style.textAlign = 'center';
  let headerFlightCode = document.createElement('th');
  headerFlightCode.innerHTML = 'Flight code number';
  headerFlightCode.style.textAlign = 'center';
  tableHeader.appendChild(headerDirection);
  tableHeader.appendChild(headerAltitude);
  tableHeader.appendChild(headerFlightCode);

  return tableHeader;
}

/*
 * Creates HTML elements for airplane data
 * to form a table row, with table data
 */
generateTableRow = (airplaneData) => {
  let tableRow = document.createElement('tr');
  tableRow.onclick = () => showFlightDetails(airplaneData);

  let tdAirplaneDirection = document.createElement('td');
  if (calculateAirplaneDirection(airplaneData) === 'W') {
    tdAirplaneDirection.innerHTML = planeLeft;
  } else {
    tdAirplaneDirection.innerHTML = planeRight;
  }

  let tdAltitude = document.createElement('td');
  tdAltitude.innerHTML = airplaneData.Alt + ' ft';

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
  const locationFinder = setInterval(() => {
    if (lat != 0.0 && lng != 0.0) {
      loadAirplaneData(lastPlaneListId);
      clearInterval(locationFinder);
    }
  }, 1000);
  dataInterval = setInterval(() => {
    loadAirplaneData(lastPlaneListId);
  }, 60*1000);
}

/*
 * Loading new Muctache template for showing
 * flight details
 */
showFlightDetails = (airplaneData) => {
  getCompanyDomain(airplaneData);
  clearInterval(dataInterval);
}

/*
 * Uses clearbit API to discover company domain
 * by company name
 */
getCompanyDomain = (airplaneData) => {
  const url = 'https://autocomplete.clearbit.com/v1/companies/suggest?query=' + airplaneData.Op;
  fetch(url)
  .then((response) => {
    response.json()
    .then((data) => {
      if (data == null || data == undefined || data.length == 0) {
        getCompanyLogo('empty', airplaneData);
      } else {
        getCompanyLogo(data[0].logo, airplaneData);
      }
    });
  })
  .catch((error) => {
    console.log(error);
  });
}

/*
 * Returns company using clearbit API
 * based on company domain
 */
getCompanyLogo = (companyDomain, airplaneData) => {
  let companyLogo = '';
  if (companyDomain == 'empty') {
    companyLogo = 'https://one-call.ca/wp-content/uploads/2013/08/logo.png';
  } else {
    companyLogo = companyDomain;
  }

  const pageParams = {
    airplaneModel: airplaneData.Mdl,
    airportFrom: airplaneData.From,
    airportTo: airplaneData.To,
    airline: airplaneData.Op,
    airlineLogo: companyLogo
  }
  $.get('../templates/flight-details.html', function(template, textStatus, jqXhr) {
    $('#route-view').html(Mustache.render($(template).filter('#flight-details').html(), pageParams))
  });
}

