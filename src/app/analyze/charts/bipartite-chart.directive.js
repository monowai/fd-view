class BipartiteDiagram {
  constructor($timeout, BiPartiteService) {
    this.restrict = 'E';
    this.scope = {
      data: '='
    };

    this._timeout = $timeout;
    this._bp = BiPartiteService;
  }

  reset(graphID) {
    d3.select(`#${graphID}`).remove();
  }

  drawBipartite(ele, data) {
    const width = 1400;
    const height = d3.max([data[0].dataLength * 10 + 40, 600]);
    const margin = {b: 0, t: 40, l: 170, r: 50};
    const el = ele[0];
    const graphID = `${data[0].id}svg`;
    // this.reset(graphID);
    d3.select(`#${graphID}`).remove();

    const svg = d3.select(el).append('svg')
      .attr('id', graphID)
      .attr('width', width).attr('height', (height + margin.b + margin.t))
      .append('g').attr('transform', `translate(${margin.l}, ${margin.t})`);
    /* var bpData = [
     {data:bP.partData(mappedData,2), id:'Relationships', header:['From','To', 'Relationships']}
     ];  */
    return this._timeout(() => {
      this._bp.draw(data, svg);
    }, 500, false);
  }

  warnMsg(timeout, graphID, defer, dataLength) {
    const timeoutMs = 5000;

    return timeout(() => {
      if (confirm(`Data set is taking a while to process. There are a total of ${dataLength} results. 
        Would you like to continue?`)) {
        timeout.cancel(warnMsg);
        // warnMsg(timeout,graphID,defer,dataLength);
      } else {
        // ToDo - report to the user on the D3 chart that it is 'incomplete'
        //      if(d3.select('#' + graphID).length>0 )
        //          d3.select('#' + graphID).remove();
        if (defer) {
          timeout.cancel(defer);
        }
        timeout.cancel(warnMsg);
      }
    }, timeoutMs);
  }

  link(scope, ele, attr) {
    scope.$watch('data', data => {
      if (data && data[0].dataLength) {
        let defer;
        if (data[0].dataLength > 200) {
          this.warnMsg($timeout, `${data[0].id}svg`, defer, data[0].dataLength);
        }
        this.drawBipartite(ele, data); // DONE: What shall we do
      }
    });
  }

  static factory() {
    return new BipartiteDiagram(...arguments);
  }
}

BipartiteDiagram.factory.$inject = ['$timeout', 'BiPartiteService'];

angular
  .module('fd-view.diagrams')
  .directive('bipartiteDiagram', BipartiteDiagram.factory);
