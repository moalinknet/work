import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface FilterBarProps {
  reviewType: string;
  setReviewType: (type: string) => void;
  region: string;
  setRegion: (region: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  totalCount: number;
  onRefresh: () => void;
}

export function FilterBar({
  reviewType,
  setReviewType,
  region,
  setRegion,
  sortBy,
  setSortBy,
  totalCount,
  onRefresh
}: FilterBarProps) {
  const regions = [
    "전체", "서울", "부산", "대구", "인천", "광주", "대전", "울산",
    "세종", "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주"
  ];

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">리뷰종류:</span>
          <Select value={reviewType} onValueChange={setReviewType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체</SelectItem>
              <SelectItem value="general">일반</SelectItem>
              <SelectItem value="premium">프리미엄</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">지역:</span>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {regions.map(regionName => (
                <SelectItem key={regionName} value={regionName.toLowerCase()}>
                  {regionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">정렬:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">최신순</SelectItem>
              <SelectItem value="reward">보상금액순</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline" size="sm" onClick={onRefresh}>
          🔄 새로고침
        </Button>
      </div>

      {/* Results Summary */}
      <div className="flex items-center gap-2">
        <Badge variant="outline">
          총 {totalCount}개 작업
        </Badge>
        {reviewType !== 'all' && (
          <Badge variant="secondary">
            {reviewType === 'general' ? '일반' : '프리미엄'}
          </Badge>
        )}
        {region !== '전체' && (
          <Badge variant="secondary">
            {region}
          </Badge>
        )}
      </div>
    </div>
  );
}