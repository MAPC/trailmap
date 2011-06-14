$(document).ready(function() {
	
	$.trailmap = {
		lon : -71.08,
		lat : 42.35,
		zoom : 12,
		layer : {},
		feedback : {},
		proj : {
			wgs84 : new OpenLayers.Projection("EPSG:4326"),
			osm : new OpenLayers.Projection("EPSG:900913") // really?
		}
	};
	
	var layer_switcher, layer_osm, layer_googsat, layer_paledawn, layer_bikeped, layer_walking, layer_regional, layer_feedback;
	
	// Map
	var layer_switcher = new OpenLayers.Control.LayerSwitcher();
	$.trailmap.map = new OpenLayers.Map("map_canvas", {
		controls: [
			new OpenLayers.Control.Navigation(),
			new OpenLayers.Control.PanZoom(),
			layer_switcher,
			new OpenLayers.Control.ScaleLine(),
			new OpenLayers.Control.Attribution()
		],
		restrictedExtent: new OpenLayers.Bounds(-74, 41, -69, 43).transform($.trailmap.proj.wgs84, $.trailmap.proj.osm),
		maxExtent: new OpenLayers.Bounds(-20037508.34,-20037508.34,20037508.34,20037508.34),
		maxResolution: 156543.0399,
		units: "m",
		projection: $.trailmap.proj.osm,
		displayProjection: $.trailmap.proj.wgs84
	});
	
	// Usability issue: people didn't find the layer switcher.
	layer_switcher.maximizeControl();
	
	// Base Layer
	layer_paledawn = new OpenLayers.Layer.CloudMade("Pale Dawn", {
		key: '7a0df0d49fb14d27b35022fcb6b49d6d',
		styleId: 998
	});
	layer_osm = new OpenLayers.Layer.OSM("OpenStreetMap");
	layer_toposm = new OpenLayers.Layer.OSM("TopOSM", 
		"http://toposm.com/ma/final/${z}/${x}/${y}.png",
		{
			numZoomLevels: 17,
			attribution: "<a href='http://toposm.com/'>TopOSM</a>"
		}
	);		
	layer_googsat = new OpenLayers.Layer.Google("Google Satellite", {
		type: google.maps.MapTypeId.SATELLITE, 
		numZoomLevels: 22
	});
	
	// Overlays
	layer_regional = new OpenLayers.Layer.WMS("Regional Networks",
		"http://geonode.mapc.org/geoserver-geonode-dev/wms",
		{ 
			layers: "MAPC:bikeped_facilities",
			format: "image/png",
			styles: "Regional Networks", 
			transparent: true
			
		},
		{
			isBaseLayer: false,
			visibility: false,
			attribution: "<a href='http://mapc.org/'>MAPC</a>"
		}
	);
	layer_walking = new OpenLayers.Layer.WMS("Paths and Trails",
		"http://geonode.mapc.org/geoserver-geonode-dev/wms",
		{ 
			layers: "MAPC:bikeped_facilities",
			format: "image/png",
			styles: "Walking Facilities", 
			transparent: true
			
		},
		{
			isBaseLayer: false,
			attribution: "<a href='http://mapc.org/'>MAPC</a>"
		}
	);
	layer_bike = new OpenLayers.Layer.WMS("Bicycle Facilities (on-road)",
		"http://geonode.mapc.org/geoserver-geonode-dev/wms",
		{ 
			layers: "MAPC:bikeped_facilities",
			format: "image/png",
			styles: "Bicycle Facilities", 
			transparent: true
			
		},
		{
			isBaseLayer: false,
			attribution: "<a href='http://mapc.org/'>MAPC</a>"
		}
	);
	$.trailmap.layer.markers = new OpenLayers.Layer.Markers( "Feedback",
        {
        	visibility: false
        }
    );
	
	// Map Functionality
	$.trailmap.map.events.on({
		"moveend": function(e) {
			var mapcenter = $.trailmap.map.getCenter().transform($.trailmap.proj.osm, $.trailmap.proj.wgs84);
			$("#id_location").val("POINT(" + mapcenter.lon + " " + mapcenter.lat + ")")
		}
	});
	
	// add markers            
	$.trailmap.addMarker = function (ll, popupContent) {

	    var feature = new OpenLayers.Feature($.trailmap.layer.markers, ll); 
	    feature.closeBox = true;
	    feature.popupClass = OpenLayers.Class(OpenLayers.Popup.FramedCloud, {
			"autoSize": true
		});
	    feature.data.popupContentHTML = popupContent;
	    feature.data.overflow = "auto";

	    var marker = feature.createMarker();

	    var markerClick = function (evt) {
	        if (this.popup == null) {
	            this.popup = this.createPopup(this.closeBox);
	            $.trailmap.map.addPopup(this.popup);
	            this.popup.show();
	        } else {
	            this.popup.toggle();
	        }
	        currentPopup = this.popup;
	        OpenLayers.Event.stop(evt);
	    };
	    
	    marker.events.register("mousedown", feature, markerClick);
	    $.trailmap.layer.markers.addMarker(marker);
	}
	
	// Compose map
	
	$.trailmap.map.addLayers([layer_paledawn, layer_osm, layer_toposm, layer_googsat, layer_regional, layer_walking, layer_bike, $.trailmap.layer.markers]);
	$.trailmap.map.setCenter( new OpenLayers.LonLat($.trailmap.lon, $.trailmap.lat).transform($.trailmap.proj.wgs84, $.trailmap.proj.osm), $.trailmap.zoom );	
	$.trailmap.map.addControl(new OpenLayers.Control.Permalink());
	
	// UI
	
	$("div.baseLbl").html("Base Layers");
	$("div.dataLbl").html("Cycling &amp; Walking");
	
	$("#largermapbutton").toggle(function() {
		var map_height = $(window).height() - $("#header").height() - $("#map_legend").height() - 24;
		$("#map_canvas").height(map_height);
		$("#largermapbutton")
			.text("Smaller Map")
		 	.attr("title", "View smaller map!");
	}, function() {
  		$("#map_canvas").height(500);
  		$("#largermapbutton")
  			.text("Larger Map")
  			.attr("title", "View larger map!");
	});
	
	// Feedback
	
	$.trailmap.feedbackMarker = function (x, y) {
		
		// Add draggable marker/feature            		
		$.trailmap.layer.layer_feedback = new OpenLayers.Layer.Vector("Your Feedback");
		$.trailmap.layer.layer_feedback.styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({				        
		        graphicYOffset: -25,
		        graphicXOffset: -13,
		        externalGraphic: $.trailmap.feedback.icon,
		        pointRadius: 13
		    })
	    );           		
		
		var x = x || $.trailmap.map.getCenter().lon;
		var y = y || $.trailmap.map.getCenter().lat;
		
		var feedback_pt = new OpenLayers.Geometry.Point(x, y)
		var feedback_feature = new OpenLayers.Feature.Vector(feedback_pt);
		
		$.trailmap.layer.layer_feedback.addFeatures([feedback_feature]);
		$.trailmap.map.addLayer($.trailmap.layer.layer_feedback);
		
		$.trailmap.map.addControl(new OpenLayers.Control.MousePosition());
		var feedback_drag = new OpenLayers.Control.DragFeature($.trailmap.layer.layer_feedback);
		feedback_drag.onComplete = function(f) {            			
			var feedback_lonlat = new OpenLayers.LonLat(feedback_feature.geometry.x, feedback_feature.geometry.y);
			feedback_lonlat.transform($.trailmap.proj.osm, $.trailmap.proj.wgs84);            			
			$("#id_location").val("POINT(" + feedback_lonlat.lon + " " + feedback_lonlat.lat + ")")					
		}
		$.trailmap.map.addControl(feedback_drag);
		feedback_drag.activate();   
	}
	
	$("#feedbackbutton").click(function() {
		$("#feedbackform").toggle("slow", function() {
			$("#feedbackbutton").hide();
			$.trailmap.feedbackMarker();
		});				
	});
	$("#cancel").click(function() {
		$("#feedbackform").toggle("slow", function() {	
			$("#feedbackbutton").show();		
			$.trailmap.map.removeLayer($.trailmap.layer.layer_feedback);
		});				
	});
	
	// validation
	$("#id_description").addClass("required");
	$("#id_user_email").addClass("email");
	$("#feedbackform, #feedbackform_admin").validate();

});


