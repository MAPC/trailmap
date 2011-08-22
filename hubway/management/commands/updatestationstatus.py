from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from django.contrib.gis.geos import GEOSGeometry

import xml.etree.ElementTree as etree
import urllib2
import datetime

# import trailmap.settings as settings
from trailmap.hubway.models import Station, Stationstatus


class Command(BaseCommand):
    """
    Get XML from Hubway, parse it and save it to hour model.
    
    http://www.thehubway.com/data/stations/bikeStations.xml
    
    <stations lastUpdate="1313783094413" version="2.0">
        <station>
        <id>3</id>
        <name>Colleges of the Fenway</name>
        <terminalName>B32006</terminalName>
        <lat>42.339503</lat>
        <long>-71.101845</long>
        <installed>true</installed>
        <locked>false</locked>
        <installDate/>
        <removalDate/>
        <temporary>false</temporary>
        <nbBikes>7</nbBikes>
        <nbEmptyDocks>10</nbEmptyDocks>
        </station>
    </stations>
    """
        
    args = ""
    help = "Update Station and Stationstatus from thehubway.com"

    def handle(self, *args, **options):

        try:  
            request = urllib2.Request(settings.HUBWAY_DATA_URL)
            response = urllib2.urlopen(request)
            bikeStations = response.read()
            h_stations = etree.XML(bikeStations)
            lastUpdate = float(h_stations.attrib['lastUpdate'])/1000 #milliseconds to seconds
            for h_station in h_stations:
                station_id = h_station.findtext('id')
                # add station if we don't have it in our database
                try:
                    station = Station.objects.get(pk=station_id)
                    # add removal date to existing station if given
                    if h_station.findtext('removalDate') != '':
                        removalDate = float(h_station.findtext('removalDate'))/1000
                        station.removalDate = datetime.datetime.fromtimestamp(removalDate)
                        station.save()
                except:
                    station = Station()
                    station.id = station_id
                    station.name = h_station.findtext('name')
                    station.terminalName = h_station.findtext('terminalName')
                    station.installed = True if h_station.findtext('installed') in ['true', 'True'] else False 
                    station.locked = True if h_station.findtext('locked') in ['true', 'True'] else False 
                    if h_station.findtext('installDate') != '':
                        installDate = float(h_station.findtext('installDate'))/1000
                        station.installDate = datetime.datetime.fromtimestamp(installDate)
                    # a removal date for a new station shouldn't be possible...
                    if h_station.findtext('removalDate') != '':
                        removalDate = float(h_station.findtext('removalDate'))/1000
                        station.removalDate = datetime.datetime.fromtimestamp(removalDate)
                    station.temporary = True if h_station.findtext('temporary') in ['true', 'True'] else False 
                    station_location_wkt = 'POINT(%s %s)' % (h_station.findtext('long'), h_station.findtext('lat'))
                    station.location = GEOSGeometry(station_location_wkt)
                    station.save()
                
                # add stationstatus entry
                stationstatus = Stationstatus()
                stationstatus.station = station
                stationstatus.update = datetime.datetime.fromtimestamp(lastUpdate)
                stationstatus.nbBikes = h_station.findtext('nbBikes')
                stationstatus.nbEmptyDocks = h_station.findtext('nbEmptyDocks')
                stationstatus.save()
        except: 
            raise CommandError("An Error occurred.")
            pass

