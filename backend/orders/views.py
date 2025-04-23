from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Order, Delivery, Pickup
from .serializers import OrderSerializer, DeliverySerializer, PickupSerializer
from rest_framework.exceptions import NotFound
from rest_framework.permissions import IsAuthenticated

class OrderDetailView(APIView):

    def post(self, request):
        print("Authe", request.user)
        serializer = OrderSerializer(data=request.data, context={'request': request})  
        if serializer.is_valid():
            order = serializer.save()
            return Response({
                'id': order.id,  
                'order_number': order.order_number,
                'total_price': order.total_price,
                'paid': order.paid,
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
        orders = Order.objects.all()
        serializer = OrderSerializer(orders, many=True)  
        return Response(serializer.data, status=status.HTTP_200_OK)
    

class DeliveryBySeller(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        deliveries = Delivery.objects.filter(order__products__user=request.user).distinct()
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
        pickups = Pickup.objects.filter(order__products__user=request.user).distinct()
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