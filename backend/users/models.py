from django.db import models
import bcrypt
import jwt
from datetime import datetime, timedelta
from django.conf import settings

class User(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('customer', 'Customer')
    )

    full_name = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    password_hash = models.CharField(max_length=255)
 
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')


    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_anonymous(self):
        return False

    def set_password(self, password):
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')

    def check_password(self, password):
        password_bytes = password.encode('utf-8')
        hash_bytes = self.password_hash.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    
    def generate_jwt(self):
        payload = {
            'user_id': self.id,
            'email': self.email,
            'full_name': self.full_name,
            'exp': datetime.utcnow() + timedelta(days=1)
        }
        token = jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
        return token
    
    @staticmethod
    def verify_jwt(token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    def __str__(self):
        return self.full_name
    
class Shop(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255, blank=True)
    address = models.CharField(max_length=255, blank=True)
    contact = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    currency = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.name