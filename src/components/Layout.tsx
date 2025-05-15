import { type ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="page-container">
      <Header />
      <main className="page-content">{children}</main>
    </div>
  );
};

export default Layout;
