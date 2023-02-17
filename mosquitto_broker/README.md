# Mosquitto broker setup

The Mosquitto Broker can be launched as a Docker container:

`docker pull eclipse-mosquitto`

`docker run -it -p 1883:1883 -p 9001:9001 -v /home/crispop/test/mosq/mosquitto.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto`

