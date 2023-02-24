// Simple MQTT Client emulator for Azure IoT Services.
// API used: https://github.com/mqttjs/MQTT.js#api

import * as mqtt from "mqtt"

const DPS_TOPIC_HEADER = "$dps/registrations/";
const DPS_TOPIC_HEADER_REGEXP = DPS_TOPIC_HEADER.replace(/\//g, '\\/').replace(/\$/g, '\\$');

export function getSubscribeTopics() {
  return [DPS_TOPIC_HEADER + "PUT/#", DPS_TOPIC_HEADER + "GET/#"];
}

export function onRegister(topic, jsonMessage, client) {
  const regex = new RegExp(`^${DPS_TOPIC_HEADER_REGEXP}PUT\\/iotdps-register\\/\\?\\$rid=(\\d+)$`);
  const m = topic.match(regex);
  if (m) {
    const request_id = m[1];
    console.log("Register request: %s", request_id[1]);
    client.publish(DPS_TOPIC_HEADER + "res/" + request_id, "");

    return true;
  }

  return false;
}
