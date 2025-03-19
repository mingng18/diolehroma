import Link from "next/link";
import { useRouter } from "next/router";

const path = [
  {
    label: "Work",
    href: "/",
  },
  {
    label: "About",
    href: "/about",
  },
];

export default function Header() {
  const router = useRouter();
  return (
    <header className="fixed top-0 w-full p-6 z-100 flex justify-between items-center bg-transparent mix-blend-difference">
      <div className="font-mono text-lg font-light tracking-widest text-gray-50">
        ludens-garage
      </div>
      <nav className="flex gap-6">
        {path.map((item) => (
          // underline when it is active
          <Link
            key={item.href}
            href={item.href}
            className={`font-mono text-sm text-gray-50 hover:text-blue-500 transition-colors ${
              router.pathname === item.href ? "underline" : ""
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
