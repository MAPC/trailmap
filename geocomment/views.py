from django.template import RequestContext
from django.shortcuts import render_to_response, get_object_or_404
from django.utils.text import normalize_newlines
import re

from django.views.decorators.cache import never_cache

import trailmap.settings as settings
from trailmap.geocomment.models import Place
from trailmap.geocomment.forms import PlaceForm

import hashlib

# Create your views here.

@never_cache 
def index(request):
    
    client = mobile(request)
    
    if 'baseline' in client:
    
        feedback = Place.objects.filter(followup='n')
        
        if request.method == 'POST':
            form = PlaceForm(request.POST)
            if form.is_valid():
                entry = form.save(commit=False)
                entry.ip = request.META['REMOTE_ADDR']
                entry.followup = entry.set_followup()  
                entry.admin_key = hashlib.md5(str(entry.location.x) + str(entry.location.y) + settings.FEEDBACK_SECRET).hexdigest()[:12]
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
                                   'MATH_CAPTCHA_QUESTION': settings.MATH_CAPTCHA_QUESTION,
                                   }, 
                                   context_instance=RequestContext(request))
        
    else:
        
        return render_to_response('m/index.html', 
                                  {}, 
                                   context_instance=RequestContext(request))
        
    
def detail(request, feedback_id=None, admin_key=None):
    
    feedback = get_object_or_404(Place, pk=feedback_id)
    
    # edit existing feedback
    if admin_key == feedback.admin_key:
        form = PlaceForm(instance=feedback)
    else:
        form = None
    
    if request.method == 'POST':
        form = PlaceForm(request.POST, instance=feedback)
        if form.is_valid():
            entry = form.save(commit=False)
            entry.ip = request.META['REMOTE_ADDR']
            # eliminate linebreaks
            normalized_text = normalize_newlines(entry.description)            
            entry.description = (normalized_text.replace('\n', ' '))     
            entry.save()
            return render_to_response('geocomment/thanks.html',
                                      {'feedback': entry,
                                       'task_msg': 'updated'},
                                      context_instance=RequestContext(request))
        
    return render_to_response('geocomment/detail.html',
                            {'feedback': feedback,
                             'form': form,
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
