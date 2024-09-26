import "./globals.css";
import { Amiri, Gowun_Batang } from "next/font/google";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const amiri = Amiri({ subsets: ["arabic"], weight: "700" });
const gowun = Gowun_Batang({ subsets: ["latin"], weight: "400" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="text-center">
          <Link href={"/"}>
            <h1 className={`${amiri.className} text-5xl`}>سم</h1>
            <h4 className={`${gowun.className} text-2xl pt-7`}>Playground</h4>
          </Link>
          <Separator className="my-4 w-3/4 mx-auto" />
        </header>
        <nav className="flex justify-center items-center">
          <Link
            href="/create"
            className="px-4 py-2 text-sm font-medium text-center text-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:underline"
          >
            Create
          </Link>
          <Separator orientation="vertical" className="h-6 mx-2" />
          <Link
            href="/chat"
            className="px-4 py-2 text-sm font-medium text-center text-foreground hover:text-primary transition-colors duration-200 focus:outline-none focus-visible:underline"
          >
            Chat
          </Link>
        </nav>
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
