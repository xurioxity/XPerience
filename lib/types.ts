// Database types
export interface Cafe {
  id: number;
  name: string;
  address: string;
  description: string | null;
  num_pcs: number;
  gpu_specs: string;
  cpu_specs: string | null;
  ram_specs: string | null;
  photo_url: string | null;
  created_at: string;
}

export interface Game {
  id: number;
  cafe_id: number;
  game_name: string;
}

export interface TimeSlot {
  id: number;
  cafe_id: number;
  date: string;
  start_time: string;
  end_time: string;
  available_pcs: number;
  is_available: number;
}

export interface Booking {
  id: number;
  slot_id: number;
  cafe_id: number;
  user_name: string;
  user_email: string;
  gaming_handle: string;
  num_pcs: number;
  status: string;
  created_at: string;
}

export interface Owner {
  id: number;
  cafe_id: number;
  username: string;
  password_hash: string;
  email: string | null;
  created_at: string;
}

// Extended types with joined data
export interface CafeWithGames extends Cafe {
  games: Game[];
}

export interface BookingWithDetails extends Booking {
  cafe_name: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface SlotWithBookings extends TimeSlot {
  booking_count: number;
}

