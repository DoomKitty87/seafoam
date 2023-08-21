const fs = require('fs');

const overallPads = [];
// Loading etherwarp pad coordinates
const padFile = fs.readFileSync('assets/padsv3.txt', 'utf8');
const padLines = padFile.trim().split('\n');
for (const line of padLines) {
  const [x, y, z] = line.split(' ').map(Number);
  overallPads.push(x, y, z);
}

const gemstoneData = fs.readFileSync('assets/blockarraydatav3.txt', 'utf8');
const blockData = [];
const lines = gemstoneData.trim().split('\n');
for (let x = 0; x < 622; x++) {
  blockData[x] = [];
  for (let y = 0; y < 256; y++) {
    blockData[x][y] = [];
    const values = lines.shift().split(' ').map(Number);
    blockData[x][y] = values;
  }
}

const gemDensities = [];
const densityFile = fs.readFileSync('assets/densitylistv3.txt', 'utf8');
const densityLines = densityFile.trim().split('\n');
for (const line of densityLines) {
  gemDensities.push(Number(line));
}

console.log(`Loaded ${overallPads.length / 3} pads.`);

const desiredPathLength = 150;

const jadecoordsx = 823;
const jadecoordsz = 202;

const sectors = [];
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    const sector = [];
    const cornerx = jadecoordsx + i * -128;
    const cornerz = jadecoordsz + j * 128;
    sector.push(cornerx);
    sector.push(cornerz);
    sector.push(cornerx - 128);
    sector.push(cornerz + 128);
    sectors.push(sector);
  }
}

async function generateRoute(sector, allowedOOB) {
  const padCoords = [];
  const secDensities = [];
  for (var i = 0; i < overallPads.length / 3; i++) {
    if (overallPads[i * 3] <= sectors[sector][0] + allowedOOB && overallPads[i * 3] > sectors[sector][2] - allowedOOB && overallPads[i * 3 + 2] >= sectors[sector][1] - allowedOOB && overallPads[i * 3 + 2] < sectors[sector][3] + allowedOOB) {
      padCoords.push(overallPads[i * 3]);
      padCoords.push(overallPads[i * 3 + 1]);
      padCoords.push(overallPads[i * 3 + 2]);
      secDensities.push(gemDensities[i]);
    }
  }
  var lowestAvgDist = Infinity;
  var lowestAvgDistDensity = 0;
  var lowestAvgDistPath = [];
  var highestDensity = 0;
  var highestDensityPath = [];
  var highestDensityDist = Infinity;

  for (var i = 0; i < padCoords.length / 3; i++) {
    const path = [];
    path.push_back(padCoords[i * 3]);
    path.push_back(padCoords[i * 3 + 1]);
    path.push_back(padCoords[i * 3 + 2]);

    var density = secDensities[i];
    const usedPads = [];
    var done = false;

    while (!done) {
      const weightChart = [];
      for (var j = 0; j < padCoords.length / 3; j++) {
        var weight = 0;

        const xdiff = abs(path[path.length - 3] - padCoords[j * 3]);
        const ydiff = abs(path[path.length - 2] - padCoords[j * 3 + 1]);
        const zdiff = abs(path[path.length - 1] - padCoords[j * 3 + 2]);
        const dist = sqrt(xdiff * xdiff + ydiff * ydiff + zdiff * zdiff);
        const startdiffx = abs(path[0] - padCoords[j * 3]);
        const startdiffy = abs(path[1] - padCoords[j * 3 + 1]);
        const startdiffz = abs(path[2] - padCoords[j * 3 + 2]);
        const startdist = sqrt(startdiffx * startdiffx + startdiffy * startdiffy + startdiffz * startdiffz);
        const gemDensity = secDensities[j];
        var angleWeight = 1;
        const angleDiff = 180 / Math.PI * abs(atan2(path[path.length - 6] - path[path.length - 3], path[path.length - 4] - path[path.length - 1]) - atan2(padCoords[j * 3] - path[path.length - 3], padCoords[j * 3 + 2] - path[path.length - 1]));
        //Include settable angle weighting later

        weight = angleWeight * (pow(dist, 2) + pow(startdist, 2 * usedPads.length + 1 / desiredPathLength)) / ((gemDensity - 44) * 4);
        if (dist > 62) weight = Infinity;

        weightChart.push(weight);
      }
      var lowestIndex = -1;
      var lowestWeight = Infinity;

      for (var j = 0; j < weightChart.length; j++) {
        if (j == i && path.length == 6) continue;
        if (padCoords[j * 3] == path[path.length - 3] && padCoords[j * 3 + 1] == path[path.length - 2] && padCoords[j * 3 + 2] == path[path.length - 1]) {
          weightChart[j] = Infinity;
          continue;
        }
        if (abs(padCoords[j * 3] - path[path.length - 3]) < 3 && abs(padCoords[j * 3 + 2] - path[path.length - 1]) < 3) {
          weightChart[j] = Infinity;
          continue;
        }
        for (var k = 0; k < usedPads.length; k++) {
          if (j == usedPads[k]) {
            weightChart[j] = Infinity;
            break;
          }
          if (abs(padCoords[j * 3] - padCoords[usedPads[k] * 3]) < 3 && abs(padCoords[j * 3 + 1] - padCoords[usedPads[k] * 3 + 1]) < 3 && abs(padCoords[j * 3 + 2] - padCoords[usedPads[k] * 3 + 2]) < 3) {
            weightChart[j] = Infinity;
            break;
          }
        }
        if (weightChart[j] < lowestWeight) {
          lowestWeight = weightChart[j];
          lowestIndex = j;
        }
      }
      var blocked = true;
      while (blocked) {
        blocked = false;
        const headx = path[path.length - 3];
        const heady = path[path.length - 2] + 2;
        const headz = path[path.length - 1];
        const tailx = padCoords[lowestIndex * 3];
        const taily = padCoords[lowestIndex * 3 + 1];
        const tailz = padCoords[lowestIndex * 3 + 2];
        const xdist = tailx - headx;
        const ydist = taily - heady;
        const zdist = tailz - headz;
        const interval = floor(sqrt(xdist * xdist + ydist * ydist + zdist * zdist));
        for (var j = 1; j < interval; j++) {
          const x = round(headx + j * xdist / interval);
          const y = round(heady + j * ydist / interval);
          const z = round(headz + j * zdist / interval);
          if (max(abs(x - headx), abs(z - headz)) < 2 && abs(y - heady) < 2) continue;
          if (x - 202 > 621 || x - 202 < 0 || y > 255 || y < 0 || z - 202 > 621 || z - 202 < 0) continue;
          if (blockData[x - 202][y][z - 202] != 0) blocked = true;
          if (blocked) {
            weightChart[lowestIndex] = Infinity;
            lowestWeight = Infinity;
            lowestIndex = -1;
            for (var k = 0; k < weightChart.length; k++) {
              if (j == i && path.length == 6) continue;
              if (weightChart[k] < lowestWeight) {
                lowestWeight = weightChart[k];
                lowestIndex = k;
              }
            }
            break;
          }
          blocked = false;
        }
        if (lowestWeight == Infinity) break;
      }

      if (lowestWeight == Infinity) break;
      if (lowestIndex == i) {
        done = true;
        break;
      }

      path.push(padCoords[lowestIndex * 3]);
      path.push(padCoords[lowestIndex * 3 + 1]);
      path.push(padCoords[lowestIndex * 3 + 2]);
      usedPads.push(lowestIndex);
      density += secDensities[lowestIndex];
    }

    var avgDist;
    for (var j = 0; j < path.length / 3 - 1; j++) {
      avgDist += sqrt(pow(path[j * 3] - path[j * 3 + 3], 2) + pow(path[j * 3 + 1] + 2 - path[j * 3 + 4], 2) + pow(path[j * 3 + 2] - path[j * 3 + 5], 2));
    }
    avgDist += sqrt(pow(path[path.length - 3] - path[0], 2) + pow(path[j * 3 + 1] + 2 - path[1], 2) + pow(path[path.length - 1] - path[2], 2));
    avgDist /= path.length / 3 + 1;
    density /= path.length / 3;
    if (avgDist < lowestAvgDist && desiredPathLength - desiredPathLength / 10 <= path.length / 3 && path.length / 3 <= desiredPathLength + desiredPathLength / 10) {
      lowestAvgDist = avgDist;
      lowestAvgDistDensity = density;
      lowestAvgDistPath = path;
    }
    if (density > highestDensity && desiredPathLength - desiredPathLength / 10 <= path.length / 3 && path.length / 3 <= desiredPathLength + desiredPathLength / 10) {
      highestDensity = density;
      highestDensityPath = path;
      highestDensityDist = avgDist;
    }
  }
  //Choose between density and dist in settings as well though
  const outPath = lowestAvgDistPath;
  const outPathDensity = lowestAvgDistDensity;
  const outPathDist = lowestAvgDist;

  var pathOutput = "[";
  for (var i = 0; i < outPath.length / 3; i++) {
    pathOutput += "{\"x\":" + outPath[i * 3] + ",\"y\":" + outPath[i * 3 + 1] + ",\"z\":" + outPath[i * 3 + 2] + ",\"r\":0,\"g\":1,\"b\":0,\"options\":{\"name\":\"" + (i + 1) + "\"}}";
    if (i != outPath.length / 3 - 1) pathOutput += ",";
  }
  pathOutput += "]";

  return pathOutput, outPath.length, outPathDensity, outPathDist;
}