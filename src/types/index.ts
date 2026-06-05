export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface Topic {
  id: number;
  title: string;
  short_description: string | null;
  content: string;
  category: string | null;
  order_number: number;
  is_active: boolean;
}

export interface Level {
  id: number;
  title: string;
  description: string | null;

  topic: string | null;
  topic_id: number | null;

  campaign: string | null;
  order_number: number;

  difficulty: string;

  base_health: number;
  start_resources: number;

  map_config: {
    path: Array<{ x: number; y: number }>;
    base: { x: number; y: number };
    width: number;
    height: number;
  } | null;

  waves_config: Array<Record<string, unknown>> | null;
  defense_config: Array<Record<string, unknown>> | null;

  is_active: boolean;
}

export interface ResultCreate {
  level_id: number;
  score: number;
  completed: number;
  enemies_destroyed: number;
  damage_taken: number;
  time_spent: number;
  correct_blocks: number;
  false_positives: number;
  allowed_normal_traffic: number;
  accuracy: number;
}

export interface UserStatistics {
  levels_completed: number;
  total_score: number;
  best_score: number;
  total_enemies_destroyed: number;
  total_damage_taken: number;
  total_time_spent: number;
  total_correct_blocks: number;
total_false_positives: number;
total_allowed_normal_traffic: number;
average_accuracy: number;
}

export interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  earned_at: string;
}

export interface UserAchievementFull {
  id: number;
  achievement_id: number;
  title: string;
  description: string | null;
  condition_type: string;
  icon: string | null;
  earned_at: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AdminStatistics {
  users_count: number;
  levels_count: number;
  results_count: number;
  completed_levels_count: number;
  average_score: number;
  best_score: number;
  total_enemies_destroyed: number;
  total_damage_taken: number;
  total_time_spent: number;
  average_accuracy: number;
total_correct_blocks: number;
total_false_positives: number;
total_allowed_normal_traffic: number;
}

export interface AdminResult {
  id: number;
  user_id: number;
  level_id: number;
  score: number;
  completed: number;
  enemies_destroyed: number;
  damage_taken: number;
  time_spent: number;

  correct_blocks: number;
  false_positives: number;
  allowed_normal_traffic: number;
  accuracy: number;

  created_at: string;
}

export interface LevelCreate {
  title: string;
  description: string | null;

  topic: string | null;
  topic_id: number | null;

  campaign: string | null;
  order_number: number;

  difficulty: string;

  base_health: number;
  start_resources: number;

  map_config: {
    path: Array<{ x: number; y: number }>;
    base: { x: number; y: number };
    width: number;
    height: number;
  };

  waves_config: Array<Record<string, unknown>>;
  defense_config: Array<Record<string, unknown>>;
}

export interface TopicCreate {
  title: string;
  short_description: string | null;
  content: string;
  category: string | null;
  order_number: number;
}

export interface TopicUpdate {
  title?: string;
  short_description?: string | null;
  content?: string;
  category?: string | null;
  order_number?: number;
  is_active?: boolean;
}

export interface UserResult {
  id: number;
  user_id: number;
  level_id: number;
  score: number;
  completed: number;
  enemies_destroyed: number;
  damage_taken: number;
  time_spent: number;

  correct_blocks: number;
  false_positives: number;
  allowed_normal_traffic: number;
  accuracy: number;
}

export interface LeaderboardItem {
  place: number;
  user_id: number;
  username: string;
  best_score: number;
  average_accuracy: number;
  total_correct_blocks: number;
  total_false_positives: number;
  completed_levels: number;
}