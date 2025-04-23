from django.urls import path
from .views import login, register, dashboard_stats, recent_orders, sales_distribution

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('stats/', dashboard_stats, name='stats'),
    path('recent-orders/', recent_orders, name='recent-orders'),
    path('sales-distribution/', sales_distribution, name='sales-distribution'),
]