from django.contrib.gis.db import models
from django.forms import ModelForm, HiddenInput, TextInput

# Create your models here.

# workaround for South custom fields issues 
try:
    from south.modelsinspector import add_introspection_rules
    add_introspection_rules([], ['^django\.contrib\.gis\.db\.models\.fields\.PointField'])
except ImportError:
    pass

FOLLOWUP_CHOICES = (
    ('n', 'New'),
    ('v', 'Verification'),
    ('c', 'Completed'),
)

class Place(models.Model):
    
    description = models.TextField()
    
    followup = models.CharField(max_length=1, default='n', choices=FOLLOWUP_CHOICES)
    
    ip = models.IPAddressField('IP Address', blank=True, null=True)
    last_modified = models.DateTimeField(editable=False, auto_now=True)
    
    # GeoDjango
    location = models.PointField(geography=True, blank=True, null=True, default='POINT(0 0)') # default SRS 4326
    objects = models.GeoManager()
    
    def __unicode__(self):
        return u'%s' % (self.id)
    
    def get_absolute_url(self):
        return "/feedback/%i/" % self.id

class PlaceForm(ModelForm):
    
    class Meta:
        model = Place
        exclude = ('ip', 'followup',)
        widgets = {
            'description': TextInput(),
            'location': HiddenInput(),         
        }