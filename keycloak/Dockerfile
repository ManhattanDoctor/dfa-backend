FROM quay.io/keycloak/keycloak:26.1.1

COPY /custom-scripts/custom-scripts.jar /opt/keycloak/providers/
COPY entrypoint.sh /opt/keycloak/

ENTRYPOINT ["/opt/keycloak/entrypoint.sh"]