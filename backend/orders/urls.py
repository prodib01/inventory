from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import OrderDetailView, OrderListView, PickupBySeller, PickupByCustomer, PickupCRUD, DeliveryBySeller, DeliveryByCustomer, DeliveryCRUD, CheckoutView

urlpatterns = [
    path('orders/', OrderDetailView.as_view(), name='order-create'),
    path('checkout/', CheckoutView.as_view(), name='checkout'),
    path('orders/<str:order_number>/', OrderDetailView.as_view(), name='order-detail'),  
    path('all-orders/', OrderListView.as_view(), name='order-list' ),
    path('delivery/by-seller/', DeliveryBySeller.as_view(), name='delivery-by-seller'),
    path('delivery/by-customer/', DeliveryByCustomer.as_view(), name='delivery-by-customer'),
    path('delivery/', DeliveryCRUD.as_view(), name='delivery-post'),
    path('delivery/<int:pk>/', DeliveryCRUD.as_view(), name='delivery-patch-delete'),
    path('pickup/by-seller/', PickupBySeller.as_view(), name='pickup-by-seller'),
    path('pickup/by-customer/', PickupByCustomer.as_view(), name='pickup-by-customer'),
    path('pickup/', PickupCRUD.as_view(), name='pickup-post'),
    path('pickup/<int:pk>/', PickupCRUD.as_view(), name='pickup-patch-delete'),
]
