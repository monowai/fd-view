FROM nginx:mainline-alpine

#RUN apk add --update nginx && rm -rf /var/cache/apk/*
#RUN mkdir -p /tmp/nginx/client-body


MAINTAINER Mike Holdsworth "https://github.com/monowai"

# bower install
# grunt dist
# docker build -t flockdata/fd-view .
# docker run -p 80:80 flockdata/fd-view

ENV ENGINE_URL http://fd-engine:8081

WORKDIR /etc/nginx

#RUN chown -R www-data:www-data /var/lib/nginx

RUN rm -f /etc/nginx/conf.d/default.conf
ADD package/fdconfig.conf /etc/nginx/conf.d/
ADD package/nginx.conf /etc/nginx/
ADD package/fdview.sh /opt/flockdata/bin/
RUN ln -s /opt/flockdata/bin/fdview.sh /usr/local/bin/fdview
RUN chmod +x  /opt/flockdata/bin/*

# Add files.
COPY dist /var/www/fd-view

# replace this with your application's default port
EXPOSE 80

#CMD ["nginx", "-g", "daemon off;"]
CMD fdview
