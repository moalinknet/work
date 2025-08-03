import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS 설정
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 로깅 설정
app.use('*', logger(console.log));

// Supabase 클라이언트 생성
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// 스토리지 버킷 초기화
async function initializeStorage() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const imageBucketExists = buckets?.some(bucket => bucket.name === 'make-73d292b7-images');
    if (!imageBucketExists) {
      await supabase.storage.createBucket('make-73d292b7-images', { public: false });
      console.log('Images bucket created');
    }

    const screenshotBucketExists = buckets?.some(bucket => bucket.name === 'make-73d292b7-screenshots');
    if (!screenshotBucketExists) {
      await supabase.storage.createBucket('make-73d292b7-screenshots', { public: false });
      console.log('Screenshots bucket created');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

// 샘플 데이터 초기화
async function initializeSampleData() {
  try {
    // 기존 리뷰 데이터가 있는지 확인
    const existingReviews = await kv.getByPrefix('review:');
    if (existingReviews.length > 0) {
      console.log('Sample data already exists');
      return;
    }

    const sampleReviews = [
      {
        id: 'review-1',
        businessName: '맛집카페 강남점',
        region: '서울 강남구',
        content: '새로 오픈한 카페 방문 후기 작성',
        fullDescription: '강남역 근처에 새로 오픈한 프리미엄 카페입니다. 인테리어와 커피 맛, 서비스에 대한 솔직한 후기를 작성해 주세요.',
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
        type: 'general',
        duration: '1-2시간',
        reward: 15000,
        registeredDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: ['실제 방문 필수', '음료 1잔 이상 주문', '사진 3장 이상'],
        restrictions: ['가족/지인 동반 불가', '할인 쿠폰 사용 금지'],
        verificationMethod: '영수증 및 매장 내부 사진',
        status: 'available'
      },
      {
        id: 'review-2',
        businessName: '치킨집 홍대점',
        region: '서울 마포구',
        content: '치킨 맛집 리뷰 작성',
        fullDescription: '홍대 근처 인기 치킨집 방문 후기입니다. 맛과 양, 가격 대비 만족도를 중심으로 리뷰해 주세요.',
        imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400',
        type: 'premium',
        duration: '2-3시간',
        reward: 25000,
        registeredDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: ['실제 주문 및 식사', '치킨 1마리 이상 주문', '사진 5장 이상'],
        restrictions: ['배달 주문 불가', '포장 주문 불가', '매장 내 식사만 가능'],
        verificationMethod: '주문 영수증 및 음식 사진',
        status: 'available'
      },
      {
        id: 'review-3',
        businessName: '헬스장 잠실점',
        region: '서울 송파구',
        content: '헬스장 이용 후기 작성',
        fullDescription: '잠실 롯데월드몰 근처 헬스장 1일 이용권으로 이용 후기를 작성해 주세요.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        type: 'general',
        duration: '2-3시간',
        reward: 20000,
        registeredDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: ['1일 이용권 구매', '실제 운동 1시간 이상', '시설 사진 촬영'],
        restrictions: ['PT 수강 불가', '락커룸 사진 촬영 금지'],
        verificationMethod: '이용권 구매 영수증 및 운동 인증샷',
        status: 'available'
      }
    ];

    // 샘플 리뷰 데이터 저장
    for (const review of sampleReviews) {
      await kv.set(`review:${review.id}`, review);
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// 앱 시작 시 초기화
initializeStorage();
initializeSampleData();

// 리뷰 목록 조회
app.get('/make-server-73d292b7/reviews', async (c) => {
  try {
    console.log('Fetching reviews from KV store...');
    const reviews = await kv.getByPrefix('review:');
    
    // 사용 가능한 리뷰만 필터링
    const availableReviews = reviews.filter(review => review.status === 'available');
    
    console.log(`Found ${availableReviews.length} available reviews`);
    return c.json(availableReviews);
  } catch (error) {
    console.error('Error fetching reviews from KV store:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// 작업 수락
app.post('/make-server-73d292b7/accept-work', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      console.error('Authorization error during work acceptance:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { reviewId } = await c.req.json();
    
    // 리뷰 정보 가져오기
    const review = await kv.get(`review:${reviewId}`);
    if (!review) {
      return c.json({ error: 'Review not found' }, 404);
    }

    if (review.status !== 'available') {
      return c.json({ error: 'Review is no longer available' }, 400);
    }

    // 작업(Task) 생성
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const task = {
      id: taskId,
      reviewId: reviewId,
      workerId: user.id,
      status: 'writing',
      acceptedAt: new Date().toISOString(),
      review: review
    };

    await kv.set(`task:${taskId}`, task);
    await kv.set(`user_task:${user.id}:${taskId}`, taskId);

    // 리뷰 상태를 assigned로 변경
    review.status = 'assigned';
    await kv.set(`review:${reviewId}`, review);

    console.log(`Work accepted: ${reviewId} by user ${user.id}`);
    return c.json({ success: true, taskId: taskId });
  } catch (error) {
    console.error('Error in accept-work endpoint:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 내 작업 목록 조회
app.get('/make-server-73d292b7/my-tasks', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      console.error('Authorization error during my tasks fetch:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    console.log(`Fetching tasks for user: ${user.id}`);
    
    // 사용자의 모든 작업 ID 가져오기
    const userTaskIds = await kv.getByPrefix(`user_task:${user.id}:`);
    console.log(`Found ${userTaskIds.length} task IDs for user`);
    
    // 각 작업의 상세 정보 가져오기
    const tasks = [];
    for (const taskId of userTaskIds) {
      const task = await kv.get(`task:${taskId}`);
      if (task) {
        tasks.push(task);
      }
    }

    console.log(`Loaded ${tasks.length} tasks for user`);
    return c.json(tasks);
  } catch (error) {
    console.error('Error in my-tasks endpoint:', error);
    return c.json({ error: 'Failed to fetch tasks' }, 500);
  }
});

// 파일 업로드
app.post('/make-server-73d292b7/upload', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      console.error('Authorization error during file upload:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const fileType = formData.get('type') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    const bucketName = fileType === 'screenshot' ? 'make-73d292b7-screenshots' : 'make-73d292b7-images';
    const fileName = `${user.id}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading file:', error);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Generate signed URL
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 365 * 24 * 60 * 60); // 1 year

    return c.json({ 
      path: data.path,
      url: signedUrlData?.signedUrl
    });
  } catch (error) {
    console.error('Error in upload endpoint:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 작업 제출
app.post('/make-server-73d292b7/submit-task', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'Authorization token required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (!user || authError) {
      console.error('Authorization error during task submission:', authError);
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { taskId, reviewText, imageUrls, screenshotUrls } = await c.req.json();

    // 작업 정보 가져오기
    const task = await kv.get(`task:${taskId}`);
    if (!task) {
      return c.json({ error: 'Task not found' }, 404);
    }

    if (task.workerId !== user.id) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    // 작업 상태 업데이트
    task.status = 'submitted';
    task.submittedAt = new Date().toISOString();
    task.reviewText = reviewText;
    task.imageUrls = imageUrls;
    task.screenshotUrls = screenshotUrls;

    await kv.set(`task:${taskId}`, task);

    console.log(`Task submitted: ${taskId} by user ${user.id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in submit-task endpoint:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 사용자 회원가입
app.post('/make-server-73d292b7/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true // 이메일 서버 설정이 되어있지 않으므로 자동 확인
    });

    if (error) {
      console.error('Error creating user during signup:', error);
      return c.json({ error: error.message }, 400);
    }

    // 사용자 프로필 정보를 KV에 저장
    const userProfile = {
      id: data.user.id,
      email: data.user.email,
      name: name,
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${data.user.id}`, userProfile);

    return c.json({ 
      user: {
        id: data.user.id,
        email: data.user.email,
        name
      }
    });
  } catch (error) {
    console.error('Error in signup endpoint:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// 헬스 체크
app.get('/make-server-73d292b7/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 초기 데이터 생성 (개발용)
app.post('/make-server-73d292b7/initialize', async (c) => {
  try {
    await initializeSampleData();
    return c.json({ message: 'Database initialized with sample data' });
  } catch (error) {
    console.error('Error initializing data:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

// 404 핸들러
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

// 에러 핸들러
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

Deno.serve(app.fetch);