export interface Achievement {
  id: number;
  year: number;
  month: number;
  title: string;
  file_url: string | null;
}

export interface AchievementForm {
  year: number;
  month: number;
  title: string;
  file?: File;
}
