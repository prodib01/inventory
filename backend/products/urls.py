from django.urls import path
from .views import ProductView, AllProductsView
from django.conf.urls.static import static
from django.conf import settings

urlpatterns = [
    path('', ProductView.as_view()),                
    path('<int:pk>/', ProductView.as_view()), 
    path('all/', AllProductsView.as_view()),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)