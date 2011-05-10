from django.template import RequestContext
from django.shortcuts import render_to_response
from django.utils.text import normalize_newlines

from geocomment.models import Place, PlaceForm

# Create your views here.

def index(request):
    
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
                               }, 
                               context_instance=RequestContext(request))
    
def detail(request, feedback_id):
    feedback = Place.objects.get(pk=feedback_id)    
    return render_to_response('geocomment/detail.html',
                            {'feedback': feedback,
                             },
                            context_instance=RequestContext(request))