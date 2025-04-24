from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Order, Delivery, Pickup
from .serializers import OrderSerializer, DeliverySerializer, PickupSerializer
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated

class OrderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        orders = Order.objects.filter(products__shop__owner=user).distinct()
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})  
        if serializer.is_valid():
            order = serializer.save()
            return Response({
                'id': order.id,  
                'order_number': order.order_number,
                'method': order.method,
                'status': order.status,
                'total_price': order.total_price,
                'products': [product.id for product in order.products.all()],
                'created_at': order.created_at
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        try:
            order = Order.objects.get(order_number=kwargs['order_number'])
        except Order.DoesNotExist:
            raise NotFound("Order not found.")
        
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            order = serializer.save()
            return Response({
                'order_number': order.order_number,
                'total_price': order.total_price,
                'paid': order.paid,
                'products': [product.id for product in order.products.all()],
                'created_at': order.created_at
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            order = Order.objects.get(order_number=kwargs['order_number'])
        except Order.DoesNotExist:
            raise NotFound("Order not found.")
        
        order.delete()
        return Response({"message": "Order deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class OrderListView(APIView):
    def get(self, request, *args, **kwargs):
        orders = Order.objects.filter(customer=request.user)
        serializer = OrderSerializer(orders, many=True)  
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    

class DeliveryBySeller(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deliveries = Delivery.objects.filter(order__products__shop_owner=request.user).distinct()
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data)

class DeliveryByCustomer(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deliveries = Delivery.objects.filter(order__customer=request.user)
        serializer = DeliverySerializer(deliveries, many=True)
        return Response(serializer.data)

# CRUD endpoint
class DeliveryCRUD(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = DeliverySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        try:
            delivery = Delivery.objects.get(pk=pk)
        except Delivery.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = DeliverySerializer(delivery, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            delivery = Delivery.objects.get(pk=pk)
        except Delivery.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        delivery.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class PickupBySeller(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pickups = Pickup.objects.filter(order__products__shop_owner=request.user).distinct()
        serializer = PickupSerializer(pickups, many=True)
        return Response(serializer.data)

class PickupByCustomer(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        pickups = Pickup.objects.filter(order__customer=request.user)
        serializer = PickupSerializer(pickups, many=True)
        return Response(serializer.data)

# CRUD endpoint
class PickupCRUD(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = PickupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        try:
            pickup = Pickup.objects.get(pk=pk)
        except Pickup.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = PickupSerializer(pickup, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            pickup = Pickup.objects.get(pk=pk)
        except Pickup.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        pickup.delete()
        return Response(status=status.HTTP_204_NO_CONTENT) 
    
class CheckoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Print received data for debugging
        print("Received checkout data:", request.data)
        
        # Prepare order data
        order_data = {
            'products_data': request.data.get('products', []),
            'method': request.data.get('method'),
            'status': 'processing'
        }
        
        # Create order serializer with request context
        order_serializer = OrderSerializer(data=order_data, context={'request': request})
        
        if order_serializer.is_valid():
            order = order_serializer.save()
            print(f"Order created with ID {order.id}, method: {order.method}, products count: {order.products.count()}")
            
            # Handle delivery or pickup based on method
            if order.method == 'delivery':
                delivery_data = {
                    'order_id': order.id,
                    'address': request.data.get('address', '')
                }
                delivery_serializer = DeliverySerializer(data=delivery_data)
                
                if delivery_serializer.is_valid():
                    delivery = delivery_serializer.save()
                    print(f"Delivery created with address: {delivery.address}")
                else:
                    # If delivery creation fails, delete the order and return error
                    print("Delivery validation errors:", delivery_serializer.errors)
                    order.delete()
                    return Response(delivery_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                    
            elif order.method == 'pickup':
                pickup_data = {
                    'order_id': order.id,
                    'pickup_date': request.data.get('pickup_date'),
                    'pickup_time': request.data.get('pickup_time')
                }
                pickup_serializer = PickupSerializer(data=pickup_data)
                
                if pickup_serializer.is_valid():
                    pickup = pickup_serializer.save()
                    print(f"Pickup created for date: {pickup.pickup_date}, time: {pickup.pickup_time}")
                else:
                    # If pickup creation fails, delete the order and return error
                    print("Pickup validation errors:", pickup_serializer.errors)
                    order.delete()
                    return Response(pickup_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Return successful response with order details
            return Response({
                'id': order.id,
                'order_number': order.order_number,
                'method': order.method,
                'status': order.status,
                'total_price': str(order.total_price)
            }, status=status.HTTP_201_CREATED)
        else:
            print("Order validation errors:", order_serializer.errors)
            for field, errors in order_serializer.errors.items():
                print(f"Field '{field}' errors: {errors}")
            return Response(order_serializer.errors, status=status.HTTP_400_BAD_REQUEST) 