export interface UserStats {
  streakCount: number;
  dueCardsCount: number;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string | null; // matches backend key exactly
  stats: UserStats;
}

export interface NavbarApiResponse {
  status: 'success' | 'error';
  data: UserProfile;
}