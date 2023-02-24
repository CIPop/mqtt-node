// Simple MQTT Client emulator for Azure IoT Services.
// API used: https://github.com/mqttjs/MQTT.js#api

import * as mqtt from "mqtt"
import * as dpsv1 from "./dpsv1.js"

function onMessage(topic, message, packet)
{
  // console.log("RECV: t='%s' m='%s'", topic, message.toString())
  
  let jsonMessage = {};
  if (message.length > 0) {
    try {
      jsonMessage = JSON.parse(message.toString());
    } catch (e) {
      console.log("WARN: JSON parse error: %s", e);
    }
  }
  
  let processed = false;
  try {
    processed = 
      dpsv1.onRegister(topic, jsonMessage, client) || 
      dpsv1.onQuery(topic, jsonMessage, client);
  } catch (e) {
    console.log("ERROR processing: %s", e);
  }

  if(!processed) {
    console.log("WARN: Unprocessed message: t='%s' m='%s'", topic, message.toString());
  }
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
  dpsv1.getSubscribeTopics().forEach(topicFilter => {
    client.subscribe(topicFilter, {qos: 1}, onSubscribe);
  });
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