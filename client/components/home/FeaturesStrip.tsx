const FEATURES = [
  {
    icon: "🚚",
    title: "Free Shipping",
    description: "On orders over $50",
  },
  {
    icon: "↩️",
    title: "Easy Returns",
    description: "30-day return policy",
  },
  {
    icon: "🔒",
    title: "Secure Payment",
    description: "100% protected",
  },
  {
    icon: "💬",
    title: "24/7 Support",
    description: "Always here for you",
  },
];

export default function FeaturesStrip() {
  return (
    <section
      className="py-10 px-4 border-y border-gray-100 bg-white"
      aria-label="Our features"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map(({ icon, title, description }) => (
            <div key={title} className="flex flex-col sm:flex-row items-center sm:items-start gap-3 text-center sm:text-left">
              <span className="text-3xl shrink-0" aria-hidden="true">{icon}</span>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}