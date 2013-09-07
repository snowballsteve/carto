var map;
var active_layers = []
var active_drive_layer="t2"
var panZoom
$.fn.qtip.defaults.style.classes = 'qtip-dark qtip-rounded qtip-shadow'

//the following json objects are used to configure the buttons, and layers used in the web app.
var base_layers = {
		"counties":{
		"layertext": "County",
		"labels":false,
		"tooltips":false
	},
	"states":{
		"layertext": "States",
		"labels":false,
		"tooltips":false
	},
	"urban_area":{
		"layertext": "Urban Area",
		"labels":false,
		"tooltips":true
	}
}

var drive_layers = {
	"t2":{
		"layertext":"2 Hours"
	},
	"t4":{
		"layertext":"4 Hours"
	},
	"t6":{
		"layertext":"6 Hours"
	}
}

var optional_layers = {
	"roads":{	
		"layertext": "Highways",
		"description": "Major road corridors. Interstates and 4-lane divided highways in the region.",
		"source_url":"http://www.rita.dot.gov/bts/sites/rita.dot.gov.bts/files/publications/national_transportation_atlas_database/index.html",
		"source_text":"The National Transportation Atlas Database",
		"tooltips":true
	},
	"hazmat":{	
		"layertext": "HazMat Routes",
		"description": "Nationally Recognized Hazardous Material Routes.",
		"source_url":"http://www.rita.dot.gov/bts/sites/rita.dot.gov.bts/files/publications/national_transportation_atlas_database/index.html",
		"source_text":"The National Transportation Atlas Database",
		"tooltips":true
	},
	"rail":{
		"layertext":"Rail",
		"description":"Major rail arteries.",
		"source_url":"http://www.rita.dot.gov/bts/sites/rita.dot.gov.bts/files/publications/national_transportation_atlas_database/index.html",
		"source_text":"The National Transportation Atlas Database",
		"tooltips":true
	},
	"waterways":{
		"layertext":"Waterways",
		"description":"U.S. Army Corps of Engineers recognized navigable waterways and shipping lanes.",
		"source_url":"http://www.rita.dot.gov/bts/sites/rita.dot.gov.bts/files/publications/national_transportation_atlas_database/index.html",
		"source_text":"The National Transportation Atlas Database",
		"tooltips":true
	},
	"ports":{
		"layertext":"Wharfs",
		"description":"U.S. Army Corps of Engineers recorded docks and wharfs used for water navigation activities.",
		"source_url":"http://www.rita.dot.gov/bts/sites/rita.dot.gov.bts/files/publications/national_transportation_atlas_database/index.html",
		"source_text":"The National Transportation Atlas Database",
		"tooltips":true
	},
	"airports_major":{
		"layertext":"Major Airports",
		"description":"Public-use airports with an operating control tower and U.S. Customs agent.",
		"source_url":"http://www.rita.dot.gov/bts/sites/rita.dot.gov.bts/files/publications/national_transportation_atlas_database/index.html",
		"source_text":"The National Transportation Atlas Database",
		"tooltips":true
	},
	"airports_all":{
		"layertext":"All Airports",
		"description":"Public-use airports of any size.",
		"source_url":"http://www.rita.dot.gov/bts/sites/rita.dot.gov.bts/files/publications/national_transportation_atlas_database/index.html",
		"source_text":"The National Transportation Atlas Database",
		"tooltips":true
	},
	"education":{
		"layertext":"Education",
		"description":"Accredited institutions as of 6/2013 according to the U.S. Department of Education.",
		"source_url":"http://ope.ed.gov/accreditation",
		"source_text":"U.S. Department of Education",
		"tooltips":true
	}
}

var labels = [
	{name:"Cleveland", lon: -81,lat:41.45},
	{name:"Columbus", lon: -82.38,lat:39.89},
	{name:"Cincinnati", lon: -85.3,lat:39.1},
	{name:"Dayton", lon: -83.57,lat:39.77},
	{name:"Louisville", lon: -86.4,lat:38.20},
	{name:"Lexington", lon: -84,lat:38},
	{name:"Chicago",lon:-87,lat:41.8},
	{name:"Detroit",lon:-82.8,lat:42}
	
	]

//the description shown in the box at launch
default_description = "Green buttons toggle between layers. White buttons toggle the driving time. Mouse over a feature to get the name."

//location of our point of interest
ports_location = [{ name: 'PORTS', lon:  -83.0030822, lat: 39.0149157 }]

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

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
		
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};


function loadMap(){
	
	//make our selection buttons based on the config jsons
    makeButtons();
    
	//set default description
	$('#descriptions').html(default_description);
	
	//create the map object
	map = Kartograph.map('#map',$("#map").width(),$("#map").height());
	
	//load the map from svg
    map.loadMap('map.svg', function() {
		//style the map with css
        map.loadCSS('stylesheets/map.css', function() {
			//for each key in the base_layers, add it to the map by default
			for (var key in base_layers) {
			    if (base_layers.hasOwnProperty(key)) {
				   //key is needed for labeling to work, or find pathby id in general, always use
			       map.addLayer(key,{"key":"id"})
				   //fade it in, looks nice
				   map.fadeIn({layer:key,duration:2000})
				   
				   //if we want tooltips, add them now
				  if(base_layers[key].tooltips){
					map.getLayer(key).tooltips(function(d){return [base_layers[key].layertext, d.name]})
				}
			    }
			}
            
			//add a symbol and label for our point of interest
    		map.addSymbols({
		        type: $K.Bubble,
		        data: ports_location,
		        location: function(d) { return [d.lon,d.lat]; },
		        radius: function(d) { return 8; },
		        style: 'fill: #112; stroke-width: 2px; stroke: #FFFEDF;fill-opacity:0.6;-webkit-svg-shadow: 0 0 7px #FFFEDF;',
		        title: function(d) { return d.name; }
		    });
		    map.addSymbols({
				type: $K.Label,
		        data: ports_location,
				location: function(d) { return [d.lon-0.45, d.lat+0.05] },
				text: function(d) { return d.name; },
				style: 'fill: #FFFEDF; stroke-width: 0.1px; stroke: #112;-webkit-svg-shadow: 0 0 5px #112;'
		    });
            
			//add labels
			map.addSymbols({
				type:$K.Label,
				data: labels,
				location:function(d){return [d.lon,d.lat]},
				text: function(d){return d.name;},
				style: 'fill: #0A8967; font-style: italic;font-family:fancy;font-size:16px;-webkit-svg-shadow: 0 0 10px #112;stroke:#112;stroke-width:0.1;stroke-opacity:0.2'
			})
			 
			
			//add a drive time layer from the get-go
            map.addLayer(active_drive_layer,{key:"id"})
		    map.fadeIn({active_drive_layer:key,duration:5000})
			
			//change drive layer button highlighting
			$('#'+active_drive_layer).css('box-shadow','0 0 15px #94f7d1')
			$('#'+active_drive_layer).css('border','1px solid #94f7d1')
		});
	});
	startPan();
	
}

function switchLayer(layer){
    
    //if there is already a layer active, remove it, change description to default, and clear symbols in case it is labelled
    /*if(active_layer != ""){
		
        map.layers[active_layer].remove();
        $('#descriptions').html(default_description);
		clearSymbols()

    }*/
	
	//if the button hit is the one for the current layer
    if(active_layers.indexOf(layer)>=0){
        active_layers.remove(layer);
        map.layers[layer].remove();
    }else{
		//set new layer to active
        active_layers.push(layer);
		
		//add layer to map and fade in
		map.addLayer(layer,{key:"id"})
		map.fadeIn({layer:layer,duration:500})
		
		//change description
		$('#descriptions').html(optional_layers[layer].description) 
		    
		//add tooltips if desired	
		if(optional_layers[layer].tooltips){
			map.getLayer(layer).tooltips( function(d){return [optional_layers[layer].layertext, d.name] })
    	}
	}
	
	//change button highligting so that active is highlighted
	$('.layerbutton').css('box-shadow','none')
	$('.layerbutton').css('border','none')
	for(var i=0;i<active_layers.length;i++){
		$('#'+active_layers[i]).css('box-shadow','0 0 15px #fff')
		$('#'+active_layers[i]).css('border','1px solid #fff')
	}
	if(active_layers.length==1){
		$('#source').html("Data Source: <a href='"+optional_layers[layer].source_url+"' >"+optional_layers[layer].source_text+"</a>")
	}else{
		var html = "Data Sources:"
		var used_sources = []
		for(var i=0;i<active_layers.length;i++){
			text = optional_layers[active_layers[i]].source_text
			url = optional_layers[active_layers[i]].source_url
			if(used_sources.indexOf(text)==-1){
				html= html+ "<a href='"+url+"' >"+text+"</a>, "
				used_sources.push(text)
			}
		}
		$('#source').html(html)
	}
}



function switchDriveLayer(drivelayer){
	
	//if clicked button matches active, turn it off and clear highlight
	if(active_drive_layer == drivelayer){
		map.layers[active_drive_layer].remove()
		active_drive_layer = ""
		$('.drivebutton').css('box-shadow','none')
		$('.drivebutton').css('border','none')
	}else{
		//else turn off current and add new drive time layer
		if(active_drive_layer != ""){
			map.layers[active_drive_layer].remove()
		}
		map.addLayer(drivelayer,{key:"id"})
		map.fadeIn({layer:drivelayer,duration:1000})
		active_drive_layer = drivelayer
		$('.drivebutton').css('box-shadow','none')
		$('.drivebutton').css('border','none')
		$('#'+active_drive_layer).css('box-shadow','0 0 15px #94f7d1')
		$('#'+active_drive_layer).css('border','1px solid #94f7d1')
	}	
}

function clearSymbols(){
	//remove all symols by the first 2
	if(map.symbolGroups.length>3){
		map.removeSymbols(3)
		clearSymbols()
	}
	
}
    
function makeButtons(){
	
	//make buttons for optional layers
    buttons = ""
	for (var key in optional_layers) {
	    if (optional_layers.hasOwnProperty(key)) {
	        buttons = buttons + "<button id='"+key+"' class='layerbutton' onclick='switchLayer(\"" + key + "\")'>" + optional_layers[key].layertext+ "</button>"
	    }
	}
    $('#buttons').html(buttons)
	
	//make buttons for drive time layers
	drive_buttons = ""
	for (var key in drive_layers) {
	    if (drive_layers.hasOwnProperty(key)) {
	        drive_buttons = drive_buttons + "<button id='"+key+"' class='drivebutton' onclick='switchDriveLayer(\"" + key + "\")'>" + drive_layers[key].layertext+ "</button>"
	    }
	}
    $('#drive_buttons').html(drive_buttons)
}

function startPan(){
	if(map.paper==null){
		setTimeout(startPan, 50);
		return;
	}else{
		panZoom = map.paper.panzoom({ initialZoom: 2, initialPosition: { x: 50, y: 0} });
		panZoom.enable();
	}
	
}

