import { Playfair_Display, Lato } from "next/font/google";
import { getSEOTags } from "@/libs/seo";
import ClientLayout from "@/components/common/LayoutClient";
import config from "@/config";
import "./globals.css";
import { ReactNode } from "react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
  variable: "--font-lato",
});

export const viewport = {
	themeColor: config.colors.main,
	width: "device-width",
	initialScale: 1,
};

// Default SEO tags for all pages
export const metadata = getSEOTags();

// Generate CSS variables from config.js
const dynamicStyles = `
  :root {
    --color-primary: ${config.colors.main};
    --color-primary-dark: ${config.colors.dark};
    --color-primary-light: ${config.colors.light};
  }
`;

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="fr"
			data-theme={config.colors.theme}
			className={`${playfair.variable} ${lato.variable} ${lato.className}`}
		>
			<head>
				<style dangerouslySetInnerHTML={{ __html: dynamicStyles }} />
			</head>
			<body>
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	);
}
