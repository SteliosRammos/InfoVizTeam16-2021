var barchart_width = 480;
var barchart_height = 500;
var barchart_margin = {top: 40, right: 20, bottom: 10, left: 200}
var barchart_globals = {
    'nbars': 15,
    'max_nbars': 15,
    'data': null
}

function barchart_view() {
    init_help();
    const help_text = 'Artists by number of artworks: This barchart shows the top artists by the number of their artworks in the selection.';
    d3.select(BARCHART).select('span')
        .on('mouseover', () => { show_help(help_text); })
        .on('mouseout', () => { hide_help(); });

    var svg = d3.select(BARCHART).append('svg')
        .attr("width", barchart_width)
        .attr("height", barchart_height)
        .style("font", "14px Montserrat");
    
    //x axis
    svg.append("g")
        .attr('class', 'xAxis')
        .attr("transform", `translate(0, ${barchart_margin.top})`);
    //y axis
    svg.append("g")
        .attr('class', 'yAxis')
        .attr("transform", `translate(${barchart_margin.left}, ${barchart_margin.top - 15})`)
        .style("font-size", "14px");
    
    var barchart_slider = d3.select(BARCHART).append('div').attr('id', 'barchart-slider');
    var slider = createD3SimpleSlider(1, barchart_globals.max_nbars, "#barchart-slider");
    slider.select(barchart_globals.nbars);
    slider.onChange(function (newPos) {
        d3.select("#barchart-slider-label").text(newPos + ' artist' + (newPos > 1 ? 's' : ''));
        pos = slider.select();
        // barchart_globals.nbars = 0;
        // update_graph();
        barchart_globals.nbars = pos;
        update_barchart();
    });
    barchart_slider.append('div').attr('id', 'barchart-slider-label').text(barchart_globals.nbars + ' artists');

};

function update_barchart(data = null) {
    if (data !== null) {
        barchart_globals.data = data;
    } else {
        data = barchart_globals.data;
    };

    if (typeof data.frequencies == "undefined") return;

    var margin = barchart_margin;

    var svg = d3.select(BARCHART).select('svg')

    barwidth = 25;
    spaced_barwidth = barwidth + 3;
    corner = Math.floor((barwidth/5));

    artistfreq_data = data.frequencies.artists
    ordered_artists = data.artist_order_per_freq;

    // Render top 10
    //   nbars = artists.length;
    nbars = barchart_globals.nbars;
    top_n_artists = Object.keys(_.pick(artistfreq_data, ordered_artists.slice(Math.max(ordered_artists.length - nbars, 1)))).reverse()

    freqs = top_n_artists.reduce((freqs, artist) => {
        freqs.push({'freq': artistfreq_data[artist], 'artist': artist})
        return freqs
    }, [])
    max_freq = d3.max(top_n_artists.reduce((max_freq, artist) => {
        max_freq.push(artistfreq_data[artist])
        return max_freq
    }, []))

    scaleY = d3.scaleOrdinal()
        .domain(top_n_artists)
        .range(d3.range(spaced_barwidth, (nbars+1) * spaced_barwidth, spaced_barwidth));

    scaleX = d3.scaleLinear()
        .domain([0, Math.ceil(max_freq/10)*10])
        .range([margin.left, barchart_width - margin.right]);
    console.log(freqs)

    svg.selectAll('path').remove();
    var bars = svg.selectAll("path").data(freqs, (d) => { return d.artist });
    bars.exit().remove();
    bars.enter().append("path")
        .attr("fill", "#698fda")
        .attr("d", (d, i) => roundedRect(
            scaleX(0),
            (i * spaced_barwidth) + margin.top,
            1,
            barwidth,
            [0, corner, corner, 0]
        ))
        .transition().duration(1000)
        .attr("d", (d, i) => roundedRect(
            scaleX(0),
            (i * spaced_barwidth) + margin.top,
            scaleX(d.freq) - scaleX(0),
            barwidth,
            [0, corner, corner, 0]
        ))

    //x axis
    svg.select('.xAxis').selectAll('*').remove()
    svg.select('.xAxis')
        .call(d3.axisTop(scaleX).tickSizeOuter(0).ticks(3))
        .style("font-size", "14px");
    //y axis
    svg.select('.yAxis').selectAll('*').remove()
    svg.select('.yAxis')
        .call(d3.axisLeft(scaleY).tickSizeOuter(0))
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


