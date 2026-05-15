const INDIA_LOCATION_SUGGESTIONS = {
  "Andhra Pradesh": [
    "Visakhapatnam",
    "Vijayawada",
    "Guntur",
    "Tirupati",
    "Kurnool",
    "Nellore",
  ],
  "Arunachal Pradesh": [
    "Itanagar",
    "Naharlagun",
    "Tawang",
    "Pasighat",
    "Ziro",
  ],
  Assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur", "Nagaon"],
  Bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"],
  Chandigarh: ["Chandigarh", "Manimajra", "Sector 17"],
  Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Jagdalpur"],
  Goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  Delhi: ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh", "Janakpuri"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar"],
  Haryana: ["Gurgaon", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Kullu", "Manali"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Pulwama"],
  Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru", "Belagavi", "Shivamogga"],
  Kerala: ["Kochi", "Kozhikode", "Thiruvananthapuram", "Thrissur", "Kannur", "Alappuzha"],
  Ladakh: ["Leh", "Kargil", "Diskit"],
  Lakshadweep: ["Kavaratti", "Agatti", "Amini"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur", "Gwalior", "Ujjain", "Sagar"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Kolhapur"],
  Manipur: ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul"],
  Meghalaya: ["Shillong", "Tura", "Jowai", "Nongstoin", "Baghmara"],
  Mizoram: ["Aizawl", "Lunglei", "Champhai", "Serchhip"],
  Nagaland: ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Tuensang"],
  Odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri"],
  Puducherry: ["Puducherry", "Karaikal", "Yanam", "Mahe"],
  Punjab: ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
  Sikkim: ["Gangtok", "Namchi", "Gyalshing", "Mangan"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem", "Tiruchirappalli", "Vellore"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Nalgonda"],
  Tripura: ["Agartala", "Dharmanagar", "Udaipur", "Kailashahar"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Varanasi", "Kanpur", "Prayagraj", "Agra", "Ghaziabad"],
  Uttarakhand: ["Dehradun", "Haridwar", "Haldwani", "Rishikesh", "Roorkee", "Nainital"],
  "West Bengal": ["Kolkata", "Durgapur", "Siliguri", "Asansol", "Howrah", "Kharagpur"],
  "Andaman and Nicobar Islands": ["Port Blair", "Swaraj Dweep", "Diglipur", "Mayabunder"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Silvassa", "Daman", "Diu"],
} as const;

export const LOCATION_SUGGESTIONS = {
  Australia: {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Parramatta", "Albury"],
    Queensland: ["Brisbane", "Gold Coast", "Cairns", "Townsville", "Toowoomba"],
    Victoria: ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton"],
  },
  Canada: {
    Alberta: ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Airdrie"],
    Ontario: ["Toronto", "Ottawa", "Mississauga", "Hamilton", "London"],
    Quebec: ["Montreal", "Quebec City", "Laval", "Gatineau", "Sherbrooke"],
  },
  France: {
    "Auvergne-Rhone-Alpes": ["Lyon", "Grenoble", "Saint-Etienne", "Annecy", "Clermont-Ferrand"],
    "Ile-de-France": ["Paris", "Boulogne-Billancourt", "Versailles", "Nanterre", "Saint-Denis"],
    Provence: ["Marseille", "Nice", "Aix-en-Provence", "Cannes", "Toulon"],
  },
  Germany: {
    Bavaria: ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt"],
    Berlin: ["Berlin", "Charlottenburg", "Mitte"],
    Hesse: ["Frankfurt", "Wiesbaden", "Darmstadt", "Kassel", "Offenbach"],
  },
  India: INDIA_LOCATION_SUGGESTIONS,
  Japan: {
    Hokkaido: ["Sapporo", "Hakodate", "Asahikawa", "Otaru", "Obihiro"],
    Osaka: ["Osaka", "Sakai", "Higashiosaka", "Takatsuki", "Toyonaka"],
    Tokyo: ["Tokyo", "Hachioji", "Machida", "Shinjuku", "Tachikawa"],
  },
  Singapore: {
    Central: ["Orchard", "Marina Bay", "Novena", "Bishan"],
    East: ["Tampines", "Pasir Ris", "Bedok", "Changi"],
    North: ["Woodlands", "Yishun", "Sembawang", "Admiralty"],
  },
  "United Arab Emirates": {
    "Abu Dhabi": ["Abu Dhabi", "Al Ain", "Madinat Zayed", "Ruwais"],
    Dubai: ["Dubai", "Jumeirah", "Deira", "Business Bay", "Dubai Marina"],
    Sharjah: ["Sharjah", "Khor Fakkan", "Kalba", "Al Dhaid"],
  },
  "United Kingdom": {
    England: ["London", "Manchester", "Birmingham", "Leeds", "Liverpool"],
    Scotland: ["Edinburgh", "Glasgow", "Aberdeen", "Dundee", "Inverness"],
    Wales: ["Cardiff", "Swansea", "Newport", "Bangor"],
  },
  "United States": {
    California: ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "San Jose"],
    Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "Fort Lauderdale"],
    "New York": ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse"],
    Texas: ["Austin", "Dallas", "Houston", "San Antonio", "Fort Worth"],
    Washington: ["Seattle", "Spokane", "Tacoma", "Bellevue", "Everett"],
  },
} as const;

export const COUNTRY_OPTIONS: string[] = Object.keys(LOCATION_SUGGESTIONS).sort();

export const LANGUAGE_OPTIONS = [
  "English",
  "Hindi",
  "Spanish",
  "French",
  "German",
  "Arabic",
  "Bengali",
  "Tamil",
  "Telugu",
  "Marathi",
  "Punjabi",
  "Urdu",
];

const findCaseInsensitiveMatch = (values: readonly string[], input: string) => {
  const normalizedInput = input.trim().toLowerCase();

  return (
    values.find((value) => value.trim().toLowerCase() === normalizedInput) || ""
  );
};

const getCountryEntry = (country: string) => {
  const match = findCaseInsensitiveMatch(COUNTRY_OPTIONS, country);

  return match
    ? LOCATION_SUGGESTIONS[match as keyof typeof LOCATION_SUGGESTIONS]
    : undefined;
};

export const getStateSuggestions = (country: string): string[] => {
  const countryEntry = getCountryEntry(country);
  return countryEntry ? Object.keys(countryEntry).sort() : [];
};

export const getCitySuggestions = (country: string, state: string): string[] => {
  const countryEntry = getCountryEntry(country);

  if (!countryEntry) {
    return [];
  }

  const stateMatch = findCaseInsensitiveMatch(Object.keys(countryEntry), state);

  if (!stateMatch) {
    return [];
  }

  const cities = countryEntry[stateMatch as keyof typeof countryEntry] as readonly string[];

  return [...cities].sort();
};
