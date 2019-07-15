FROM nginx:mainline-alpine

#RUN apk add --update nginx && rm -rf /var/cache/apk/*
#RUN mkdir -p /tmp/nginx/client-body


MAINTAINER Mike Holdsworth "https://github.com/monowai"

# bower install
# gulp
# docker build -t flockdata/fd-view .
# docker run -p 80:80 flockdata/fd-view

ENV ENGINE_URL http://fd-engine:15001

WORKDIR /etc/nginx

#RUN chown -R www-data:www-data /var/lib/nginx

RUN rm -f /etc/nginx/conf.d/default.conf
ADD package/nginx.fd.conf /etc/nginx/conf.d/
ADD package/fdview.sh /opt/flockdata/bin/
RUN ln -s /opt/flockdata/bin/fdview.sh /usr/local/bin/fdview
RUN chmod +x  /opt/flockdata/bin/*

# Add files.
COPY dist /var/www/fd-view

# replace this with your application's default port
EXPOSE 80

#CMD ["nginx", "-g", "daemon off;"]
CMD fdview
