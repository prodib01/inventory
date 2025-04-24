from django.urls import path, include
from .views import login, register, dashboard_stats, recent_orders, sales_distribution, ShopViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'shop', ShopViewSet)

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('stats/', dashboard_stats, name='stats'),
    path('recent-orders/', recent_orders, name='recent-orders'),
    path('sales-distribution/', sales_distribution, name='sales-distribution'),
    path('', include(router.urls)),
]