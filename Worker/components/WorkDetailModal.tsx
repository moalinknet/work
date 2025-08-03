import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Separator } from "./ui/separator";

interface WorkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  work: {
    id: string;
    businessName: string;
    region: string;
    content: string;
    fullDescription: string;
    imageUrl?: string;
    type: 'general' | 'premium';
    duration: string;
    reward: number;
    registeredDate: string;
    requirements: string[];
    restrictions: string[];
    verificationMethod: string;
    deadline: string;
  } | null;
}

export function WorkDetailModal({
  isOpen,
  onClose,
  onAccept,
  work
}: WorkDetailModalProps) {
  if (!work) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🏷️ {work.businessName}
            <Badge variant={work.type === 'premium' ? 'default' : 'secondary'}>
              {work.type === 'premium' ? '프리미엄' : '일반'}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            작업 상세 정보를 확인하고 작업을 수락할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">📍 {work.region}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span>⏱️ {work.duration}</span>
              <span className="font-medium">💰 {work.reward.toLocaleString()}원</span>
              <span>📅 등록: {work.registeredDate}</span>
              <span>⏰ 마감: {work.deadline}</span>
            </div>
          </div>

          <Separator />

          {/* Image */}
          {work.imageUrl && (
            <div className="space-y-2">
              <h4 className="font-medium">🖼️ 참고 이미지</h4>
              <div className="w-full max-w-md mx-auto">
                <ImageWithFallback
                  src={work.imageUrl}
                  alt="작업 참고 이미지"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Full Description */}
          <div className="space-y-2">
            <h4 className="font-medium">📝 작업 상세 설명</h4>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm whitespace-pre-line">{work.fullDescription}</p>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <h4 className="font-medium">✅ 요청사항</h4>
            <ul className="space-y-1">
              {work.requirements.map((req, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Restrictions */}
          <div className="space-y-2">
            <h4 className="font-medium">❌ 금지사항</h4>
            <ul className="space-y-1">
              {work.restrictions.map((restriction, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">•</span>
                  <span>{restriction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Verification Method */}
          <div className="space-y-2">
            <h4 className="font-medium">🔍 인증 방법</h4>
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
              <p className="text-sm">{work.verificationMethod}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={onAccept}>
            ✅ 작업 수락하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}