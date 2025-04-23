from django.db import models
from users.models import User
from products.models import Products
import uuid
from datetime import datetime
from decimal import Decimal

class Order(models.Model):
    METHOD_CHOICES = (
        ('delivery', 'Delivery'),
        ('pickup', 'Pickup')
    )
    STATUS_CHOICES = (
        ('delivered', 'Delivered'),
        ('processing', 'Processing'),
        ('cancelled', 'Cancelled')
    )
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    products = models.ManyToManyField('products.Products')  
    order_number = models.CharField(max_length=50, unique=True, editable=False)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    method = models.CharField(max_length=20, choices=METHOD_CHOICES)
    status = models.CharField(max_length=25, choices=STATUS_CHOICES)
    created_at = models.DateField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            while True:
                new_order_number = str(uuid.uuid4()).replace('-', '')[:12]
                if not Order.objects.filter(order_number=new_order_number).exists():
                    self.order_number = new_order_number
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return self.order_number

class Delivery(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    address = models.CharField(max_length=255)
    created_at = models.DateField(auto_now_add=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.order.order_number 

class Pickup(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    pickup_time = models.TimeField()
    pickup_date = models.DateField()
    completed = models.BooleanField(default=False)
    created_at = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.order.order_number          