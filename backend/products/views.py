from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Products
from .serializers import ProductSerializer
from django.shortcuts import get_object_or_404
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser

class ProductView(APIView):
    parser_classes = (MultiPartParser, FormParser)

    def get(self, request):
        user_id = request.query_params.get('user_id')

        if user_id:
            products = Products.objects.filter(user_id=user_id)
        else:
            products = Products.objects.all()

        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, pk=None):
        if not pk:
            return Response({"error": "Product ID required for update."}, status=status.HTTP_400_BAD_REQUEST)
        
        product = get_object_or_404(Products, pk=pk)
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk=None):
        if not pk:
            return Response({"error": "Product ID required for deletion."}, status=status.HTTP_400_BAD_REQUEST)
        
        product = get_object_or_404(Products, pk=pk)
        product.delete()
        return Response({"message": "Product deleted."}, status=status.HTTP_204_NO_CONTENT)


class AllProductsView(ListAPIView):
    permission_classes = [AllowAny]
    queryset = Products.objects.all()
    serializer_class = ProductSerializer