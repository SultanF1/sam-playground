import { Amiri, Gowun_Batang } from "next/font/google";
import "./globals.css";
const amiri = Amiri({ subsets: ["arabic"], weight: "700" });
const gowun = Gowun_Batang({ subsets: ["latin"], weight: "700" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="text-center text-5xl">
          <h1 className={amiri.className}>سم</h1>
          <h4 className={`${gowun.className} text-center text-2xl pt-7`}>
            Playground
          </h4>
        </div>
        <hr className="w-1/2 h-0.1 mx-auto my-auto bg-gray-100 border-10 rounded md:my-2 dark:bg-gray-700"></hr>
        {children}
      </body>
    </html>
  );
}
