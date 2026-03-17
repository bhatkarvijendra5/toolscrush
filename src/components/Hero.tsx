const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-6 pb-4 md:pt-12 md:pb-6 px-4" aria-labelledby="hero-heading">
      <div className="container relative z-10 mx-auto">
        <div className="mx-auto max-w-4xl text-center">
          <h1 id="hero-heading" className="mb-3 text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Free Online PDF & Image Tools
          </h1>
          
          <p className="mb-2 text-sm sm:text-base md:text-lg text-muted-foreground px-4">
            Merge, split, compress, convert, and edit your documents with professional-grade tools. Fast, secure, and completely free — no signup required.
          </p>
          
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-foreground">
            A Smarter Way to Work with Files
          </h2>
        </div>
      </div>
    </section>
  );
};

export default Hero;
