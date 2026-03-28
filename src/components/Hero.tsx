const Hero = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-24 md:py-32 px-6">
      <div className="container mx-auto max-w-3xl text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
          Votre boutique tech, en ligne.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground font-light max-w-xl mx-auto">
          Consultez notre catalogue, commandez en un message.
        </p>
        <button
          onClick={scrollToProducts}
          className="mt-10 inline-flex items-center px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
        >
          Voir les produits
        </button>
      </div>
    </section>
  );
};

export default Hero;
