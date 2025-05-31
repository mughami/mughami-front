import { type ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="page-container">
      <Header />
      <main className="page-content">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
