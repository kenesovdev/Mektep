from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import status
from django.contrib.auth import get_user_model

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


class ChangePasswordView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not user.check_password(old_password):
            return Response(
                {'old_password': 'Неверный текущий пароль'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password != confirm_password:
            return Response(
                {'confirm_password': 'Пароли не совпадают'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 8:
            return Response(
                {'new_password': 'Пароль должен быть не менее 8 символов'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Пароль успешно изменён'}, status=status.HTTP_200_OK)
