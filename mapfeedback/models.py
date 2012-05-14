from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry
from django.utils.translation import ugettext_lazy as _

# Create your models here.

FOLLOWUP_CHOICES = (
    ('n', 'New'),
    ('m', 'Moderate'),
    ('c', 'Completed'),
)

class Comment(models.Model):
    """
    Comment left on the map for a particular location.
    """

    description = models.TextField()
    user_name = models.CharField(max_length=50, blank=True, null=True)
    user_email = models.EmailField(max_length=75, blank=True, null=True)
    
    admin_key = models.CharField(max_length=12, blank=True, null=True)
    
    followup = models.CharField(max_length=1, default='n', choices=FOLLOWUP_CHOICES)
    
    ip = models.IPAddressField('IP Address', blank=True, null=True)
    last_modified = models.DateTimeField(editable=False, auto_now=True)
    
    location = models.PointField(geography=True, blank=True, null=True, default='POINT (0 0)') # default SRS 4326
    objects = models.GeoManager()

    class Meta:
        verbose_name = _('Comment')
        verbose_name_plural = _('Comments')

    def __unicode__(self):
        return "%i" % (self.pk)
    
    def save(self, *args, **kwargs):
        # self.description += self.user_email
        # no geometry, potential spam
        if self.location == GEOSGeometry('POINT(0 0)'):
            self.followup = 'm'   
        super(Comment, self).save(*args, **kwargs)
