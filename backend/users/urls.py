from django.urls import path, include
from .views import login, register, dashboard_stats, recent_orders, sales_distribution, ShopViewSet, get_user_profile
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static


router = DefaultRouter()
router.register(r'shop', ShopViewSet)

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('stats/', dashboard_stats, name='stats'),
    path('recent-orders/', recent_orders, name='recent-orders'),
    path('sales-distribution/', sales_distribution, name='sales-distribution'),
    path('', include(router.urls)),
    path('profile/', get_user_profile, name='profile'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)