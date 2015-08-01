FROM alpine:3.2

RUN apk add --update nginx && \
    rm -rf /var/cache/apk/*

WORKDIR /dashboard/
ADD . /dashboard/
ADD nginx.conf /etc/nginx/nginx.conf

RUN apk add -U nodejs git && \
    npm install -g bower && \
    bower --allow-root install && \
    apk del nodejs git && \
    rm -rf /usr/lib/node_modules && \
    rm -rf /root/.npm && \
    rm -rf /root/.cache && \
    rm -rf /tmp/* && \
    rm -f nginx.conf && \
    rm -rf /var/cache/apk/*

EXPOSE 80 443

CMD nginx
