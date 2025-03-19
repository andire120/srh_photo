import React, { useState, useEffect, useRef } from "react";
import html2canvas from "html2canvas";
import "./PhotoFrameTest.css";

const frameLayouts = {
  pixcel_frame: [
    { width: 512, height: 612, top: 186, left: 63 },
    { width: 512, height: 612, top: 186, left: 626 },
    { width: 512, height: 612, top: 901, left: 63 },
    { width: 512, height: 612, top: 901, left: 626 },
  ],
  light_frame: [
    { width: 512, height: 612, top: 406, left: 63 },
    { width: 512, height: 612, top: 137, left: 626 },
    { width: 512, height: 612, top: 1050, left: 63 },
    { width: 512, height: 612, top: 781, left: 626 },
  ],
  dark_frame: [
    { width: 512, height: 612, top: 406, left: 63 },
    { width: 512, height: 612, top: 137, left: 626 },
    { width: 512, height: 612, top: 1050, left: 63 },
    { width: 512, height: 612, top: 781, left: 626 },
  ],
  ohpan_frame: [
    { width: 512, height: 612, top: 406, left: 63 },
    { width: 512, height: 612, top: 137, left: 626 },
    { width: 512, height: 612, top: 1050, left: 63 },
    { width: 512, height: 612, top: 781, left: 626 },
  ],
  spam_frame: [
    { width: 512, height: 612, top: 406, left: 63 },
    { width: 512, height: 612, top: 137, left: 625 },
    { width: 512, height: 612, top: 1050, left: 63 },
    { width: 512, height: 612, top: 781, left: 626 },
  ],
};

const PhotoFrameTest = ({ photos, frameType, onBack, title = "인생네컷" }) => {
  const layouts = frameLayouts[frameType] || [];
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mergedImageUrl, setMergedImageUrl] = useState(null);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [frameLoaded, setFrameLoaded] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Canvas로 이미지 합성하기
  const mergeImagesWithCanvas = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // 프레임의 원래 크기를 기준으로 설정
    canvas.width = 1200; // 프레임 너비에 맞게 조정
    canvas.height = 1800; // 프레임 높이에 맞게 조정
    
    try {
      // 배경 그리기 (프레임이 투명 배경인 경우)
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 각 사진 로드 및 그리기
      for (let i = 0; i < Math.min(photos.length, layouts.length); i++) {
        if (!photos[i]) continue;
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = photos[i];
        });
        
        const layout = layouts[i];
        ctx.drawImage(img, layout.left, layout.top, layout.width, layout.height);
      }
      
      // 프레임 이미지 로드 및 그리기
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        frameImg.onload = resolve;
        frameImg.onerror = (e) => {
          console.error("프레임 이미지 로드 실패:", e);
          reject(e);
        };
        frameImg.src = `/${frameType}.png`;
      });
      
      ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
      
      // 결과 URL 설정
      const url = canvas.toDataURL('image/png');
      setMergedImageUrl(url);
      setIsPreviewReady(true);
      
      return url;
    } catch (error) {
      console.error("이미지 합성 중 오류 발생:", error);
      return null;
    }
  };

  // 이미지를 서버에 업로드하고 QR 코드 URL 받기
  const uploadImageToServer = async (imageUrl) => {
    try {
      setIsUploading(true);
      
      // base64 이미지 URL을 Blob으로 변환
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // FormData 생성 및 이미지 추가
      const formData = new FormData();
      formData.append('title', `${title}_${new Date().getTime()}`);
      formData.append('image', blob, `${title}_${new Date().getTime()}.png`);
      
      // 서버에 이미지 업로드
      const uploadResponse = await fetch('http://127.0.0.1:8000/api/photos/', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error(`서버 응답 오류: ${uploadResponse.status}`);
      }
      
      const data = await uploadResponse.json();
      console.log('업로드 응답:', data);
      
      // QR 코드 URL 설정
      setQrCodeUrl(data.qr_code_url);
      setIsUploading(false);
      
      return data;
    } catch (error) {
      console.error('이미지 업로드 중 오류 발생:', error);
      setIsUploading(false);
      return null;
    }
  };

  // html2canvas를 이용한 캡처
  const captureWithHtml2Canvas = (action) => {
    setIsLoading(true);
    const frame = containerRef.current;

    if (!frame) {
      alert("프레임을 찾을 수 없습니다.");
      setIsLoading(false);
      return;
    }

    const images = frame.querySelectorAll("img");
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(imagePromises).then(() => {
      html2canvas(frame, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
        width: frame.offsetWidth,
        height: frame.offsetHeight,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          
          if (action === "print") {
            const printContent = `
            <html>
              <head>
                <title>${title}</title>
                <style>
                  @page {
                    size: 100mm 148mm; /* Hagaki size */
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  img {
                    width: 100mm;
                    height: 148mm;
                    object-fit: contain;
                  }
                </style>
              </head>
              <body>
                <img src="${imgData}" alt="Print Image">
                <script>
                  window.onload = function() {
                    setTimeout(function() {
                      window.print();
                      window.close();
                    }, 500);
                  };
                </script>
              </body>
            </html>
          `;
            const printWindow = window.open("", "_blank");
            if (printWindow) {
              printWindow.document.write(printContent);
              printWindow.document.close();
            } else {
              alert("팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
            }
          } else if (action === "download") {
            const link = document.createElement("a");
            link.href = imgData;
            link.download = `${title}_${new Date().getTime()}.png`;
            link.click();
          }
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("캡처 중 오류 발생:", err);
          alert("이미지 캡처 중 오류가 발생했습니다.");
          setIsLoading(false);
        });
    });
  };

  // 다운로드/출력 메소드
  const handleAction = (action, method = "html2canvas") => {
    if (method === "canvas") {
      // Canvas 방식을 사용하여 이미지 합성 후 처리
      setIsLoading(true);
      mergeImagesWithCanvas().then(imgData => {
        if (!imgData) {
          setIsLoading(false);
          alert("이미지 합성 중 오류가 발생했습니다.");
          return;
        }
      
        if (action === "print") {
          const printContent = `
          <html>
            <head>
              <title>${title}</title>
              <style>
                @page {
                  size: 100mm 148mm; /* Hagaki size */
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
                img {
                  width: 100mm;
                  height: 148mm;
                  object-fit: contain;
                }
              </style>
            </head>
            <body>
              <img src="${imgData}" alt="Print Image">
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
          </html>
        `;
          const printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
          } else {
            alert("팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.");
          }
        } else if (action === "download") {
          const link = document.createElement("a");
          link.href = imgData;
          link.download = `${title}_${new Date().getTime()}.png`;
          link.click();
        }
        setIsLoading(false);
      });
    } else {
      // html2canvas 방식 사용
      captureWithHtml2Canvas(action);
    }
  };

  // 프레임 이미지 로드 확인
  const handleFrameLoad = () => {
    setFrameLoaded(true);
  };

  // 이미지 로드 오류 처리
  const handleFrameError = () => {
    console.error("프레임 이미지 로드 중 오류 발생");
    setFrameLoaded(false);
  };

  // 컴포넌트가 마운트되면 미리 이미지 합성
  useEffect(() => {
    if (photos.length > 0 && frameType) {
      mergeImagesWithCanvas().then(imgUrl => {
        if (imgUrl) {
          // 합성된 이미지를 서버에 업로드하고 QR 코드 URL 받기
          uploadImageToServer(imgUrl);
        }
      });
    }
  }, [photos, frameType]);

  return (
    <div className="result-container">
      <div className="photo-frame-container">
        {/* 미리보기 영역 */}
        <div className="preview-container">
          {isPreviewReady && mergedImageUrl ? (// 합성된 이미지가 있으면 보여주기
            <div className="merged-image-preview" >
              <img src={mergedImageUrl} alt="합성된 인생네컷" className="result-image"/>
            </div>
          ) : ( // 로딩 중이거나 합성 실패 시 보여주는 부분 
            <div className="loading-preview">
              <p>이미지 합성 중...</p>
            </div>
          )}
          <button
            className="print-button"
            onClick={() => handleAction("print", "canvas")}
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "출력"}
          </button>
        </div>
        
        <div className="section2">
          <div className="qr-section">
            <p>QR 코드를 스캔해 인생네컷을 저장하세요!</p>
            {isUploading ? (
              <div className="qr-loading">업로드 중...</div>
            ) : qrCodeUrl ? (
              <div className="qr-image">
                <img src={qrCodeUrl} alt="QR 코드" style={{ width: "100%", height: "100%" }}/>
              </div>
            ) : (
              <div className="qr-placeholder">QR</div>
            )}
          </div>
          
          <button className="back-button" onClick={onBack}>
            처음으로 {'>'}
          </button>
        </div>

        {/* 숨겨진 프레임 컨테이너 (html2canvas 용) */}
        <div className="frame_container" ref={containerRef}>
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`사진 ${index + 1}`}
              className={`photo${index + 1}`}
              style={{
                width: layouts[index]?.width / 4,
                height: layouts[index]?.height / 4,
                top: layouts[index]?.top / 4,
                left: layouts[index]?.left / 4,
                position: 'absolute',
                objectFit: 'cover'
              }}
              crossOrigin="anonymous"
            />
          ))}
          <img
            src={`/${frameType}.png`}
            alt="프레임"
            className="frame-overlay"
            onLoad={handleFrameLoad}
            onError={handleFrameError}
            crossOrigin="anonymous"
          />
        </div>

        {/* 캔버스 영역 (화면에 보이지 않음) */}
        <canvas ref={canvasRef} className="not-see"/>
      </div> 
    </div>
  );
};

export default PhotoFrameTest;