$(document).ready(function() {
	
	var map;
	var proj_wgs84 = new OpenLayers.Projection("EPSG:4326");
	var proj_osm = new OpenLayers.Projection("EPSG:900913");
	
	var vector = new OpenLayers.Layer.Vector("My Location", {});

    var geolocate = new OpenLayers.Control.Geolocate({
        id: 'locate-control',
        geolocationOptions: {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 7000
        }
    });
    // create map   
    map = new OpenLayers.Map({
        div: "map",
        theme: null,
        numZoomLevels: 18,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(
            -20037508.34, -20037508.34, 20037508.34, 20037508.34
        ),
        restrictedExtent: new OpenLayers.Bounds(-74, 41, -69, 43).transform(proj_wgs84, proj_osm),
        units: "m",
		rojection: proj_osm,
		displayProjection: proj_wgs84,
        controls: [
            new OpenLayers.Control.Attribution(),
            new OpenLayers.Control.TouchNavigation({
                dragPanOptions: {
                    interval: 100,
                    enableKinetic: true
                }
            }),
            geolocate
        ],
        layers: [
        
        	new OpenLayers.Layer.CloudMade("Pale Dawn", {
				key: '7a0df0d49fb14d27b35022fcb6b49d6d',
				styleId: 998
			}),
            new OpenLayers.Layer.OSM("OpenStreetMap", 
            	null, 
            	{
                	transitionEffect: 'resize'
                }
            ),
            new OpenLayers.Layer.OSM("TopOSM", 
				"http://toposm.com/ma/final/${z}/${x}/${y}.png",
				{
					transitionEffect: 'resize',
					numZoomLevels: 17,
					attribution: "<a href='http://toposm.com/'>TopOSM</a>"
				}
			),
			new OpenLayers.Layer.WMS("Regional Networks",
				"http://geonode.mapc.org/geoserver-geonode-dev/wms",
				{ 
					layers: "MAPC:bikeped_facilities",
					format: "image/png",
					styles: "Regional Networks", 
					transparent: true
					
				},
				{
					isBaseLayer: false,
					transitionEffect: 'resize',
					visibility: false,
					attribution: "<a href='http://mapc.org/'>MAPC</a>"
				}
			),
			new OpenLayers.Layer.WMS("Paths and Trails",
				"http://geonode.mapc.org/geoserver-geonode-dev/wms",
				{ 
					layers: "MAPC:bikeped_facilities",
					format: "image/png",
					styles: "Walking Facilities", 
					transparent: true
					
				},
				{
					isBaseLayer: false,
					transitionEffect: 'resize',
					attribution: "<a href='http://mapc.org/'>MAPC</a>"
				}
			),			
			new OpenLayers.Layer.WMS("Bicycle Facilities (on-road)",
				"http://geonode.mapc.org/geoserver-geonode-dev/wms",
				{ 
					layers: "MAPC:bikeped_facilities",
					format: "image/png",
					styles: "Bicycle Facilities", 
					transparent: true
					
				},
				{
					isBaseLayer: false,
					transitionEffect: 'resize',
					attribution: "<a href='http://mapc.org/'>MAPC</a>"
				}
			),
            vector
        ],
        center: new OpenLayers.LonLat(-71.08, 42.35).transform(proj_wgs84, proj_osm),
        zoom: 12
    });

    var style = {
        fillOpacity: 0.1,
        fillColor: '#000',
        strokeColor: '#f00',
        strokeOpacity: 0.6
    };
    geolocate.events.register("locationupdated", this, function(e) {
        vector.removeAllFeatures();
        vector.addFeatures([
            new OpenLayers.Feature.Vector(
                e.point,
                {},
                {
                    graphicName: 'cross',
                    strokeColor: '#f00',
                    strokeWidth: 2,
                    fillOpacity: 0,
                    pointRadius: 10
                }
            ),
            new OpenLayers.Feature.Vector(
                OpenLayers.Geometry.Polygon.createRegularPolygon(
                    new OpenLayers.Geometry.Point(e.point.x, e.point.y),
                    e.position.coords.accuracy / 2,
                    50,
                    0
                ),
                {},
                style
            )
        ]);
        map.zoomToExtent(vector.getDataExtent());
    });


    // Start with the map page
    if (window.location.hash && window.location.hash!='#mappage') {
        $.mobile.changePage('mappage');
    }

    // fix height of content
    function fixContentHeight() {
        var footer = $("div[data-role='footer']:visible"),
        content = $("div[data-role='content']:visible:visible"),
        viewHeight = $(window).height(),
        contentHeight = viewHeight - footer.outerHeight();

        if ((content.outerHeight() + footer.outerHeight()) !== viewHeight) {
            contentHeight -= (content.outerHeight() - content.height());
            content.height(contentHeight);
        }
        if (window.map) {
            map.updateSize();
        }
    }
    $(window).bind("orientationchange resize pageshow", fixContentHeight);
    fixContentHeight(); 

    // Map zoom  
    $("#plus").click(function(){
        map.zoomIn();
    });
    $("#minus").click(function(){
        map.zoomOut();
    });
    $("#locate").click(function(){
        var control = map.getControlsBy("id", "locate-control")[0];
        if (control.active) {
            control.getCurrentLocation();
        } else {
            control.activate();
        }
    });

    $('#layerslist').listview();
    $('<li>', {
            "data-role": "list-divider",
            text: "Base Layers"
        })
        .appendTo('#layerslist');

    var baseLayers = map.getLayersBy("isBaseLayer", true);
    
	$.each(baseLayers, function() {
        addLayerToList(this);
    });

    $('<li>', {
            "data-role": "list-divider",
            text: "Overlay Layers"
        })
        .appendTo('#layerslist');
    var overlayLayers = map.getLayersBy("isBaseLayer", false);
    $.each(overlayLayers, function() {
        addLayerToList(this);
    });
    $('#layerslist').listview('refresh');
    
    map.events.register("addlayer", this, function(e) {
        addLayerToList(e.layer);
    });

});

function addLayerToList(layer) {
    var item = $('<li>', {
            "data-icon": "check",
            "class": layer.visibility ? "checked" : ""
        })
        .append($('<a />', {
            text: layer.name
        })
            .click(function() {
                $.mobile.changePage('mappage');
                if (layer.isBaseLayer) {
                    layer.map.setBaseLayer(layer);
                } else {
                    layer.setVisibility(!layer.getVisibility());
                }
            })
        )
        .appendTo('#layerslist');
    layer.events.on({
        'visibilitychanged': function() {
            $(item).toggleClass('checked');
        }
    });
}
