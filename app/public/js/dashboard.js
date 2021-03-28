var CIELAB = '#cielab-view',
    BARCHART = '#barchart-view',
    VOLUME = '#volume-view',
    GRAPH = '#graph-view',
    TOOLTIP = '#tooltip';
    HELP_TOOLTIP = '#help-tooltip';

var first_load = true; 
var parameters = {
    creation_year: { begin: 1800, end: 1850 }
}

var message = {
    'first_load': first_load, 
    'parameters': parameters
}

var options;

function submitSelected() {
    console.log('Submitting selection')
    parameters["artist_nationality"]= document.getElementById('artist_nationality').value
    parameters["artwork_type"]= document.getElementById('artwork_type').value
    parameters["school"]= document.getElementById('school').value

    message.parameters = parameters
    ws.send(JSON.stringify(message))
}

function submitPreSelection(option) {
    console.log(option)
    switch (option) {
        case 1:
            console.log('In case 1')
            parameters["artist_nationality"] = ''
            parameters["artwork_type"] = ''
            parameters["school"] = ''
            parameters["general_type"] = ''
            parameters["creation_year"] = { begin: 1550, end: 1650 }
            break;
        case 2:
            parameters["artist_nationality"] = ''
            parameters["artwork_type"] = ''
            parameters["school"] = ''
            parameters["general_type"]= ''
            parameters["creation_year"] = { begin: 1650, end: 1750 }
            break;
        case 3:
            parameters["artist_nationality"] = ''
            parameters["artwork_type"] = ''
            parameters["school"] = ''
            parameters["general_type"]= ''
            parameters["creation_year"] = { begin: 1750, end: 1850 }
            break;
    }

    console.log(parameters)
    message.parameters = parameters
    ws.send(JSON.stringify(message))
}

function resetOptions() {
    parameters["artist_nationality"] = ''
    parameters["artwork_type"] = ''
    parameters["school"] = ''
    parameters["general_type"]= ''
    parameters["creation_year"] = { begin: 1800, end: 1850 }

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
        
        if (category == "general_type") {
            selector.append('<br>')
            options[category].forEach(new_option => {
                selector.append(`<input type="radio" id="${new_option}" name="general_type" value="${new_option}">`);
                selector.append(`<label for="${new_option}">${new_option}</label><br>`);
            });

            // Update general type value based on radio selection
            var general_type_radio = document.radioSelect.general_type;
            var prev = null;
            for (var i = 0; i < general_type_radio.length; i++) {
                general_type_radio[i].addEventListener('change', function() {
                    (prev) ? console.log(prev.value) : null;
                    
                    if (this !== prev) {
                        prev = this;
                    }

                    parameters["general_type"] = this.value

                    submitSelected();
                });
            }
        } else {
            options[category].forEach(new_option => {
            selector.append(new Option(new_option, new_option));
        });
        }
    };
};