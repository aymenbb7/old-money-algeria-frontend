

const Logo = ({ className = "h-10 w-10" }) => (
  <div className={`rounded-full bg-primary flex items-center justify-center border border-accent ${className}`}>
    <span className="text-accent text-[8px] font-playfair font-bold text-center leading-tight">OLD<br/>MONEY</span>
  </div>
);

export default Logo;
