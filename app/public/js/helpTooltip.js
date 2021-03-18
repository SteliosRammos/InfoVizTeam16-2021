function init_help() {
    var tooltip = d3.select(HELP_TOOLTIP);
    tooltip
        .style('position', 'absolute')
        .style('color', 'black')
        .style('border', '1px solid black')
        .style('background', 'white')
        .style('pointer-events', 'none')
        .style('display', 'none')
        .style('padding', '8px')

    tooltip.append('p')
};

function show_help(text) {
    console.log(d3.event);

    var tooltip = d3.select(HELP_TOOLTIP);
    tooltip
        .style('left', d3.event.clientX + 'px')
        .style('right', d3.event.clientX + 500 + 'px')
        .style('top', d3.event.clientY + 'px')
        .style('display', 'inline');

    tooltip.select('p')
        .text(text);
};

function hide_help() {
    d3.select(HELP_TOOLTIP)
        .style('display', 'none')
        .selectAll('tr').remove();
};