from django.contrib.gis.db import models

# Create your models here.

class Station(models.Model):
    """
    A subset of Hubway's public data schema:
    
    <stations lastUpdate="1312912074530" version="2.0">
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
            <nbBikes>6</nbBikes>
            <nbEmptyDocks>11</nbEmptyDocks>
        </station>
    </stations>

    Note: Hubway doesn't use station.id as unique identifier, but station.name. 
    If a station is removed, it can happen that the station.id is re-used for another, new station.

    """
    id = models.IntegerField(primary_key=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    terminalName = models.CharField(max_length=50, blank=True, null=True)
    installed = models.BooleanField()
    locked = models.BooleanField()
    installDate = models.DateField(blank=True, null=True, default='2011-07-28')
    removalDate = models.DateField(blank=True, null=True)
    temporary = models.BooleanField()
    
    last_modified = models.DateTimeField(editable=False, auto_now=True)
    
    location = models.PointField(geography=True, blank=True, null=True, default='POINT (0 0)') # default SRS 4326
    objects = models.GeoManager()
    
    def __unicode__(self):
        return self.name
    
    
class Stationstatus(models.Model):
    """
    A subset of Hubway's public data schema:
    
    <stations lastUpdate="1312912074530" version="2.0">
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
            <nbBikes>6</nbBikes>
            <nbEmptyDocks>11</nbEmptyDocks>
        </station>
    </stations>
    """
    station = models.ForeignKey(Station)
    update = models.DateTimeField(blank=True, null=True)
    nbBikes = models.IntegerField(blank=True, null=True)
    nbEmptyDocks = models.IntegerField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = 'Stationstatuses'