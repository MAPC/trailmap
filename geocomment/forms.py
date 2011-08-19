from django.forms import HiddenInput,  Textarea
from math_captcha.forms import MathCaptchaModelForm

from trailmap.geocomment.models import Place


class PlaceForm(MathCaptchaModelForm):
    
    class Meta:
        model = Place
        exclude = ('ip', 'followup', 'admin_key')
        widgets = {
            'description': Textarea(),
            'location': HiddenInput(),         
        }
