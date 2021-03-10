let url= 

//Read the data
d3.csv(url)
  .then(d => {
    setup(d)
    update(d)
  })

// declare some variables that will assigned in functions below
let art_global = []
let Centruy, Artwork_type, General_type, School


function setup(art){
	art_global = art

	let variables = Object.keys(art[0])

	d3.select('select.century')
	.on('change',() => update(art_global))
	.selectAll('option')
	.data(variables)
	.enter()
	.append('option')
	.attr('value', function (d) {return d;})
	.text(function (d) {return d;})

	d3.select('select.artwork_type')
	.on('change',() => update(art_global))
	.selectAll('option')
	.data(variables)
	.enter()
	.append('option')
	.attr('value', function (d) {return d;})
	.text(function (d) {return d;})


	d3.select('select.general_type')
	.on('change',() => update(art_global))
	.selectAll('option')
	.data(variables)
	.enter()
	.append('option')
	.attr('value', function (d) {return d;})
	.text(function (d) {return d;})

	d3.select('select.school')
	.on('change',() => update(art_global))
	.selectAll('option')
	.data(variables)
	.enter()
	.append('option')
	.attr('value', function (d) {return d;})
	.text(function (d) {return d;})

 // initialize values of select elements
	d3.select('select.century').property('value','century')
	d3.select('select.artwork_type').property('value', 'artwork_type')
	d3.select('select.general_type').property('value', 'general_type')
	d3.select('select.school').property('value','school')

// read current selections
	Let Centruy = d3.select('select.century').property('value')
	Let Artwork_type = d3.select('select.artwork_type').property('value')
	Let General_type = d3.select('select.general_type').property('value')
	Let School = d3.select('select.school').property('value')

// create other views based on selections
}


// update elements that get modified when selections change
function updata(art){
	Let Centruy = d3.select('select.century').property('value')
	Let Artwork_type = d3.select('select.artwork_type').property('value')
	Let General_type = d3.select('select.general_type').property('value')
	Let School = d3.select('select.school').property('value')

//update views


}


