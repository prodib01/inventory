from django.http import JsonResponse
from rest_framework import authentication
from rest_framework import exceptions
from .models import User

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        # Get the auth header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        
        # Check if header exists and has correct format
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        # Extract the token
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            return None
        
        # Verify token
        payload = User.verify_jwt(token)
        if not payload:
            raise exceptions.AuthenticationFailed('Invalid token or token expired')
        
        # Get user from payload
        user_id = payload.get('user_id')
        if not user_id:
            raise exceptions.AuthenticationFailed('Token has no user ID')
        
        try:
            user = User.objects.get(id=user_id)
            request.user = user
            return (user, token)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')