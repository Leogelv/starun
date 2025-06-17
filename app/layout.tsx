import type {Metadata} from "next";
import {Inter, Poppins} from "next/font/google";
import "../fsd/app/styles/globals.css";
import {ReactQueryProvider} from "@/fsd/app/providers/ReactQueryProvider";
import AntdWrapper from "@/fsd/app/providers/AntdWrapper";


const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "cyrillic"],
});

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
    title: "Mini App",
    description: "",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ru">
        <body
            className={`${inter.variable} ${poppins.variable} antialiased font-inter`}
        >
        <ReactQueryProvider>
            <AntdWrapper>
                <main>
                    {children}
                </main>
            </AntdWrapper>
        </ReactQueryProvider>
        </body>
        </html>
    );
}
