import logo from '@/assets/logo.png';

const Footer = () => {
  return (
    <footer className="py-10 border-t border-border">
      <div className="container mx-auto px-6 flex flex-col items-center gap-3">
        <img src={logo} alt="GCO Store" className="h-10" />
        <p className="text-sm text-muted-foreground">
          GCO STORE · +229 94 52 36 71 · Cotonou, Bénin
        </p>
      </div>
    </footer>
  );
};

export default Footer;
