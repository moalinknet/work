import { useState, useEffect } from "react";
import { ReviewCard } from "./components/ReviewCard";
import { WorkDetailModal } from "./components/WorkDetailModal";
import { FilterBar } from "./components/FilterBar";
import { MyWorksPage } from "./components/MyWorksPage";
import { SubmissionForm } from "./components/SubmissionForm";
import { AuthModal } from "./components/AuthModal";
import { Dashboard } from "./components/Dashboard";
import { Button } from "./components/ui/button";
import { Badge } from "./components/ui/badge";
import { apiClient } from "./utils/api";
import { authService, type User, type AuthState } from "./utils/auth";
import { LogOut, User as UserIcon, ArrowLeft } from "lucide-react";

interface Review {
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
}

interface Task {
  id: string;
  reviewId: string;
  workerId: string;
  status: 'writing' | 'submitted' | 'pending_approval' | 'approved';
  acceptedAt: string;
  submittedAt?: string;
  review?: Review;
}

type CurrentPage = 'dashboard' | 'naksiter' | 'myworks' | 'submission';

export default function App() {
  const [currentPage, setCurrentPage] = useState<CurrentPage>('dashboard');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [selectedWork, setSelectedWork] = useState<Review | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [submissionWorkId, setSubmissionWorkId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true
  });

  // Filter states for naksiter page
  const [reviewType, setReviewType] = useState('all');
  const [region, setRegion] = useState('전체');
  const [sortBy, setSortBy] = useState('latest');

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await authService.getSession();
        if (session) {
          setAuthState({
            user: session.user,
            accessToken: session.accessToken,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            accessToken: null,
            isLoading: false
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthState({
          user: null,
          accessToken: null,
          isLoading: false
        });
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((newAuthState) => {
      setAuthState(newAuthState);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Load reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setIsLoading(true);
        console.log('Loading reviews...');
        const reviewsData = await apiClient.fetchReviews();
        console.log('Reviews loaded successfully:', reviewsData.length);
        setReviews(reviewsData);
      } catch (error) {
        console.error('Error loading reviews:', error);
        
        // Initialize sample data if server is not responding or no data exists
        try {
          console.log('Attempting to initialize sample data...');
          await apiClient.initializeData();
          
          // Wait a moment for data to be initialized
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const reviewsData = await apiClient.fetchReviews();
          console.log('Reviews loaded after initialization:', reviewsData.length);
          setReviews(reviewsData);
        } catch (initError) {
          console.error('Error initializing data:', initError);
          // If all else fails, set empty array to prevent app crash
          setReviews([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadReviews();
  }, []);

  // Load user tasks when logged in
  useEffect(() => {
    const loadMyTasks = async () => {
      if (!authState.accessToken) {
        setMyTasks([]);
        return;
      }

      try {
        const tasksData = await apiClient.getMyTasks(authState.accessToken);
        setMyTasks(tasksData);
      } catch (error) {
        console.error('Error loading my tasks:', error);
      }
    };

    if (!authState.isLoading) {
      loadMyTasks();
    }
  }, [authState]);

  // Filter and sort reviews
  const filteredReviews = reviews.filter(review => {
    if (reviewType !== 'all' && review.type !== reviewType) return false;
    if (region !== '전체' && !review.region.includes(region)) return false;
    return true;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'reward') {
      return b.reward - a.reward;
    }
    return new Date(b.registeredDate).getTime() - new Date(a.registeredDate).getTime();
  });

  const handleTakeWork = (workId: string) => {
    if (!authState.user) {
      setIsAuthModalOpen(true);
      return;
    }

    const work = reviews.find(r => r.id === workId);
    if (work) {
      setSelectedWork(work);
      setIsDetailModalOpen(true);
    }
  };

  const handleViewDetails = (workId: string) => {
    const work = reviews.find(r => r.id === workId);
    if (work) {
      setSelectedWork(work);
      setIsDetailModalOpen(true);
    }
  };

  const handleAcceptWork = async () => {
    if (!selectedWork || !authState.accessToken) return;

    try {
      await apiClient.acceptWork(selectedWork.id, authState.accessToken);
      
      // Remove from available reviews
      setReviews(prev => prev.filter(r => r.id !== selectedWork.id));
      
      // Reload my tasks
      const tasksData = await apiClient.getMyTasks(authState.accessToken);
      setMyTasks(tasksData);
      
      setIsDetailModalOpen(false);
      setSelectedWork(null);
      alert(`"${selectedWork.businessName}" 작업을 수락했습니다!`);
    } catch (error: any) {
      console.error('Error accepting work:', error);
      alert(`작업 수락 실패: ${error.message}`);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const reviewsData = await apiClient.fetchReviews();
      setReviews(reviewsData);
      alert('새로운 작업을 확인했습니다!');
    } catch (error) {
      console.error('Error refreshing reviews:', error);
      alert('새로고침 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitWork = (taskId: string) => {
    const task = myTasks.find(t => t.id === taskId);
    if (task) {
      setSubmissionWorkId(taskId);
      setCurrentPage('submission');
    }
  };

  const handleFormSubmit = async (data: {
    workId: string;
    reviewText: string;
    images: File[];
    screenshots: File[];
  }) => {
    if (!authState.accessToken) return;

    try {
      // Upload files
      const imageUrls = [];
      const screenshotUrls = [];

      for (const image of data.images) {
        const uploadResult = await apiClient.uploadFile(image, 'image', authState.accessToken);
        if (uploadResult.url) {
          imageUrls.push(uploadResult.url);
        }
      }

      for (const screenshot of data.screenshots) {
        const uploadResult = await apiClient.uploadFile(screenshot, 'screenshot', authState.accessToken);
        if (uploadResult.url) {
          screenshotUrls.push(uploadResult.url);
        }
      }

      // Submit task
      await apiClient.submitTask(data.workId, {
        reviewText: data.reviewText,
        imageUrls,
        screenshotUrls
      }, authState.accessToken);

      // Reload my tasks
      const tasksData = await apiClient.getMyTasks(authState.accessToken);
      setMyTasks(tasksData);

      setCurrentPage('myworks');
      setSubmissionWorkId(null);
    } catch (error: any) {
      console.error('Error submitting work:', error);
      throw new Error(error.message || '제출 중 오류가 발생했습니다.');
    }
  };

  const handleAuth = (user: User, accessToken: string) => {
    setAuthState({ user, accessToken, isLoading: false });
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      setCurrentPage('dashboard'); // 로그아웃 시 대시보드로 이동
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getSubmissionTask = () => {
    if (!submissionWorkId) return null;
    return myTasks.find(t => t.id === submissionWorkId);
  };

  const getSubmissionWork = () => {
    const task = getSubmissionTask();
    if (!task?.review) return null;
    
    return {
      businessName: task.review.businessName,
      region: task.review.region,
      content: task.review.content,
      reward: task.review.reward,
      deadline: task.review.deadline
    };
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인되지 않은 경우 인증 모달 표시
  if (!authState.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">🎣 낚시터</h1>
            <p className="text-muted-foreground">
              작업자 전용 플랫폼에 오신 것을 환영합니다
            </p>
          </div>
          <Button onClick={() => setIsAuthModalOpen(true)} size="lg">
            로그인하여 시작하기
          </Button>
        </div>
        
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onAuth={handleAuth}
        />
      </div>
    );
  }

  // 대시보드 페이지
  if (currentPage === 'dashboard') {
    return (
      <Dashboard
        user={authState.user}
        myTasks={myTasks}
        onGoToNaksiter={() => setCurrentPage('naksiter')}
        onGoToMyWorks={() => setCurrentPage('myworks')}
        onSignOut={handleSignOut}
      />
    );
  }

  // 내 작업 페이지
  if (currentPage === 'myworks') {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <MyWorksPage
            myTasks={myTasks}
            onBack={() => setCurrentPage('dashboard')}
            onSubmitWork={handleSubmitWork}
          />
        </div>
      </div>
    );
  }

  // 제출 페이지
  if (currentPage === 'submission' && submissionWorkId) {
    const submissionWork = getSubmissionWork();
    if (submissionWork) {
      return (
        <div className="min-h-screen bg-background p-4">
          <div className="max-w-2xl mx-auto">
            <SubmissionForm
              workId={submissionWorkId}
              work={submissionWork}
              onBack={() => setCurrentPage('myworks')}
              onSubmit={handleFormSubmit}
            />
          </div>
        </div>
      );
    }
  }

  // 낚시터 페이지 (기존 메인 페이지)
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPage('dashboard')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-medium">🎣 낚시터</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <UserIcon className="w-4 h-4" />
                <span>{authState.user.name || authState.user.email}</span>
              </div>
              <Button 
                variant="outline"
                onClick={() => setCurrentPage('myworks')}
              >
                내 작업 보기 ({myTasks.length})
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Filter Bar */}
        <FilterBar
          reviewType={reviewType}
          setReviewType={setReviewType}
          region={region}
          setRegion={setRegion}
          sortBy={sortBy}
          setSortBy={setSortBy}
          totalCount={sortedReviews.length}
          onRefresh={handleRefresh}
        />

        {/* Reviews Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>작업 목록을 불러오는 중...</p>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>현재 조건에 맞는 작업이 없습니다.</p>
            <p className="text-sm mt-2">필터를 변경하거나 새로고침을 해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedReviews.map((review) => (
              <ReviewCard
                key={review.id}
                id={review.id}
                businessName={review.businessName}
                region={review.region}
                content={review.content}
                imageUrl={review.imageUrl}
                type={review.type}
                duration={review.duration}
                reward={review.reward}
                registeredDate={review.registeredDate}
                onTakeWork={handleTakeWork}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <WorkDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onAccept={handleAcceptWork}
        work={selectedWork}
      />
    </div>
  );
}