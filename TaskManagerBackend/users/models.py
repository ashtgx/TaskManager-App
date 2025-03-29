from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    email = models.EmailField(unique=True)

    first_name = None
    last_name = None

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]
    
    def __str__(self):
        return self.username
