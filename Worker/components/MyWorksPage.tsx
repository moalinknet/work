import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, FileText, Upload } from "lucide-react";

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

interface MyWorksPageProps {
  myTasks: Task[];
  onBack: () => void;
  onSubmitWork: (taskId: string) => void;
}

export function MyWorksPage({ myTasks, onBack, onSubmitWork }: MyWorksPageProps) {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'writing': return '작성 중';
      case 'submitted': return '제출 완료';
      case 'pending_approval': return '승인 대기';
      case 'approved': return '승인 완료';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'writing': return 'outline' as const;
      case 'submitted': return 'secondary' as const;
      case 'pending_approval': return 'secondary' as const;
      case 'approved': return 'default' as const;
      default: return 'outline' as const;
    }
  };

  const groupedWorks = {
    active: myTasks.filter(w => w.status === 'writing' || w.status === 'submitted'),
    completed: myTasks.filter(w => w.status === 'approved'),
    all: myTasks
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="text-xl font-medium">내 작업 보기</h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">진행 중 ({groupedWorks.active.length})</TabsTrigger>
          <TabsTrigger value="completed">완료됨 ({groupedWorks.completed.length})</TabsTrigger>
          <TabsTrigger value="all">전체 ({groupedWorks.all.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {groupedWorks.active.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>진행 중인 작업이 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groupedWorks.active.map(task => (
                <Card key={task.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">🏷️ {task.review?.businessName || '업체명 없음'}</h3>
                          <Badge variant={getStatusVariant(task.status)}>
                            {getStatusText(task.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">📍 {task.review?.region || '지역 정보 없음'}</p>
                        <p className="text-sm text-muted-foreground mt-1">{task.review?.content || '작업 내용 없음'}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">
                          💰 {task.review?.reward?.toLocaleString() || 0}원
                        </p>
                        <p>⏰ {task.review?.deadline || '마감일 없음'}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-muted-foreground">
                        수락: {task.acceptedAt}
                        {task.submittedAt && (
                          <>
                            <br />
                            제출: {task.submittedAt}
                          </>
                        )}
                      </div>
                      
                      {task.status === 'writing' && (
                        <Button 
                          size="sm"
                          onClick={() => onSubmitWork(task.id)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          제출하기
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {groupedWorks.completed.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>완료된 작업이 없습니다.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {groupedWorks.completed.map(task => (
                <Card key={task.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">🏷️ {task.review?.businessName || '업체명 없음'}</h3>
                          <Badge variant="default">승인 완료</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">📍 {task.review?.region || '지역 정보 없음'}</p>
                        <p className="text-sm text-muted-foreground mt-1">{task.review?.content || '작업 내용 없음'}</p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p className="font-medium text-green-600">
                          💰 {task.review?.reward?.toLocaleString() || 0}원 지급완료
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {groupedWorks.all.map(task => (
              <Card key={task.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">🏷️ {task.review?.businessName || '업체명 없음'}</h3>
                        <Badge variant={getStatusVariant(task.status)}>
                          {getStatusText(task.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">📍 {task.review?.region || '지역 정보 없음'}</p>
                      <p className="text-sm text-muted-foreground mt-1">{task.review?.content || '작업 내용 없음'}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p className={`font-medium ${task.status === 'approved' ? 'text-green-600' : 'text-foreground'}`}>
                        💰 {task.review?.reward?.toLocaleString() || 0}원 {task.status === 'approved' ? '지급완료' : ''}
                      </p>
                      {task.status !== 'approved' && <p>⏰ {task.review?.deadline || '마감일 없음'}</p>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}