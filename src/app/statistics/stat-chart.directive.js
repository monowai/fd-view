import {
  arc as d3arc,
  entries,
  interpolate,
  pie as d3pie,
  scaleOrdinal,
  schemeCategory20,
  select
} from 'd3';

class StatsChart {
  constructor($filter) {
    this._filter = $filter;

    this.restrict = 'E';
    this.scope = {
      data: '='
    };
  }

  link(scope, element) {
    const width = 300;
    const height = 300;
    const getData = dataSet => {
      const data = {};
      dataSet.forEach(e => {
        data[e.key] = e.doc_count;
      });
      return data;
    };
    const statChart = this._chart(select(element[0]), width, height, getData(scope.data)).render();

    scope.$watch(
      'data',
      (newVal, oldVal, scope) => {
        if (scope.data) {
          statChart.data(getData(newVal)).render();
        }
      },
      true
    );
  }

  static factory() {
    return new StatsChart(...arguments);
  }

  _chart(element, width, height, data) {
    let radius = Math.min(width, height) / 2;
    const color = scaleOrdinal(schemeCategory20);
    const total = () => Object.values(data).reduce((a, b) => a + b);

    const pie = d3pie()
      .sort(null)
      .value(d => d.value);

    let svg;
    let g;
    let arc;

    const object = {};

    object.render = () => {
      if (svg) {
        g.data(pie(entries(data)))
          .exit()
          .remove();

        g.select('path')
          .transition()
          .duration(200)
          .attrTween('d', a => {
            const i = interpolate(this._current, a);
            this._current = i(0);
            return t => arc(i(t));
          });

        g.select('text').attr('transform', d => `translate(${arc.centroid(d)})`);

        svg.select('text.text-tooltip').datum(data);
      } else {
        arc = d3arc()
          .outerRadius(radius)
          .innerRadius(radius - radius / 2);
        svg = element
          .append('svg')
          // .attr('width', width)
          // .attr('height', height)
          .attr('preserveAspectRatio', 'xMinYMid')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .classed('chart-content', true)
          .append('g')
          .attr('transform', `translate(${width / 2},${height / 2})`);

        g = svg
          .selectAll('.arc')
          .data(pie(entries(data)))
          .enter()
          .append('g')
          .attr('class', 'arc');

        g.append('path')
          .each(d => {
            this._current = d;
          })
          .attr('d', arc)
          .style('fill', d => color(d.data.key));
        g.append('text')
          .attr('transform', d => `translate(${arc.centroid(d)})`)
          .attr('dy', '.35em')
          .style('text-anchor', 'middle');
        g.select('text').text(d => d.data.key);

        svg
          .append('text')
          .datum(data)
          .attr('x', 0)
          .attr('y', radius / 10)
          .attr('class', 'text-tooltip')
          .style('text-anchor', 'middle')
          .attr('font-weight', 'bold')
          .style('font-size', `${radius / 3}px`);

        svg
          .select('text.text-tooltip')
          .attr('fill', '#3c8dbc')
          .text(this._filter('megaNum')(total()));

        g.on('mouseover', obj => {
          svg
            .select('text.text-tooltip')
            .attr('fill', d => color(obj.data.key))
            .text(d => this._filter('megaNum')(d[obj.data.key]));
        });

        g.on('mouseout', obj => {
          svg
            .select('text.text-tooltip')
            .attr('fill', '#3c8dbc')
            .text(this._filter('megaNum')(total()));
        });
      }
      return object;
    };

    object.data = value => {
      if (!arguments.length) {
        return data;
      }
      data = value;
      return object;
    };

    object.element = value => {
      if (!arguments.length) {
        return element;
      }
      element = value;
      return object;
    };

    object.width = value => {
      if (!arguments.length) {
        return width;
      }
      width = value;
      radius = Math.min(width, height) / 2;
      return object;
    };

    object.height = value => {
      if (!arguments.length) {
        return height;
      }
      height = value;
      radius = Math.min(width, height) / 2;
      return object;
    };

    return object;
  }
}

StatsChart.factory.$inject = ['$filter'];

export default StatsChart.factory;
