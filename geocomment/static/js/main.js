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
		},
		feedback: {},
		hubway: {}
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
	$.trailmap.layer.paledawn = new OpenLayers.Layer.CloudMade("Pale Dawn", {
		key: '7a0df0d49fb14d27b35022fcb6b49d6d',
		styleId: 998
	});
	$.trailmap.layer.osm = new OpenLayers.Layer.OSM("OpenStreetMap");
	$.trailmap.layer.toposm = new OpenLayers.Layer.OSM("TopOSM", 
		"http://toposm.com/ma/final/${z}/${x}/${y}.png",
		{
			numZoomLevels: 17,
			attribution: "<a href='http://toposm.com/'>TopOSM</a>"
		}
	);		
	$.trailmap.layer.googsat = new OpenLayers.Layer.Google("Google Satellite", {
		type: google.maps.MapTypeId.SATELLITE, 
		numZoomLevels: 22
	});
	
	// Overlays
	$.trailmap.layer.regional = new OpenLayers.Layer.WMS("Regional Networks",
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
	$.trailmap.layer.walking = new OpenLayers.Layer.WMS("Paths and Trails",
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
	$.trailmap.layer.bike = new OpenLayers.Layer.WMS("Bicycle Facilities (on-road)",
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
	$.trailmap.layer.hubway = new OpenLayers.Layer.Vector("Hubway Stations", {
		visibility: false,
		attribution: "<a href='http://www.thehubway.com'>Hubway</a>",
		styleMap: new OpenLayers.StyleMap({
			externalGraphic: "/static/img/hubway.png", //FIXME: should use $.trailmap.staticurl
			graphicOpacity: 1.0,
			graphicWith: 20,
			graphicHeight: 26,
			graphicYOffset: -26
        })
	});
	$.trailmap.layer.feedback = new OpenLayers.Layer.Vector("Feedback", {
		visibility: false,
		styleMap: new OpenLayers.StyleMap({
			externalGraphic: "/static/img/icon-conversation-blue.png", //FIXME: should use $.trailmap.staticurl
			graphicOpacity: 1.0,
			graphicWith: 32,
			graphicHeight: 37,
			graphicYOffset: -37
        })
	});
	
	// Map Functionality
	
	$.trailmap.map.events.on({
		"moveend": function(e) {
			var mapcenter = $.trailmap.map.getCenter().transform($.trailmap.proj.osm, $.trailmap.proj.wgs84);
			$("#id_location").val("POINT(" + mapcenter.lon + " " + mapcenter.lat + ")");
		}
	});
	
	// parse GeoJSON helper
	$.trailmap.parseGeoJSON = function (data) {
		// GeoJSON with custom projections
        var parser = new OpenLayers.Format.GeoJSON({
    		'externalProjection': $.trailmap.proj.wgs84,
    		'internalProjection': $.trailmap.proj.osm
  		});
        return parser.read(data);
    }
	
	// unselect selected feature
	$.trailmap.onFeatureUnselect = function (feature) {
		$.trailmap.map.removePopup(feature.popup);
		feature.popup.destroy();
		feature.popup = null;
	}
	
	// Custom Hubway popup and feature select
	$.trailmap.hubway.onFeatureSelect = function (feature) {
        $.trailmap.selectedFeature = feature;
        var feature_center = feature.geometry.getBounds().getCenterLonLat();
        var popup = new OpenLayers.Popup.FramedCloud("Hubway", 
			feature_center,
			null,
			"<div class='popup'><b>" + feature.attributes.name + "</b><br>Available Bikes: " + feature.attributes.bikes + "<br>Empty Docks: " + feature.attributes.emptydocks + "</div>",
			null, true, $.trailmap.hubway.onPopupClose);
        feature.popup = popup;
        $.trailmap.map.addPopup(popup);
        // $.trailmap.map.panTo(feature_center);
	}
	$.trailmap.hubway.onPopupClose = function (evt) {
		$.trailmap.hubway.selectControl.unselect($.trailmap.selectedFeature);
	}
	
	// Custom Feedback popup and feature select
	$.trailmap.feedback.onFeatureSelect = function (feature) {
        $.trailmap.selectedFeature = feature;
        var username = feature.attributes.username ? "<b>" + feature.attributes.username + ":</b> " : "";
        var feature_center = feature.geometry.getBounds().getCenterLonLat();
        var popup = new OpenLayers.Popup.FramedCloud("Feedback", 
			feature_center,
			null,
			"<div class='popup'>" + username + feature.attributes.description + "<br><a href='" + feature.attributes.url + "'>Discuss</a></div>",
			null, true, $.trailmap.feedback.onPopupClose);
        feature.popup = popup;
        $.trailmap.map.addPopup(popup);
        // $.trailmap.map.panTo(feature_center);
	}
	$.trailmap.feedback.onPopupClose = function (evt) {
		$.trailmap.feedback.selectControl.unselect($.trailmap.selectedFeature);
	}
	
	// Compose map
	
	// load Hubway stations with status
	$.get("/hubway/status/", function(data) {
		var hubwaystations = $.trailmap.parseGeoJSON(data);
    	$.trailmap.layer.hubway.addFeatures(hubwaystations);
    	// add popup window on click (feature select)
    	$.trailmap.hubway.selectControl = new OpenLayers.Control.SelectFeature( $.trailmap.layer.hubway,
		{
			onSelect: $.trailmap.hubway.onFeatureSelect, 
			onUnselect: $.trailmap.onFeatureUnselect
		});
    	$.trailmap.map.addControl($.trailmap.hubway.selectControl);
    	$.trailmap.hubway.selectControl.activate();  
	});
	
	// load feedback data, receives data url from page
	$.trailmap.loadFeedback = function(url) {
		$.get(url, function(data) {
			var feedback = $.trailmap.parseGeoJSON(data);
	    	$.trailmap.layer.feedback.addFeatures(feedback);
	    	// add popup window on click (feature select)
	    	$.trailmap.feedback.selectControl = new OpenLayers.Control.SelectFeature( $.trailmap.layer.feedback,
			{
				onSelect: $.trailmap.feedback.onFeatureSelect, 
				onUnselect: $.trailmap.onFeatureUnselect
			});
	    	$.trailmap.map.addControl($.trailmap.feedback.selectControl);
	    	$.trailmap.feedback.selectControl.activate();  
		});
	}
	
	if ($("#id_location").val() !== "POINT (0 0)" && $("#id_location").val() !== undefined) {
		var form_location = new OpenLayers.Geometry.fromWKT($("#id_location").val());
		$.trailmap.lon = form_location.x;
		$.trailmap.lat = form_location.y;
	}
	
  	for (var i in $.trailmap.layer) {
  		$.trailmap.map.addLayer($.trailmap.layer[i]);
	}
  	$.trailmap.map.setCenter( new OpenLayers.LonLat($.trailmap.lon, $.trailmap.lat).transform($.trailmap.proj.wgs84, $.trailmap.proj.osm), $.trailmap.zoom );	
	$.trailmap.map.addControl(new OpenLayers.Control.Permalink());
	
	// UI
	
	$("div.baseLbl").html("Base Layers");
	$("div.dataLbl").html("Cycling &amp; Walking");
	
	
	// larger map button
	var largerMap = function () {
		var map_height = $(window).height() - $("#header").height() - $("#map_legend").height() - 24;
		$("#map_canvas").height(map_height);
	}
	var panel = new OpenLayers.Control.Panel();
	var largermapButton = new OpenLayers.Control.Button({
		title: "View larger map",
		displayClass: "largermapButtonDisplay",
		trigger: largerMap
	});
	$("div.largermapButtonDisplayItemInactive")
	panel.addControls([largermapButton]);
    $.trailmap.map.addControl(panel);

	// Feedback
	
	$.trailmap.feedbackMarker = function (x, y) {		
		// Add draggable marker/feature            		
		$.trailmap.layer.layer_feedback = new OpenLayers.Layer.Vector("Your Feedback");
		$.trailmap.layer.layer_feedback.styleMap = new OpenLayers.StyleMap(new OpenLayers.Style({				        
		        graphicYOffset: -37,
		        graphicXOffset: -16,
		        externalGraphic: $.trailmap.staticurl + "img/icon-conversation-green.png", // switch
		        pointRadius: 18
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
	
	// Feedback form validation
	$("#id_description").addClass("required");
	$("#id_user_email").addClass("email");
	$("#feedbackform, #feedbackform_admin").validate();
	

	
});


