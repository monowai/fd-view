class ChordDiagram {
  constructor() {
    this.restrict = 'EA';
    this.scope = {
      data: '='
    };
  }

  drawChords(ele, matrix, mmap, scope) {
    const el = ele[0];
    let w = 1024;
    let h = 640;
    let r1 = h / 2;
    let r0 = r1 - 100;
    const graphID = ele.parent()[0].id;
    const fill = d3.scaleOrdinal()
      .domain(d3.range(6))
      .range(['#788b92', '#A2AC72', '#cab8a1', '#89b4fd', '#9eac74', '#f6f0ba']);

    const chord = d3.chord()
      .padAngle(0.03)
      .sortSubgroups(d3.descending)
      .sortChords(d3.ascending);

    const arc = d3.arc()
      .innerRadius(r0)
      .outerRadius(r0 + 20);

    d3.select(`#${graphID} svg`).remove();

    const svgP = d3.select(el).append('svg:svg')
      .attr('width', w)
      .attr('height', h);
    const svg = svgP.append('svg:g')
      .attr('id', 'circle')
      .attr('transform', `translate(${w / 2},${h / 2})`);

    const circle = svg.append('circle')
      .attr('r', r0 + 20);

    const rdr = chordRdr(matrix, mmap);
    const chords = chord(matrix);
    const g = svg.selectAll('g.group')
      .data(chords.groups)
      .enter().append('svg:g')
      .attr('class', 'group')
      .on('mouseover', mouseover)
      .on('mouseout', d => d3.select('#tooltip').style('visibility', 'hidden'));

    const arcs = g.append('svg:path')
      .style('stroke', 'black')
      .style('fill', d => fill(d.index));
      // .attr('d', arc);

    const txtG = g.append('svg:text')
      .each(d => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr('dy', '.35em')
      .style('font-family', 'helvetica, arial, sans-serif')
      .style('font-size', '9px')
      .attr('text-anchor', d => d.angle > Math.PI ? 'end' : null)
      .attr('transform', d => {
        return `rotate(${d.angle * 180 / Math.PI - 90})` +
          `translate(${r0 + 26})` +
          `${(d.angle > Math.PI ? 'rotate(180)' : '')}`;
      })
      .text(d => {
        // Trying to get the labels to look a little better when they are really looooonng.
        const maxLength = 20;
        return rdr(d).gname.length > maxLength ?
          `...${rdr(d).gname.substring(rdr(d).gname.length - maxLength)}` : rdr(d).gname;
      });

    const chordPaths = svg.selectAll('path.chord')
      .data(chords)
      .enter().append('svg:path')
      .attr('class', 'chord')
      .style('stroke', d => d3.rgb(fill(d.target.index)).darker())
      .style('fill', d => fill(d.target.index))
      // .attr('d', d3.svg.chord().radius(r0))
      .on('mouseover', d => {
        d3.select('#tooltip')
          .style('visibility', 'visible')
          .html(chordTip(rdr(d)))
          .style('top', () => `${d3.event.pageY - 100}px`)
          .style('left', () => '100px');
      })
      .on('mouseout', d => d3.select('#tooltip').style('visibility', 'hidden'));

    function chordTip(d) {
      const p = d3.format('.2%');
      // const q = d3.format(',.3r');
      return `${p(d.stotal === 0 ? 0 : d.svalue / d.stotal)} of ${d.sname}<br>-to-<br>${p(d.ttotal === 0 ? 0 : d.tvalue / d.ttotal)} of ${d.tname}`;
      // + ' <br> values - ' +  q(d.stotal) + ' / ' + q(d.tvalue);
    }

    function groupTip(d) {
      const p = d3.format('.1%');
      const q = d3.format(',.3r');
      return `${d.gname}<br>${p(d.gvalue / d.mtotal)}: ${q(d.gvalue)} of ${q(d.mtotal)}`;
    }

    function mouseover(d, i) {
      d3.select('#tooltip')
        .style('visibility', 'visible')
        .html(groupTip(rdr(d)))
        .style('top', () => `${d3.event.pageY - 80}px`)
        .style('left', () => '130px');

      chordPaths.classed('fade', p => {
        return p.source.index !== i && p.target.index !== i;
      });
    }

    scope.$watch(() => el.clientWidth * el.clientHeight,
      () => {
        w = el.clientWidth;
        h = el.clientWidth * 2 / 3;
        r1 = h / 2;
        r0 = r1 - 100;
        resize();
      });

    function resize() {
      if (r0 > 0) {
        svgP.attr({width: w, height: h});
        svg.attr('transform', `translate(${w / 2},${h / 2})`);
        circle.attr('r', r0 + 20);
        arc.innerRadius(r0).outerRadius(r0 + 20);
        arcs.attr('d', arc);
        txtG.attr('transform', d => {
          return `rotate(${d.angle * 180 / Math.PI - 90})` +
            `translate(${r0 + 26})` +
            `${d.angle > Math.PI ? 'rotate(180)' : ''}`;
        });
        chordPaths.attr('d', d3.ribbon().radius(r0));
      }
    }
  }

  link(scope, ele, attr) {
    scope.$watch('data', data => {
      if (data && data.matrix.length) {
        this.drawChords(ele, data.matrix, data.mmap, scope);
      }
    });
  }
}

angular
  .module('fd-view.diagrams')
  .directive('chordDiagram', () => new ChordDiagram());
