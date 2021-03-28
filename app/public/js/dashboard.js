var CIELAB = '#cielab-view',
    BARCHART = '#barchart-view',
    VOLUME = '#volume-view',
    GRAPH = '#graph-view',
    TOOLTIP = '#tooltip';
    HELP_TOOLTIP = '#help-tooltip';

var first_load = true; 
var parameters = {
    creation_year: { begin: 1614, end: 1714 }
}

var message = {
    'first_load': first_load, 
    'parameters': parameters
}

var options;

function submitSelected() {
    parameters["artist_nationality"]= document.getElementById('country').value
    parameters["artwork_type"]= document.getElementById('artwork_type').value
    parameters["school"]= document.getElementById('school').value
    parameters["general_type"]= document.getElementById('general_type').value

    message.parameters = parameters
    ws.send(JSON.stringify(message))
}

window.onload = () => {
    // Initialize the views
    cielab_view();
    volume_view();
    graph_view();
    // barchart_view();
    
    ws.onopen = () => {        
        ws.send(JSON.stringify(message))
        message.first_load = false;
        
        console.log("Socket open")
    };

}

// Define websocket
var ws = new WebSocket('ws://localhost:40510');

// Listen to messages from backend
ws.onmessage = (ev) => {
    message = JSON.parse(ev.data);
    options = message['options'];

    if (!message['unchanged']) {
        console.log('Updating graphs');
        update_cielab(message['graph_data']);
        update_graph(message['graph_data']);
        update_volume(message['graph_data']);
        update_barchart(message['graph_data']);

        update_options(message['options']);
    }
}

// Slider
var slider = createD3RangeSlider(-400, 2021, "#container", true);
slider.range(parameters["creation_year"]["begin"], parameters["creation_year"]["end"]);
slider.onTouchEnd(function (newRange) {
    d3.select("#range-label").html(newRange.begin + " &mdash; " + newRange.end);
    range = slider.range()
    parameters["creation_year"]["begin"] = range["begin"]
    parameters["creation_year"]["end"] = range["end"]
    console.log(parameters["creation_year"])

    message.parameters = parameters

    ws.send(JSON.stringify(message))
});

function update_options(options) {
    console.log(options);
    for (const category in options) {
        selector = $('#' + category);
        selector.children().not(':first').remove()

        options[category].forEach(new_option => {
            selector.append(new Option(new_option, new_option));
        });
    };
};