import { Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12 border-t border-border bg-card/30">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Gamepad2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-orbitron text-lg font-bold text-foreground">SUNSTONE ESPORTS</p>
              <p className="text-xs text-muted-foreground">Kill Fest Arena 2026</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#games" className="hover:text-primary transition-colors">Games</a>
            <a href="#rules" className="hover:text-primary transition-colors">Rules</a>
            <Link to="/auth" className="hover:text-primary transition-colors">Admin</Link>
          </div>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © 2026 Sunstone Esports. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;