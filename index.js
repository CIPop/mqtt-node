// Simple MQTT Client emulator for Azure IoT Services.
// API used: https://github.com/mqttjs/MQTT.js#api

import * as mqtt from "mqtt"

function onMessage(topic, message, packet)
{
  // message is Buffer
  console.log("PUB: t='%s' m='%s'", topic, message.toString())
}

function onSubscribe(err, granted){
  if(err) {
    throw new Error("Failed to subscribe: %s", granted['topic']);
  }
  else {
    console.log("Subscribed to %s, QoS %d", granted[0].topic, granted[0].qos);
  }
}

function onConnect(err){
  client.subscribe('$dps/#', onSubscribe);
}

function onExit(code) {
  console.log("Stopping...");
  client.end();
  console.log("STOP");
}

process.on('SIGINT', onExit);

let client  = mqtt.connect('mqtt://localhost')
// Set up callbacks.
client.on('connect', onConnect);
client.on('message', onMessage);