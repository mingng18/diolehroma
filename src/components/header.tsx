import Link from "next/link";

export default function Header() {
  return (
    <header className="fixed top-0 w-full p-6 z-100 flex justify-between items-center bg-transparent mix-blend-difference">
      <div className="font-mono text-lg font-light tracking-widest">
        ludens-garage
      </div>
      <nav className="flex gap-6">
        <Link
          href="/work"
          className="font-mono text-sm hover:text-red-500 transition-colors"
        >
          Work
        </Link>
        <Link
          href="/about"
          className="font-mono text-sm hover:text-red-500 transition-colors"
        >
          About
        </Link>
      </nav>
    </header>
  );
}
