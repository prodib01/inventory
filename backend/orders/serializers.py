from rest_framework import serializers
from .models import Order, Delivery, Pickup
from products.models import Products
from users.models import User
from decimal import Decimal
from users.serializers import UserSerializer
from products.serializers import ProductSerializer

class OrderSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['customer', 'products', 'order_number', 'total_price', 'created_at']
        read_only_fields = ['order_number', 'total_price', 'created_at', 'customer']

    def create(self, validated_data):
        products = validated_data.pop('products')
        user = self.context['request'].user 
        order = Order.objects.create(customer=user, **validated_data)
        order.products.set(products)

        total = sum([Decimal(p.price) for p in products])
        order.total_price = total
        order.save()
        return order


    def update(self, instance, validated_data):
        products = validated_data.pop('products', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if products is not None:
            instance.products.set(products)
            instance.total_price = sum([product.price for product in products])

        instance.save()
        return instance
    

class DeliverySerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    class Meta:
        model = Delivery
        fields = ['id', 'order', 'address', 'created_at', 'completed']    

class PickupSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    class Meta:
        model = Pickup
        fields = ['id', 'order', 'pickup_time', 'pickup_date']        