export interface User {
  id: string;
  email: string;
  name: string | null;
  photoUrl: string | null;
  preferredBudget: number | null;
  preferredAmenities: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  pricePerDay: number;
  pricePerMonth: number;
  wifiSpeed: number;
  parking: boolean;
  cafeteria: boolean;
  meetingRooms: boolean;
  chargingPorts: boolean;
  noiseLevel: 'Low' | 'Medium' | 'High' | string;
  washroomRating: number;
  trafficScore: number;
  metroDistance: number;
  availableSeats: number;
  rating: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
  reviews?: Review[];
  workspaceAmenities?: WorkspaceAmenity[];
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
}

export interface WorkspaceAmenity {
  workspaceId: string;
  amenityId: string;
  amenity?: Amenity;
}

export interface Review {
  id: string;
  userId: string;
  workspaceId: string;
  rating: number;
  comment: string;
  pros: string[];
  cons: string[];
  createdAt: string;
  user?: User;
}

export interface Booking {
  id: string;
  userId: string;
  workspaceId: string;
  date: string;
  time: string;
  teamSize: number;
  purpose: string;
  status: 'Pending' | 'Confirmed' | 'Cancelled' | string;
  createdAt: string;
  workspace?: Workspace;
  user?: User;
}

export interface Favorite {
  userId: string;
  workspaceId: string;
  createdAt: string;
  workspace?: Workspace;
}

export interface Location {
  id: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  createdAt: string;
  recommendedWorkspaces?: Workspace[];
}

export interface RecommendationResult {
  workspace: Workspace;
  score: number;
  reasons: string[];
  scoreBreakdown: {
    wifi: number;
    budget: number;
    distance: number;
    traffic: number;
    noise: number;
    washroom: number;
    cafeteria: number;
    parking: number;
  };
}
