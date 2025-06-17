import type {Metadata} from "next";
import {Montserrat} from "next/font/google";
import "../fsd/app/styles/globals.css";
import {ReactQueryProvider} from "@/fsd/app/providers/ReactQueryProvider";
import AntdWrapper from "@/fsd/app/providers/AntdWrapper";


const montserrat = Montserrat({
    variable: "--font-montserrat",
    subsets: ["latin", "cyrillic"],
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
            className={`${montserrat.variable} antialiased font-montserrat`}
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
