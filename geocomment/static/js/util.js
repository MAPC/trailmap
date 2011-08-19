/*
 * Utilities that require $.trailmap.staticurl
 */

$(document).ready(function() {

	// Page load after invalid math-captcha POST
	if ($("#captchaerror").html() !== "" && $("#captchaerror").length > 0) {
		$("#id_math_captcha_field").css("border","2px solid #8A1F11");
		$("#feedbackform").toggle();			
		var feedback_geom = new OpenLayers.Geometry.fromWKT($("#id_location").val()).transform($.trailmap.proj.wgs84, $.trailmap.proj.osm);
		$.trailmap.feedbackMarker( feedback_geom.x, feedback_geom.y);
		$.trailmap.map.setCenter( new OpenLayers.LonLat(feedback_geom.x, feedback_geom.y), $.trailmap.zoom );
	}

});