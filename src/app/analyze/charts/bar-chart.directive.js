import {
  scaleOrdinal,
  schemeCategory20,
  scaleBand,
  scaleLinear,
  select as d3select,
  max as d3max,
  event as d3event,
  axisBottom,
  axisLeft
} from 'd3';

class BarChart {
  constructor($state, SearchService) {
    this.restrict = 'E';
    this.scope = {
      data: '=',
      agg: '=?'
    };
    this._state = $state;
    this._search = SearchService;
  }

  draw(svg, data, width, height, agg) {
    const margin = {top: 20, right: 20, bottom: 40, left: 40};
    const color = scaleOrdinal(schemeCategory20);

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    const x = scaleBand().range([0, width]).padding(0.1);
    const y = scaleLinear().range([height, 0]);

    d3select('.bar-title')
      .text(`${agg.aggType}: ${agg.metric || agg.term}`);

    svg.attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    svg.select('.data')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const div = d3select('body').append('div')
      .attr('class', 'bar-tooltip')
      .style('opacity', 0);

    x.domain(data.map(d => d.key));
    y.domain([0, d3max(data, d => d.metric ? (d.metric.value || d.metric.values['50.0']) : d.doc_count)]);

    const bars = svg.select('.data').selectAll('rect').data(data);

    bars
      .exit().remove();

    bars
      .enter().append('rect')
      .style('fill', d => color(d.key))
      .attr('x', d => x(d.key))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.metric ? (d.metric.value || d.metric.values['50.0']) : d.doc_count))
      .attr('height', d => height - y(d.metric ? (d.metric.value || d.metric.values['50.0']) : d.doc_count))
      .on('mouseover', (d, i) => {
        svg.selectAll('rect')
          .transition().duration(250)
          .attr('opacity', (d, j) => j === i ? 1 : 0.6);
      })
      .on('mousemove', d => {
        div
          .transition().duration(100)
          .style('opacity', 0.9)
          .style('height', 'auto');
        div.html(`<strong>${d.key}</strong>
                  ${(d.metric ? `<br>${(d.metric.value || d.metric.values['50.0']).toFixed(2)}` : '')}
                  <br/><b>doc_count: </b>${d.doc_count}`)
          .style('left', `${d3event.pageX}px`)
          .style('top', `${d3event.pageY - 28}px`);
      })
      .on('mouseout', () => {
        div
          .transition().duration(500)
          .style('opacity', 0);
        svg.selectAll('rect')
          .transition().duration(250)
          .attr('opacity', '1');
      })
      .on('click', d => {
        div.remove();
        this._search.term.value = d.key;
        this._state.go('search');
      });

    bars
      .transition().duration(500)
      .attr('x', d => x(d.key))
      .attr('width', x.bandwidth())
      .attr('y', d => y(d.metric ? (d.metric.value || d.metric.values['50.0']) : d.doc_count) || 0)
      .attr('height', d => (height || 0) - y(d.metric ? (d.metric.value || d.metric.values['50.0']) : d.doc_count) || 0);

    svg.select('.x.axis')
      .attr('transform', `translate(0,${height})`)
      .call(axisBottom(x))
      .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-55)');

    svg.select('.y.axis')
      .call(axisLeft(y));
  }

  link(scope, elem, attrs) {
    const svg = d3select(elem[0]).append('svg');
    const data = svg.append('g').attr('class', 'data');
    const width = 960;
    const height = 500;

    data.append('g').attr('class', 'x axis');
    data.append('g').attr('class', 'y axis');

    svg.append('text')          // Chart title
      .attr('x', (width / 2))
      .attr('y', 20)           // (margin.top)
      .attr('text-anchor', 'middle')
      .attr('class', 'bar-title');

    scope.$watch('data', (newVal, oldVal, scope) => {
      if (scope.data) {
        this.draw(svg, scope.data, width, height, scope.agg);
      }
    }, true);
  }

  static factory() {
    return new BarChart(...arguments);
  }
}

BarChart.factory.$inject = ['$state', 'SearchService'];

export default BarChart.factory;
