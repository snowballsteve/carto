# Transportation Asset Map Readme

### How the map is done.

The map was created by first downloading the data from the National Atlas website, then preparing it using QGIS, a desktop gis software. Once a layer was prepare, simplified, queried etc for what was desired it was saved and then reprojected using ogr2ogr, from the GDAL tools library. The needed projection was EPSG:4326.

Kartograph.py, a platform for turning GIS data into SVG graphics was used to create the svg file used by the website. Each layer is given a configuration in a json file, including its path, name, and any attributes to include in the svg. 

Kartograph.js, a javascript library for turning svg maps from the above into interactive webmaps, is used to create the website itself. The library handles the drawing, adding, and removing layers. 
