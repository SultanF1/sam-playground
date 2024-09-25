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
          <h1 className={`${amiri.className} text-5xl`}>سم</h1>
          <h4 className={`${gowun.className} text-2xl pt-7`}>Playground</h4>
          <Separator className="my-1 w-3/4 mx-auto" />
        </header>
        <nav className="flex justify-center space-x-4 py-4">
          <Link
            href="/create"
            className="px-4 py-2 text-sm font-medium text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75"
          >
            Create
          </Link>
          <Link
            href="/chat"
            className="px-4 py-2 text-sm font-medium text-center bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75"
          >
            Chat
          </Link>
        </nav>
        <main className="flex-grow">{children}</main>
      </body>
    </html>
  );
}
