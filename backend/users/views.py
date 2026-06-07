from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.serializers import UserReadSerializer


class LoginView(TokenObtainPairView):
    permission_classes = (AllowAny,)


class RefreshView(TokenRefreshView):
    permission_classes = (AllowAny,)


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        serializer = UserReadSerializer(request.user)
        return Response(serializer.data)


