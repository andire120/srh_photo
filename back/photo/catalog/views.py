from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, FileResponse, JsonResponse
from .models import Photo
from .forms import PhotoForm
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from .serializers import PhotoSerializer
import os
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
from rest_framework.parsers import MultiPartParser, FormParser

# 기존 뷰 유지
def photo_list(request):
    photos = Photo.objects.all().order_by('-created_at')
    return render(request, 'photos/photo_list.html', {'photos': photos})

def photo_detail(request, pk):
    photo = get_object_or_404(Photo, pk=pk)
    return render(request, 'photos/photo_detail.html', {'photo': photo})

def photo_create(request):
    if request.method == 'POST':
        form = PhotoForm(request.POST, request.FILES)
        if form.is_valid():
            photo = form.save()  # save 메서드에서 QR 코드가 자동으로 생성됨
            return redirect('photo_detail', pk=photo.id)
    else:
        form = PhotoForm()
    return render(request, 'photos/photo_form.html', {'form': form})

# React와 통신하기 위한 API 뷰 추가
@csrf_exempt
@api_view(['POST'])
def upload_photo(request):
    if request.method == 'POST':
        print("Request data:", request.data)  # 디버깅을 위한 출력
        print("Request FILES:", request.FILES)  # 파일 정보 출력
        
        serializer = PhotoSerializer(data=request.data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)  # 에러 출력
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        photo = serializer.save()  # save 메서드에서 QR 코드가 자동으로 생성됨
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response({"error": "Method not allowed"}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

@method_decorator(csrf_exempt, name='dispatch')
class PhotoViewSet(viewsets.ModelViewSet):
    queryset = Photo.objects.all().order_by('-created_at')
    serializer_class = PhotoSerializer
    parser_classes = (MultiPartParser, FormParser)  # 이 부분이 꼭 필요합니다
    
    # 파일 업로드 처리
    def create(self, request, *args, **kwargs):
        print("Request data:", request.data)  # 디버깅을 위한 출력
        print("Request FILES:", request.FILES)  # 파일 정보 출력
        
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("Serializer errors:", serializer.errors)  # 에러 출력
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    # QR 코드 직접 다운로드 액션
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        photo = self.get_object()
        file_path = photo.image.path
        
        if os.path.exists(file_path):
            response = FileResponse(open(file_path, 'rb'))
            response['Content-Disposition'] = f'attachment; filename="{os.path.basename(file_path)}"'
            return response
        
        return Response({"error": "File not found"}, status=status.HTTP_404_NOT_FOUND)
    
# 날짜 보내주는 코드
def get_current_date(request):
    current_date = datetime.now().strftime('%Y-%m-%d')  # 'YYYY-MM-DD' 형식
    return JsonResponse({'current_date': current_date})

def some_endpoint(request):
    data = {'message': 'Hello from Django!'}
    return JsonResponse(data)