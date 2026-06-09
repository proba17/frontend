import type {
  AdminResult,
  AdminStatistics,
  AdminUser,
  Level,
  LevelCreate,
  ResultCreate,
  TokenResponse,
  Topic,
  User,
  UserAchievement,
  UserAchievementFull,
  UserStatistics,
  TopicCreate,
  TopicUpdate,
  UserResult,
  LeaderboardItem,
  FinalTestQuestion,
  FinalTestResult,
} from '../types';

const API_URL = 'http://localhost:8000';

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

function setToken(token: string): void {
  localStorage.setItem('access_token', token);
}

export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('lastPage');
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

 const headers = new Headers(options.headers);

headers.set('Content-Type', 'application/json');

if (token) {
  headers.set('Authorization', `Bearer ${token}`);
}

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message = errorData?.detail || 'Ошибка запроса к серверу';
    throw new Error(message);
  }

  return response.json();
}

export async function registerUser(
  username: string,
  email: string,
  password: string
): Promise<User> {
  return request<User>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export async function loginUser(
  username: string,
  password: string
): Promise<TokenResponse> {
  const result = await request<TokenResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  setToken(result.access_token);
  return result;
}

export async function getMe(): Promise<User> {
  return request<User>('/auth/me');
}

export async function getLevels(): Promise<Level[]> {
  return request<Level[]>('/levels/');
}

export async function getLevel(id: number): Promise<Level> {
  return request<Level>(`/levels/${id}`);
}

export async function getTopics(): Promise<Topic[]> {
  return request<Topic[]>('/topics/');
}

export async function getTopic(id: number): Promise<Topic> {
  return request<Topic>(`/topics/${id}`);
}

export async function saveResult(data: ResultCreate) {
  return request('/results/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMyStatistics(): Promise<UserStatistics> {
  return request<UserStatistics>('/results/statistics');
}

export async function getMyAchievements(): Promise<UserAchievement[]> {
  return request<UserAchievement[]>('/achievements/my');
}

export async function getMyAchievementsFull(): Promise<UserAchievementFull[]> {
  return request<UserAchievementFull[]>('/achievements/my/full');
}

export async function checkAchievements() {
  return request('/achievements/check', {
    method: 'POST',
  });
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>('/admin/users');
}

export async function getAdminStatistics(): Promise<AdminStatistics> {
  return request<AdminStatistics>('/admin/statistics');
}

export async function getAdminResults(): Promise<AdminResult[]> {
  return request<AdminResult[]>('/admin/results');
}

export async function createLevel(data: LevelCreate): Promise<Level> {
  return request<Level>('/levels/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLevel(
  id: number,
  data: Partial<LevelCreate>
): Promise<Level> {
  return request<Level>(`/levels/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLevel(id: number): Promise<{ message: string; level_id: number }> {
  return request<{ message: string; level_id: number }>(`/levels/${id}`, {
    method: 'DELETE',
  });
}

export async function createTopic(data: TopicCreate): Promise<Topic> {
  return request<Topic>('/topics/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateTopic(
  id: number,
  data: TopicUpdate
): Promise<Topic> {
  return request<Topic>(`/topics/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteTopic(id: number): Promise<{ message: string; topic_id: number }> {
  return request<{ message: string; topic_id: number }>(`/topics/${id}`, {
    method: 'DELETE',
  });
}

export async function getMyResults(): Promise<UserResult[]> {
  return request<UserResult[]>('/results/my');
}



export async function getLevelTopic(levelId: number): Promise<Topic> {
  return request<Topic>(`/levels/${levelId}/topic`);
}

export async function getTeacherStatistics(): Promise<AdminStatistics> {
  return request<AdminStatistics>('/teacher/statistics');
}

export async function getTeacherUsers(): Promise<AdminUser[]> {
  return request<AdminUser[]>('/teacher/users');
}

export async function getTeacherResults(): Promise<AdminResult[]> {
  return request<AdminResult[]>('/teacher/results');
}

export async function getLeaderboard(): Promise<LeaderboardItem[]> {
  return request<LeaderboardItem[]>('/leaderboard/');
}

export async function updateUserRole(
  userId: number,
  role: string
): Promise<AdminUser> {
  return request<AdminUser>(`/admin/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role }),
  });
}

export async function refreshToken(): Promise<void> {
  const response = await request<{
    access_token: string;
    token_type: string;
  }>('/auth/refresh-token', {
    method: 'POST',
  });

  localStorage.setItem('access_token', response.access_token);
}

export async function deleteMyAccount(): Promise<{ message: string }> {
  return request('/auth/me', {
    method: 'DELETE',
  });
}

export async function getFinalTestQuestions(): Promise<FinalTestQuestion[]> {
  return request<FinalTestQuestion[]>(
    '/final-test/questions'
  );
}

export async function submitFinalTest(
  data: unknown
): Promise<FinalTestResult> {

  return request<FinalTestResult>(
    '/final-test/submit',
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
}

export interface FinalTestStatistics {
  attempts: number;

  best_score: number;

  average_score: number;

  last_score: number;

  certificate: string;
}

export async function getFinalTestStatistics():
Promise<FinalTestStatistics> {

  return request<FinalTestStatistics>(
    '/final-test/statistics'
  );
}


export async function downloadCertificate() {

  const token =
    localStorage.getItem(
      'access_token'
    );

  const response =
    await fetch(
      `${API_URL}/certificate/pdf`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  const blob =
    await response.blob();

  const url =
    window.URL.createObjectURL(
      blob
    );

  const a =
    document.createElement('a');

  a.href = url;

  a.download =
    'certificate.pdf';

  a.click();

  window.URL.revokeObjectURL(
    url
  );
}

export async function getFinalTestDifficulty(): Promise<{
  accuracy: number;
  questions_count: number;
  level: string;
}> {

  return request<{
    accuracy: number;
    questions_count: number;
    level: string;
  }>(
    '/final-test/difficulty'
  );
}

