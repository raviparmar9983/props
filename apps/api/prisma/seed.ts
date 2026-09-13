import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcrypt";

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ── Seed data ──────────────────────────────────────

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
  { name: "Entrance Gate", description: "Grand entrance with safe and beautiful features", icon: "security" },
  { name: "Society Meeting Room", description: "A space for residents to organize meetings and discussions", icon: "emoji_people" },
  { name: "Pick Up & Drop Point", description: "Safe and convenient access for students", icon: "directions_bus" },
  { name: "Entrance Plaza", description: "Stunning welcome with elegant design", icon: "location_city" },
  { name: "Lounge & Library", description: "Library with comfy seats and cool books", icon: "local_library" },
  { name: "Skateboarding Surface", description: "A smooth scape for gliding fun", icon: "sports_tennis" },
  { name: "Landscape Garden", description: "Elegant green environment for relaxation", icon: "park" },
  { name: "Plaza", description: "Open gathering space for residents", icon: "emoji_people" },
  { name: "Car Parking", description: "Spacious and secure elevated vehicle parking area", icon: "local_parking" },
  { name: "Indoor Game", description: "Play games in a specially designed indoor area", icon: "sports_tennis" },
  { name: "Badminton Court", description: "To play and practice your smash", icon: "sports_tennis" },
  { name: "Entrance Foyer", description: "Stunning front lobby area", icon: "living" },
  { name: "Multipurpose Hall", description: "All-purpose hall for events and functions", icon: "emoji_people" },
  { name: "Dry Fountain", description: "A decorative fountain with a lot of aesthetic value", icon: "water_drop" },
  { name: "Gym", description: "State-of-the-art fitness center for daily exercises", icon: "fitness_center" },
  { name: "Children Play Area", description: "Safe and leisure area for children", icon: "child_care" },
  { name: "Veranda With Swings", description: "Relaxing sit-out with gentle swings", icon: "park" },
  { name: "Security With CCTV", description: "Advanced monitoring security 24/7", icon: "security" },
  { name: "Common DTH", description: "Shared satellite dish access for everyone", icon: "satellite_alt" },
  { name: "Generator For Common Areas", description: "Generator for uninterrupted common services", icon: "bolt" },
  { name: "Jogging Track", description: "Dedicated track for walking and jogging", icon: "directions_run" },
  { name: "Yoga/Meditation Area", description: "Peaceful space for yoga and meditation", icon: "self_improvement" },
  { name: "Children's Pool", description: "Safe swimming area designed for children", icon: "pool" },
  { name: "Party Lawn", description: "Outdoor space for parties and social gatherings", icon: "park" },
  { name: "Community Garden", description: "Green space for residents to relax and connect with nature", icon: "park" },
  { name: "Gazebo", description: "Covered outdoor seating area for relaxation", icon: "park" },
  { name: "Senior Citizen Area", description: "Dedicated relaxation and seating area for senior residents", icon: "elderly" },
  { name: "Visitor Parking", description: "Dedicated parking spaces for visitors", icon: "local_parking" },
  { name: "Visitor Management", description: "Managed entry and visitor registration system", icon: "security" },
  { name: "Video Door Phone", description: "Secure visitor identification and communication system", icon: "videocam" },
  { name: "Solar Power", description: "Solar energy system for common areas", icon: "solar_power" },
  { name: "Waste Management", description: "Dedicated waste collection and management facilities", icon: "delete" },
  { name: "Sewage Treatment Plant", description: "On-site sewage treatment facility", icon: "water_drop" },
  { name: "Water Treatment Plant", description: "Water purification and treatment facility", icon: "water_drop" },
  { name: "24/7 Water Supply", description: "Round-the-clock water supply for residents", icon: "water_drop" },
  { name: "Shopping Area", description: "Convenient retail facilities within the community", icon: "shopping_cart" },
  { name: "Convenience Store", description: "Essential daily-use items available within the society", icon: "store" },
  { name: "ATM", description: "ATM facility within the community", icon: "account_balance" },
  { name: "Cafeteria", description: "On-site cafeteria for residents", icon: "restaurant" },
  { name: "Creche", description: "Daycare facility for young children", icon: "child_care" },
  { name: "Pet Area", description: "Dedicated outdoor space for pets", icon: "pets" },
  { name: "Pet Park", description: "Recreational area designed for pets", icon: "pets" },
  { name: "Table Tennis", description: "Indoor table tennis facility", icon: "sports_tennis" },
  { name: "Basketball Court", description: "Dedicated court for basketball activities", icon: "sports_basketball" },
  { name: "Tennis Court", description: "Dedicated tennis court for residents", icon: "sports_tennis" },
  { name: "Volleyball Court", description: "Dedicated volleyball court", icon: "sports_volleyball" },
  { name: "Cricket Practice Area", description: "Space for cricket practice and recreation", icon: "sports_cricket" },
  { name: "Indoor Games Room", description: "Indoor recreational area for residents", icon: "sports_esports" },
  { name: "Spa", description: "Wellness and relaxation facility", icon: "spa" },
  { name: "Sauna", description: "Relaxation facility with sauna amenities", icon: "spa" },
  { name: "Steam Room", description: "Dedicated steam room for relaxation", icon: "spa" },
  { name: "Changing Room", description: "Changing facilities for residents using recreational amenities", icon: "checkroom" },
  { name: "Guest Room", description: "Guest accommodation available within the society", icon: "hotel" },
  { name: "Co-working Space", description: "Dedicated workspace for residents", icon: "business_center" },
  { name: "Wi-Fi Zone", description: "Wi-Fi connectivity in common areas", icon: "wifi" },
  { name: "Mail Room", description: "Dedicated area for receiving and managing mail", icon: "mail" },
  { name: "Laundry Facility", description: "Convenient laundry facility for residents", icon: "local_laundry_service" },
  { name: "Car Wash", description: "Dedicated vehicle washing facility", icon: "local_car_wash" },
  { name: "Bicycle Parking", description: "Secure parking area for bicycles", icon: "pedal_bike" },
  { name: "Bicycle Track", description: "Dedicated cycling track within the community", icon: "pedal_bike" },
  { name: "Organic Waste Composting", description: "Facility for processing organic household waste", icon: "compost" },
  { name: "Rainwater Storage", description: "System for collecting and storing rainwater", icon: "water_drop" },
  { name: "Fire Alarm System", description: "Fire detection and alarm system", icon: "local_fire_department" },
  { name: "Fire Extinguishers", description: "Fire extinguishing equipment in common areas", icon: "local_fire_department" },
  { name: "Earthquake Resistant", description: "Building designed with earthquake-resistant features", icon: "domain" },
];

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

// ── Main ───────────────────────────────────────────

async function main() {
  console.log("Seeding database...");

  // 1. Admin user (essential for the admin console)
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

  // 2. Amenities
  for (const amenity of AMENITIES) {
    await prisma.amenity.upsert({
      where: { name: amenity.name },
      update: { icon: amenity.icon, description: amenity.description },
      create: amenity,
    });
  }
  console.log(`Amenities: ${AMENITIES.length}`);

  // 3. Cities with localities
  for (const cityData of CITIES) {
    const { localities, ...cityFields } = cityData;
    const city = await prisma.city.upsert({
      where: { slug: cityFields.slug },
      update: {},
      create: cityFields,
    });

    for (const locName of localities) {
      const locSlug = slugify(locName);
      await prisma.locality.upsert({
        where: { cityId_slug: { cityId: city.id, slug: locSlug } },
        update: {},
        create: { cityId: city.id, name: locName, slug: locSlug },
      });
    }
    console.log(`City: ${city.name} with ${localities.length} localities`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });