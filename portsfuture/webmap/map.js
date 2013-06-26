var map;
var active_layer = ""
var active_drive_layer="t60"


var base_layers = {
		"counties":{
		"layertext": "Counties",
		"labels":false,
		"tooltips":false
	},
	"states":{
		"layertext": "States",
		"labels":true,
		"tooltips":false
	},
	"urban_area":{
		"layertext": "Urban Areas",
		"labels":false,
		"tooltips":true
	}
}

var drive_layers = {
	"t60":{
		"layertext":"1 Hour"
	},
	"t120":{
		"layertext":"2 Hours"
	},
	"t180":{
		"layertext":"3 Hours"
	}
}

var optional_layers = {
	"roads":{	
		"layertext": "Major Roads",
		"type": "Line",
		"description": "Major Roads used for tranportation to and from the Ports location.",
		"labels":false,
		"tooltips":true
	},
	"rail":{
		"layertext":"Railroads",
		"type":"Line",
		"description":"Major Railroads, Ports has major rail lines running right in the front door.",
		"labels":false,
		"tooltips":true
	},
	"rivers":{
		"layertext":"Major Rivers",
		"type":"Line",
		"description":"Larger rivers, those with a Strahler Order greater than 3, in the Ports Greater Region.",
		"labels":false,
		"tooltips":true
	}//,
//	"ports":{
//		"layertext":"Ports",
//		"type":"Point",
//		"description":"Access To Shipping",
//		"labels":false,
//		"tooltips":true
//	}
}

default_description = "Click a button above to look at driving distances. The buttons on the right toggle layers."

        
ports_location = [{ name: 'Ports', lon:  -83.0030822, lat: 39.0149157 }]

function loadMap(){
    makeButtons();
    $('#descriptions').html(default_description);
	map = Kartograph.map('#map',800,800);
        map.loadMap('map.svg', function() {
            map.loadCSS('map.css', function() {
				for (var key in base_layers) {
				    if (base_layers.hasOwnProperty(key)) {
				       map.addLayer(key)
					   if(base_layers[key].labels){
			   			    map.addSymbols({
			   					type: $K.Label,
			   			        	data: map.getLayer(key).getPathsData(),
			   					location: function(d) { return key+"." + d.id; },
			   					text: function(d) { return d.name; },
			   					style: 'fill: #ccc; stroke-width: 1.2px; stroke: #eee; stroke-opacity: 0.6;'
								
			   			    });
					   }
					  if(base_layers[key].tooltips){
						map.getLayer(key).tooltips(function(d){return d.name})
					}
				    }
				}
                
				
	    		map.addSymbols({
			        type: $K.Bubble,
			        data: ports_location,
			        location: function(d) { return [d.lon,d.lat]; },
			        radius: function(d) { return 8; },
			        style: 'fill: #eee; stroke-width: 2px; stroke: #ccc;fill-opacity:0.6',
			        title: function(d) { return d.name; }
			    });
			    map.addSymbols({
					type: $K.Label,
			        data: ports_location,
					location: function(d) { return [d.lon-0.3, d.lat+0.05] },
					text: function(d) { return d.name; },
					style: 'fill: #eee; stroke-width: 2px; stroke: #ccc; stroke-opacity: 0.6;'
			    });
                
                map.addLayer(active_drive_layer)
                      
			});
		});
}

function switchLayer(layer){
    
    
    if(active_layer != ""){
        map.layers[active_layer].remove();
        $('#descriptions').html(default_description);
		clearSymbols()

    }
    if(active_layer==layer){
        map.layers[layer].remove();
        active_layer="";
    }else{
		clearSymbols()
        active_layer = layer;
		if(optional_layers[active_layer].type == "Point"){
				map.addLayer(active_layer)
	    		map.addSymbols({
				type: $K.Bubble,
				data: map.getLayer(active_layer).getPathsData(),
				location: function(d) { return active_layer+"."+d.id; },
				radius: function(d) { return 6; },
				style: 'fill: #eee; stroke-width: 2px; stroke: #ccc; stroke-opacity: 0.6;',
				title: function(d) { return d.name; }
			    });
			
		}else{
			
			map.addLayer(active_layer,{chunks:200})
			$('#descriptions').html(optional_layers[active_layer].description) 
			    
				
			if(optional_layers[active_layer].tooltips){
				map.getLayer(active_layer).tooltips( function(d){return d.name })
		}		
			
		   
	
		    
    	}
	}
	
}



function switchDriveLayer(drivelayer){
	if(active_drive_layer != drivelayer){
		map.layers[active_drive_layer].remove()
		map.addLayer(drivelayer)
		active_drive_layer = drivelayer
	}	
}

function clearSymbols(){
	if(map.symbolGroups.length>3){
		map.removeSymbols(3)
		clearSymbols()
	}
	
}
    
function makeButtons(){
    buttons = ""
	for (var key in optional_layers) {
	    if (optional_layers.hasOwnProperty(key)) {
	        buttons = buttons + "<button onclick='switchLayer(\"" + key + "\")'>" + optional_layers[key].layertext+ "</button>"
	    }
	}
    $('#buttons').html(buttons)
	
	drive_buttons = ""
	for (var key in drive_layers) {
	    if (drive_layers.hasOwnProperty(key)) {
	        drive_buttons = drive_buttons + "<button onclick='switchDriveLayer(\"" + key + "\")'>" + drive_layers[key].layertext+ "</button>"
	    }
	}
    $('#drive_buttons').html(drive_buttons)
}

//window.onload = loadMap()
