function map_view(geojson, container_selector) {
    //Width and height
    var w = 960;
    var h = 720;

    //Define map projection
    var projection = d3.geoMercator() //utiliser une projection standard pour aplatir les pôles, voir D3 projection plugin
        .center([13, 52]) //comment centrer la carte, longitude, latitude
        .translate([w / 2, h / 2]) // centrer l'image obtenue dans le svg
        .scale([w / 1.5]); // zoom, plus la valeur est petit plus le zoom est gros 

    //Define path generator
    var path = d3.geoPath()
        .projection(projection);

    //Create SVG
    var svg = d3.select(container_selector)
        .append('svg')
        .attr('width', w)
        .attr('height', h)
        .style('border', '1px solid black');

    //Load in GeoJSON data
    d3.json(geojson).then((data) => {
        //Bind data and create one path per GeoJSON feature
        svg.selectAll('path')
            .data(data.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('stroke', 'rgba(8, 81, 156, 0.2)')
            .attr('fill', 'rgba(8, 81, 156, 0.6)')
            .on('mouseover', function() {
                d3.select(this).attr('fill', 'rgba(8, 81, 156, 0.2)');
            })
            .on('mouseout', function() {
                d3.select(this).attr('fill', 'rgba(8, 81, 156, 0.6)');
            });
    });
};
