import {
  ArrowUpDown,
  Baby,
  Droplet,
  Dumbbell,
  Flame,
  Phone,
  PlugZap,
  ShieldCheck,
  Sparkles,
  SquareParking,
  TreePine,
  Users,
  Video,
  Volleyball,
  Waves,
  Zap,
  type LucideIcon,
} from "lucide-react";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  pool: Waves,
  fitness_center: Dumbbell,
  emoji_people: Users,
  bolt: Zap,
  local_parking: SquareParking,
  security: ShieldCheck,
  child_care: Baby,
  park: TreePine,
  elevator: ArrowUpDown,
  videocam: Video,
  water_drop: Droplet,
  local_fire_department: Flame,
  phone: Phone,
  sports_tennis: Volleyball,
  ev_station: PlugZap,
};

export function AmenityIcon({
  icon,
  size = 14,
  className,
}: {
  icon?: string | null;
  size?: number;
  className?: string;
}) {
  const Icon = (icon && AMENITY_ICONS[icon]) || Sparkles;
  return <Icon size={size} className={className} aria-hidden="true" />;
}
