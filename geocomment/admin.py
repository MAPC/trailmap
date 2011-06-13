from trailmap.geocomment.models import Place
# from django.contrib import admin
from django.contrib.gis import admin

class PlaceAdmin(admin.OSMGeoAdmin):
    list_display = ('pk',)

admin.site.register(Place, PlaceAdmin)
