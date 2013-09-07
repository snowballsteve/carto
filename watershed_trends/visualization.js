var currentYear = 2000

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (obj, fromIndex) {
    if (fromIndex == null) {
        fromIndex = 0;
    } else if (fromIndex < 0) {
        fromIndex = Math.max(0, this.length + fromIndex);
    }
    for (var i = fromIndex, j = this.length; i < j; i++) {
        if (this[i] === obj)
            return i;
    }
    return -1;
  };
}

function epsg3857Toepsg4326 (coord){
	/* 
	takes a two dimensional array of [x,y] in epsg 3856 web mercator and 
		returns a two dimensional array of [lon,lat] in WGS 84
	*/
	x = parseFloat(coord[0])
	y = parseFloat(coord[1])
    if (Math.abs(x) < 180 && Math.abs(y) < 90)
        return;

    if ((Math.abs(x) > 20037508.3427892) || (Math.abs(y) > 20037508.3427892))
        return;

    num3 = x / 6378137.0;
    num4 = num3 * 57.295779513082323;
    num5 = Math.floor(((num4 + 180.0) / 360.0));
    num6 = num4 - (num5 * 360.0);
    num7 = 1.5707963267948966 - (2.0 * Math.atan(Math.exp((-1.0 * y) / 6378137.0)));
    mercatorX_lon = num6;
    mercatorY_lat = num7 * 57.295779513082323;
    
    return [mercatorX_lon,mercatorY_lat]

}


function getExtent(json){
	/*
		Returns the xy extent as d3.geo.js extent format [[xmin,ymin],[xmax,ymax]] from a geojson object
	*/
	xmin = 0
	xmax = 0
	ymin = 0
	ymax = 0
	for(var i=0;i<json.features.length;i++){
		for(var j=0;j<json.features[i].geometry.coordinates.length;j++){
			for(var k=0;k<json.features[i].geometry.coordinates[j].length;k++){
				if(xmax == 0){xmax=x}
				x = json.features[i].geometry.coordinates[j][k][0]
				y = json.features[i].geometry.coordinates[j][k][1]
				if(xmax == 0){xmax=x}
				if(ymax == 0){ymax=y}
				if(xmin == 0){xmin=x}
				if(ymin == 0){ymin=y}
				xmax = Math.max(xmax,x)
				xmin = Math.min(xmin,x)
				ymax = Math.max(ymax,y)
				ymin = Math.min(ymin,y)
				
			}
		}
	}
	
	return [[xmin,ymin],[xmax,ymax]]
}


function convertCoordinates(json){
	/*
		parses over all the features and geometry in a geojson and returns a geojson with coordinates in a different projection
		uses epsg3857Toepsg4326
	*/
	if(json.features[0].geometry)
	
	for(var i=0;i<json.features.length;i++){
		for(var j=0;j<json.features[i].geometry.coordinates.length;j++){
			if(json.features[i].geometry.type=="LineString"){
				json.features[i].geometry.coordinates[j]= epsg3857Toepsg4326(json.features[i].geometry.coordinates[j])
			
			}else{
				for(var k=0;k<json.features[i].geometry.coordinates[j].length;k++){
					json.features[i].geometry.coordinates[j][k] = epsg3857Toepsg4326(json.features[i].geometry.coordinates[j][k])
				}
			}
		}
	}
	return json
}

function bufferExtent(extent,percent){
	/*
		buffers a d3.js extent array by a specified percentage of its width and height
	*/
	xAmount = Math.abs(extent[1][0] - extent[0][0]) * percent
	yAmount = Math.abs(extent[1][1] - extent[0][1]) * percent
	return [[extent[0][0]-xAmount,extent[0][1]-yAmount],[extent[1][0]+xAmount,extent[1][1]+yAmount]]
	
}

function extentCenter(extent){
	return [Math.abs(extent[1][0] - extent[0][0])/2 + extent[0][0],Math.abs(extent[1][1] - extent[0][1])/2 + extent[0][1] ]

}
	

function visStart(){
	/*
		this function handles the workflow for the visualization
	
	*/
	
	//in pixels
	var width = 400
	var height = 600
	
	//create svg object using d3
	var svg = d3.select("#vis_window").append("svg")
		.attr("width", width)
		.attr("height", height)
	
	var projection;
	var path;
	
	var years = []
	
	//load the geojson into memory for the watershed shape, convert the coordinates, project it
	d3.json("data/raccoon_creek_watersheds.geojson", function(geojson) {
		
		//convert and get extent
		geojson = convertCoordinates(geojson)
		extent = getExtent(geojson)

		//calculate center of extent
		center = extentCenter(extent)
		
		//projection
		projection = d3.geo.albers()
			.parallels([extent[0][1], extent[1][1]])
			.center([0,center[1]])
			.scale(100*(extent[1][1]-extent[0][1])*(width+height)/2) //find way to automatically adjust this 0.7976008966785884 400 0.79*180
			.rotate([-center[0],0])
			.translate([width / 2, height / 2]);

		
		//add a paths
		path = d3.geo.path().projection(projection);
	
		//add each shape of the waterhsed to the screen
		svg.selectAll("svg")
			.data(geojson.features)
			.enter()
			.append("g")
			.append("path")
			.attr("d", path)
			.style("fill","#555")
	});
	
	//add streams
	d3.json("data/streams-time.geojson", function(json){
		json = convertCoordinates(json)
		
		var min=-99;
		var max=-99;
		
		for(var i=0;i<json.features.length;i++){
			//update years
			date_year = json.features[i].properties.date_year
			if(years.indexOf(date_year)==-1){
				years.push(date_year)
			}
			//update min max
			value = parseFloat(json.features[i].properties.avg_ph)
			value = value || -99
			if(min==-99){min = value}
			if(max==-99){max = value}
			if(value!=-99){
				min = Math.min(value,min)
				max = Math.max(value,max)
			}
		}
		
		
		
		
		var color = d3.scale.linear()
		    .domain([0,min, max])
		    .range(["#ccc","red", "blue"]);

		svg.selectAll("g")
			.append("s")
			.data(json.features)
			.enter()
			.append("path")
			.attr("d", path)
			.style("stroke",function(d){
				value = d.properties.avg_ph
				if(value==NaN){value=0}
				return color(value)})
			.style("stroke-width","1.5px")
			.style("fill","None")
		    .on('mouseover', function(){
				barChart(d3.select(this).data())
				d3.select(this)
					.transition().duration(500)
					.style("stroke-width","5px")
			})
		    .on('mouseout', function(){ 
				d3.select(this)
					.transition().duration(100)
					.style("stroke-width","1.5px")
			})
			
	}); 
	
	svg.selectAll("g").selectAll("s").selectAll("path")
		.remove()
	
	
	years = years.sort()
	console.log(years)
	//this section is an example of adding nav elements
	nav = d3.select('#nav')	
	
	ul = nav.append('ul').attr("id","years")
	
	ul.selectAll('li')
		.data(years)
		.enter().append('li').attr('class','rotate').text(function(d){ return d; })
		.on('mouseover',function(){ 
			d3.select(this).style('text-decoration','underline')})
		.on('mouseout',function(){ 
			d3.select(this).style('text-decoration','none')})
		.on('click',function(){
			currentYear = d3.select(this).data()[0]
			d3.selectAll("s")
				.filter(function(d){return d.properties.date_year != currentYear})
				.remove()
		})
}

function barChart(data){
	x = []
	y = []
	for(var i=0;i<data.length;i++){
		y.push(data[i].properties.avg_ph)
		x.push(data[i].properties.date_year)
	}
	
	console.log(data)
	
	
}


//when document ready, let's go
$(document).ready(visStart)
		
		
