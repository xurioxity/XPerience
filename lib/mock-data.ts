// Mock data for Vercel deployment (since better-sqlite3 doesn't work on serverless)

export const mockCafes = [
  {
    id: 1,
    name: 'GameZone Arena',
    address: 'MG Road, Bangalore - 560001',
    description: 'Premium gaming cafe with high-end hardware and comfortable seating',
    num_pcs: 25,
    gpu_specs: 'NVIDIA RTX 4080',
    cpu_specs: 'Intel Core i9-13900K',
    ram_specs: '32GB DDR5',
    photo_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: 'Cyber Knights Gaming',
    address: 'Koramangala 4th Block, Bangalore - 560034',
    description: 'Esports-ready cafe with tournament hosting facilities',
    num_pcs: 30,
    gpu_specs: 'NVIDIA RTX 4070 Ti',
    cpu_specs: 'AMD Ryzen 9 7950X',
    ram_specs: '32GB DDR5',
    photo_url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800',
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: 'Pixel Paradise',
    address: 'Indiranagar 100 Feet Road, Bangalore - 560038',
    description: 'Cozy gaming lounge with a wide variety of games',
    num_pcs: 20,
    gpu_specs: 'NVIDIA RTX 4060 Ti',
    cpu_specs: 'Intel Core i7-13700K',
    ram_specs: '16GB DDR5',
    photo_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800',
    created_at: new Date().toISOString(),
  },
];

export const mockGames = [
  'Valorant', 'CS:GO', 'Dota 2', 'League of Legends', 'Fortnite',
  'Apex Legends', 'Overwatch 2', 'PUBG', 'GTA V', 'Minecraft',
  'Call of Duty: Warzone', 'Rocket League', 'Rainbow Six Siege'
];

// Generate games for each cafe
export function getGamesForCafe(cafeId: number) {
  return mockGames.map((game, index) => ({
    id: (cafeId - 1) * mockGames.length + index + 1,
    cafe_id: cafeId,
    game_name: game,
  }));
}

// Generate time slots for the next 7 days
export function getSlotsForCafe(cafeId: number) {
  const cafe = mockCafes.find(c => c.id === cafeId);
  if (!cafe) return [];

  const timeSlots = [
    { start: '10:00', end: '12:00' },
    { start: '12:00', end: '14:00' },
    { start: '14:00', end: '16:00' },
    { start: '16:00', end: '18:00' },
    { start: '18:00', end: '20:00' },
    { start: '20:00', end: '22:00' },
    { start: '22:00', end: '00:00' },
  ];

  const slots = [];
  let slotId = (cafeId - 1) * 49 + 1; // 7 days * 7 slots = 49 slots per cafe

  for (let day = 0; day < 7; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    timeSlots.forEach(slot => {
      slots.push({
        id: slotId++,
        cafe_id: cafeId,
        date: dateStr,
        start_time: slot.start,
        end_time: slot.end,
        available_pcs: cafe.num_pcs,
        is_available: 1,
        remaining_pcs: cafe.num_pcs,
        is_bookable: true,
      });
    });
  }

  return slots;
}

// In-memory bookings storage (will reset on each deployment, but works for demo)
export const mockBookings: Array<{
  id: number;
  slot_id: number;
  cafe_id: number;
  user_name: string;
  user_email: string;
  gaming_handle: string;
  num_pcs: number;
  status: string;
  created_at: string;
}> = [];

let nextBookingId = 1;

export function addBooking(booking: {
  slot_id: number;
  cafe_id: number;
  user_name: string;
  user_email: string;
  gaming_handle: string;
  num_pcs: number;
}) {
  const newBooking = {
    ...booking,
    id: nextBookingId++,
    status: 'confirmed',
    created_at: new Date().toISOString(),
  };
  mockBookings.push(newBooking);
  return newBooking;
}

export function getBookingsByEmail(email: string) {
  return mockBookings.filter(b => b.user_email === email);
}

export function getBookingsByCafe(cafeId: number) {
  return mockBookings.filter(b => b.cafe_id === cafeId);
}

// Check if we're running on Vercel
export const isVercel = process.env.VERCEL === '1';

