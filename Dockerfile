FROM node
RUN apt-get update && apt-get install -y nginx iptables
WORKDIR /src
CMD nginx && npm i -g . && bash
