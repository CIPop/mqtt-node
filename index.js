// Simple MQTT Client emulator for Azure IoT Services.
// API used: https://github.com/mqttjs/MQTT.js#api

import * as mqtt from "mqtt"
import * as dpsv1 from "./dpsv1.js"

function onMessage(topic, message, packet)
{
  // message is Buffer
  console.log("RECV: t='%s' m='%s'", topic, message.toString())
  
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


/// DPS V1

/*

SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc sending SUBSCRIBE (Mid: 1, Topic: $dps/registrations/res/#, QoS: 1, Options: 0x00)
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc received SUBACK
SDK: [AZ_HFSM_MQTT_EVENT_SUBACK_RSP] az_mosquitto/root/running
SDK: [AZ_HFSM_MQTT_EVENT_SUBACK_RSP] az_iot_provisioning/started/connected/subscribing
SDK: [HFSM_EXIT] az_iot_provisioning/started/connected/subscribing
SDK: [HFSM_ENTRY] az_iot_provisioning/started/connected/subscribed
SDK: [HFSM_ENTRY] az_iot_provisioning/started/connected/subscribed/start_register
SDK: [AZ_HFSM_MQTT_EVENT_PUB_REQ] az_mosquitto/root/running
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc sending PUBLISH (d0, q1, r0, m2, '$dps/registrations/PUT/iotdps-register/?$rid=1', ... (0 bytes))
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc received PUBACK (Mid: 2, RC:0)
SDK: [AZ_HFSM_MQTT_EVENT_PUBACK_RSP] az_mosquitto/root/running
SDK: [AZ_HFSM_MQTT_EVENT_PUBACK_RSP] az_iot_provisioning/started/connected/subscribed/start_register
SDK: [HFSM_EXIT] az_iot_provisioning/started/connected/subscribed/start_register
SDK: [HFSM_ENTRY] az_iot_provisioning/started/connected/subscribed/wait_register
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc received PUBLISH (d0, q1, r0, m2, '$dps/registrations/res/202/?$rid=1&retry-after=3', ... (94 bytes))
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc sending PUBACK (m2, rc0)
SDK: [AZ_HFSM_MQTT_EVENT_PUB_RECV_IND] az_mosquitto/root/running
SDK: [AZ_HFSM_MQTT_EVENT_PUB_RECV_IND] az_iot_provisioning/started/connected/subscribed/wait_register
SDK: [AZ_LOG_MQTT_RECEIVED_TOPIC] $dps/registrations/res/202/?$rid=1&retry-after=3
SDK: [AZ_LOG_MQTT_RECEIVED_PAYLOAD] {"operationId":"5.ae17b01c7d4d7ebf.0ea5b739-2621-4a83-8c26-12d7f8893c70","status":"assigning"}
SDK: [HFSM_EXIT] az_iot_provisioning/started/connected/subscribed/wait_register
SDK: [HFSM_ENTRY] az_iot_provisioning/started/connected/subscribed/delay
SDK: [HFSM_TIMEOUT] az_iot_provisioning/started/connected/subscribed/delay
SDK: [HFSM_EXIT] az_iot_provisioning/started/connected/subscribed/delay
SDK: [HFSM_ENTRY] az_iot_provisioning/started/connected/subscribed/query
SDK: [AZ_HFSM_MQTT_EVENT_PUB_REQ] az_mosquitto/root/running
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc sending PUBLISH (d0, q1, r0, m3, '$dps/registrations/GET/iotdps-get-operationstatus/?$rid=1&operationId=5.ae17b01c7d4d7ebf.0ea5b739-2621-4a83-8c26-12d7f8893c70', ... (0 bytes))
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc received PUBACK (Mid: 3, RC:0)
SDK: [AZ_HFSM_MQTT_EVENT_PUBACK_RSP] az_mosquitto/root/running
SDK: [AZ_HFSM_MQTT_EVENT_PUBACK_RSP] az_iot_provisioning/started/connected/subscribed/query
SDK: [HFSM_EXIT] az_iot_provisioning/started/connected/subscribed/query
SDK: [HFSM_ENTRY] az_iot_provisioning/started/connected/subscribed/wait_register
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc received PUBLISH (d0, q1, r0, m2, '$dps/registrations/res/200/?$rid=1', ... (447 bytes))
SDK: [AZ_LOG_HFSM_MQTT_STACK] Client dev1-ecc sending PUBACK (m2, rc0)
SDK: [AZ_HFSM_MQTT_EVENT_PUB_RECV_IND] az_mosquitto/root/running
SDK: [AZ_HFSM_MQTT_EVENT_PUB_RECV_IND] az_iot_provisioning/started/connected/subscribed/wait_register
SDK: [AZ_LOG_MQTT_RECEIVED_TOPIC] $dps/registrations/res/200/?$rid=1
SDK: [AZ_LOG_MQTT_RECEIVED_PAYLOAD] {"operationId":"5.ae17b01c7d4d7ebf.0ea5b739-2621-4a83-8c26-12d7f8893c70","status":"assigned","registrationState":{"x509":{},"registrationId":"dev1-ecc","createdDateTimeUtc":"2023-02-23T23:42:29.8828674Z","assignedHub":"crispop-iothub1.azure-devices.net","deviceId":"dev1-ecc","status":"assigned","substatus":"initialAssignment","lastUpdatedDateTimeUtc":"2023-02-23T23:42:30.1319067Z","etag":"IjcxMDAzODUyLTAwMDAtMDEwMC0wMDAwLTYzZjdmOWU2MDAwMCI="}}
SDK: [HFSM_EXIT] az_iot_provisioning/started/connected/subscribed/wait_register

                Topic: $dps/registrations/res/202/?$rid=1&retry-after=3
                Payload: {"operationId":"5.ae17b01c7d4d7ebf.d4876685-2133-4a4d-8721-10b28dfa3989","status":"assigning"}
                Status: 202
SUCCESS:        Client parsed registration status message.
                Operation is still pending.
                Querying after 3 seconds... 
20230224 000202.598 3 dev1-ecc -> PUBLISH qos: 0 retained: 0 rc: 0 payload len(0): 
SUCCESS:        Client sent operation query message.
                 
                Waiting for registration status message.

20230224 000202.699 3 dev1-ecc <- PUBLISH msgid: 2 qos: 1 retained: 0 payload len(447): {"operationId":"5.ae
20230224 000202.699 3 dev1-ecc -> PUBACK msgid: 2 (0)
SUCCESS:        Client received a message from the provisioning service.
SUCCESS:        Client received a valid topic response:
                Topic: $dps/registrations/res/200/?$rid=1
                Payload: {"operationId":"5.ae17b01c7d4d7ebf.d4876685-2133-4a4d-8721-10b28dfa3989","status":"assigned","registrationState":{"x509":{},"registrationId":"dev1-ecc","createdDateTimeUtc":"2023-02-24T00:02:00.1502433Z","assignedHub":"crispop-iothub1.azure-devices.net","deviceId":"dev1-ecc","status":"assigned","substatus":"initialAssignment","lastUpdatedDateTimeUtc":"2023-02-24T00:02:00.4200119Z","etag":"IjcxMDBmNWFlLTAwMDAtMDEwMC0wMDAwLTYzZjdmZTc4MDAwMCI="}}
                Status: 200
SUCCESS:        Client parsed registration status message.
SUCCESS:        Device provisioned:
                Hub Hostname: crispop-iothub1.azure-devices.net
                Device Id: dev1-ecc
                 
SUCCESS:        Client received registration status message.
20230224 000202.699 3 dev1-ecc -> DISCONNECT (0)
20230224 000202.699 SSL alert write:warning:close notify
SUCCESS:        Client disconnected from provisioning service.
*/
