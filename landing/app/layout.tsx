import "./globals.css";

export const metadata = {
    title: "Blind - Intentional Dating",
    description: "Connect based on values, personality, and life goals.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
