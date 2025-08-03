import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { ArrowLeft, Upload, X, Image as ImageIcon } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface SubmissionFormProps {
  workId: string;
  work: {
    businessName: string;
    region: string;
    content: string;
    reward: number;
    deadline: string;
  };
  onBack: () => void;
  onSubmit: (data: {
    workId: string;
    reviewText: string;
    images: File[];
    screenshots: File[];
  }) => void;
}

export function SubmissionForm({ workId, work, onBack, onSubmit }: SubmissionFormProps) {
  const [reviewText, setReviewText] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (files: FileList | null, type: 'images' | 'screenshots') => {
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 3); // 최대 3개
    
    if (type === 'images') {
      setImages(prev => [...prev, ...newFiles].slice(0, 3));
    } else {
      setScreenshots(prev => [...prev, ...newFiles].slice(0, 3));
    }
  };

  const removeFile = (index: number, type: 'images' | 'screenshots') => {
    if (type === 'images') {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setScreenshots(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reviewText.trim()) {
      alert("리뷰 내용을 작성해주세요.");
      return;
    }

    if (images.length === 0) {
      alert("최소 1장의 이미지를 업로드해주세요.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        workId,
        reviewText,
        images,
        screenshots
      });
      
      alert("작업이 성공적으로 제출되었습니다!");
    } catch (error) {
      alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FilePreview = ({ files, type }: { files: File[], type: 'images' | 'screenshots' }) => (
    <div className="grid grid-cols-3 gap-2">
      {files.map((file, index) => (
        <div key={index} className="relative group">
          <div className="aspect-square bg-muted rounded border flex items-center justify-center overflow-hidden">
            <ImageWithFallback
              src={URL.createObjectURL(file)}
              alt={`업로드된 ${type === 'images' ? '이미지' : '스크린샷'}`}
              className="w-full h-full object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => removeFile(index, type)}
          >
            <X className="w-3 h-3" />
          </Button>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {file.name}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-medium">리뷰 제출</h1>
      </div>

      {/* Work Info */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium">🏷️ {work.businessName}</h3>
            <Badge variant="outline">제출 중</Badge>
          </div>
          <p className="text-sm text-muted-foreground">📍 {work.region}</p>
          <p className="text-sm text-muted-foreground">{work.content}</p>
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium">💰 {work.reward.toLocaleString()}원</span>
            <span className="text-red-600">⏰ 마감: {work.deadline}</span>
          </div>
        </div>
      </Card>

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Review Text */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium">📝 리뷰 작성</h3>
          <div className="space-y-2">
            <Label htmlFor="review-text">리뷰 내용 *</Label>
            <Textarea
              id="review-text"
              placeholder="솔직하고 도움이 되는 리뷰를 작성해주세요..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground">
              {reviewText.length}/500자
            </p>
          </div>
        </Card>

        {/* Image Upload */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium">🖼️ 이미지 업로드 (최대 3장) *</h3>
          
          {images.length > 0 && (
            <FilePreview files={images} type="images" />
          )}
          
          <div className="space-y-2">
            <Label htmlFor="image-upload">이미지 선택</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files, 'images')}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG 파일만 업로드 가능 ({images.length}/3)
            </p>
          </div>
        </Card>

        {/* Screenshot Upload */}
        <Card className="p-4 space-y-4">
          <h3 className="font-medium">📱 인증 캡처 업로드 (최대 3장)</h3>
          <p className="text-sm text-muted-foreground">
            네이버 지도 검색 기록, 방문 인증 등의 스크린샷을 업로드해주세요.
          </p>
          
          {screenshots.length > 0 && (
            <FilePreview files={screenshots} type="screenshots" />
          )}
          
          <div className="space-y-2">
            <Label htmlFor="screenshot-upload">캡처 파일 선택</Label>
            <Input
              id="screenshot-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e.target.files, 'screenshots')}
              className="cursor-pointer"
            />
            <p className="text-xs text-muted-foreground">
              JPG, PNG 파일만 업로드 가능 ({screenshots.length}/3)
            </p>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            취소
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !reviewText.trim() || images.length === 0}
            className="flex-1"
          >
            {isSubmitting ? (
              "제출 중..."
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                📤 작업 제출하기
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}