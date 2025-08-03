import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-73d292b7`;

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      console.log(`Making API request to: ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error (${response.status}):`, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`API response from ${endpoint}:`, data);
      return data;
    } catch (error) {
      console.error(`Error making request to ${endpoint}:`, error);
      throw error;
    }
  }

  // 리뷰 목록 조회
  async fetchReviews() {
    return this.makeRequest<any[]>('/reviews');
  }

  // 작업 수락
  async acceptWork(reviewId: string, accessToken: string) {
    return this.makeRequest<{ success: boolean; taskId: string }>('/accept-work', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ reviewId }),
    });
  }

  // 내 작업 목록 조회
  async getMyTasks(accessToken: string) {
    return this.makeRequest<any[]>('/my-tasks', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
  }

  // 파일 업로드
  async uploadFile(file: File, type: 'image' | 'screenshot', accessToken: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const url = `${API_BASE_URL}/upload`;
    
    try {
      console.log(`Uploading file to: ${url}`);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Upload Error (${response.status}):`, errorText);
        throw new Error(`Upload failed: ${errorText}`);
      }

      const data = await response.json();
      console.log('Upload response:', data);
      return data;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  // 작업 제출
  async submitTask(
    taskId: string,
    submission: {
      reviewText: string;
      imageUrls: string[];
      screenshotUrls: string[];
    },
    accessToken: string
  ) {
    return this.makeRequest<{ success: boolean }>('/submit-task', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        taskId,
        reviewText: submission.reviewText,
        imageUrls: submission.imageUrls,
        screenshotUrls: submission.screenshotUrls,
      }),
    });
  }

  // 사용자 회원가입
  async signUp(email: string, password: string, name: string) {
    return this.makeRequest<{ user: any }>('/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // 헬스 체크
  async healthCheck() {
    return this.makeRequest<{ status: string; timestamp: string }>('/health');
  }

  // 초기 데이터 생성 (개발용)
  async initializeData() {
    return this.makeRequest<{ message: string }>('/initialize', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient();