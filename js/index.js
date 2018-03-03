// Defining constant IMG elements with airplane icons
const planeLeft = "<img style='width: 25px; height: 25px;' src='../images/plane-left.png' />";
const planeRight = "<img style='width: 25px; height: 25px;' src='../images/plane-right.png' />"

$(document).ready(() => {
  // Using fetch to get airplane data from API
  fetch('https://public-api.adsbexchange.com/VirtualRadar/AircraftList.json?lat=33.433638&lng=-112.008113&fDstL=0&fDstU=100')
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
});

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
