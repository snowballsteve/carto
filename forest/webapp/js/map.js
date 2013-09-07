function loadMap(){
	sales = {}
	$.getJSON('sales.json',function(d){sales = d})
	
	map = Kartograph.map('#map',1000,700);
	map.loadCSS('stylesheets/map.css', function() {
		map.loadMap("map.svg", function(){
			map.addLayer('places',{key:'id'});
			map.addLayer('public_lands',{ 
				key: 'id',
				tooltips: function(d){return d.name}
			 });
			map.addLayer('rivers',{key:'id'});
			map.addLayer('cutting_sections',{ 
				key: 'id',
				mouseenter: function(data, path, event){
					makeDisplay(sales,data.id)
				}
				
			});
			map.addSymbols({
			    type: $K.Label,
			    data: map.getLayer('places').getPathsData(),
			    location: function(d) { return 'places.' + d.id; },
			    text: function(d) { return d.name; },
				style: 'fill: #fff; font-style: italic;font-family:fancy;font-size:14px;-webkit-svg-shadow: 0 0 5px #564334;stroke:#564334;stroke-width:0.1;stroke-opacity:0.2'
			});
			
		})
	});
	
 	
}

function makeDisplay(sales, number){
	html = ""
	if(number in sales){
		html += "<h5>Sale: "+number+"</h5>"
		html += "<hr />"
		html += "<p>"+sales[number].SaleType+"-"+sales[number].Date+"</p>"
		html += "<ul>"
		html += "<li>Acres: "+sales[number].Acres+"</li>"
		html += "<li>Sections: "+sales[number].CuttingSections+"</li>"
		html += "<li>Trees: "+sales[number].TotalTrees+"</li>"
		html += "<li>Board Feet: "+sales[number].BoardFeet+"</li>"
		html += "<li>Pulpwood Tons: "+sales[number].PulpwoodTons+"</li>"
		html += "</ul>"
	}else{
		html+="<h5>No Data for "+number+"</h5><hr />"
	}
	$("#info").html(html)
}
