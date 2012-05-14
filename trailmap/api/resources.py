from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie.authorization import Authorization

from mapfeedback.models import Comment
from trailmap.api.tastyhacks import GeoResource


def process_request(request):
    """ 
    Sets 'REMOTE_ADDR' to 'HTTP_X_REAL_IP', if the latter is set.
    'HTTP_X_REAL_IP' is specified in Nginx config.
    """
    if 'HTTP_X_REAL_IP' in request.META:
        request.META['REMOTE_ADDR'] = request.META['HTTP_X_REAL_IP']
    return request

class CommentResource(GeoResource):
    """
    Mapcomment
    """

    class Meta:
        queryset = Comment.objects.filter(followup='n')
        allowed_methods = ['get', 'post', ]
        excludes = ['admin_key', 'followup', 'last_modified',]
        authorization = Authorization()
        include_resource_uri = False
        filtering = {
            'description': ALL,
        }

    def hydrate_ip(self, bundle):
        bundle.request = process_request(bundle.request)
        bundle.data['ip'] = bundle.request.META.get('REMOTE_ADDR')
        return bundle

    def dehydrate(self, bundle):
         del bundle.data['user_email']
         del bundle.data['ip']
         del bundle.data['id']
         return bundle