# Mosquitto broker setup

The Mosquitto Broker can be launched as a Docker container:

`docker pull eclipse-mosquitto`

## No TLS

`docker run -it -p 1883:1883 -p 9001:9001 -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto`

## With TLS support

Ensure you have generated a [CA and server certificate](https://github.com/CIPop/certificates). Name them `ca.crt`, `server.crt` and `server.key` and place them in this folder.

`docker run -it -p 1883:1883 -p 8883:8883 -p 9001:9001 -v $(pwd)/mosquitto_ssl.conf:/mosquitto/config/mosquitto.conf -v $(pwd)/ca.crt:/mosquitto/certs/ca.crt -v $(pwd)/server.crt:/mosquitto/certs/server.crt -v $(pwd)/server.key:/mosquitto/certs/server.key eclipse-mosquitto`
