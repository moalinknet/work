import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Bell, 
  ChevronDown, 
  User, 
  LogOut, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  DollarSign,
  Calendar,
  Target,
  Fish,
  Briefcase,
  Wallet
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

interface Task {
  id: string;
  reviewId: string;
  workerId: string;
  status: 'writing' | 'submitted' | 'pending_approval' | 'approved';
  acceptedAt: string;
  submittedAt?: string;
  review?: {
    businessName: string;
    region: string;
    content: string;
    reward: number;
    deadline: string;
  };
}

interface DashboardProps {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  myTasks: Task[];
  onGoToNaksiter: () => void;
  onGoToMyWorks: () => void;
  onSignOut: () => void;
}

export function Dashboard({ user, myTasks, onGoToNaksiter, onGoToMyWorks, onSignOut }: DashboardProps) {
  const [notifications] = useState([
    { id: 1, title: "새로운 프리미엄 작업", message: "강남구 카페 리뷰 작업이 등록되었습니다.", time: "5분 전" },
    { id: 2, title: "작업 승인 완료", message: "A업체 리뷰가 승인되어 정산 대기 중입니다.", time: "1시간 전" },
  ]);

  // 통계 계산
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter(t => t.status === 'approved').length;
  const approvalRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const availableAmount = myTasks
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + (t.review?.reward || 0), 0);
  
  const pendingAmount = myTasks
    .filter(t => t.status === 'submitted' || t.status === 'pending_approval')
    .reduce((sum, t) => sum + (t.review?.reward || 0), 0);

  const activeTasks = myTasks.filter(t => t.status === 'writing' || t.status === 'submitted');

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 로고 (좌측) */}
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎣</div>
              <h1 className="text-xl font-semibold">낚시터 워커</h1>
            </div>
            
            {/* 알림 아이콘 & 프로필 (우측) */}
            <div className="flex items-center gap-3">
              {/* 알림 아이콘 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative p-2">
                    <Bell className="w-5 h-5" />
                    {notifications.length > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white">{notifications.length}</span>
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>알림</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-3">
                      <div className="text-sm font-medium">{notification.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.message}</div>
                      <div className="text-xs text-muted-foreground mt-1">{notification.time}</div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* 프로필 드롭다운 */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="" />
                      <AvatarFallback>
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium">
                        {user.name || user.email.split('@')[0]}
                      </span>
                      <span className="text-xs text-muted-foreground">워커</span>
                    </div>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    내 정보
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    설정
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    로그아웃
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">안녕하세요, {user.name || '워커'}님! 👋</h2>
            <p className="text-muted-foreground mt-1">오늘도 좋은 작업 하세요!</p>
          </div>
          <Button onClick={onGoToNaksiter} size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Fish className="w-4 h-4 mr-2" />
            🎣 낚시터 입장하기
          </Button>
        </div>

        {/* Section 1: 내 작업 현황 요약 */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">📊 내 작업 현황 요약</h3>
          
          {/* 작업 통계 테이블 형태 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-2">
                  <Target className="w-8 h-8 text-blue-600" />
                  <div className="text-2xl font-bold">{totalTasks}건</div>
                  <div className="text-sm text-muted-foreground">작업 수주</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="text-2xl font-bold">{completedTasks}건</div>
                  <div className="text-sm text-muted-foreground">작업 완료</div>
                </div>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-2">
                  <TrendingUp className="w-8 h-8 text-purple-600" />
                  <div className="text-2xl font-bold">{approvalRate}%</div>
                  <div className="text-sm text-muted-foreground">승인률</div>
                  <Progress value={approvalRate} className="w-full mt-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 정산 정보 테이블 형태 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">정산 가능</div>
                      <div className="text-2xl font-bold text-green-600">
                        {availableAmount.toLocaleString()}원
                      </div>
                    </div>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    정산 신청
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">대기 중</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {pendingAmount.toLocaleString()}원
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Section 2: 진행 중인 작업 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              진행 중인 작업
            </h3>
            <Button variant="outline" onClick={onGoToMyWorks}>
              전체 보기
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              {activeTasks.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h4 className="text-lg font-medium mb-2">진행 중인 작업이 없습니다</h4>
                  <p className="text-sm mb-4">낚시터에서 새로운 작업을 수주해보세요!</p>
                  <Button onClick={onGoToNaksiter} className="bg-blue-600 hover:bg-blue-700">
                    <Fish className="w-4 h-4 mr-2" />
                    낚시터 가기
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeTasks.slice(0, 3).map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">🏷️ {task.review?.businessName || '업체명 없음'}</h4>
                          <Badge variant={task.status === 'writing' ? 'outline' : 'secondary'}>
                            {task.status === 'writing' ? '작성 중' : '제출 완료'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>📍 {task.review?.region || '지역 정보 없음'}</div>
                          <div>💰 {task.review?.reward?.toLocaleString() || 0}원</div>
                          <div>⏰ 마감: {task.review?.deadline || '마감일 없음'}</div>
                        </div>
                      </div>
                      {task.status === 'writing' && (
                        <Button size="sm" variant="outline" onClick={onGoToMyWorks}>
                          작업 계속하기
                        </Button>
                      )}
                    </div>
                  ))}
                  {activeTasks.length > 3 && (
                    <div className="text-center pt-4 border-t">
                      <Button variant="link" onClick={onGoToMyWorks}>
                        {activeTasks.length - 3}개 작업 더 보기 →
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section 3: 빠른 액션 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">⚡ 빠른 액션</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-all hover:scale-105" 
              onClick={onGoToNaksiter}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Fish className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">낚시터</h4>
                  <p className="text-sm text-muted-foreground">새로운 작업 수주하기</p>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-all hover:scale-105" 
              onClick={onGoToMyWorks}
            >
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">내 작업</h4>
                  <p className="text-sm text-muted-foreground">작업 현황 관리하기</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-all hover:scale-105">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium">정산 관리</h4>
                  <p className="text-sm text-muted-foreground">수익 및 정산 확인</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}