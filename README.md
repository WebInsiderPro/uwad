# UWAD
Unreal Web-Applications Development\
Django, Vue & Webpack mix for professional applications development.

#### Usage:
Just change `app_name` to your application name.
```
npm i
```

For Windows:
```
python -m venv venv
./venv/Scripts/Activate
```

For Linux/Mac:
```
python3 -m venv venv
source venv/bin/activate
```

Then:
```
pip install -r req.txt
django-admin startproject app .
python manage.py startapp app_name
```

app/settings.py
```
INSTALLED_APPS = [
    ...
    'webpack_loader',
    'app_name'
]

...

TEMPLATES = [
    {
        ...
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        ...
    },
]

...

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        # 'BUNDLE_DIR_NAME': 'webpack_bundles/',  # must end with slash
        'STATS_FILE': os.path.join(BASE_DIR, 'webpack-stats.json'),
        'POLL_INTERVAL': 0.1,
        'TIMEOUT': None,
        'IGNORE': [r'.+\.hot-update.js', r'.+\.map']
    }
}


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/2.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'dist')
]
```

app/urls.py
```
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('app_name.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
```

app_name/urls.py
```
from django.urls import path
from .views import home

urlpatterns = [
    path('', home, name='home'),
]
```

app_name/views.py
```
from django.shortcuts import render


def home(request):
    context = {}
    return render(request, 'app_name/index.html', context)
```

app_name/templates/app_name/index.html
```
{% extends 'base.html' %}
```

Now you need two terminal windows or tabs:
```
python manage.py migrate
npm run dev
python manage.py runserver
```
Check: [localhost:8000](http://127.0.0.1:8000/)


For Production:
`npm run build`

### Happy coding! =)
