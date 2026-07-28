export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  role: "student" | "moderator" | "admin";
}

export interface FavoriteNote {
  id: string;
  title: string;
  description: string | null;
  file_type: string;
  semester: number;
  downloads_count: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  notes: FavoriteNote | null;
}

export interface Note {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_type: string;
  file_size: number;
  semester: number;
  status: "draft" | "pending_review" | "approved" | "rejected" | "removed";
  downloads_count: number;
  view_count: number;
  bookmarks_count: number;
  average_rating: number;
  total_ratings: number;
  total_reviews: number;
  created_at: string;
  subjects?: { name: string; branches?: { name: string } };
  profiles?: { name: string };
}

export interface DashboardProps {
  profile: Profile | null;
  notes: Note[];
  favorites: Favorite[];
  recentlyViewed: any[];
  searchQuery: string;
  filteredNotes: Note[];
  handleClearHistory: () => Promise<void>;
  isClearingHistory: boolean;
}
