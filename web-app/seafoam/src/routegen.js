async function generateRoute(sector, allowedOOB, priority, waypointCount) {
  const readTextFile = window.__TAURI__.fs.readTextFile;
  const resolveResource = window.__TAURI__.path.resolveResource;
  const padPath = await resolveResource('assets/padsv3.txt')
  const overallPads = [];
  // Loading etherwarp pad coordinates
  const padFile = await readTextFile(padPath);
  const padLines = padFile.trim().split('\n');
  for (const line of padLines) {
    const [x, y, z] = line.split(' ').map(Number);
    overallPads.push(x, y, z);
  }
  const gemDataPath = await resolveResource('assets/blockarraydatav3.txt');
  const gemstoneData = await readTextFile(gemDataPath);
  const blockData = [];
  const lines = gemstoneData.trim().split('\n');
  for (let x = 0; x < 622; x++) {
    console.log(`Loading block data... ${Math.floor(x / 622 * 100)}%`);
    blockData[x] = [];
    for (let y = 0; y < 256; y++) {
      blockData[x][y] = [];
      const values = lines.shift().split(' ').map(Number);
      blockData[x][y] = values;
    }
  }
  const densPath = await resolveResource('assets/densitylistv3.txt');
  const gemDensities = [];
  const densityFile = await readTextFile(densPath);
  const densityLines = densityFile.trim().split('\n');
  for (const line of densityLines) {
    gemDensities.push(Number(line));
  }

  console.log(`Loaded ${overallPads.length / 3} pads.`);

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
  const desiredPathLength = waypointCount;
  const padCoords = [];
  const secDensities = [];
  console.log(sectors[sector][0] + allowedOOB, sectors[sector][2] - allowedOOB, sectors[sector][1] - allowedOOB, sectors[sector][3] + allowedOOB)
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
  console.log(padCoords.length / 3);
  for (var i = 0; i < padCoords.length / 3; i++) {
    console.log("Generating route... " + Math.floor(i / padCoords.length * 100) + "%");
    const path = [];
    path.push(padCoords[i * 3]);
    path.push(padCoords[i * 3 + 1]);
    path.push(padCoords[i * 3 + 2]);

    var density = secDensities[i];
    const usedPads = [];
    var done = false;

    while (!done) {
      const weightChart = [];
      for (var j = 0; j < padCoords.length / 3; j++) {
        var weight = 0;

        const xdiff = Math.abs(path[path.length - 3] - padCoords[j * 3]);
        const ydiff = Math.abs(path[path.length - 2] - padCoords[j * 3 + 1]);
        const zdiff = Math.abs(path[path.length - 1] - padCoords[j * 3 + 2]);
        const dist = Math.sqrt(xdiff * xdiff + ydiff * ydiff + zdiff * zdiff);
        const startdiffx = Math.abs(path[0] - padCoords[j * 3]);
        const startdiffy = Math.abs(path[1] - padCoords[j * 3 + 1]);
        const startdiffz = Math.abs(path[2] - padCoords[j * 3 + 2]);
        const startdist = Math.sqrt(startdiffx * startdiffx + startdiffy * startdiffy + startdiffz * startdiffz);
        const gemDensity = secDensities[j];
        var angleWeight = 1;
        const angleDiff = 180 / Math.PI * Math.abs(Math.atan2(path[path.length - 6] - path[path.length - 3], path[path.length - 4] - path[path.length - 1]) - Math.atan2(padCoords[j * 3] - path[path.length - 3], padCoords[j * 3 + 2] - path[path.length - 1]));
        //Include settable angle weighting later

        weight = angleWeight * (Math.pow(dist, 2) + Math.pow(startdist, 2 * usedPads.length + 1 / desiredPathLength)) / ((gemDensity - 44) * 4);
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
          if (Math.abs(padCoords[j * 3] - padCoords[usedPads[k] * 3]) < 3 && Math.abs(padCoords[j * 3 + 1] - padCoords[usedPads[k] * 3 + 1]) < 3 && Math.abs(padCoords[j * 3 + 2] - padCoords[usedPads[k] * 3 + 2]) < 3) {
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
        const interval = Math.floor(Math.sqrt(xdist * xdist + ydist * ydist + zdist * zdist));
        for (var j = 1; j < interval; j++) {
          const x = Math.round(headx + j * xdist / interval);
          const y = Math.round(heady + j * ydist / interval);
          const z = Math.round(headz + j * zdist / interval);
          if (Math.max(Math.abs(x - headx), Math.abs(z - headz)) < 2 && Math.abs(y - heady) < 2) continue;
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
      avgDist += Math.sqrt(Math.pow(path[j * 3] - path[j * 3 + 3], 2) + Math.pow(path[j * 3 + 1] + 2 - path[j * 3 + 4], 2) + Math.pow(path[j * 3 + 2] - path[j * 3 + 5], 2));
    }
    avgDist += Math.sqrt(Math.pow(path[path.length - 3] - path[0], 2) + Math.pow(path[j * 3 + 1] + 2 - path[1], 2) + Math.pow(path[path.length - 1] - path[2], 2));
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
  var outPath = [];
  var outPathDensity = 0;
  var outPathDist = 0;
  if (priority == "tp") {
    outPath = lowestAvgDistPath;
    outPathDensity = lowestAvgDistDensity;
    outPathDist = lowestAvgDist;
  } else {
    outPath = highestDensityPath;
    outPathDensity = highestDensity;
    outPathDist = highestDensityDist;
  }

  var pathOutput = "[";
  for (var i = 0; i < outPath.length / 3; i++) {
    pathOutput += "{\"x\":" + outPath[i * 3] + ",\"y\":" + outPath[i * 3 + 1] + ",\"z\":" + outPath[i * 3 + 2] + ",\"r\":0,\"g\":1,\"b\":0,\"options\":{\"name\":\"" + (i + 1) + "\"}}";
    if (i != outPath.length / 3 - 1) pathOutput += ",";
  }
  pathOutput += "]";

  return pathOutput, outPath.length, outPathDensity, outPathDist;
}