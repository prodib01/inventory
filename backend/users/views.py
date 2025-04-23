from django.shortcuts import render
from rest_framework import viewsets
from .models import User
from .serializers import UserSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from .authentication import JWTAuthentication
from orders.models import Order
from products.models import Products
from rest_framework.decorators import api_view
from rest_framework.response import Response
from collections import defaultdict

@csrf_exempt
@require_http_methods(["POST"])
def register(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        full_name = data.get('full_name')
        role = data.get('role')
        
        # Validate input
        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)
        
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return JsonResponse({'error': 'User with this email already exists'}, status=400)
        
        # Create user
        user = User(
            email=email,
            full_name=full_name,
            role=role
        )
        user.set_password(password)
        user.save()
        
        
        # Generate token
        token = user.generate_jwt()
        
        return JsonResponse({
            'message': 'User registered successfully',
            'token': token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role
            }
        }, status=201)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def login(request):
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        
        # Validate input
        if not email or not password:
            return JsonResponse({'error': 'Email and password are required'}, status=400)
        
        # Find user
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Check password
        if not user.check_password(password):
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        

        
        # Generate token
        token = user.generate_jwt()
        
        return JsonResponse({
            'message': 'Login successful',
            'token': token,
            'user': {
                'id': str(user.id),
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    

@csrf_exempt
@require_http_methods(["GET"])
def get_user_profile(request):
    try:
        # Get the token from the Authorization header
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return JsonResponse({'error': 'Invalid authorization header'}, status=401)
        
        token = auth_header.split(' ')[1]
        
        # Verify token
        payload = User.verify_jwt(token)
        if payload is None:
            return JsonResponse({'error': 'Invalid or expired token'}, status=401)
        
        # Get user from payload
        user_id = payload.get('user_id')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
        
        
        # Return user profile data
        return JsonResponse({
            'user': {
                'id': user.id,
                'email': user.email,
                'full_name': user.full_name,
                'role': user.role
            }
        })
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
def dashboard_stats(request):
    user = request.user  
    user_orders =  Order.objects.filter(products__user=user) 
    user_products = Products.objects.filter(user=user)

    total_sales = sum(order.total_price for order in user_orders)
    total_orders = user_orders.count()
    pending_orders = user_orders.filter(status='Processing').count()
    low_stock_items = user_products.filter(quantity__lt=10).count()
    total_products = user_products.count() 

    return Response({
        "totalSales": total_sales,
        "totalOrders": total_orders,
        "pendingOrders": pending_orders,
        "lowStockItems": low_stock_items,
        "totalProducts": total_products,
    })

@api_view(['GET'])
def recent_orders(request):
    user = request.user
    user_orders = Order.objects.filter(products__user=user).order_by('-created_at')[:5]
    return Response([
        {
            "id": order.id,
            "customer": order.customer.full_name,
            "date": order.created_at,
            "total": order.total_price,
            "status": order.status,
        } for order in user_orders
    ])

@api_view(['GET'])
def sales_distribution(request):
    user = request.user
    orders = Order.objects.filter(customer=user)

    category_sales = defaultdict(int)

    for order in orders:
        for product in order.products.all():  
            category_name = product.category.name  
            category_sales[category_name] += order.total_price  

    return Response(category_sales)    