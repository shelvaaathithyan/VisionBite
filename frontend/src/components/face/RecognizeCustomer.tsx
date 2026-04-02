import React, { useMemo, useState } from 'react';
import { Scan, History, Users } from 'lucide-react';
import GroupWebcamCapture from './GroupWebcamCapture';
import { customerService } from '../../services/api';
import { FaceRecognitionResult, FoodItem, GroupFaceRecognitionResponse } from '../../types/customer';

interface CapturedFaceInput {
  descriptor: number[];
  emotion: string;
  previewImage?: string;
}

interface GroupRecognitionCard {
  recognition: FaceRecognitionResult;
  detectedMood: string;
  recommendations: FoodItem[];
}

interface UnknownFace {
  index: number;
  descriptor: number[];
  emotion: string;
  previewImage?: string;
}

interface UnknownFaceForm {
  name: string;
  phone: string;
  email: string;
  isSaving: boolean;
}

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatInr = (amount: number) => inrFormatter.format(amount);

const LEGACY_ORDER_PRICE_MAP: Record<string, { name: string; inrPrice: number }> = {
  '8.50': { name: 'Smoky Paneer Tikka', inrPrice: 120 },
  '7.25': { name: 'Crispy Corn Pepper', inrPrice: 131 },
  '7.95': { name: 'Garlic Herb Mushrooms', inrPrice: 142 },
  '9.75': { name: 'Peri Peri Chicken Bites', inrPrice: 153 },
  '6.90': { name: 'Classic Bruschetta', inrPrice: 164 },
  '8.20': { name: 'Nacho Fiesta Bowl', inrPrice: 175 },
  '10.25': { name: 'Spicy Buffalo Wings', inrPrice: 186 },
  '8.15': { name: 'Avocado Hummus Platter', inrPrice: 197 },
  '13.50': { name: 'Butter Chicken Rice Bowl', inrPrice: 208 },
  '12.40': { name: 'Veggie Lasagna Slice', inrPrice: 219 },
  '12.95': { name: 'Thai Green Curry Noodles', inrPrice: 230 },
  '14.25': { name: 'Mushroom Truffle Pasta', inrPrice: 241 },
  '15.75': { name: 'Grilled Herb Fish Fillet', inrPrice: 121 },
  '12.70': { name: 'Paneer Butter Masala', inrPrice: 132 },
  '13.20': { name: 'Chicken Shawarma Plate', inrPrice: 143 },
  '11.95': { name: 'Mexican Burrito Supreme', inrPrice: 154 },
  '11.60': { name: 'Teriyaki Tofu Stir Fry', inrPrice: 165 },
  '12.80': { name: 'Classic Margherita Pizza', inrPrice: 176 },
  '13.90': { name: 'Spicy Chicken Pizza', inrPrice: 187 },
  '11.25': { name: 'Quinoa Power Bowl', inrPrice: 198 },
  '6.75': { name: 'Classic Tiramisu Cup', inrPrice: 209 },
  '5.95': { name: 'Double Chocolate Brownie', inrPrice: 220 },
  '7.10': { name: 'Blueberry Cheesecake', inrPrice: 231 },
  '6.40': { name: 'Mango Sticky Rice', inrPrice: 242 },
  '6.80': { name: 'Vanilla Bean Panna Cotta', inrPrice: 122 },
  '6.20': { name: 'Choco Hazelnut Sundae', inrPrice: 133 },
  '6.50': { name: 'Caramel Apple Pie', inrPrice: 144 },
  '4.90': { name: 'Pistachio Kulfi Stick', inrPrice: 155 },
  '3.25': { name: 'Iced Americano', inrPrice: 166 },
  '4.95': { name: 'Mocha Frappuccino', inrPrice: 177 },
  '2.85': { name: 'Classic Masala Chai', inrPrice: 188 },
  '3.60': { name: 'Fresh Mint Lemon Cooler', inrPrice: 199 },
  '4.40': { name: 'Berry Kombucha Sparkle', inrPrice: 210 },
  '5.50': { name: 'Salted Caramel Milkshake', inrPrice: 221 },
  '3.10': { name: 'Tropical Coconut Water', inrPrice: 232 },
  '3.90': { name: 'Spiced Tomato Soup Shot', inrPrice: 243 },
  '3.95': { name: 'Herb Garlic Bread', inrPrice: 123 },
  '4.60': { name: 'Crispy Waffle Fries', inrPrice: 134 },
  '4.20': { name: 'Sauteed Butter Veggies', inrPrice: 145 },
  '2.90': { name: 'Steamed Jasmine Rice', inrPrice: 156 },
  '3.30': { name: 'Tangy Coleslaw Cup', inrPrice: 167 },
  '4.35': { name: 'Roasted Baby Potatoes', inrPrice: 178 },
  '4.75': { name: 'Classic Caesar Side Salad', inrPrice: 189 },
  '4.55': { name: 'Spicy Kimchi Slaw', inrPrice: 200 },
  '18.50': { name: 'Chef Special Platter One', inrPrice: 211 },
  '20.95': { name: 'Chef Special Platter Two', inrPrice: 222 },
  '16.75': { name: 'Weekend Brunch Signature', inrPrice: 233 },
  '14.80': { name: 'Festival Sweet Sampler', inrPrice: 244 },
  '13.65': { name: 'Midnight Craving Combo', inrPrice: 124 },
  '15.40': { name: 'Detox Wellness Plate', inrPrice: 135 },
};

const getLegacyFallback = (price: number) => {
  if (!Number.isFinite(price)) {
    return null;
  }

  return LEGACY_ORDER_PRICE_MAP[price.toFixed(2)] || null;
};

const getOrderItemChips = (order: any): string[] => {
  const items = Array.isArray(order?.items) ? order.items : [];

  return items
    .map((item: any) => {
      const foodItem = item?.foodItem;
      const fallback = getLegacyFallback(Number(item?.price));
      const name = typeof foodItem?.name === 'string'
        ? foodItem.name
        : fallback?.name || 'Menu Item';
      const quantity = Number(item?.quantity || 0);
      return quantity > 0 ? `${name} x${quantity}` : name;
    })
    .filter(Boolean)
    .filter(Boolean);
};

const getCorrectOrderTotal = (order: any) => {
  const items = Array.isArray(order?.items) ? order.items : [];

  const computed = items.reduce((sum: number, item: any) => {
    const quantity = Number(item?.quantity || 0);
    if (quantity <= 0) {
      return sum;
    }

    // Prefer latest populated menu price. For legacy orders with null refs, map old price to INR.
    const currentPrice = Number(item?.foodItem?.price);
    const fallbackPrice = Number(item?.price);
    const legacyFallback = getLegacyFallback(fallbackPrice);
    const unitPrice = Number.isFinite(currentPrice) && currentPrice > 0
      ? currentPrice
      : typeof legacyFallback?.inrPrice === 'number'
        ? legacyFallback.inrPrice
        : Number.isFinite(fallbackPrice) && fallbackPrice > 0
          ? fallbackPrice
          : 0;

    return sum + unitPrice * quantity;
  }, 0);

  if (computed > 0) {
    return computed;
  }

  const totalFallback = Number(order?.totalAmount || 0);
  const mappedLegacyTotal = getLegacyFallback(totalFallback);
  return mappedLegacyTotal?.inrPrice || totalFallback;
};

const RecognizeCustomer: React.FC = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const [hasNewEnrollments, setHasNewEnrollments] = useState(false);
  const [groupResults, setGroupResults] = useState<GroupRecognitionCard[]>([]);
  const [unknownFaces, setUnknownFaces] = useState<UnknownFace[]>([]);
  const [unknownFaceForms, setUnknownFaceForms] = useState<Record<number, UnknownFaceForm>>({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const getFaceEmotionByIndex = (faces: CapturedFaceInput[], index?: number) => {
    if (typeof index === 'number' && faces[index]) {
      return faces[index].emotion || 'neutral';
    }
    return 'neutral';
  };

  const getInitialUnknownFaceForms = (faces: UnknownFace[]) => {
    const forms: Record<number, UnknownFaceForm> = {};
    for (const face of faces) {
      forms[face.index] = {
        name: '',
        phone: '',
        email: '',
        isSaving: false,
      };
    }
    return forms;
  };

  const updateUnknownForm = (index: number, updates: Partial<UnknownFaceForm>) => {
    setUnknownFaceForms((current) => ({
      ...current,
      [index]: {
        ...(current[index] || { name: '', phone: '', email: '', isSaving: false }),
        ...updates,
      },
    }));
  };

  const handleGroupCapture = async (faces: CapturedFaceInput[]) => {
    setShowCamera(false);
    setRecognizing(true);
    setHasNewEnrollments(false);
    setMessage({ type: '', text: '' });
    setGroupResults([]);
    setUnknownFaces([]);
    setUnknownFaceForms({});

    try {
      const batchResponse = await customerService.recognizeCustomersBatch(faces.map((face) => face.descriptor));
      const data = batchResponse.data as GroupFaceRecognitionResponse;
      const recognizedResults = data.results as FaceRecognitionResult[];

      const unmatchedIndices = data.unmatchedDescriptorIndices || [];
      const unmatchedFaces = unmatchedIndices
        .filter((index) => index >= 0 && index < faces.length)
        .map((index) => ({
          index,
          descriptor: faces[index].descriptor,
          emotion: faces[index].emotion,
          previewImage: faces[index].previewImage,
        }));

      setUnknownFaces(unmatchedFaces);
      setUnknownFaceForms(getInitialUnknownFaceForms(unmatchedFaces));

      if (recognizedResults.length === 0) {
        setMessage({
          type: 'warning',
          text: `No enrolled customers recognized from this group. ${unmatchedFaces.length} face(s) can be enrolled below.`,
        });
        return;
      }

      const cards = await Promise.all(
        recognizedResults.map(async (result) => {
          const detectedMood = getFaceEmotionByIndex(faces, result.matchedDescriptorIndex);
          const recResponse = await customerService.getRecommendations(result.customer.id, detectedMood);
          return {
            recognition: result,
            detectedMood,
            recommendations: recResponse.data.recommendations as FoodItem[],
          } as GroupRecognitionCard;
        })
      );

      setGroupResults(cards);
      setMessage({
        type: 'success',
        text: `Detected ${faces.length} face(s). Recognized ${data.recognizedCount} customer(s), ${data.unrecognizedCount} not recognized.`,
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Group recognition failed',
      });
    } finally {
      setRecognizing(false);
    }
  };

  const handleEnrollUnknownFace = async (unknownFace: UnknownFace) => {
    const form = unknownFaceForms[unknownFace.index];
    if (!form?.name?.trim()) {
      setMessage({
        type: 'error',
        text: `Please enter a name for Face #${unknownFace.index + 1}`,
      });
      return;
    }

    if (!form.phone.trim() || !form.email.trim()) {
      setMessage({
        type: 'error',
        text: `Phone and email are required for Face #${unknownFace.index + 1}`,
      });
      return;
    }

    try {
      updateUnknownForm(unknownFace.index, { isSaving: true });
      await customerService.enrollCustomer({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        preferences: [],
        dietaryRestrictions: [],
        faceDescriptor: unknownFace.descriptor,
      });

      setUnknownFaces((current) => current.filter((face) => face.index !== unknownFace.index));
      setUnknownFaceForms((current) => {
        const next = { ...current };
        delete next[unknownFace.index];
        return next;
      });

      setMessage({
        type: 'success',
        text: `Face #${unknownFace.index + 1} enrolled successfully. Run group scan again to include them in recommendations.`,
      });
      setHasNewEnrollments(true);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || `Failed to enroll Face #${unknownFace.index + 1}`,
      });
    } finally {
      updateUnknownForm(unknownFace.index, { isSaving: false });
    }
  };

  const handleRescanNow = () => {
    setMessage({ type: '', text: '' });
    setShowCamera(true);
  };

  const totalRecognized = useMemo(() => groupResults.length, [groupResults.length]);

  return (
    <div className="space-y-6">
      {/* Recognition Section */}
      <div className="rounded-2xl border border-slate-500/30 bg-transparent p-6 shadow-xl shadow-slate-950/10 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <Scan className="text-blue-300" size={28} />
          <h2 className="text-4xl font-bold text-white">Recognize Group Customers</h2>
        </div>

        {message.text && (
          <div
            className={`mb-4 p-4 rounded-lg ${
              message.type === 'success'
                ? 'border border-emerald-400/35 bg-emerald-500/20 text-emerald-100'
                : message.type === 'warning'
                ? 'border border-amber-400/35 bg-amber-500/20 text-amber-100'
                : 'border border-rose-400/35 bg-rose-500/20 text-rose-100'
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          onClick={() => setShowCamera(true)}
          disabled={recognizing}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-xl font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Users size={20} />
          {recognizing ? 'Recognizing Group...' : 'Start Group Recognition'}
        </button>

        {hasNewEnrollments && (
          <button
            type="button"
            onClick={handleRescanNow}
            className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xl font-semibold text-white transition hover:bg-emerald-500"
          >
            <Scan size={20} />
            Rescan Now
          </button>
        )}

        {totalRecognized > 0 && (
          <div className="mt-6 rounded-xl border border-blue-400/35 bg-blue-500/20 p-3 text-lg text-blue-100">
            Recognized customers in current scan: {totalRecognized}
          </div>
        )}
      </div>

      {groupResults.map((card) => (
        <div key={card.recognition.customer.id} className="rounded-2xl border border-slate-500/30 bg-transparent p-6 shadow-xl shadow-slate-950/10 backdrop-blur-sm">
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-slate-600/50 p-4">
              <h3 className="mb-3 text-2xl font-semibold text-white">Customer Information</h3>
              <div className="space-y-2 text-lg text-slate-200">
                <p><strong>Name:</strong> {card.recognition.customer.name}</p>
                <p><strong>Visits:</strong> {card.recognition.customer.visitCount}</p>
                <p><strong>Detected Mood:</strong> <span className="capitalize">{card.detectedMood}</span></p>
                <p>
                  <strong>Match:</strong>{' '}
                  {(parseFloat(card.recognition.matchConfidence) * 100).toFixed(0)}%
                  {typeof card.recognition.matchDistance === 'number'
                    ? ` (distance ${card.recognition.matchDistance})`
                    : ''}
                </p>
                {card.recognition.customer.phone && (
                  <p><strong>Phone:</strong> {card.recognition.customer.phone}</p>
                )}
                {card.recognition.customer.email && (
                  <p><strong>Email:</strong> {card.recognition.customer.email}</p>
                )}
                {card.recognition.customer.dietaryRestrictions.length > 0 && (
                  <p>
                    <strong>Restrictions:</strong>{' '}
                    {card.recognition.customer.dietaryRestrictions.join(', ')}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-600/50 p-4">
              <h3 className="mb-3 flex items-center gap-2 text-2xl font-semibold text-white">
                <History size={20} />
                Recent Orders
              </h3>
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {card.recognition.orderHistory.length === 0 ? (
                  <p className="text-base text-slate-400">No previous orders</p>
                ) : (
                  card.recognition.orderHistory.slice(0, 5).map((order) => (
                    <div key={order._id} className="border-b border-slate-700/60 pb-2 text-base text-slate-200">
                      {(() => {
                        const itemChips = getOrderItemChips(order);
                        return (
                          <>
                      <p className="font-medium">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-slate-400">
                        {order.items.length} item{order.items.length === 1 ? '' : 's'} - {formatInr(getCorrectOrderTotal(order))}
                      </p>
                      {itemChips.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {itemChips.map((chip: string) => (
                            <span
                              key={`${order._id}-${chip}`}
                              className="rounded-full border border-slate-500/60 bg-[linear-gradient(135deg,rgba(148,163,184,0.2)_0%,rgba(30,41,59,0.45)_40%,rgba(15,23,42,0.72)_100%)] px-2.5 py-0.5 text-[11px] uppercase tracking-wide text-slate-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_4px_10px_rgba(2,6,23,0.35)]"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      )}
                          </>
                        );
                      })()}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-3xl font-bold text-white">
              Personalized Recommendations for {card.recognition.customer.name}
              <span className="ml-2 text-lg font-normal text-slate-400">
                Based on mood: <span className="font-semibold capitalize">{card.detectedMood}</span>
              </span>
            </h3>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {card.recommendations.map((item) => (
                <div key={item._id} className="rounded-xl border border-slate-600/50 bg-slate-950/30 p-4 transition hover:border-slate-400/60">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-xl font-semibold text-slate-100">{item.name}</h4>
                    <span className="text-2xl font-bold text-blue-300">{formatInr(item.price)}</span>
                  </div>
                  <p className="mb-2 text-base text-slate-300">{item.description}</p>
                  <div className="flex flex-wrap gap-1">
                    <span className="rounded bg-slate-800 px-2 py-1 text-xs text-slate-100">{item.category}</span>
                    {item.isVegetarian && (
                      <span className="rounded bg-emerald-500/20 px-2 py-1 text-xs text-emerald-200">Vegetarian</span>
                    )}
                    {item.spicyLevel > 0 && (
                      <span className="rounded bg-rose-500/20 px-2 py-1 text-xs text-rose-200">Spicy {item.spicyLevel}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {unknownFaces.length > 0 && (
        <div className="rounded-2xl border border-slate-500/30 bg-transparent p-6 shadow-xl shadow-slate-950/10 backdrop-blur-sm">
          <h3 className="mb-4 text-3xl font-bold text-white">Unknown Faces Detected</h3>
          <p className="mb-4 text-lg text-slate-300">
            Enroll these customers now so the next scan can fetch their order history and recommendations.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {unknownFaces.map((unknownFace) => {
              const form = unknownFaceForms[unknownFace.index] || {
                name: '',
                phone: '',
                email: '',
                isSaving: false,
              };

              return (
                <div key={unknownFace.index} className="rounded-xl border border-amber-400/35 bg-amber-500/10 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="text-xl font-semibold text-amber-100">Face #{unknownFace.index + 1}</h4>
                    <span className="rounded bg-amber-500/20 px-2 py-1 text-xs text-amber-100">
                      Mood: {unknownFace.emotion}
                    </span>
                  </div>

                  {unknownFace.previewImage && (
                    <div className="mb-3 overflow-hidden rounded-lg border border-amber-300/45 bg-slate-950/60">
                      <img
                        src={unknownFace.previewImage}
                        alt={`Face preview ${unknownFace.index + 1}`}
                        className="h-52 w-full object-contain bg-black/30"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Customer name"
                      value={form.name}
                      onChange={(event) => updateUnknownForm(unknownFace.index, { name: event.target.value })}
                      className="w-full rounded border border-amber-300/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Phone"
                      value={form.phone}
                      onChange={(event) => updateUnknownForm(unknownFace.index, { phone: event.target.value })}
                      className="w-full rounded border border-amber-300/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(event) => updateUnknownForm(unknownFace.index, { email: event.target.value })}
                      className="w-full rounded border border-amber-300/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 focus:border-amber-300 focus:outline-none"
                    />
                    <button
                      type="button"
                      disabled={form.isSaving}
                      onClick={() => handleEnrollUnknownFace(unknownFace)}
                      className="w-full rounded-xl bg-amber-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {form.isSaving ? 'Enrolling...' : 'Enroll This Customer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showCamera && (
        <GroupWebcamCapture
          title="Scan Group Faces"
          onCapture={handleGroupCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
};

export default RecognizeCustomer;
