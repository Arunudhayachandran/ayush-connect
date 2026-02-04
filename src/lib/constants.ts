export const AYUSH_SERVICES = [
  { id: 'ayurveda', name: 'Ayurveda', icon: '🌿', color: 'hsl(152 45% 28%)', description: 'Ancient Indian healing system' },
  { id: 'yoga', name: 'Yoga', icon: '🧘', color: 'hsl(262 47% 55%)', description: 'Mind-body wellness practices' },
  { id: 'naturopathy', name: 'Naturopathy', icon: '🍃', color: 'hsl(142 55% 42%)', description: 'Natural healing therapies' },
  { id: 'unani', name: 'Unani', icon: '⚗️', color: 'hsl(199 89% 48%)', description: 'Traditional Greco-Arabic medicine' },
  { id: 'siddha', name: 'Siddha', icon: '🔮', color: 'hsl(25 95% 53%)', description: 'Ancient Tamil healing tradition' },
  { id: 'homeopathy', name: 'Homeopathy', icon: '💊', color: 'hsl(330 65% 50%)', description: 'Natural symptom-based treatment' },
] as const;

export const DISTANCE_OPTIONS = [
  { value: '1', label: 'Within 1 km' },
  { value: '5', label: 'Within 5 km' },
  { value: '10', label: 'Within 10 km' },
  { value: '25', label: 'Within 25 km' },
  { value: '50', label: 'Within 50 km' },
] as const;

export const SORT_OPTIONS = [
  { value: 'nearest', label: 'Nearest First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'availability', label: 'Available Now' },
  { value: 'popular', label: 'Most Popular' },
] as const;

export const PRICE_RANGES = [
  { value: 'budget', label: '₹0 - ₹500', min: 0, max: 500 },
  { value: 'mid', label: '₹500 - ₹1500', min: 500, max: 1500 },
  { value: 'premium', label: '₹1500 - ₹3000', min: 1500, max: 3000 },
  { value: 'luxury', label: '₹3000+', min: 3000, max: Infinity },
] as const;

export const DAYS_OF_WEEK = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
] as const;

export const INDIAN_CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 
  'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Kochi',
  'Bhopal', 'Indore', 'Nagpur', 'Vadodara', 'Coimbatore', 'Mysore'
] as const;

export type AyushServiceType = typeof AYUSH_SERVICES[number]['id'];
