
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  ChartNoAxesCombined,
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="sidebar bg-[#1F2937] text-white">
      <nav>
        <ul className="sidebar-menu p-3">
          <li>
            <Link href="/" className="flex items-center gap-1">
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
          </li>

          <li>
            <Link href="/products" className="flex items-center gap-1">
              <Package size={20} />
              <span>Products</span>
            </Link>
          </li>

          <li>
            <Link href="/users" className="flex items-center gap-1">
              <Users size={20} />
              <span>Users</span>
            </Link>
          </li>

          <li>
            <Link href="/analytics" className="flex items-center gap-1">
              <ChartNoAxesCombined size={20} />
              <span>Analytics</span>
            </Link>
          </li>

          <li>
            <Link href="/settings" className="flex items-center gap-1">
              <Settings size={20} />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
