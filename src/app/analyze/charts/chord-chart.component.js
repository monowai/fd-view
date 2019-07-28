import {
  arc as d3arc,
  ascending,
  chord as d3chord,
  descending,
  event as d3event,
  format,
  interpolate,
  rgb,
  ribbon as d3ribbon,
  scaleOrdinal,
  schemeCategory20,
  select as d3select
} from 'd3';

import {chordRdr} from './chord.helpers';

class ChordDiagramCtrl {
  /** ngInject */
  constructor($window, $element) {
    this._window = $window;
    this._element = $element;
  }

  drawChords(ele, matrix, mmap) {
    const el = ele[0];
    let w = 1024;
    let h = 800;
    let r1 = h / 2;
    let r0 = r1 - 100;

    let lastLayout = null;

    const fill = scaleOrdinal(schemeCategory20);

    const chord = d3chord()
      .padAngle(0.03)
      .sortSubgroups(descending)
      .sortChords(ascending);

    const arc = d3arc()
      .innerRadius(r0)
      .outerRadius(r0 + 20);

    d3select(el)
      .select('svg')
      .remove();

    const svgP = d3select(el)
      .append('svg:svg')
      .attr('width', w)
      .attr('height', h)
      .attr('preserveAspectRatio', 'xMinYMin')
      .attr('viewBox', `0 0 ${w} ${h}`);
    const tooltip = d3select(el)
      .append('div')
      .attr('id', 'tooltip');
    const svg = svgP
      .append('svg:g')
      .attr('id', 'circle')
      .attr('transform', `translate(${w / 2},${h / 2})`);

    const circle = svg.append('circle').attr('r', r0 + 20);

    const rdr = chordRdr(matrix, mmap);
    const chords = chord(matrix);
    const g = svg
      .selectAll('g.group')
      .data(chords.groups)
      .enter()
      .append('svg:g')
      .attr('class', 'group')
      .on('mouseover', mouseover)
      .on('mouseout', d => {
        d3select('#tooltip').style('visibility', 'hidden');
        chordPaths.style('opacity', 0.9);
      });

    g.exit()
      .transition()
      .duration(1000)
      .attr('opacity', 0)
      .remove();

    const arcs = g
      .append('svg:path')
      .style('stroke', 'black')
      .style('fill', d => fill(d.index));
    // .attr('d', arc);

    g.select('path')
      .transition()
      .duration(1000)
      .attr('opacity', 0.5)
      .attrTween('d', arcTween(lastLayout))
      .transition()
      .duration(100)
      .attr('opacity', 1);

    const txtG = g
      .append('svg:text')
      .each(d => {
        d.angle = (d.startAngle + d.endAngle) / 2;
      })
      .attr('dy', '.35em')
      .style('font-family', 'helvetica, arial, sans-serif')
      .style('font-size', '9px')
      .attr('text-anchor', d => (d.angle > Math.PI ? 'end' : null))
      .attr('transform', d => {
        return (
          `rotate(${(d.angle * 180) / Math.PI - 90})` +
          `translate(${r0 + 26})` +
          `${d.angle > Math.PI ? 'rotate(180)' : ''}`
        );
      })
      .text(d => {
        // Trying to get the labels to look a little better when they are really looooonng.
        const maxLength = 20;
        return rdr(d).gname.length > maxLength
          ? `...${rdr(d).gname.substring(rdr(d).gname.length - maxLength)}`
          : rdr(d).gname;
      });

    const chordPaths = svg
      .selectAll('path.chord')
      .data(chords)
      .enter()
      .append('svg:path')
      .attr('class', 'chord')
      .style('stroke', d => rgb(fill(d.target.index)).darker())
      .style('fill', d => fill(d.target.index))
      // .attr('d', d3.svg.chord().radius(r0))
      .on('mouseover', d => {
        d3select('#tooltip')
          .style('visibility', 'visible')
          .html(chordTip(rdr(d)))
          .style('top', () => `${d3event.pageY - 100}px`)
          .style('left', () => '100px');
      })
      .on('mouseout', () => {
        d3select('#tooltip').style('visibility', 'hidden');
      });

    // handle exiting paths:
    chordPaths
      .exit()
      .transition()
      .duration(1000)
      .attr('opacity', 0)
      .remove();

    // update the path shape
    chordPaths
      .transition()
      .duration(1000)
      .attr('opacity', 0.5)
      .style('fill', d => fill(d.target.index))
      .attrTween('d', chordTween(lastLayout))
      .transition()
      .duration(100)
      .attr('opacity', 1);

    function arcTween(oldLayout) {
      const oldGroups = {};
      if (oldLayout) {
        oldLayout.groups().forEach(groupData => {
          oldGroups[groupData.index] = groupData;
        });
      }

      return (d, i) => {
        let tween;
        const old = oldGroups[d.index];
        if (old) {
          tween = interpolate(old, d);
        } else {
          const emptyArc = { startAngle: d.startAngle, endAngle: d.startAngle };
          tween = interpolate(emptyArc, d);
        }

        return t => arc(tween(t));
      };
    }

    function chordKey(data) {
      return data.source.index < data.target.index
        ? `${data.source.index}-${data.target.index}`
        : `${data.target.index}-${data.source.index}`;
    }

    function chordTween(oldLayout) {
      const oldChords = {};

      if (oldLayout) {
        oldLayout.chords().forEach(chordData => {
          oldChords[chordKey(chordData)] = chordData;
        });
      }

      return (d, i) => {
        let tween;
        let old = oldChords[chordKey(d)];
        if (old) {
          if (d.source.index !== old.source.index) {
            old = {
              source: old.target,
              target: old.source
            };
          }

          tween = interpolate(old, d);
        } else {
          const emptyChord = {
            source: { startAngle: d.source.startAngle, endAngle: d.source.startAngle },
            target: { startAngle: d.target.startAngle, endAngle: d.target.startAngle }
          };
          tween = interpolate(emptyChord, d);
        }

        return t => d3ribbon().radius(r0)(tween(t));
      };
    }

    lastLayout = chord;

    function chordTip(d) {
      const p = format('.2%');
      // const q = format(',.3r');
      return `${p(d.stotal === 0 ? 0 : d.svalue / d.stotal)} of ${d.sname}<br>-to-<br>${p(
        d.ttotal === 0 ? 0 : d.tvalue / d.ttotal
      )} of ${d.tname}`;
      // + ' <br> values - ' +  q(d.stotal) + ' / ' + q(d.tvalue);
    }

    function groupTip(d) {
      const p = format('.1%');
      const q = format(',.3r');
      return `${d.gname}<br>${p(d.gvalue / d.mtotal)}: ${q(d.gvalue)} of ${q(d.mtotal)}`;
    }

    function mouseover(d, i) {
      d3select('#tooltip')
        .style('visibility', 'visible')
        .html(groupTip(rdr(d)))
        .style('top', () => `${d3event.pageY - 80}px`)
        .style('left', () => '130px');

      dimChords(i);
    }

    function dimChords(i) {
      chordPaths.style('opacity', p => {
        return p.source.index === i || p.target.index === i ? 0.9 : 0.15;
      });
    }

    function resize() {
      if (r0 > 0) {
        svgP.attr('width', w).attr('height', h);
        svg.attr('transform', `translate(${w / 2},${h / 2})`);
        circle.attr('r', r0 + 20);
        arc.innerRadius(r0).outerRadius(r0 + 20);
        arcs.attr('d', arc);
        txtG.attr('transform', d => {
          return (
            `rotate(${(d.angle * 180) / Math.PI - 90})` +
            `translate(${r0 + 26}) ${d.angle > Math.PI ? 'rotate(180)' : ''}`
          );
        });
        chordPaths.attr('d', d3ribbon().radius(r0));
      }
    }

    resize();

    this.resizeHandler = () => {
      w = el.clientWidth;
      h = (el.clientWidth * 2) / 3;
      r1 = h / 2;
      r0 = r1 - 100;
      resize();
    };

    this._window.addEventListener('resize', this.resizeHandler);
  }

  $onChanges(c) {
    if (this.data && this.data.matrix.length) {
      this.drawChords(this._element, this.data.matrix, this.data.mmap);
    }
  }

  $onDestroy() {
    this._window.removeEventListener('resize', this.resizeHandler);
  }
}

export const chordDiagram = {
  controller: ChordDiagramCtrl,
  bindings: {
    data: '<'
  }
};
