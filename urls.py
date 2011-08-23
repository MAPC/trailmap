from django.conf.urls.defaults import patterns, include, url
from django.views.generic.simple import direct_to_template

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'trailmap1.views.home', name='home'),
    # url(r'^trailmap/', include('trailmap.foo.urls')),
    # default
    (r'^$', 'trailmap.geocomment.views.index'),
    
    # force mobile version
    (r'^m/', direct_to_template, {'template': 'm/index.html'}),
    
    # add new feedback
    (r'^feedback/new/', 'trailmap.geocomment.views.index'),
    
    # feedback detail page with comment stream
    (r'^feedback/(?P<feedback_id>\d+)/$', 'trailmap.geocomment.views.detail'),
    (r'^feedback/(?P<feedback_id>\d+)/update/$', 'trailmap.geocomment.views.detail'),
    (r'^feedback/(?P<feedback_id>\d+)/(?P<admin_key>\w+)/$', 'trailmap.geocomment.views.detail'),
    (r'^feedback/data/', 'trailmap.geocomment.views.data'),
    
    # trigger manual hubway update
    (r'^hubway/update/', 'trailmap.hubway.views.update'),
    # stationstatus geojson
    (r'^hubway/status/', 'trailmap.hubway.views.status'),
    # station geojson
    (r'^hubway/stations/', 'trailmap.hubway.views.stations'),
    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
