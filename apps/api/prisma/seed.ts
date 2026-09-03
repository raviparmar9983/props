import "dotenv/config";
import { PrismaClient, Prisma, ProjectVerificationStatus, ProjectReviewStatus, MediaType, SpecCategory, PaymentPlanType, LandmarkCategory, ParkingType, MaintenanceFrequency, LeadStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

// ── Deterministic randomness ───────────────────────
// A fixed seed keeps re-runs idempotent (same data every time).
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(20260815);
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)] as T;

function shuffle<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const phone = () => `+91 9${String(randInt(0, 9))}${String(randInt(1000000, 9999999))}`;
const pincode = () => String(randInt(100000, 999999));

function formatPriceText(price: number): string {
  if (price >= 1e7) {
    const cr = price / 1e7;
    return `₹${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(2)} Cr`;
  }
  if (price >= 1e5) {
    const l = price / 1e5;
    return `₹${l % 1 === 0 ? l.toFixed(0) : l.toFixed(1)} L`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
}

// ── Seed data ──────────────────────────────────────

const CITIES: Array<{
  name: string;
  slug: string;
  stateName: string;
  latitude: number;
  longitude: number;
  localities: string[];
}> = [
  {
    name: "Ahmedabad",
    slug: "ahmedabad",
    stateName: "Gujarat",
    latitude: 23.0225,
    longitude: 72.5714,
    localities: ["SG Highway", "Satellite", "Vastrapur", "Bopal", "Thaltej", "Paldi", "Maninagar", "Navrangpura"],
  },
  {
    name: "Surat",
    slug: "surat",
    stateName: "Gujarat",
    latitude: 21.1702,
    longitude: 72.8311,
    localities: ["Athwa", "Adajan", "Vesu", "City Light", "Dumas Road", "Nanpura"],
  },
  {
    name: "Mumbai",
    slug: "mumbai",
    stateName: "Maharashtra",
    latitude: 19.076,
    longitude: 72.8777,
    localities: ["Bandra", "Andheri", "Juhu", "Powai", "Lower Parel", "Worli"],
  },
  {
    name: "Pune",
    slug: "pune",
    stateName: "Maharashtra",
    latitude: 18.5204,
    longitude: 73.8567,
    localities: ["Kothrud", "Baner", "Hinjewadi", "Wakad", "Kharadi", "Viman Nagar"],
  },
  {
    name: "Bangalore",
    slug: "bangalore",
    stateName: "Karnataka",
    latitude: 12.9716,
    longitude: 77.5946,
    localities: ["Koramangala", "Indiranagar", "HSR Layout", "Whitefield", "Electronic City", "Marathahalli"],
  },
  {
    name: "Gurugram",
    slug: "gurugram",
    stateName: "Haryana",
    latitude: 28.4595,
    longitude: 77.0266,
    localities: ["Sector 43", "Golf Course Road", "Sohna Road", "Palam Vihar", "DLF Phase 5", "Sector 56"],
  },
  {
    name: "Noida",
    slug: "noida",
    stateName: "Uttar Pradesh",
    latitude: 28.5355,
    longitude: 77.391,
    localities: ["Sector 62", "Sector 137", "Sector 150", "Sector 50", "Greater Noida West"],
  },
  {
    name: "Hyderabad",
    slug: "hyderabad",
    stateName: "Telangana",
    latitude: 17.385,
    longitude: 78.4867,
    localities: ["Gachibowli", "Kondapur", "Kukatpally", "Miyapur", "Madhapur", "Banjara Hills"],
  },
  {
    name: "Chennai",
    slug: "chennai",
    stateName: "Tamil Nadu",
    latitude: 13.0827,
    longitude: 80.2707,
    localities: ["OMR", "Velachery", "Anna Nagar", "Porur", "Sholinganallur", "Tambaram"],
  },
  {
    name: "Kolkata",
    slug: "kolkata",
    stateName: "West Bengal",
    latitude: 22.5726,
    longitude: 88.3639,
    localities: ["Salt Lake", "New Town", "Rajarhat", "Behala", "Ballygunge"],
  },
  {
    name: "Jaipur",
    slug: "jaipur",
    stateName: "Rajasthan",
    latitude: 26.9124,
    longitude: 75.7873,
    localities: ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "C-Scheme", "Jagatpura"],
  },
  {
    name: "Lucknow",
    slug: "lucknow",
    stateName: "Uttar Pradesh",
    latitude: 26.8467,
    longitude: 80.9462,
    localities: ["Gomti Nagar", "Indira Nagar", "Aliganj", "Hazratganj", "Chinhat"],
  },
  {
    name: "Indore",
    slug: "indore",
    stateName: "Madhya Pradesh",
    latitude: 22.7196,
    longitude: 75.8577,
    localities: ["Vijay Nagar", "Scheme 54", "AB Road", "Rau", "Bicholi Mardana"],
  },
  {
    name: "Kochi",
    slug: "kochi",
    stateName: "Kerala",
    latitude: 9.9312,
    longitude: 76.2673,
    localities: ["Kakkanad", "Maradu", "Edappally", "Vyttila", "Fort Kochi"],
  },
];

const AMENITIES: Array<{ name: string; description: string | null; icon: string }> = [
  { name: "Swimming Pool", description: null, icon: "pool" },
  { name: "Clubhouse", description: null, icon: "emoji_people" },
  { name: "Power Backup", description: null, icon: "bolt" },
  { name: "Covered Parking", description: null, icon: "local_parking" },
  { name: "24/7 Security", description: null, icon: "security" },
  { name: "Kids Play Area", description: null, icon: "child_care" },
  { name: "Garden", description: null, icon: "park" },
  { name: "Lift", description: null, icon: "elevator" },
  { name: "CCTV", description: null, icon: "videocam" },
  { name: "Rainwater Harvesting", description: null, icon: "water_drop" },
  { name: "Fire Safety", description: null, icon: "local_fire_department" },
  { name: "Intercom", description: null, icon: "phone" },
  { name: "Sports Court", description: null, icon: "sports_tennis" },
  { name: "EV Charging", description: null, icon: "ev_station" },
  // ── Society/lifestyle amenities (added) ───────────
  // Note: "Gym" already existed above historically; it is kept here once,
  // merged with its icon and official description.
  // Icon keys below are reconciled against apps/web/components/amenity-icon.tsx's
  // AMENITY_ICONS map (pool, fitness_center, emoji_people, bolt, local_parking,
  // security, child_care, park, elevator, videocam, water_drop,
  // local_fire_department, phone, sports_tennis, ev_station). Where a seeded
  // amenity's original icon key had no entry in that map (and so rendered the
  // generic Sparkles fallback), it has been remapped to the closest existing
  // key below. A few (see PUBLIC.md-less note in the report) have no
  // reasonable semantic match among the current icon set and are left as-is
  // pending a web-side icon addition — flagged in the delivery report.
  { name: "Entrance Gate", description: "Grand entrance with safe and beautiful features", icon: "security" }, // was door_front (unmapped) — gated/controlled access
  { name: "Society Meeting Room", description: "A space for residents to organize meetings and discussions", icon: "emoji_people" }, // was meeting_room (unmapped)
  { name: "Pick Up & Drop Point", description: "Safe and convenient access for students", icon: "directions_bus" }, // no matching web icon key — flagged for web team
  { name: "Entrance Plaza", description: "Stunning welcome with elegant design", icon: "location_city" }, // no matching web icon key — flagged for web team
  { name: "Lounge & Library", description: "Library with comfy seats and cool books", icon: "local_library" }, // no matching web icon key — flagged for web team
  { name: "Skateboarding Surface", description: "A smooth scape for gliding fun", icon: "sports_tennis" }, // was skateboarding (unmapped)
  { name: "Landscape Garden", description: "Elegant green environment for relaxation", icon: "park" }, // was yard (unmapped)
  { name: "Plaza", description: "Open gathering space for residents", icon: "emoji_people" }, // was groups (unmapped)
  { name: "Car Parking", description: "Spacious and secure elevated vehicle parking area", icon: "local_parking" },
  { name: "Indoor Game", description: "Play games in a specially designed indoor area", icon: "sports_tennis" }, // was sports_esports (unmapped)
  { name: "Badminton Court", description: "To play and practice your smash", icon: "sports_tennis" },
  { name: "Entrance Foyer", description: "Stunning front lobby area", icon: "living" }, // no matching web icon key — flagged for web team
  { name: "Multipurpose Hall", description: "All-purpose hall for events and functions", icon: "emoji_people" }, // was celebration (unmapped)
  { name: "Dry Fountain", description: "A decorative fountain with a lot of aesthetic value", icon: "water_drop" }, // was waves (unmapped)
  { name: "Gym", description: "State-of-the-art fitness center for daily exercises", icon: "fitness_center" },
  { name: "Children Play Area", description: "Safe and leisure area for children", icon: "child_care" }, // was toys (unmapped)
  { name: "Veranda With Swings", description: "Relaxing sit-out with gentle swings", icon: "park" }, // was deck (unmapped)
  { name: "Security With CCTV", description: "Advanced monitoring security 24/7", icon: "security" },
  { name: "Common DTH", description: "Shared satellite dish access for everyone", icon: "satellite_alt" }, // no matching web icon key — flagged for web team
  { name: "Generator For Common Areas", description: "Generator for uninterrupted common services", icon: "bolt" }, // was electrical_services (unmapped)
];

const BUILDER_COMPANIES = [
  "Shree Ram Developers",
  "Apex Constructions",
  "Vastu Nirman",
  "Golden Gate Infra",
  "UrbanNest Builders",
  "Meridian Estates",
  "Tranquil Realty",
  "Sunrise Infra Group",
  "Lotus Developers",
  "Regency Construction Co.",
  "Saffron Builders",
  "Eagle Rock Infra",
  "Metro Polis Developers",
  "Blossom Group",
  "Summit Constructions",
  "Nova Estates",
  "Hillcrest Developers",
  "Pride Realty",
  "Kingsway Infra",
  "Ocean View Developers",
];

const PROJECT_PREFIXES = [
  "Sapphire",
  "Emerald",
  "Crystal",
  "Golden",
  "Silver",
  "Aurora",
  "Sunrise",
  "Green Valley",
  "Blue Sapphire",
  "Royal",
  "Imperial",
  "Skyline",
  "Lakeview",
  "Orchard",
  "Palm",
  "Cedar",
  "Maple",
  "Sunshine",
  "Starlight",
  "Paradise",
  "Highland",
  "Riverside",
  "Meadow",
  "Prestige",
  "Victory",
];

const PROJECT_SUFFIXES = ["Heights", "Residency", "Towers", "Enclave", "Gardens", "City", "Crest", "Vista"];

const STREETS = [
  "MG Road",
  "Station Road",
  "Ring Road",
  "Park Avenue",
  "Lake View Road",
  "Commercial Street",
  "Green Avenue",
  "Temple Street",
  "Main Bazaar Road",
  "College Road",
  "Airport Road",
  "Church Street",
  "Hospital Road",
  "High Street",
  "Canal Road",
];

const CONTACT_NAMES = [
  "Rajesh Kumar",
  "Priya Sharma",
  "Amit Patel",
  "Sneha Reddy",
  "Vikram Singh",
  "Neha Gupta",
  "Arjun Mehta",
  "Kavita Joshi",
  "Rohan Desai",
  "Ananya Iyer",
];

const VIDEO_URLS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
];

const BROCHURE_URL = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const IMAGE_BASE = "https://picsum.photos/seed";

const LANDMARKS_DATA: Array<{ category: LandmarkCategory; names: string[] }> = [
  { category: "SCHOOL", names: ["Delhi Public School", "DPS Academy", "Kendriya Vidyalaya", "Ryan International School", "St. Mary's School", "The Doon School", "BD Memorial School"] },
  { category: "HOSPITAL", names: ["Apollo Hospital", "Fortis Healthcare", "Max Hospital", "Manipal Hospital", "Medanta Hospital", "AIIMS", "Lilavati Hospital"] },
  { category: "METRO", names: ["Metro Station", "Blue Line Metro", "Green Line Metro", "Metro Phase 2 Station", "Rapid Metro Station"] },
  { category: "RAILWAY", names: ["Railway Junction", "Central Railway Station", "City Railway Station", "Suburban Railway Station"] },
  { category: "AIRPORT", names: ["International Airport", "Domestic Terminal", "Airport Expressway"] },
  { category: "HIGHWAY", names: ["NH-48 Highway", "Ring Road Expressway", "Outer Ring Road", "State Highway 10"] },
  { category: "MALL", names: ["Phoenix Mall", "Select City Walk", "DLF Mall", "VR Mall", "Inorbit Mall", "Lulu Mall", "Ambience Mall"] },
];

const SPECIFICATIONS_DATA: Array<{ category: SpecCategory; items: Array<{ label: string; values: string[] }> }> = [
  { category: "FLOORING", items: [{ label: "Living Room", values: ["Vitrified Tiles 600x600mm", "Italian Marble", "Wooden Laminate Flooring", "Anti-skid Ceramic Tiles"] }, { label: "Bedrooms", values: ["Vitrified Tiles 600x600mm", "Wooden Laminate", "Ceramic Tiles", "Marble Flooring"] }, { label: "Balcony", values: ["Anti-skid Ceramic Tiles", "Vitrified Tiles", "Textured Tiles"] }] },
  { category: "KITCHEN", items: [{ label: "Platform", values: ["Granite Platform with SS Sink", "Marble Platform", "Quartz Countertop"] }, { label: "Wall Dado", values: ["Ceramic Tiles up to 2 feet", "Full Height Dado", "Glass Backsplash"] }, { label: "Provision", values: ["Water Purifier, Exhaust Fan", "RO + Chimney, Washing Machine"] }] },
  { category: "BATHROOM", items: [{ label: "Fittings", values: ["Jaguar / Cera Premium", "Kohler Fittings", "Hindware fittings"] }, { label: "Wall Dado", values: ["Ceramic Tiles up to door height", "Full Height Tiles", "Digital Print Tiles"] }, { label: "Sanitary", values: ["Wall-mounted WC", "Concealed Cistern WC", "Western Style WC"] }] },
  { category: "DOORS_WINDOWS", items: [{ label: "Main Door", values: ["Teak Wood Frame with Laminate Shutters", "Flush Door with Veneer", "Solid Wood Door"] }, { label: "Internal Doors", values: ["Flush Door with Laminate", "Engineered Wood Frame", "Hollow Core Flush Door"] }, { label: "Windows", values: ["Aluminium Sliding Windows", "UPVC Windows", "Powder Coated Aluminium"] }] },
  { category: "ELECTRICAL", items: [{ label: "Wiring", values: ["Concealed Copper Wiring", "FR LSOH Wiring", "Anchor Roma Modular Switches"] }, { label: "Points", values: ["TV, Telephone, AC, Split AC", " modular switches, DTH Provision"] }, { label: "Backup", values: ["DG Backup for Common Areas", "Full Power Backup", "Partial Backup (Fans + Lights)"] }] },
  { category: "PAINT", items: [{ label: "Interior", values: ["Acrylic Emulsion Paint", "Asian Paints Apex", "OBD Paint"] }, { label: "Exterior", values: ["Weather-proof Acrylic Paint", "Asian Paints External Emulsion", "Cement Paint"] }] },
];

const FAQ_PAIRS: Array<{ question: string; answer: string }> = [
  { question: "What is the possession date for this project?", answer: "The expected possession date is as per RERA registration. Please contact our sales team for the latest timeline update." },
  { question: "Is this project RERA registered?", answer: "Yes, this project is RERA registered. The RERA number is mentioned in the project details above. You can verify it on your state's RERA portal." },
  { question: "What payment plans are available?", answer: "We offer Construction-Linked, Possession-Linked, and Flexi payment plans. Please speak with our sales team for a customized plan that suits your needs." },
  { question: "Are there any additional charges besides the base price?", answer: "There may be charges for PLC (Preferred Location Charges), parking, maintenance deposit, and stamp duty/registration. Our team will provide a complete cost breakup." },
  { question: "What is the carpet area of the apartments?", answer: "Carpet areas vary by configuration. Please refer to the unit type section above for detailed area information for each layout." },
  { question: "Is home loan available for this project?", answer: "Yes, we have tie-ups with leading banks and financial institutions for home loan assistance at competitive interest rates." },
  { question: "Can I schedule a site visit?", answer: "Absolutely! You can schedule a site visit through our booking form or by contacting our sales team directly." },
  { question: "What amenities are provided?", answer: "The project includes world-class amenities such as swimming pool, gym, clubhouse, landscaped gardens, kids play area, 24/7 security, and more. Refer to the amenities section for a complete list." },
  { question: "Is the project earthquake resistant?", answer: "Yes, the structure is designed as per seismic zone norms with RCC framed structure and earthquake-resistant design." },
  { question: "What is the maintenance charge?", answer: "Maintenance charges will be communicated closer to possession. It typically covers common area maintenance, security, lifts, and garden upkeep." },
];

const HIGHLIGHT_POOL = [
  "RERA registered project",
  "Zero brokerage — connect directly with the builder",
  "Gated community with round-the-clock security",
  "Vastu-compliant layouts",
  "Landscaped gardens and modern clubhouse",
  "Easy home loan approval from leading banks",
  "Excellent connectivity to schools, hospitals and business hubs",
  "Spacious configurations designed for modern families",
  "Earthquake-resistant RCC framed structure",
  "Ample covered parking for every unit",
];

const CUSTOMER_NAMES = ["Rahul Verma", "Pooja Nair", "Sanjay Bhatia", "Meera Krishnan", "Arvind Rao"];

const LEAD_MESSAGES = [
  "Interested in a 2 BHK. Please share the price list and floor plans.",
  "Can I get a call back regarding site visit availability this weekend?",
  "Looking for ready-to-move options in this project. What's the best price?",
  "Please share loan/EMI details and the payment plan for this project.",
  "Would like more details on the amenities and possession timeline.",
];

const BANK_NAMES = [
  "HDFC Bank", "ICICI Bank", "SBI", "Axis Bank", "Kotak Mahindra Bank",
  "PNB Bank", "Bank of Baroda", "Citibank", "Standard Chartered", "Yes Bank",
];

const STRUCTURE_TYPES = ["RCC Framed Structure", "RCC Frame with Shear Wall", "Steel Framed Structure", "Load Bearing Structure"];
const WATER_SOURCES = ["Municipal Water + Borewell", "Borewell + Water Tanker", "Underground Sump + Overhead Tank", "Municipal Corporation Supply + Recycling Plant"];
const LIFT_BRANDS = ["Otis", "Schindler", "KONE", "ThyssenKrupp", "Johnson Lifts", "Honeywell"];
const PET_POLICIES = ["Pets allowed with restrictions", "Pets allowed in designated areas", "No pets allowed", "Small pets allowed with prior approval"];

// Project status distribution (weighted towards active listings)
const STATUS_POOL: Array<"UPCOMING" | "UNDER_CONSTRUCTION" | "READY"> = [
  "UPCOMING",
  "UPCOMING",
  "UPCOMING",
  "UNDER_CONSTRUCTION",
  "UNDER_CONSTRUCTION",
  "UNDER_CONSTRUCTION",
  "UNDER_CONSTRUCTION",
  "READY",
  "READY",
  "READY",
];

// ── Unit type builders ─────────────────────────────

interface UnitDef {
  label: string;
  propertyType: "FLAT" | "HOUSE" | "PLOT" | "SHOP" | "TENEMENT" | "CORPORATE";
  bedrooms: number | null;
  carpetArea: number;
  builtUpArea: number;
  areaUnit: "SQFT" | "SQM";
  price: number;
  priceUnit: "LAKH" | "CRORE" | "TOTAL";
  parkingCount: number | null;
  parkingType: ParkingType | null;
  totalCount: number;
  availableCount: number;
  attributes: Prisma.InputJsonValue;
}

const FLAT_CONFIGS: Record<string, Array<{ label: string; bedrooms: number; carpetMin: number; carpetMax: number; priceMin: number; priceMax: number }>> = {
  budget: [
    { label: "1 BHK Apartment", bedrooms: 1, carpetMin: 480, carpetMax: 650, priceMin: 35, priceMax: 55 },
    { label: "2 BHK Apartment", bedrooms: 2, carpetMin: 750, carpetMax: 950, priceMin: 45, priceMax: 70 },
    { label: "3 BHK Apartment", bedrooms: 3, carpetMin: 1100, carpetMax: 1300, priceMin: 70, priceMax: 95 },
  ],
  mid: [
    { label: "2 BHK Apartment", bedrooms: 2, carpetMin: 820, carpetMax: 1050, priceMin: 55, priceMax: 90 },
    { label: "3 BHK Apartment", bedrooms: 3, carpetMin: 1150, carpetMax: 1450, priceMin: 80, priceMax: 140 },
    { label: "4 BHK Apartment", bedrooms: 4, carpetMin: 1550, carpetMax: 1850, priceMin: 150, priceMax: 220 },
  ],
  premium: [
    { label: "2 BHK Apartment", bedrooms: 2, carpetMin: 900, carpetMax: 1150, priceMin: 90, priceMax: 140 },
    { label: "3 BHK Apartment", bedrooms: 3, carpetMin: 1350, carpetMax: 1650, priceMin: 140, priceMax: 220 },
    { label: "4 BHK Penthouse", bedrooms: 4, carpetMin: 1900, carpetMax: 2400, priceMin: 240, priceMax: 380 },
  ],
};

function buildResidentialUnits(): UnitDef[] {
  const tier = pick(["budget", "budget", "mid", "mid", "premium"] as const);
  const configs = shuffle(FLAT_CONFIGS[tier]!).slice(0, randInt(2, 3));
  const furnishing = pick(["Unfurnished", "Semi-Furnished", "Fully Furnished"]);
  return configs.map((c) => {
    const carpet = randInt(c.carpetMin, c.carpetMax);
    const builtUp = Math.round(carpet * (rng() < 0.5 ? 1.2 : 1.3));
    const price = randInt(c.priceMin, c.priceMax) * 100000;
    const total = randInt(12, 90);
    return {
      label: c.label,
      propertyType: "FLAT" as const,
      bedrooms: c.bedrooms,
      carpetArea: carpet,
      builtUpArea: builtUp,
      areaUnit: "SQFT" as const,
      price,
      priceUnit: "TOTAL" as const,
      parkingCount: c.bedrooms <= 2 ? 1 : 2,
      parkingType: pick(["COVERED", "COVERED", "STILT", "OPEN"] as const),
      totalCount: total,
      availableCount: randInt(2, total),
      attributes: { furnishing, view: pick(["Garden", "City", "Pool", "Courtyard"]) },
    };
  });
}

function buildVillaUnits(): UnitDef[] {
  const configs: Array<{ label: string; carpetMin: number; carpetMax: number; priceMin: number; priceMax: number }> = [
    { label: "3 BHK Villa", carpetMin: 1800, carpetMax: 2400, priceMin: 150, priceMax: 250 },
    { label: "4 BHK Villa", carpetMin: 2400, carpetMax: 3200, priceMin: 250, priceMax: 400 },
    { label: "4 BHK Duplex Villa", carpetMin: 2800, carpetMax: 3800, priceMin: 350, priceMax: 520 },
  ];
  const chosen = shuffle(configs).slice(0, randInt(1, 2));
  return chosen.map((c) => {
    const carpet = randInt(c.carpetMin, c.carpetMax);
    const builtUp = Math.round(carpet * 1.1);
    const price = randInt(c.priceMin, c.priceMax) * 100000;
    const total = randInt(6, 40);
    return {
      label: c.label,
      propertyType: "HOUSE" as const,
      bedrooms: c.label.startsWith("3") ? 3 : 4,
      carpetArea: carpet,
      builtUpArea: builtUp,
      areaUnit: "SQFT" as const,
      price,
      priceUnit: "TOTAL" as const,
      parkingCount: randInt(2, 3),
      parkingType: "COVERED" as const,
      totalCount: total,
      availableCount: randInt(1, total),
      attributes: { furnishing: pick(["Unfurnished", "Semi-Furnished"]), plotArea: randInt(2000, 5000) },
    };
  });
}

function buildPlotUnits(): UnitDef[] {
  const configs: Array<{ label: string; areaMin: number; areaMax: number; priceMin: number; priceMax: number }> = [
    { label: "Residential Plot", areaMin: 1200, areaMax: 2400, priceMin: 25, priceMax: 60 },
    { label: "Corner Plot", areaMin: 1800, areaMax: 3600, priceMin: 40, priceMax: 100 },
    { label: "Commercial Plot", areaMin: 2000, areaMax: 5000, priceMin: 60, priceMax: 200 },
  ];
  const chosen = shuffle(configs).slice(0, randInt(1, 3));
  return chosen.map((c) => {
    const area = randInt(c.areaMin, c.areaMax);
    const price = randInt(c.priceMin, c.priceMax) * 100000;
    const total = randInt(20, 120);
    return {
      label: c.label,
      propertyType: "PLOT" as const,
      bedrooms: null,
      carpetArea: area,
      builtUpArea: area,
      areaUnit: "SQFT" as const,
      price,
      priceUnit: "TOTAL" as const,
      // Plots are sold as bare land — no built parking allotment applies.
      parkingCount: null,
      parkingType: null,
      totalCount: total,
      availableCount: randInt(5, total),
      attributes: { plotType: c.label, facing: pick(["North", "South", "East", "West"]) },
    };
  });
}

function buildCommercialUnits(): UnitDef[] {
  const configs: Array<{ label: string; areaMin: number; areaMax: number; priceMin: number; priceMax: number }> = [
    { label: "Retail Shop", areaMin: 300, areaMax: 900, priceMin: 35, priceMax: 120 },
    { label: "Showroom", areaMin: 1000, areaMax: 2500, priceMin: 80, priceMax: 250 },
    { label: "Office Space", areaMin: 500, areaMax: 1500, priceMin: 50, priceMax: 180 },
  ];
  const chosen = shuffle(configs).slice(0, randInt(1, 3));
  return chosen.map((c) => {
    const area = randInt(c.areaMin, c.areaMax);
    const price = randInt(c.priceMin, c.priceMax) * 100000;
    const total = randInt(10, 60);
    return {
      label: c.label,
      propertyType: "SHOP" as const,
      bedrooms: null,
      carpetArea: area,
      builtUpArea: Math.round(area * 1.15),
      areaUnit: "SQFT" as const,
      price,
      priceUnit: "TOTAL" as const,
      parkingCount: randInt(1, 3),
      parkingType: pick(["OPEN", "OPEN", "BASEMENT"] as const),
      totalCount: total,
      availableCount: randInt(2, total),
      attributes: { frontage: `${randInt(10, 40)} ft`, floor: pick(["Ground", "1st", "2nd", "3rd"]) },
    };
  });
}

function buildUnits(category: string): UnitDef[] {
  switch (category) {
    case "villa":
      return buildVillaUnits();
    case "plot":
      return buildPlotUnits();
    case "commercial":
      return buildCommercialUnits();
    default:
      return buildResidentialUnits();
  }
}

// ── Main ───────────────────────────────────────────

async function main() {
  console.log("Seeding database...");

  // 1. Admin user
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "ChangeMe123!";
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      isEmailVerified: true,
    },
  });
  console.log(`Admin user: ${admin.email} (${admin.id})`);

  // 2. Cities with localities
  const cityMap = new Map<string, { id: string; slug: string; name: string; stateName: string; latitude: number; longitude: number; localities: Array<{ id: string; name: string; slug: string }> }>();

  for (const cityData of CITIES) {
    const { localities, ...cityFields } = cityData;
    const city = await prisma.city.upsert({
      where: { slug: cityFields.slug },
      update: {},
      create: cityFields,
    });

    const localityRows: Array<{ id: string; name: string; slug: string }> = [];
    for (const locName of localities) {
      const locSlug = slugify(locName);
      const loc = await prisma.locality.upsert({
        where: { cityId_slug: { cityId: city.id, slug: locSlug } },
        update: {},
        create: { cityId: city.id, name: locName, slug: locSlug },
      });
      localityRows.push({ id: loc.id, name: loc.name, slug: loc.slug });
    }
    cityMap.set(city.slug, { ...cityFields, id: city.id, localities: localityRows });
    console.log(`City: ${city.name} with ${localities.length} localities`);
  }

  // 3. Amenities
  const amenityIdByName = new Map<string, number>();
  for (const amenity of AMENITIES) {
    const row = await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: { icon: amenity.icon, description: amenity.description },
      create: amenity,
    });
    amenityIdByName.set(row.name, row.id);
  }
  const allAmenityIds = [...amenityIdByName.values()];
  console.log(`Amenities: ${AMENITIES.length}`);

  // 4. Builders (verified builder accounts with profiles)
  const builders: Array<{ id: string; slug: string; companyName: string; email: string }> = [];
  for (let i = 0; i < BUILDER_COMPANIES.length; i++) {
    const companyName = BUILDER_COMPANIES[i]!;
    const email = `builder${i + 1}@example.com`;
    const citySlug = pick([...cityMap.keys()]);
    const city = cityMap.get(citySlug)!;

    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: adminHash,
        role: "BUILDER",
        isEmailVerified: true,
      },
    });

    const companySlug = slugify(companyName);
    const profile = await prisma.builderProfile.upsert({
      where: { slug: companySlug },
      update: {},
      create: {
        userId: user.id,
        companyName,
        slug: companySlug,
        reraNumber: `${city.name.slice(0, 3).toUpperCase()}/RERA/${randInt(1000, 9999)}/REG/${randInt(100, 999)}`,
        gstNumber: `2${String(randInt(1, 37)).padStart(2, "0")}${companyName.replace(/[^A-Za-z]/g, "").slice(0, 4).toUpperCase()}${randInt(1000, 9999)}F1Z5`,
        cityId: city.id,
        phone: phone(),
        verificationStatus: "VERIFIED",
        verifiedAt: new Date(),
        verifiedById: admin.id,
      },
    });
    builders.push({ id: profile.id, slug: companySlug, companyName, email });
  }
  console.log(`Builders: ${builders.length}`);

  // 4b. Customer accounts (used to seed sample leads below)
  const customers: Array<{ id: string; email: string }> = [];
  for (let i = 0; i < CUSTOMER_NAMES.length; i++) {
    const email = `customer${i + 1}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash: adminHash,
        role: "CUSTOMER",
        isEmailVerified: true,
      },
    });
    customers.push({ id: user.id, email: user.email });
  }
  console.log(`Customers: ${customers.length}`);

  // 5. Projects (100 across random cities) with towers, unit types, media,
  //    amenities and contacts.
  const projectIds: string[] = [];
  const towerRows: Array<{ refKey: string; projectId: string; name: string; totalFloors: number }> = [];
  const unitTypeDefs: Array<UnitDef & { projectId: string; towerRefKey: string | null }> = [];
  const mediaRows: Array<{ projectId: string; type: MediaType; url: string; displayOrder: number; isPrimary: boolean }> = [];
  const amenityRows: Array<{ projectId: string; amenityId: number }> = [];
  const contactRows: Array<{ builderId: string; projectId: string; name: string; designation: string; phone: string; email: string; isPrimary: boolean }> = [];
  const nearbyLandmarkRows: Array<{ projectId: string; category: LandmarkCategory; name: string; distanceKm: number; travelTimeMinutes: number | null }> = [];
  const priceComponentRows: Array<{ projectId: string; label: string; amount: number; isIncludedInBasePrice: boolean; displayOrder: number }> = [];
  const paymentPlanRows: Array<{ projectId: string; name: string; type: PaymentPlanType; bookingAmount: number; milestones: Prisma.InputJsonValue }> = [];
  const bankPartnerRows: Array<{ projectId: string; bankName: string; logoUrl: string | null }> = [];
  const constructionUpdateRows: Array<{ projectId: string; title: string; description: string; photoUrl: string; updateDate: Date; progressPercent: number }> = [];
  const specificationRows: Array<{ projectId: string; category: SpecCategory; label: string; value: string }> = [];
  const faqRows: Array<{ projectId: string; question: string; answer: string; displayOrder: number }> = [];
  const highlightRows: Array<{ projectId: string; text: string; displayOrder: number }> = [];
  const projectBuilderId = new Map<string, string>();

  const now = new Date();
  const TOTAL_PROJECTS = 100;

  for (let i = 0; i < TOTAL_PROJECTS; i++) {
    const city = cityMap.get(pick([...cityMap.keys()]))!;
    const locality = pick(city.localities);
    const title = `${PROJECT_PREFIXES[i % PROJECT_PREFIXES.length]} ${PROJECT_SUFFIXES[Math.floor(i / PROJECT_PREFIXES.length)]}`;
    const slug = `${slugify(title)}-${city.slug}`;
    const status = pick(STATUS_POOL);
    const isFeatured = rng() < 0.15;
    const builder = pick(builders);
    const category = pick(["residential", "residential", "residential", "villa", "plot", "commercial"] as const);

    const units = buildUnits(category);
    const unitTypeCount = units.length;
    const priceStartingFrom = Math.min(...units.map((u) => u.price));
    // Maintenance is conventionally billed per sqft of the largest carpet area on offer.
    const maintenanceRatePerSqft = randInt(2, 5);
    const maintenanceAmount = category === "plot" ? null : maintenanceRatePerSqft * Math.max(...units.map((u) => u.carpetArea));
    const amenities = shuffle(allAmenityIds).slice(0, randInt(4, 8));
    const amenityNames = amenities.map((id) => [...amenityIdByName].find(([, v]) => v === id)?.[0] ?? "").filter(Boolean);

    const statusLine =
      status === "UPCOMING"
        ? `This upcoming ${category === "commercial" ? "commercial" : "residential"} destination is designed for a modern lifestyle, with thoughtfully planned layouts and world-class amenities.`
        : status === "UNDER_CONSTRUCTION"
          ? `Currently under construction, this development is taking shape with high-quality construction standards and premium specifications.`
          : `Ready for possession, this completed development offers immediate move-in with fully functional amenities and landscaped surroundings.`;

    const unitsText = units.map((u) => `${u.label} starting from ${formatPriceText(u.price)}`).join(", ");
    const description = `${title} is a premium ${category === "villa" ? "villa" : category === "plot" ? "plotted" : category === "commercial" ? "commercial" : "apartment"} project located in ${locality.name}, ${city.name}. ${statusLine}\n\nThe project offers ${unitsText}, designed to suit every budget and lifestyle. Residents can enjoy amenities including ${amenityNames.join(", ")}.\n\nWith easy access to schools, hospitals, shopping centres and major transport hubs, ${title} presents an ideal investment opportunity in ${city.name}.`;

    const possessionDate = new Date(now);
    if (status === "UPCOMING") possessionDate.setMonth(now.getMonth() + randInt(18, 36));
    else if (status === "UNDER_CONSTRUCTION") possessionDate.setMonth(now.getMonth() + randInt(6, 18));
    else possessionDate.setMonth(now.getMonth() - randInt(6, 24));

    const primaryImage = `${IMAGE_BASE}/${slug}-0/900/700`;

    const projectData = {
      builderId: builder.id,
      cityId: city.id,
      localityId: locality.id,
      title,
      slug,
      description,
      status,
      address: `${randInt(1, 120)} ${pick(STREETS)}, ${locality.name}, ${city.name} ${pincode()}, ${city.stateName}`,
      latitude: city.latitude + (rng() - 0.5) * 0.16,
      longitude: city.longitude + (rng() - 0.5) * 0.16,
      reraProjectNumber: `${city.name.slice(0, 3).toUpperCase()}/RERA/${randInt(1000, 9999)}/PR/${new Date(now.getTime() - randInt(1, 700) * 86400000).getFullYear()}/0041${String(i).padStart(3, "0")}`,
      reraStatus: "ACTIVE" as const,
      possessionDate,
      occupancyCertStatus: status === "READY" ? ("RECEIVED" as const) : ("PENDING" as const),
      commencementCertStatus: status === "READY" ? ("RECEIVED" as const) : ("PENDING" as const),
      landTitleType: pick(["FREEHOLD", "FREEHOLD", "LEASEHOLD"] as const),
      structureType: pick(STRUCTURE_TYPES),
      powerBackupCapacity: pick(["Full Backup", "Partial Backup (Fans + Lights)", "Common Areas Only", "DG Set for Lifts & Common Areas"]),
      waterSource: pick(WATER_SOURCES),
      liftBrand: category !== "plot" ? pick(LIFT_BRANDS) : null,
      liftCount: category !== "plot" ? randInt(2, 8) : null,
      fireSafetyCompliant: rng() < 0.85,
      openSpacePercent: randInt(30, 70),
      greenAreaPercent: randInt(15, 45),
      hasCctv: rng() < 0.9,
      hasGatedEntry: rng() < 0.75,
      petPolicy: pick(PET_POLICIES),
      allowsSiteVisitBooking: true,
      maintenanceAmount,
      maintenanceFrequency: category === "plot" ? null : pick(["MONTHLY", "MONTHLY", "QUARTERLY"] as const),
      isFeatured,
      verificationStatus: ProjectVerificationStatus.APPROVED,
      reviewStatus: ProjectReviewStatus.APPROVED,
      reviewedAt: new Date(now.getTime() - randInt(1, 30) * 86400000),
      metaTitle: `${title} in ${locality.name}, ${city.name} | ${unitTypeCount} configurations starting ${formatPriceText(priceStartingFrom)}`,
      metaDescription: description.slice(0, 160),
      ogImageUrl: primaryImage,
      publishedAt: new Date(now.getTime() - randInt(1, 180) * 86400000),
    };

    const project = await prisma.project.upsert({
      where: { slug },
      create: projectData,
      update: projectData,
    });
    projectIds.push(project.id);
    projectBuilderId.set(project.id, builder.id);

    // Towers
    const towerCount = category === "residential" ? randInt(1, 4) : category === "commercial" ? randInt(1, 2) : 0;
    const towerRefKeys: string[] = [];
    const towerNames = ["Tower A", "Tower B", "Tower C", "Tower D", "Sky House", "Garden House", "Cedar House", "Maple House"];
    for (let t = 0; t < towerCount; t++) {
      const refKey = `${project.id}:tower:${t}`;
      towerRows.push({
        refKey,
        projectId: project.id,
        name: pick(towerNames),
        totalFloors: status === "READY" ? randInt(8, 35) : randInt(6, 32),
      });
      towerRefKeys.push(refKey);
    }

    // Unit types (towerId resolved after towers are created)
    unitTypeDefs.push(
      ...units.map((u) => ({
        ...u,
        projectId: project.id,
        towerRefKey: towerRefKeys.length > 0 ? pick(towerRefKeys) : null,
      })),
    );

    // Media: images (first is primary) + 1 video + floor/master plans + brochure
    const imageCount = randInt(5, 8);
    for (let m = 0; m < imageCount; m++) {
      mediaRows.push({
        projectId: project.id,
        type: "IMAGE",
        url: `${IMAGE_BASE}/${slug}-${m}/900/700`,
        caption: m === 0 ? `${title} — exterior view` : `${title} — photograph ${m + 1}`,
        displayOrder: m,
        isPrimary: m === 0,
      });
    }
    let order = imageCount;
    mediaRows.push({ projectId: project.id, type: "VIDEO", url: pick(VIDEO_URLS), caption: `${title} — video walkthrough`, displayOrder: order++, isPrimary: false });
    mediaRows.push({ projectId: project.id, type: "FLOOR_PLAN", url: `${IMAGE_BASE}/${slug}-fp1/800/1000`, caption: `${title} — floor plan`, displayOrder: order++, isPrimary: false });
    if (rng() < 0.6) {
      mediaRows.push({ projectId: project.id, type: "FLOOR_PLAN", url: `${IMAGE_BASE}/${slug}-fp2/800/1000`, caption: `${title} — floor plan (alternate layout)`, displayOrder: order++, isPrimary: false });
    }
    mediaRows.push({ projectId: project.id, type: "MASTER_PLAN", url: `${IMAGE_BASE}/${slug}-mp/1000/700`, caption: `${title} — master site plan`, displayOrder: order++, isPrimary: false });
    mediaRows.push({ projectId: project.id, type: "BROCHURE", url: BROCHURE_URL, caption: null, displayOrder: order++, isPrimary: false });

    // Amenities
    for (const amenityId of amenities) {
      amenityRows.push({ projectId: project.id, amenityId });
    }

    // Contacts
    const primaryContactName = pick(CONTACT_NAMES);
    contactRows.push({
      builderId: builder.id,
      projectId: project.id,
      name: primaryContactName,
      designation: pick(["Sales Executive", "Senior Sales Manager", "Relationship Manager"]),
      phone: phone(),
      email: `${slugify(primaryContactName).replace(/-/g, ".")}@${builder.slug}.com`,
      isPrimary: true,
    });
    if (rng() < 0.5) {
      contactRows.push({
        builderId: builder.id,
        projectId: project.id,
        name: pick(CONTACT_NAMES.filter((n) => n !== primaryContactName)),
        designation: pick(["Site Manager", "Customer Care", "Marketing Head"]),
        phone: phone(),
        email: `info@${builder.slug}.com`,
        isPrimary: false,
      });
    }

    // Nearby landmarks (3-6 per project)
    const landmarkCount = randInt(3, 6);
    const usedLandmarkCategories = new Set<LandmarkCategory>();
    for (let lm = 0; lm < landmarkCount; lm++) {
      const lmData = pick(LANDMARKS_DATA.filter((l) => !usedLandmarkCategories.has(l.category) || usedLandmarkCategories.size >= LANDMARKS_DATA.length));
      usedLandmarkCategories.add(lmData.category);
      nearbyLandmarkRows.push({
        projectId: project.id,
        category: lmData.category,
        name: pick(lmData.names),
        distanceKm: Math.round((rng() * 8 + 0.2) * 10) / 10,
        travelTimeMinutes: randInt(3, 45),
      });
    }

    // Price components (4-6 per project)
    const basePrice = priceStartingFrom;
    const plcAmount = Math.round(basePrice * (rng() * 0.08 + 0.02));
    const parkingAmount = randInt(2, 8) * 100000;
    const ifmsAmount = Math.round(basePrice * 0.03);
    const clubCharge = randInt(50000, 200000);
    const maintenanceDeposit = randInt(1, 3) * 100000;
    priceComponentRows.push(
      { projectId: project.id, label: "Base Price", amount: basePrice, isIncludedInBasePrice: true, displayOrder: 0 },
      { projectId: project.id, label: "PLC (Preferred Location Charge)", amount: plcAmount, isIncludedInBasePrice: false, displayOrder: 1 },
      { projectId: project.id, label: "Covered Car Parking", amount: parkingAmount, isIncludedInBasePrice: false, displayOrder: 2 },
      { projectId: project.id, label: "IFMS (Internal Fund Maintenance)", amount: ifmsAmount, isIncludedInBasePrice: false, displayOrder: 3 },
      { projectId: project.id, label: "Club Membership Charge", amount: clubCharge, isIncludedInBasePrice: false, displayOrder: 4 },
      { projectId: project.id, label: "Maintenance Deposit (Refundable)", amount: maintenanceDeposit, isIncludedInBasePrice: false, displayOrder: 5 },
    );

    // Payment plans (1-2 per project)
    const planTypes: PaymentPlanType[] = ["CONSTRUCTION_LINKED", "POSSESSION_LINKED", "FLEXI"];
    const planCount = randInt(1, 2);
    const chosenPlans = shuffle(planTypes).slice(0, planCount);
    for (const planType of chosenPlans) {
      const bookingAmt = Math.round(basePrice * (rng() * 0.05 + 0.05));
      let milestones: Prisma.InputJsonValue;
      if (planType === "CONSTRUCTION_LINKED") {
        milestones = [
          { stage: "At Booking", percent: 10 },
          { stage: "Foundation Complete", percent: 15 },
          { stage: "Plinth Level", percent: 10 },
          { stage: "1st Floor Slab", percent: 10 },
          { stage: "Mid-rise Slab", percent: 15 },
          { stage: "Top Floor Slab", percent: 10 },
          { stage: "Brickwork Complete", percent: 10 },
          { stage: "Possession", percent: 20 },
        ];
      } else if (planType === "POSSESSION_LINKED") {
        milestones = [
          { stage: "At Booking", percent: 10 },
          { stage: "Within 3 Months", percent: 20 },
          { stage: "Within 6 Months", percent: 30 },
          { stage: "At Possession", percent: 40 },
        ];
      } else {
        milestones = [
          { stage: "At Booking", percent: 10 },
          { stage: "On Demand 1", percent: 25 },
          { stage: "On Demand 2", percent: 25 },
          { stage: "On Demand 3", percent: 20 },
          { stage: "At Possession", percent: 20 },
        ];
      }
      paymentPlanRows.push({
        projectId: project.id,
        name: `${planType === "CONSTRUCTION_LINKED" ? "Construction Linked" : planType === "POSSESSION_LINKED" ? "Possession Linked" : "Flexi"} Plan`,
        type: planType,
        bookingAmount: bookingAmt,
        milestones,
      });
    }

    // Bank partners (2-4 per project)
    const bankCount = randInt(2, 4);
    const chosenBanks = shuffle(BANK_NAMES).slice(0, bankCount);
    for (const bankName of chosenBanks) {
      bankPartnerRows.push({
        projectId: project.id,
        bankName,
        logoUrl: `https://picsum.photos/seed/${slugify(bankName)}/120/40`,
      });
    }

    // Construction updates (2-4 per project)
    if (status !== "UPCOMING") {
      const updateCount = randInt(2, 4);
      for (let cu = 0; cu < updateCount; cu++) {
        const updateDate = new Date(now.getTime() - randInt(1, 180) * 86400000);
        const progress = Math.min(95, Math.max(5, Math.round((1 - (updateDate.getTime() - (possessionDate.getTime() - 365 * 86400000)) / (365 * 86400000)) * 100) + randInt(-10, 10)));
        constructionUpdateRows.push({
          projectId: project.id,
          title: pick(["Foundation Work", "Structure Progress", "Brickwork Update", "Plastering Work", "Plumbing & Electrical", "Internal Finishing", "External Facade", "Landscaping Progress"]),
          description: pick(["Construction is progressing as per schedule. Quality materials and skilled workforce ensure timely completion.", "Structural work completed for the current phase. Next phase of construction is underway.", "Interior work including flooring, painting, and fittings is in progress.", "Exterior facade and common area development is on track."]),
          photoUrl: `${IMAGE_BASE}/${slug}-cu${cu}/800/600`,
          updateDate,
          progressPercent: status === "READY" ? 100 : progress,
        });
      }
    }

    // Specifications (5-8 per project)
    const specCategories = shuffle(SPECIFICATIONS_DATA).slice(0, randInt(5, 6));
    for (const specCat of specCategories) {
      for (const specItem of specCat.items) {
        specificationRows.push({
          projectId: project.id,
          category: specCat.category,
          label: specItem.label,
          value: pick(specItem.values),
        });
      }
    }

    // FAQs (4-7 per project)
    const faqCount = randInt(4, 7);
    const chosenFaqs = shuffle(FAQ_PAIRS).slice(0, faqCount);
    for (let fq = 0; fq < chosenFaqs.length; fq++) {
      const faq = chosenFaqs[fq]!;
      faqRows.push({
        projectId: project.id,
        question: faq.question,
        answer: faq.answer,
        displayOrder: fq,
      });
    }

    // Highlights (3-5 per project) — short USP bullets for prominent display
    const chosenHighlights = shuffle(HIGHLIGHT_POOL).slice(0, randInt(3, 5));
    for (let hl = 0; hl < chosenHighlights.length; hl++) {
      highlightRows.push({
        projectId: project.id,
        text: chosenHighlights[hl]!,
        displayOrder: hl,
      });
    }
  }

  console.log(`Projects upserted: ${projectIds.length}`);

  // Rebuild children idempotently: delete rows owned by the seeded projects,
  // then recreate everything. Done in a transaction.
  const deleteOps = [
    prisma.lead.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.projectAmenity.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.contact.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.projectMedia.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.nearbyLandmark.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.priceComponent.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.paymentPlan.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.bankPartner.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.constructionUpdate.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.specificationItem.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.projectFAQ.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.projectHighlight.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.unitType.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.tower.deleteMany({ where: { projectId: { in: projectIds } } }),
  ];
  await prisma.$transaction(deleteOps);

  // Towers must be created first so unit types can reference their IDs.
  const towerIdByRef = new Map<string, string>();
  for (const t of towerRows) {
    const created = await prisma.tower.create({
      data: { projectId: t.projectId, name: t.name, totalFloors: t.totalFloors },
    });
    towerIdByRef.set(t.refKey, created.id);
  }

  const unitTypeRows = unitTypeDefs.map(({ towerRefKey, ...u }) => ({
    ...u,
    towerId: towerRefKey ? towerIdByRef.get(towerRefKey) ?? null : null,
  }));

  await prisma.$transaction([
    prisma.tower.createMany({ data: towerRows.map(({ refKey, ...t }) => t) }),
    prisma.unitType.createMany({ data: unitTypeRows }),
    prisma.projectMedia.createMany({ data: mediaRows }),
    prisma.projectAmenity.createMany({ data: amenityRows }),
    prisma.contact.createMany({ data: contactRows }),
    prisma.nearbyLandmark.createMany({ data: nearbyLandmarkRows }),
    prisma.priceComponent.createMany({ data: priceComponentRows }),
    prisma.paymentPlan.createMany({ data: paymentPlanRows }),
    prisma.bankPartner.createMany({ data: bankPartnerRows }),
    prisma.constructionUpdate.createMany({ data: constructionUpdateRows }),
    prisma.specificationItem.createMany({ data: specificationRows }),
    prisma.projectFAQ.createMany({ data: faqRows }),
    prisma.projectHighlight.createMany({ data: highlightRows }),
  ]);

  // Leads reference Contact rows created via createMany above (which does not
  // return ids), so the primary contact per project is looked up afterward to
  // demonstrate Lead.assignedContactId with representative data.
  const primaryContacts = await prisma.contact.findMany({
    where: { projectId: { in: projectIds }, isPrimary: true },
    select: { id: true, projectId: true },
  });
  const primaryContactByProject = new Map(
    primaryContacts.filter((c) => c.projectId).map((c) => [c.projectId as string, c.id]),
  );

  const leadRows: Array<{
    projectId: string;
    builderId: string;
    customerId: string;
    message: string;
    status: LeadStatus;
    contactedAt: Date | null;
    assignedContactId: string | null;
  }> = [];
  for (const projectId of projectIds) {
    if (rng() >= 0.3) continue; // ~30% of projects have at least one sample lead
    const builderId = projectBuilderId.get(projectId);
    if (!builderId) continue;
    const leadCount = randInt(1, 2);
    for (let l = 0; l < leadCount; l++) {
      const status = pick(["NEW", "NEW", "CONTACTED", "IN_PROGRESS"] as const);
      const isContacted = status !== "NEW";
      leadRows.push({
        projectId,
        builderId,
        customerId: pick(customers).id,
        message: pick(LEAD_MESSAGES),
        status,
        contactedAt: isContacted ? new Date(now.getTime() - randInt(1, 10) * 86400000) : null,
        // Only contacted/in-progress leads are assigned to a builder-side
        // contact in this sample data; brand-new leads sit unassigned.
        assignedContactId: isContacted && rng() < 0.6 ? primaryContactByProject.get(projectId) ?? null : null,
      });
    }
  }
  if (leadRows.length > 0) {
    await prisma.lead.createMany({ data: leadRows });
  }

  const summary = await Promise.all([
    prisma.project.count(),
    prisma.tower.count(),
    prisma.unitType.count(),
    prisma.projectMedia.count(),
    prisma.projectAmenity.count(),
    prisma.contact.count(),
    prisma.nearbyLandmark.count(),
    prisma.priceComponent.count(),
    prisma.paymentPlan.count(),
    prisma.bankPartner.count(),
    prisma.constructionUpdate.count(),
    prisma.specificationItem.count(),
    prisma.projectFAQ.count(),
    prisma.projectHighlight.count(),
    prisma.lead.count(),
  ]);

  console.log("Seeding complete!");
  console.log(
    `Projects: ${summary[0]} | Towers: ${summary[1]} | UnitTypes: ${summary[2]} | Media: ${summary[3]} | ProjectAmenities: ${summary[4]} | Contacts: ${summary[5]}`,
  );
  console.log(
    `NearbyLandmarks: ${summary[6]} | PriceComponents: ${summary[7]} | PaymentPlans: ${summary[8]} | BankPartners: ${summary[9]} | ConstructionUpdates: ${summary[10]} | Specifications: ${summary[11]} | FAQs: ${summary[12]}`,
  );
  console.log(`Highlights: ${summary[13]} | Leads: ${summary[14]}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
