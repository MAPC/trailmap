from django.conf.urls.defaults import patterns


urlpatterns = patterns('',    
    # trigger manual hubway update
    (r'^update/', 'hubway.views.update'),
    # stationstatus geojson
    (r'^status/', 'hubway.views.status'),
    # station geojson
    (r'^stations/', 'hubway.views.stations'),
)