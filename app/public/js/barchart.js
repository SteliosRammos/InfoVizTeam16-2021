function barchart_view() {
   //d3.json(data_json).then((data) => { update_barchart(data); });
};

function update_barchart(data) {
      margin = ({top: 20, right: 20, bottom: 10, left: 150})
      width = 500;
      barwidth = 25
      corner = Math.floor((barwidth/3))
  artistfreq_data = data.frequencies.artists
  artists = Object.keys(artistfreq_data)
  freqs = Object.keys(artistfreq_data).map(
                            function(key){
                                return artistfreq_data[key];
                            });
  nbars = artists.length;
  height = (nbars * 28) + margin.top
  range = d3.range(28, (nbars+1) * 28, 28)

  svg = d3.select('.barchart-view').append('svg')
      .attr("width", width)
      .attr("height", height)
      .style("font", "14px Montserrat");

  scaleY = d3.scaleOrdinal()
      .domain(artists)
      .range(range);

   scaleX = d3.scaleLinear()
      .domain([0, Math.ceil(d3.max(freqs)/100)*100])
      .range([margin.left, width - margin.right]);

    xAxis = g => g
        .attr("transform", `translate(0, ${margin.top})`)
        .call(d3.axisTop(scaleX).tickSizeOuter(0).ticks(3))


    yAxis = g => g
        .attr("transform", `translate(${margin.left}, ${margin.top - 15})`)
        .call(d3.axisLeft(scaleY).tickSizeOuter(0))


  svg.selectAll("path")
        .data(freqs)
        .join("path")
        .attr("fill", "#168B98")
        .attr("d", (d, i) => roundedRect(
          scaleX(0),
          (i * 28) + margin.top,
          1,
          barwidth,
          [0, 0, corner, 0]
        ))
        .transition().duration(1000)
        .attr("d", (d, i) => roundedRect(
          scaleX(0),
          (i * 28) + margin.top,
          scaleX(d) - scaleX(0),
          barwidth,
          [0, 0, corner, 0]
        ))

  //x axis
  svg.append("g")
      .call(xAxis)
      .style("font-size", "14px");
  //y axis
  svg.append("g")
      .call(yAxis)
      .style("font-size", "14px");
}

arc = (r, sign) => r ? `a${r * sign[0]},${r * sign[1]} 0 0 1 ${r * sign[2]},${r * sign[3]}` : ""

function roundedRect(x, y, width, height, r) {
            r = [Math.min(r[0], height, width),
                Math.min(r[1], height, width),
                Math.min(r[2], height, width),
                Math.min(r[3], height, width)];

            return `M${x + r[0]},${y
            }h${width - r[0] - r[1]}${arc(r[1], [1, 1, 1, 1])
            }v${height - r[1] - r[2]}${arc(r[2], [1, 1, -1, 1])
            }h${-width + r[2] + r[3]}${arc(r[3], [1, 1, -1, -1])
            }v${-height + r[3] + r[0]}${arc(r[0], [1, 1, 1, -1])
            }z`;
}


