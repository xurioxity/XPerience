import { CafeDetails } from '@/components/cafe-details';
import { BookingForm } from '@/components/booking-form';
import { mockCafes, getGamesForCafe } from '@/lib/mock-data';

// Get cafe by ID using mock data
function getCafe(id: string) {
  const cafeId = parseInt(id);
  const cafe = mockCafes.find(c => c.id === cafeId);
  
  if (!cafe) return null;
  
  return {
    ...cafe,
    games: getGamesForCafe(cafeId),
  };
}

export default async function CafePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cafe = getCafe(id);

  if (!cafe) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Café Not Found
        </h1>
        <p className="text-gray-600">
          The café you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main content - 2/3 width on large screens */}
      <div className="lg:col-span-2 space-y-6">
        <CafeDetails cafe={cafe} />
      </div>

      {/* Booking sidebar - 1/3 width on large screens */}
      <div className="lg:col-span-1">
        <div className="sticky top-8">
          <BookingForm cafeId={cafe.id} cafeName={cafe.name} />
        </div>
      </div>
    </div>
  );
}
