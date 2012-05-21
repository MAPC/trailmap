from django.conf.urls import patterns, include, url
from django.views.generic import TemplateView

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

from tastypie.api import Api
from api.resources import CommentResource
v1_api = Api(api_name='v1')
v1_api.register(CommentResource())

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'trailmap.views.home', name='home'),
    # url(r'^trailmap/', include('trailmap.foo.urls')),
    ('^$', TemplateView.as_view(template_name='index.html')),
    ('^embed/$', TemplateView.as_view(template_name='embed.html')),

    # API
    (r'^api/', include(v1_api.urls)),

    # Hubway
    (r'^hubway/', include('hubway.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
