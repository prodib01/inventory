from django.urls import path
from .views import ProductView, AllProductsView

urlpatterns = [
    path('', ProductView.as_view()),                
    path('<int:pk>/', ProductView.as_view()), 
    path('all/', AllProductsView.as_view()),
]