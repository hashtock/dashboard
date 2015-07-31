FROM nginx:1.9

WORKDIR /usr/share/nginx/html/static
ADD . /usr/share/nginx/html/static

RUN \
    apt-get update && \
    apt-get install -qq -y npm git && \
    npm install -g bower && \
    ln -s /usr/bin/nodejs /usr/bin/node && \
    bower --allow-root install && \
    apt-get purge -y npm git && \
    apt-get autoremove -y && \
    rm -rf /usr/local/lib/node_modules
