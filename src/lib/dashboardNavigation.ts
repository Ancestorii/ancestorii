import {
  Calendar,
  Package,
  Image as ImageIcon,
  CreditCard,
  HelpCircle,
  Settings,
  HandHeart,
  BookOpen,
  Book,
  ShoppingBag,
  Frame,
  Gem,
} from "lucide-react";

export const memoriesLinks = [
  { href: "/dashboard/family", label: "Loved Ones", icon: HandHeart },
  { href: "/dashboard/library", label: "Library", icon: BookOpen },
  { href: "/dashboard/timeline", label: "Timelines", icon: Calendar },
  { href: "/dashboard/capsules", label: "Capsules", icon: Package },
  { href: "/dashboard/albums", label: "Albums", icon: ImageIcon },
];

export const heirloomsLinks = [
  { href: "/dashboard/books", label: "Memory Books", icon: Book },
  { href: "/dashboard/canvas", label: "Memory Canvases", icon: Frame },
  { href: "/dashboard/acrylic", label: "Acrylic Prints", icon: Gem },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
];

export const accountLinks = [
  { href: "/dashboard/plans", label: "Plans", icon: CreditCard },
  { href: "/dashboard/help", label: "Support", icon: HelpCircle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];