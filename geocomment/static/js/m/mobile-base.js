// API key for http://openlayers.org. Please get your own at
// http://bingmapsportal.com/ and use that instead.
var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";

// initialize map when page ready
var map;
var gg = new OpenLayers.Projection("EPSG:4326");
var sm = new OpenLayers.Projection("EPSG:900913");

var init = function (onSelectFeatureFunction) {

    var vector = new OpenLayers.Layer.Vector("Vector Layer", {});

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
        projection: sm,
        units: "m",
        numZoomLevels: 18,
        maxResolution: 156543.0339,
        maxExtent: new OpenLayers.Bounds(
            -20037508.34, -20037508.34, 20037508.34, 20037508.34
        ),
        // restrictedExtent: new OpenLayers.Bounds(-74, 41, -69, 43).transform(gg, sm),
        units: "m",
		// projection: sm,
		// displayProjection: gg,
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
					numZoomLevels: 16,
					attribution: "<a href='http://toposm.com/'>TopOSM</a>"
				}
			),
			new OpenLayers.Layer.Google("Google Satellite", {
				type: google.maps.MapTypeId.SATELLITE, 
				numZoomLevels: 22
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
        center: new OpenLayers.LonLat(-71.08, 42.35).transform(gg, sm),
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


};
