angular
  .module('fd-view')
  .provider('configuration', Configuration);

/** @ngInject */
function Configuration(engineUrl) {
  const config = {
    engineUrl: localStorage.getItem('engineUrl') || engineUrl,
    devMode: localStorage.getItem('devMode')
  };

  return {
    $get: () => {
      return {
        devMode: () => {
          return config.devMode;
        },
        engineUrl: () => {
          return config.engineUrl;
        },
        exploreUrl: () => {
          return config.exploreUrl;
        },
        setEngineUrl: engineUrl => {
          config.engineUrl = engineUrl || config.engineUrl;
          localStorage.setItem('engineUrl', engineUrl);
        },
        setDevMode: devMode => {
          // config.devMode = devMode || config.devMode;
          if (devMode) {
            config.devMode = devMode;
            localStorage.setItem('devMode', devMode);
          } else {
            delete config.devMode;
            localStorage.removeItem('devMode');
          }
        }
      };
    }
  };
}

