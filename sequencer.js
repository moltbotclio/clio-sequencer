#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SEQUENCE_FILE = path.join(__dirname, 'sequence.json');
const DEFAULT_HEARTBEAT = path.join(__dirname, '..', 'vrm-viewer', 'heartbeat.json');
const HEARTBEAT_FILE = process.env.HEARTBEAT_PATH || process.argv[2] || DEFAULT_HEARTBEAT;

function loadSequence() {
  if (!fs.existsSync(SEQUENCE_FILE)) {
    console.error('Error: sequence.json not found');
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(SEQUENCE_FILE, 'utf8'));
}

function writeHeartbeat(type, value) {
  const data = {
    timestamp: new Date().toISOString(),
    [type]: value
  };
  fs.writeFileSync(HEARTBEAT_FILE, JSON.stringify(data, null, 2));
  console.log(`[${new Date().toLocaleTimeString()}] ${type}: ${value}`);
}

function sleep(seconds) {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function runSequence() {
  const config = loadSequence();
  const { sequence, loop } = config;

  console.log('🌀 Clio Sequencer started');
  console.log(`Sequence: ${sequence.length} steps, loop: ${loop}`);

  do {
    for (const step of sequence) {
      const { type, value, duration } = step;
      writeHeartbeat(type, value);
      await sleep(duration);
    }
  } while (loop);

  console.log('Sequence complete.');
}

runSequence().catch(console.error);
