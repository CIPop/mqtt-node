// Simple MQTT Client emulator for Azure IoT Services.
// API used: https://github.com/mqttjs/MQTT.js#api

import * as mqtt from "mqtt"

const DPS_TOPIC_HEADER = "$dps/registrations/";
const DPS_TOPIC_HEADER_REGEXP = DPS_TOPIC_HEADER.replace(/\//g, '\\/').replace(/\$/g, '\\$');
const RETRY_PROBABILITY = 0.7;
const ERROR_PROBABILITY = 0;

export function getSubscribeTopics() {
  return [DPS_TOPIC_HEADER + "PUT/#", DPS_TOPIC_HEADER + "GET/#"];
}

function responseStatusAssigning(client, request_id) {
  let retry = Math.floor(Math.random() * 10) + 1;
  console.log("DPSv1 Assigning: %s, retry-after=%d", request_id, retry);
  client.publish(
    `${DPS_TOPIC_HEADER}202/?$rid=${request_id}&retry-after=${retry}`,
    JSON.stringify(
      {
        "operationId": "5.ae17b01c7d4d7ebf.0ea5b739-2621-4a83-8c26-12d7f8893c70",
        "status": "assigning"
      }));
}

function responseStatusAssigned(client, request_id) {
  console.log("DPSv1 Assigned: %s", request_id);

  client.publish(
    `${DPS_TOPIC_HEADER}200/?$rid=${request_id}`,
    JSON.stringify(
      {
        "operationId": "5.ae17b01c7d4d7ebf.0ea5b739-2621-4a83-8c26-12d7f8893c70",
        "status": "assigned",
        "registrationState": {
          "x509": {},
          "registrationId": "dev1-ecc",
          "createdDateTimeUtc": "2023-02-23T23:42:29.8828674Z",
          "assignedHub": "crispop-iothub1.azure-devices.net",
          "deviceId": "dev1-ecc",
          "status": "assigned",
          "substatus": "initialAssignment",
          "lastUpdatedDateTimeUtc": "2023-02-23T23:42:30.1319067Z",
          "etag": "IjcxMDAzODUyLTAwMDAtMDEwMC0wMDAwLTYzZjdmOWU2MDAwMCI="
        }
      }));
}

// Req: $dps/registrations/PUT/iotdps-register/?$rid=1
// Rsp: $dps/registrations/res/202/?$rid=1&retry-after=3
export function onRegister(topic, jsonMessage, client) {
  const regex = new RegExp(`^${DPS_TOPIC_HEADER_REGEXP}PUT\\/iotdps-register\\/\\?\\$rid=(\\d+)$`);
  const m = topic.match(regex);
  if (m) {
    const request_id = m[1];
    console.log("DPSv1 Register request: %s", request_id);
    responseStatusAssigning(client, request_id);

    return true;
  }

  return false;
}

// Req: $dps/registrations/GET/iotdps-get-operationstatus/?$rid=1&operationId=5.ae17b01c7d4d7ebf.0ea5b739-2621-4a83-8c26-12d7f8893c70
// Rsp:
//  Intermediate:
//    $dps/registrations/res/202/?$rid=1&retry-after=3 
//  Final: 
//    $dps/registrations/res/200/?$rid=1
export function onQuery(topic, jsonMessage, client) {
  const regex =
    new RegExp(`^${DPS_TOPIC_HEADER_REGEXP}GET\\/iotdps-get-operationstatus\\/\\?\\$rid=(\\d+)&operationId=(.*)$`);
  const m = topic.match(regex);
  if (m) {
    let state = 'assigning';
    if (Math.random() < RETRY_PROBABILITY) {
      state = 'assigned';
    }
    if (Math.random() < ERROR_PROBABILITY) {
      state = 'error';
    }

    const request_id = m[1];
    const operation_id = m[2];
    console.log("DPSv1 Query request: %s %s", request_id, operation_id);

    switch(state) {
      case 'assigning':
        responseStatusAssigning(client, request_id);
        break;
      case 'assigned':
        responseStatusAssigned(client, request_id, operation_id);
        break;
      case 'error':
      default:
        //not implemented.
    }

    return true;
  }

  return false;
}
