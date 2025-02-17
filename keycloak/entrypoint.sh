#!/bin/bash
set -e
echo "Building Keycloak server..."
/opt/keycloak/bin/kc.sh build
#echo "Starting Keycloak server..."
#/opt/keycloak/bin/kc.sh start-dev