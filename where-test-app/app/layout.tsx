import WhereReporter from '../components/WhereReporter';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <WhereReporter />
        {children}
      </body>
    </html>
  );
}