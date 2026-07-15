import Head from 'next/head';
import { ThemeProvider, createTheme } from 'next-themes';
import Navbar from '../components/Navbar';

const theme = createTheme({
  // Your theme configuration
});

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme} attribute="class">
      <Head>
        <title>Vyqour App</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="container mx-auto p-4 pt-6 mt-6">{children}</main>
      </div>
    </ThemeProvider>
  );
}

export default RootLayout;