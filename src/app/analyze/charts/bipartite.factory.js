/* eslint-disable */
import {
  scaleOrdinal, schemeCategory20, range, interpolate,
  set as d3set,
  sum as d3sum,
  max as d3max,
  select as d3select,
  event as d3event
} from 'd3';

export default function biPartite() {
  'use strict';
  const bP = {};
  const b = 30;
  const bb = 200;
  let height = 600;
  const buffMargin = 1;
  const minHeight = 10;
  const offset = 120;
  const txtLength = 35;
  const c1 = [-130, 40];
  const c2 = [-50 + offset, 120 + offset];
  const c3 = [-10 + offset, 160 + offset]; // Column positions of labels.
  const colors = scaleOrdinal(schemeCategory20).domain(range(20));

  bP.partData = data => {
    const sData = {};

    sData.keys = [
      d3set(data.map(d => d.source)).values().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
      d3set(data.map(d => d.target)).values().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0))
    ];

    sData.data = [
      sData.keys[0].map(d => sData.keys[1].map(v => 0)),
      sData.keys[1].map(d => sData.keys[0].map(v => 0))
    ];

    data.forEach(d => {
      sData.data[0][sData.keys[0].indexOf(d.source)][sData.keys[1].indexOf(d.target)] = d.count;
      sData.data[1][sData.keys[1].indexOf(d.target)][sData.keys[0].indexOf(d.source)] = d.count;
    });

    return sData;
  };

  function visualize(data) {
    const vis = {};

    function calculatePosition(a, s, e, b, m) {
      const total = d3sum(a);
      let neededHeight = 0;
      let leftoverHeight = e - s - 2 * b * a.length;
      const ret = a.map(d => {
        const v = {};
        v.percent = (total === 0 ? 0 : d / total);
        v.value = d;
        v.height = Math.max(v.percent * (e - s - 2 * b * a.length), m);
        (v.height === m) ? leftoverHeight -= m : neededHeight += v.height;
        return v;
      });

      const scaleFact = leftoverHeight / Math.max(neededHeight, 1);
      let sum = 0;

      ret.forEach(d => {
        d.percent *= scaleFact;
        d.height = (d.height === m ? m : d.height * scaleFact);
        d.middle = sum + b + d.height / 2;
        d.y = s + d.middle - d.percent * (e - s - 2 * b * a.length) / 2;
        d.h = d.percent * (e - s - 2 * b * a.length);
        d.percent = (total === 0 ? 0 : d.value / total);
        sum += 2 * b + d.height;
      });

      return ret;
    }

    vis.mainBars = [
      calculatePosition(data.data[0].map(d => d3sum(d)), 0, height, buffMargin, minHeight),
      calculatePosition(data.data[1].map(d => d3sum(d)), 0, height, buffMargin, minHeight)
    ];

    vis.subBars = [[], []];
    vis.mainBars.forEach((pos, p) => {
      pos.forEach((bar, i) => {
        calculatePosition(data.data[p][i], bar.y, bar.y + bar.h, 0, 0).forEach((sBar, j) => {
          sBar.key1 = (p === 0 ? i : j);
          sBar.key2 = (p === 0 ? j : i);
          vis.subBars[p].push(sBar);
        });
      });
    });
    vis.subBars.forEach(sBar => {
      sBar.sort((a, b) => {
        return (a.key1 < b.key1 ? -1 : a.key1 > b.key1 ?
          1 : a.key2 < b.key2 ? -1 : a.key2 > b.key2 ? 1 : 0);
      });
    });

    vis.edges = vis.subBars[0].map((p, i) => {
      return {
        key1: p.key1,
        key2: p.key2,
        y1: p.y,
        y2: vis.subBars[1][i].y,
        h1: p.h,
        h2: vis.subBars[1][i].h
      };
    });
    vis.keys = data.keys;
    return vis;
  }

  function arcTween(a) {
    const i = interpolate(this._current, a);
    this._current = i(0);
    return t => edgePolygon(i(t));
  }

  function drawPart(data, id, p) {
    d3select(`#${id}`).append('g').attr('class', `part${p}`)
      .attr('transform', `translate(${p * (bb + b + offset)},0)`);
    d3select(`#${id}`).select(`.part${p}`).append('g').attr('class', 'subbars');
    d3select(`#${id}`).select(`.part${p}`).append('g').attr('class', 'mainbars');

    const mainbar = d3select(`#${id}`).select(`.part${p}`).select('.mainbars')
      .selectAll('.mainbar').data(data.mainBars[p])
      .enter().append('g').attr('class', 'mainbar');

    mainbar.append('rect').attr('class', 'mainrect')
      .attr('x', p === 0 ? offset : 0)
      .attr('y', d => d.middle - d.height / 2)
      .attr('width', b)
      .attr('height', d => d.height)
      .style('shape-rendering', 'auto')
      .style('fill-opacity', 0).style('stroke-width', '0.5')
      .style('stroke', 'black').style('stroke-opacity', 0);

    mainbar.append('text').attr('class', 'barlabel')
      .attr('x', c1[p])
      .attr('y', d => d.middle + 5)
      .text((d, i) => {
        const barlabel = data.keys[p][i];
        return (barlabel.length > txtLength) ?
          `${barlabel.substring(0, 44)}...` : barlabel;
      })
      .attr('text-anchor', 'start');

    mainbar.append('text').attr('class', 'barvalue')
      .attr('x', c2[p])
      .attr('y', d => d.middle + 5)
      .text((d, i) => d.value)
      .attr('text-anchor', 'end');

    mainbar.append('text').attr('class', 'barpercent')
      .attr('x', c3[p])
      .attr('y', d => d.middle + 5)
      .text((d, i) => `(${Math.round(100 * d.percent)}%)`)
      .attr('text-anchor', 'end').style('fill', 'grey');

    d3select(`#${id}`).select(`.part${p}`).select('.subbars')
      .selectAll('.subbar')
      .data(data.subBars[p]).enter()
      .append('rect').attr('class', 'subbar')
      .attr('x', p === 0 ? offset : 0)
      .attr('y', d => d.y)
      .attr('width', b)
      .attr('height', d => d.h)
      .style('fill', d => colors(d.key1));
  }

  function drawEdges(data, id) {
    d3select(`#${id}`).append('g').attr('class', 'edges').attr('transform', `translate(${b + offset},0)`);
    d3select(`#${id}`).select('.edges').selectAll('.edge')
      .data(data.edges).enter()
      .append('polygon').attr('class', 'edge')
      .attr('points', edgePolygon)
      .style('fill', d => colors(d.key1))
      .style('opacity', 0.5)
      .each(function (d) {
        this._current = d;
      });
  }

  function drawHeader(header, id) {
    d3select(`#${id}`).append('g').attr('class', 'header')
      .append('text').text(header[2])
      .style('font-size', '20')
      .attr('x', 258)
      .attr('y', -20)
      .style('text-anchor', 'middle')
      .style('font-weight', 'bold');

    [0, 1].forEach(d => {
      const h = d3select(`#${id}`).select(`.part${d}`).append('g').attr('class', 'header');

      h.append('text').text(header[d])
        .attr('x', (c1[d] - 5))
        .attr('y', -5)
        .style('fill', 'grey');

      h.append('text').text('Count')
        .attr('x', (c2[d] - 10))
        .attr('y', -5)
        .style('fill', 'grey');

      h.append('line').attr('x1', c1[d] - 10).attr('y1', -2)
        .attr('x2', c3[d] + 10).attr('y2', -2).style('stroke', 'black')
        .style('stroke-width', '1').style('shape-rendering', 'crispEdges');
    });
  }

  function edgePolygon(d) {
    return [0, d.y1, bb, d.y2, bb, d.y2 + d.h2, 0, d.y1 + d.h1].join(' ');
  }

  function transitionPart(data, id, p) {
    const mainbar = d3select(`#${id}`).select(`.part${p}`).select('.mainbars')
      .selectAll('.mainbar').data(data.mainBars[p]);

    mainbar.select('.mainrect').transition().duration(500)
      .attr('y', d => d.middle - d.height / 2)
      .attr('height', d => d.height);

    mainbar.select('.barlabel').transition().duration(500)
      .attr('y', d => d.middle + 5);

    mainbar.select('.barvalue').transition().duration(500)
      .attr('y', d => d.middle + 5)
      .text((d, i) => d.value);

    mainbar.select('.barpercent').transition().duration(500)
      .attr('y', d => d.middle + 5)
      .text((d, i) => `(${Math.round(100 * d.percent)}%)`);

    const transitSubBars = d3select(`#${id}`).select(`.part${p}`).select('.subbars')
      .selectAll('.subbar').data(data.subBars[p])
      .transition().duration(500)
      .each(subBarTrans);

    function subBarTrans() {
      d3select(this).transition()
      .attr('y', d => d.y)
      .attr('height', d => d.h);
    }
  }

  function transitionEdges(data, id) {
    d3select(`#${id}`).append('g').attr('class', 'edges')
      .attr('transform', `translate(${b},0)`);

    const transitEdges = d3select(`#${id}`).select('.edges')
      .selectAll('.edge').data(data.edges)
      .transition().duration(500)
      .each(edgeTween);

    function edgeTween(d, i) {
      d3select(this).transition().attrTween('points', arcTween)
        .style('opacity', d => d.h1 === 0 || d.h2 === 0 ? 0 : 0.5);
      /** if(i> 0 && i % 1000 == 0 || i == data.edges.length-1){
                console.log('Processing '+ (i+1) +' out of '+data.edges.length+ '...' );
            }  **/
    }
  }

  function transition(data, id) {
    transitionPart(data, id, 0);
    transitionPart(data, id, 1);
    transitionEdges(data, id);
  }

  let skip;
  bP.draw = (data, svg) => {
    skip = false;
    height = d3max([data[0].dataLength * 10 + 40, 600]);
    data.forEach((biP, s) => {
      svg.append('g')
        .attr('id', biP.id)
        .attr('transform', `translate(${550 * s},0)`);

      const visData = visualize(biP.data);
      drawPart(visData, biP.id, 0);
      drawPart(visData, biP.id, 1);
      drawEdges(visData, biP.id);
      drawHeader(biP.header, biP.id);
      if (visData.edges.length > 10000) {
        skip = true;
      }
      [0, 1].forEach(p => {
        d3select(`#${biP.id}`)
          .select(`.part${p}`)
          .select('.mainbars')
          .selectAll('.mainbar')
          .on('mouseover', (d, i) => bP.selectSegment(data, p, i))
          .on('mouseout', (d, i) => bP.deSelectSegment(data, p, i));
      });
    });
  };

  bP.selectSegment = (data, m, s) => {
    data.forEach(k => {
      const newdata = {keys: [], data: []};

      newdata.keys = k.data.keys;

      newdata.data[m] = k.data.data[m];

      newdata.data[1 - m] = k.data.data[1 - m]
        .map(v => v.map((d, i) => s === i ? d : 0));
      if (newdata.keys[m][s].length > txtLength) {
        d3select('#tooltip')
          .style('visibility', 'visible')
          .html(newdata.keys[m][s])
          .attr('class', 'longlabel')
          .style('top', () => `${d3event.pageY - 120}px`)
          .style('left', () => m === 0 ? '50px' : '550px');
      }
      if (!skip) {
        transition(visualize(newdata), k.id);

        const selectedBar = d3select(`#${k.id}`).select(`.part${m}`).select('.mainbars')
          .selectAll('.mainbar').filter((d, i) => i === s);

        selectedBar.select('.mainrect').style('stroke-opacity', 1);
        selectedBar.select('.barlabel').style('font-weight', 'bold');
        selectedBar.select('.barvalue').style('font-weight', 'bold');
        selectedBar.select('.barpercent').style('font-weight', 'bold');
      }
    });
  };

  bP.deSelectSegment = (data, m, s) => {
    data.forEach(k => {
      d3select('#tooltip').style('visibility', 'hidden');
      if (!skip) {
        transition(visualize(k.data), k.id);

        const selectedBar = d3select(`#${k.id}`).select(`.part${m}`).select('.mainbars')
          .selectAll('.mainbar').filter((d, i) => i === s);

        selectedBar.select('.mainrect').style('stroke-opacity', 0);
        selectedBar.select('.barlabel').style('font-weight', 'normal');
        selectedBar.select('.barvalue').style('font-weight', 'normal');
        selectedBar.select('.barpercent').style('font-weight', 'normal');
      }
    });
  };

  return bP;
}
