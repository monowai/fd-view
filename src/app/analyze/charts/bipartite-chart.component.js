class BipartiteDiagram {
  /** @ngInject */
  constructor($element, $timeout, BiPartiteService, modalService, toastr) {
    this._element = $element;
    this._timeout = $timeout;
    this._bp = BiPartiteService;
    this._modal = modalService;
    this._toastr = toastr;
  }

  drawBipartite(ele, data) {
    const width = 1400;
    const height = d3.max([data[0].dataLength * 10 + 40, 600]);
    const margin = {b: 0, t: 40, l: 170, r: 50};
    const el = ele[0];

    d3.select(el).select('svg').remove();

    const svg = d3.select(el).append('svg')
      .attr('width', width)
      .attr('height', (height + margin.b + margin.t))
      .append('g').attr('transform', `translate(${margin.l}, ${margin.t})`);
    /* var bpData = [
     {data:bP.partData(mappedData,2), id:'Relationships', header:['From','To', 'Relationships']}
     ];  */
    return this._timeout(() => {
      this._bp.draw(data, svg);
    }, 500, false);
  }

  warnMsg(dataLength) {
    return this._modal.show(
      {
        size: 'sm',
        backdrop: 'static'},
      {
        title: 'Data set is taking a while to process',
        text: `There are a total of ${dataLength} results. Proceeding can disrupt your browser work. Would you like to continue?`
      });
  }

  $onChanges(c) {
    if (this.data && this.data[0].dataLength) {
      if (this.data[0].dataLength > 200) {
        this.warnMsg(this.data[0].dataLength)
          .then(
            () => {
              this._toastr.warning('Please wait...');
              this.drawBipartite(this._element, this.data);
            },
            () => {
              this._toastr.warning('Cancelled processing...');
            });
      } else {
        this.drawBipartite(this._element, this.data);
      }
    }
  }
}

angular
  .module('fd-view.diagrams')
  .component('bipartiteDiagram', {
    controller: BipartiteDiagram,
    bindings: {
      data: '<'
    }
  });
