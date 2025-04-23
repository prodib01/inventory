from django.contrib import admin
from .models import Order, Delivery, Pickup

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    readonly_fields = ('order_number', 'created_at', 'total_price')

    
admin.site.register(Delivery)
admin.site.register(Pickup)