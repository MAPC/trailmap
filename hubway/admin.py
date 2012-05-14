from hubway.models import Station, Stationstatus
# from django.contrib import admin
from django.contrib.gis import admin

# GeoAdmin overloads
admin.GeoModelAdmin.default_lon = -7915039
admin.GeoModelAdmin.default_lat = 5216500 
admin.GeoModelAdmin.default_zoom = 12

class StationAdmin(admin.OSMGeoAdmin):
    list_display = ('name', 'installDate', 'terminalName',)
    
class StationstatusAdmin(admin.ModelAdmin):
    list_display = ('update', 'station', 'nbBikes', 'nbEmptyDocks',)
    list_filter = ('station',)
    date_hierarchy = 'update'

admin.site.register(Station, StationAdmin)
admin.site.register(Stationstatus, StationstatusAdmin)