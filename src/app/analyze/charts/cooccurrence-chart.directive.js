import {
  range,
  scaleBand,
  scaleLinear,
  scaleOrdinal,
  schemeCategory10,
  select as d3select,
  selectAll as d3selectAll
} from 'd3';

class CooccurrenceDiagram {
  constructor() {
    this.restrict = 'E';
    this.scope = {
      data: '=',
      orderedNodes: '='
    };
  }

  /**
   * The graph is drawn by row.
   * @param  {[type]} matrix [matrix is a 2 dimension arrays. The 1st dimension is rows and 2nd one is each row.]
   * @param  {[type]} nodes  [the names of each cell]
   * @return {[type]}        [void]
   */
  drawCooccurrence(ele, matrix, fromNodes, toNodes, fromOrders, toOrders) {
    const el = ele[0];

    const margin = {top: 60, right: 0, bottom: 0, left: 60};
    const width = 580;
    const height = 580;

    const x = scaleBand().range([0, width]);
    const y = scaleBand().range([height, 0]);
    const z = scaleLinear()
      .domain([0, 4])
      .clamp(true);
    const c = scaleOrdinal(schemeCategory10).domain(range(10));
    const graphID = ele.parent()[0].id;

    d3select(`#${graphID} svg`).remove();

    const svg = d3select(el)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .style('float', 'left')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // The default sort order.
    y.domain(fromOrders); // DONE: Get axis labels
    x.domain(toOrders); // DONE: Get axis labels

    const rect = svg
      .append('rect')
      .attr('class', 'background')
      .attr('width', width)
      .attr('height', height);

    const row = svg
      .selectAll('.row')
      .data(matrix)
      .enter()
      .append('g')
      .attr('class', 'row')
      .attr('transform', (d, i) => `translate(0,${y(i)})`)
      .each(drawRow);

    row.append('line').attr('x2', width);

    row
      .append('text')
      .attr('x', -6)
      .attr('y', x.step() / 2)
      .attr('dy', '.32em')
      .attr('text-anchor', 'end')
      .text((d, i) => fromNodes[i].name); // DONE: get node name which is axis' name

    const column = svg
      .selectAll('.column')
      .data(toNodes)
      .enter()
      .append('g')
      .attr('class', 'column')
      .attr('transform', (d, i) => `translate(${x(i)})rotate(-90)`);

    column.append('line').attr('x1', -width);

    column
      .append('text')
      .attr('x', 6)
      .attr('y', x.step() / 2)
      .attr('dy', '.32em')
      .attr('text-anchor', 'start')
      .text((d, i) => toNodes[i].name);

    function drawRow(row) {
      const cell = d3select(this)
        .selectAll('.cell')
        .data(row.filter(d => d.z))
        .enter()
        .append('rect')
        .attr('class', 'cell')
        .attr('x', d => x(d.x))
        .attr('width', x.step())
        .attr('height', y.step())
        .style('fill-opacity', d => z(d.z))
        .style('fill', d => c(d.z)) // nodes[d.x].group == nodes[d.y].group ? c(nodes[d.x].group) : null;

        .on('mouseover', mouseover)
        .on('mouseout', mouseout);
    }

    function mouseover(p) {
      d3selectAll('.row text').classed('active', (d, i) => i === p.y);
      d3selectAll('.column text').classed('active', (d, i) => d.index === p.x);
    }

    function mouseout() {
      d3selectAll('text').classed('active', false);
    }

    // d3.select('#order').on('change', () => {
    //  clearTimeout(timeout);
    //  order(this.value);
    // });
    //
    // const timeout = setTimeout(() => {
    //  order('group');
    //  d3.select('#order').property('selectedIndex', 2).node().focus();
    // }, 5000);

    //        scope.$watch(function () {
    //            return el.clientWidth * el.clientHeight;
    //        }, function () {
    //            w = el.clientWidth;
    //            h = el.clientWidth * 2/3;
    //            r1 = h / 2, r0 = r1 - 100
    //            resize();
    //        })
    //        function resize() {
    //            svg.attr({width: w+ margin.left + margin.right, height: h + margin.top + margin.bottom});
    //            rect.attr({width:w, height:h});
    //            circle.attr('r', r0 + 20);
    //            arc.innerRadius(r0).outerRadius(r0 + 20);
    //            arcs.attr('d', arc);
    //            txtG.attr('transform', function(d) {
    //                return 'rotate(' + (d.angle * 180 / Math.PI - 90) + ')'
    //                    + 'translate(' + (r0 + 26) + ')'
    //                    + (d.angle > Math.PI ? 'rotate(180)' : '');
    //            })
    //            chordPaths.attr('d', d3.svg.chord().radius(r0))
    //
    //        }

    function order(orderedNodes) {
      x.domain(orderedNodes);

      const t = svg.transition().duration(2500);

      t.selectAll('.row')
        .delay((d, i) => x(i) * 4)
        .attr('transform', (d, i) => `translate(0,${x(i)})`)
        .selectAll('.cell')
        .delay(d => x(d.x) * 4)
        .attr('x', d => x(d.x));

      t.selectAll('.column')
        .delay((d, i) => x(i) * 4)
        .attr('transform', (d, i) => `translate(${x(i)})rotate(-90)`);
    }

    return {orderFn: order};
  }

  link(scope, ele, attr) {
    let painter;
    scope.$watch('data', data => {
      if (data && data.matrix.length) {
        painter = this.drawCooccurrence(
          ele,
          data.matrix,
          data.fromNodes,
          data.toNodes,
          data.fromOrders,
          data.toOrders
        ); // DONE: What shall we do
      }
    });
    scope.$watch('orderedNodes', orderedNodes => {
      if (orderedNodes && painter) {
        painter.orderFn(orderedNodes);
      }
    });
  }

  static factory() {
    return new CooccurrenceDiagram();
  }
}

export default CooccurrenceDiagram.factory;
