export const LOCATION_SUGGESTIONS = {
  Australia: {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong"],
    Queensland: ["Brisbane", "Gold Coast", "Cairns"],
    Victoria: ["Melbourne", "Geelong", "Ballarat"],
  },
  Canada: {
    Alberta: ["Calgary", "Edmonton", "Red Deer"],
    Ontario: ["Toronto", "Ottawa", "Mississauga"],
    Quebec: ["Montreal", "Quebec City", "Laval"],
  },
  France: {
    "Auvergne-Rhone-Alpes": ["Lyon", "Grenoble", "Saint-Etienne"],
    "Ile-de-France": ["Paris", "Boulogne-Billancourt", "Versailles"],
    Provence: ["Marseille", "Nice", "Aix-en-Provence"],
  },
  Germany: {
    Bavaria: ["Munich", "Nuremberg", "Augsburg"],
    Berlin: ["Berlin"],
    Hesse: ["Frankfurt", "Wiesbaden", "Darmstadt"],
  },
  India: {
    "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur"],
    "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Tawang"],
    Assam: ["Guwahati", "Silchar", "Dibrugarh"],
    Bihar: ["Patna", "Gaya", "Muzaffarpur"],
    Chandigarh: ["Chandigarh"],
    Chhattisgarh: ["Raipur", "Bhilai", "Bilaspur"],
    Goa: ["Panaji", "Margao", "Vasco da Gama"],
    Delhi: ["New Delhi", "Dwarka", "Rohini"],
    "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan"],
    "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag"],
    Jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara"],
    Haryana: ["Gurgaon", "Faridabad", "Panipat"],
    Karnataka: ["Bengaluru", "Mysuru", "Hubballi"],
    Kerala: ["Kochi", "Kozhikode", "Thiruvananthapuram"],
    Ladakh: ["Leh", "Kargil"],
    Lakshadweep: ["Kavaratti"],
    "Madhya Pradesh": ["Bhopal", "Indore", "Jabalpur"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Manipur: ["Imphal", "Thoubal", "Bishnupur"],
    Meghalaya: ["Shillong", "Tura", "Jowai"],
    Mizoram: ["Aizawl", "Lunglei", "Champhai"],
    Nagaland: ["Kohima", "Dimapur", "Mokokchung"],
    Odisha: ["Bhubaneswar", "Cuttack", "Rourkela"],
    Puducherry: ["Puducherry", "Karaikal", "Yanam"],
    Punjab: ["Ludhiana", "Amritsar", "Jalandhar"],
    Rajasthan: ["Jaipur", "Jodhpur", "Udaipur"],
    Sikkim: ["Gangtok", "Namchi", "Gyalshing"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
    Telangana: ["Hyderabad", "Warangal", "Nizamabad"],
    Tripura: ["Agartala", "Dharmanagar", "Udaipur"],
    "Uttar Pradesh": ["Lucknow", "Noida", "Varanasi"],
    Uttarakhand: ["Dehradun", "Haridwar", "Haldwani"],
    "West Bengal": ["Kolkata", "Durgapur", "Siliguri"],
    "Andaman and Nicobar Islands": [
      "Port Blair",
      "Swaraj Dweep",
      "Diglipur",
    ],
    "Dadra and Nagar Haveli and Daman and Diu": [
      "Silvassa",
      "Daman",
      "Diu",
    ],
  },
  Japan: {
    Hokkaido: ["Sapporo", "Hakodate", "Asahikawa"],
    Osaka: ["Osaka", "Sakai", "Higashiosaka"],
    Tokyo: ["Tokyo", "Hachioji", "Machida"],
  },
  Singapore: {
    Central: ["Orchard", "Marina Bay", "Novena"],
    East: ["Tampines", "Pasir Ris", "Bedok"],
    North: ["Woodlands", "Yishun", "Sembawang"],
  },
  "United Arab Emirates": {
    "Abu Dhabi": ["Abu Dhabi", "Al Ain", "Madinat Zayed"],
    Dubai: ["Dubai", "Jumeirah", "Deira"],
    Sharjah: ["Sharjah", "Khor Fakkan", "Kalba"],
  },
  "United Kingdom": {
    England: ["London", "Manchester", "Birmingham"],
    Scotland: ["Edinburgh", "Glasgow", "Aberdeen"],
    Wales: ["Cardiff", "Swansea", "Newport"],
  },
  "United States": {
    California: ["Los Angeles", "San Francisco", "San Diego"],
    Florida: ["Miami", "Orlando", "Tampa"],
    "New York": ["New York City", "Buffalo", "Rochester"],
    Texas: ["Austin", "Dallas", "Houston"],
    Washington: ["Seattle", "Spokane", "Tacoma"],
  },
} as const;

export const COUNTRY_OPTIONS: string[] = Object.keys(
  LOCATION_SUGGESTIONS
).sort();

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

const findCaseInsensitiveMatch = (
  values: readonly string[],
  input: string
) => {
  const normalizedInput = input.trim().toLowerCase();

  return (
    values.find(
      (value) =>
        value.trim().toLowerCase() === normalizedInput
    ) || ""
  );
};

const getCountryEntry = (country: string) => {
  const match = findCaseInsensitiveMatch(
    COUNTRY_OPTIONS,
    country
  );

  return match
    ? LOCATION_SUGGESTIONS[
        match as keyof typeof LOCATION_SUGGESTIONS
      ]
    : undefined;
};

export const getStateSuggestions = (
  country: string
): string[] => {
  const countryEntry = getCountryEntry(country);
  return countryEntry ? Object.keys(countryEntry).sort() : [];
};

export const getCitySuggestions = (
  country: string,
  state: string
): string[] => {
  const countryEntry = getCountryEntry(country);

  if (!countryEntry) {
    return [];
  }

  const stateMatch = findCaseInsensitiveMatch(
    Object.keys(countryEntry),
    state
  );

  if (!stateMatch) {
    return [];
  }

  const cities = countryEntry[
    stateMatch as keyof typeof countryEntry
  ] as readonly string[];

  return [...cities].sort();
};
