import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ReviewCardProps {
  id: string;
  businessName: string;
  region: string;
  content: string;
  imageUrl?: string;
  type: 'general' | 'premium';
  duration: string;
  reward: number;
  registeredDate: string;
  onTakeWork: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export function ReviewCard({
  id,
  businessName,
  region,
  content,
  imageUrl,
  type,
  duration,
  reward,
  registeredDate,
  onTakeWork,
  onViewDetails
}: ReviewCardProps) {
  return (
    <Card className="p-4 border hover:shadow-md transition-shadow cursor-pointer">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">🏷️ {businessName}</h3>
              <Badge variant={type === 'premium' ? 'default' : 'secondary'}>
                {type === 'premium' ? '프리미엄' : '일반'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">📍 {region}</p>
          </div>
          {imageUrl && (
            <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
              <ImageWithFallback
                src={imageUrl}
                alt="리뷰 이미지"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Content Preview */}
        <div className="space-y-2">
          <p className="text-sm line-clamp-2 text-muted-foreground">
            📝 {content}
          </p>
        </div>

        {/* Work Info */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span>⏱️</span>
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>💰</span>
            <span className="font-medium text-foreground">{reward.toLocaleString()}원</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span>{registeredDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(id)}
            className="flex-1"
          >
            상세 보기
          </Button>
          <Button
            size="sm"
            onClick={() => onTakeWork(id)}
            className="flex-1"
          >
            📦 작업 가져가기
          </Button>
        </div>
      </div>
    </Card>
  );
}