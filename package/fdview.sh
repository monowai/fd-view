#@IgnoreInspection BashAddShebang

echo Setting FD-VIEW to connect to $ENGINE_URL
sed -i -- "s#@FD-API@#$ENGINE_URL#" /var/www/fd-view/scripts/app-*.js
nginx -g 'daemon off;'
