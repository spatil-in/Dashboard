import Image from "next/image";
import { FloatingNav } from "@/components/ui/floating-navbar";

import {
  House,
  User,
  Briefcase,
  Mail,
} from "lucide-react";

const navItems = [
  {
    name: "Home",
    link: "#home",
    icon: <House size={18} />,
  },
  {
    name: "About",
    link: "#about",
    icon: <User size={18} />,
  },
  {
    name: "Projects",
    link: "#projects",
    icon: <Briefcase size={18} />,
  },
  {
    name: "Contact",
    link: "#contact",
    icon: <Mail size={18} />,
  },
];

export default function Home() {
  return (
    <>
      <FloatingNav navItems={navItems} />
    </>
  );
}
