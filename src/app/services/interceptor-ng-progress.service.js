class InterceptorNgProgress {
  /** @ngInject */
  constructor(ngProgressFactory) {
    this._ngProgressFactory = ngProgressFactory;

    this._ngProgress = null;
    this._working = false;
  }

  _getNgProgress() {
    this._ngProgress = this._ngProgress || ngProgressFactory.createInstance();
    // ngProgress.setColor('red');
    return this._ngProgress;
  }

  _completedProgress() {
    let ngProgress;
    if (this._working) {
      ngProgress = this._getNgProgress();
      ngProgress.complete();
      this._working = false;
    }
  }

  request(request) {
    const ngProgress = this._getNgProgress();
    if (request.url.indexOf('.html') > 0) {
      return request;
    }
    if (!this._working) {
      ngProgress.reset();
      ngProgress.start();
      this._working = true;
    }
    return request;
  }

  requestError(request) {
    this._completedProgress();
    return request;
  }

  response(response) {
    this._completedProgress();
    return response;
  }
  // responseError (response) {
  //   completedProgress();
  //   return response;
  // }
}

angular
  .module('fd-view')
  .service('interceptorNgProgress', InterceptorNgProgress);
