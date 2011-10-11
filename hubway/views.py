from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.core.management import call_command
from django.utils import simplejson

from trailmap.hubway.models import Station, Stationstatus

# Create your views here.

@login_required
def update(request):
    """
    Calls custom command to update Stations and Stationstatuses from Hubway.
    """

    call_command('updatestationstatus')
        
    return HttpResponse('successfully updated')


def stations(request):
    """
    Returns a GeoJSON representation of all Hubway stations and their attributes.
    """
    stations = Station.objects.all()
    
    features = []
    
    for station in stations:
        removalDate = station.removalDate.strftime('%Y-%m-%dT%H:%M:%S') if station.removalDate else ''
        installDate = station.installDate.strftime('%Y-%m-%dT%H:%M:%S') if station.installDate else ''
        properties = dict(name=station.name, id=station.id, terminalName=station.terminalName, 
                          installed=station.installed, locked=station.locked, installDate=installDate, 
                          removalDate=removalDate, temporary=station.temporary)
        geometry = simplejson.loads(station.location.geojson)
        feature = dict(type='Feature', geometry=geometry, properties=properties)
        features.append(feature)
    
    response = dict(type='FeatureCollection', features=features)
    return HttpResponse(simplejson.dumps(response), mimetype='application/json')
    


def status(request):
    """
    Returns a GeoJSON representation of the Stationstatus 
    for all active Stations.
    Schema:
    { 
        "type": "FeatureCollection",
        "features": [
            { 
                "type": "Feature",
                "geometry": {
                    "type": "Point", 
                    "coordinates": [16, 48]
                },
                "properties": {
                    "name": "Station Name",
                    "bikes": 3,
                    "emptydocks": 4
                }
            }
        ]
    }
    """
    stations = Station.objects.filter(installed=True, locked=False)
    
    features = []
    
    for station in stations:
        # get current stationstatus
        stationstatus = Stationstatus.objects.filter(station=station).order_by(-id)[0]
        
        properties = dict(name=station.name, bikes=stationstatus.nbBikes, emptydocks=stationstatus.nbEmptyDocks)
        geometry = simplejson.loads(station.location.geojson)
        feature = dict(type='Feature', geometry=geometry, properties=properties)
        
        features.append(feature)
    
    response = dict(type='FeatureCollection', features=features)
    return HttpResponse(simplejson.dumps(response), mimetype='application/json')
    
        


    