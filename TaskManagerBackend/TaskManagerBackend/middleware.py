from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model

User = get_user_model()

@database_sync_to_async
def get_user(user_id):
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = parse_qs(scope["query_string"].decode())
        token = query_string.get("token", [None])[0]

        if token is not None:
            try:
                access_token = AccessToken(token)
                user = await get_user(access_token["user_id"])
                scope["user"] = user
            except Exception:
                scope["user"] = AnonymousUser()
        else:
            print("⚠️ No token found")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)