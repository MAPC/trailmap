from django.contrib.gis.db import models
from django.forms import ModelForm, HiddenInput,  Textarea

from django.contrib.gis.geos import GEOSGeometry

# Create your models here.

# workaround for South custom fields issues 
try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], ['^django\.contrib\.gis\.db\.models\.fields\.PointField'])
except ImportError:
    pass

FOLLOWUP_CHOICES = (
    ('n', 'New'),
    ('m', 'Moderate'),
    ('c', 'Completed'),
)

class Place(models.Model):
    
    description = models.TextField()
    user_name = models.CharField(max_length=50, blank=True, null=True)
    user_email = models.EmailField(max_length=75, blank=True, null=True)
    
    admin_key = models.CharField(max_length=12, blank=True, null=True)
    
    followup = models.CharField(max_length=1, default='n', choices=FOLLOWUP_CHOICES)
    
    ip = models.IPAddressField('IP Address', blank=True, null=True)
    last_modified = models.DateTimeField(editable=False, auto_now=True)
    
    # GeoDjango
    location = models.PointField(geography=True, blank=True, null=True, default='POINT (0 0)') # default SRS 4326
    objects = models.GeoManager()
    
    def __unicode__(self):
        return u'%s' % (self.id)
    
    def get_absolute_url(self):
        return '/feedback/%i/' % self.id
    
    def set_followup(self):
        if self.location == GEOSGeometry('POINT(0 0)'): #potential spam-bot submission
            return 'm'
        return 'n'
            

class PlaceForm(ModelForm):
    
    class Meta:
        model = Place
        exclude = ('ip', 'followup', 'admin_key')
        widgets = {
            'description': Textarea(),
            'location': HiddenInput(),         
        }