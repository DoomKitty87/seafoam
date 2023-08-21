const fs = require('fs');

const overallPads = [];
// Loading etherwarp pad coordinates
const padFile = fs.readFileSync('padsv3.txt', 'utf8');
const padLines = padFile.trim().split('\n');
for (const line of padLines) {
  const [x, y, z] = line.split(' ').map(Number);
  overallPads.push(x, y, z);
}

const gemstoneData = fs.readFileSync('blockarraydatav3.txt', 'utf8');
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
const densityFile = fs.readFileSync('densitylistv3.txt', 'utf8');
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