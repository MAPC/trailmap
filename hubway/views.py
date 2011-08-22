from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.core.management import call_command

# Create your views here.

@login_required
def update(request):
    """
    Calls custom command to update Stations and Stationstatuses from Hubway.
    """

    call_command('updatestationstatus')
        
    return HttpResponse('success')



    