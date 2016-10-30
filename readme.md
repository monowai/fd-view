# Overview
fd-view is a UI for modelling, analyzing and querying data imported into FlockData.   
  * Visual information modelling from existing data files.
  * Data mediation between Neo4j and ElasticSearch
  * Analytical views

The entire FD stack can be executed via Docker Compose by checking the project out from [fd-demo](http://github.com/monowai/fd-demo). Here we'll assume that you want to build from src

![fd-view](http://wiki.flockdata.com/download/attachments/13172788/fd-view-samples.png?api=v2)

## Dependencies
### NodeJS

Install NodeJS 6.X as per the instructions for your platform. On Ubuntu, this could look something like this
```
sudo apt-get install python-software-properties
sudo apt-add-repository ppa:chris-lea/node.js -y
sudo apt-get update
sudo apt-get install nodejs -q -y
```
The -g flag indicates that the package should be installed globally (for all users)

### Build tools
```
npm install -g gulp-cli
npm install -g bower
``` 

## Building
You'll need to run these commands when you pull the latest source to ensure your libraries are up-to-date as defined in ```package.json``` and ```bower.json``` 

```
npm install 
bower install 
```

## Testing
Unit testing
```
gulp test
```

## Starting
The server can be started with 
``` gulp serve```
Where fd-view will be listening on ```http://localhost:9000``` by default. 

If you can't connect to fd-engine, then click on settings, and set the fd-engine URL if necessary 
```
http://localhost:8080/
```

## Packaging
To build a production version into the dist folder
```
gulp
```

### Docker
A Docker package can be built from the contents of the ```dist``` folder for deployment into a Docker Machine
```
docker build -t flockdata/fd-view .
# Run fd-view on port 80 in the docker-machine
docker run -p 80:80 flockdata/fd-view
```
