import angular from 'angular';
import {
  scaleOrdinal,
  schemeCategory20,
  select as d3select
} from 'd3';
import cloud from 'd3-cloud';
import _ from 'lodash';

class TagCloud {
  constructor() {
    this.restrict = 'E';
    this.scope = {
      terms: '='
    };
    this.template = '<div id="tagCloudPrinted"></div>';
  }

  draw(words) {
    angular.element('#tagCloudPrinted').empty();
    const fill = scaleOrdinal(schemeCategory20);
    d3select('#tagCloudPrinted').append('svg')
      .attr('width', 900)
      .attr('height', 600)
      .append('g')
      .attr('transform', 'translate(450,300)')
      .selectAll('text')
      .data(words)
      .enter().append('text')
      .style('font-size', d => `${d.size}px`)
      .style('font-family', 'Impact')
      .style('fill', (d, i) => fill(i))
      .attr('text-anchor', 'middle')
      .attr('transform', d => `translate(${[d.x, d.y]}) rotate(${d.rotate})`)
      .text(d => d.text);
  }

  link(scope, elem, attrs) {
    scope.$watch('terms', newVal => {
      if (scope.terms) {
        const terms = _.map(scope.terms, (val, key) => {
          return {occur: val, term: key};
        });

        cloud().size([600, 600])
          .words(terms.map(d => ({text: d.term, size: d.occur})))
          .padding(2)
          .rotate(() => 0) // return (~~(Math.random() * 6) - 3) * 30;
          .font('Impact')
          .fontSize(d => d.size)
          .on('end', this.draw)
          .start();
      }
    });
  }

  static factory() {
    return new TagCloud();
  }
}

export default TagCloud.factory;
