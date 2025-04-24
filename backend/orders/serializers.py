from rest_framework import serializers
from .models import Order, Delivery, Pickup
from products.models import Products
from users.models import User
from decimal import Decimal
from users.serializers import UserSerializer
from products.serializers import ProductSerializer

class OrderSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    products_data = serializers.PrimaryKeyRelatedField(
        source='products',
        queryset=Products.objects.all(),
        many=True,
        write_only=True
    )
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['customer', 'products', 'products_data', 'order_number', 'total_price', 'method', 'status', 'created_at']
        read_only_fields = ['order_number', 'total_price', 'created_at', 'customer']

    def create(self, validated_data):
        # Extract products before creating order
        products = validated_data.pop('products')
        
        # Set customer to the authenticated user
        validated_data['customer'] = self.context['request'].user
        
        # Default status to 'processing' if not provided
        validated_data.setdefault('status', 'processing')
        
        # Create order
        order = Order.objects.create(**validated_data)
        
        # Add products to order
        order.products.set(products)
            
        # Calculate total price based on products
        total_price = Decimal('0.00')
        for product in products:
            total_price += product.price
            
        # Add delivery fee if method is delivery
        if order.method == 'delivery':
            total_price += Decimal('5.00')  # Add $5 delivery fee
            
        order.total_price = total_price
        order.save(update_fields=['total_price'])
        
        return order

    def update(self, instance, validated_data):
        if 'products' in validated_data:
            products = validated_data.pop('products')
            instance.products.set(products)
            instance.total_price = sum([product.price for product in products])

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    

class DeliverySerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(
        source='order',
        queryset=Order.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = Delivery
        fields = ['id', 'order', 'order_id', 'address', 'created_at', 'completed']    

class PickupSerializer(serializers.ModelSerializer):
    order = OrderSerializer(read_only=True)
    order_id = serializers.PrimaryKeyRelatedField(
        source='order',
        queryset=Order.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = Pickup
        fields = ['id', 'order', 'order_id', 'pickup_time', 'pickup_date', 'created_at', 'completed']