from django.template import RequestContext
from django.shortcuts import render_to_response
from django.utils.text import normalize_newlines
import re

from django.views.decorators.cache import never_cache

from trailmap.geocomment.models import Place, PlaceForm

# Create your views here.

@never_cache 
def index(request):
    
    client = mobile(request)
    
    if 'baseline' in client:
    
        feedback = Place.objects.exclude(followup='c')
        
        if request.method == 'POST':
            form = PlaceForm(request.POST)
            if form.is_valid():
                entry = form.save(commit=False)
                entry.ip = request.META['REMOTE_ADDR']  
                # eliminate linebreaks
                normalized_text = normalize_newlines(entry.description)            
                entry.description = (normalized_text.replace('\n', ' '))     
                entry.save()
                return render_to_response('geocomment/thanks.html',
                                          {'feedback': entry,},
                                          context_instance=RequestContext(request))            
        else:
            form = PlaceForm()
            
        return render_to_response('geocomment/index.html', 
                                  {'form': form,
                                   'feedback': feedback,
                                   'client': client,
                                   }, 
                                   context_instance=RequestContext(request))
        
    else:
        
        return render_to_response('m/index.html', 
                                  {}, 
                                   context_instance=RequestContext(request))
        
    
def detail(request, feedback_id):
    feedback = Place.objects.get(pk=feedback_id)    
    return render_to_response('geocomment/detail.html',
                            {'feedback': feedback,
                             },
                            context_instance=RequestContext(request))
   
def mobile(request):
    
    # http://djangosnippets.org/snippets/2228/
    
    device = {}

    ua = request.META.get('HTTP_USER_AGENT', '').lower()
    
    if ua.find("iphone") > 0:
        device['iphone'] = "iphone" + re.search("iphone os (\d)", ua).groups(0)[0]
        
    if ua.find("ipad") > 0:
        device['ipad'] = "ipad"
        
    if ua.find("android") > 0:
        device['android'] = "android" + re.search("android (\d\.\d)", ua).groups(0)[0].translate(None, '.')
        
    if ua.find("blackberry") > 0:
        device['blackberry'] = "blackberry"
        
    if ua.find("windows phone os 7") > 0:
        device['winphone7'] = "winphone7"
        
    if ua.find("iemobile") > 0:
        device['winmo'] = "winmo"
        
    if not device:            # either desktop, or something we don't care about.
        device['baseline'] = "baseline"
    
    # spits out device names for CSS targeting, to be applied to <html> or <body>.
    device['classes'] = " ".join(v for (k,v) in device.items())
    
    return device
