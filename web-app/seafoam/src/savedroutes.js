const fs = require('fs');

function saveRoute(route, density, tpDist, waypoints, fileName) {
  const filePath = "../savedroutes/" + fileName + ".rte";
  const file = fs.createWriteStream(fileName);
  file.on('error', function(err) { console.log(err); });
  file.write(`Density: ${density}\n`);
  file.write(`TP Dist: ${tpDist}\n`);
  file.write(`Waypoints: ${waypoints}\n`);
  file.write(`Route:\n`);
  file.write(route);
  file.end();
}

function fetchRoutes() {
  const routes = [];

  const files = fs.readdirSync('../savedroutes');
  for (const file of files) {
    const route = {};
    const fileContents = fs.readFileSync('../savedroutes/' + file, 'utf8');
    const lines = fileContents.trim().split('\n');
    route.density = Number(lines[0].split(' ')[1]);
    route.tpDist = Number(lines[1].split(' ')[1]);
    route.waypoints = Number(lines[2].split(' ')[1]);
    route.route = lines[4];
    routes.push(route);
  }
  
  return routes;
}