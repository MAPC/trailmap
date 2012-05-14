from django.contrib.gis import admin

from mapfeedback.models import Comment

def moderate(modeladmin, request, queryset):
    queryset.update(followup='m')
moderate.short_description = "Mark for moderation"

def completed(modeladmin, request, queryset):
    queryset.update(followup='c')
completed.short_description = "Mark as completed"

class CommentAdmin(admin.OSMGeoAdmin):
    list_display = ('pk', 'user_name', 'description')
    list_filter = ['followup']
    actions = [moderate, completed]

admin.site.register(Comment, CommentAdmin)