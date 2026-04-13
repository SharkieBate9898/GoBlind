import "./globals.css";

export const metadata = {
    title: "Blind - Admin Dashboard",
    description: "Internal dashboard for managing users and waitlists.",
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
