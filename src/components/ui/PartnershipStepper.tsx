
const steps = [
  {
    number: 1,
    title: "Get in Touch",
    description: "Call or email us to express your interest",
  },
  {
    number: 2,
    title: "Discussion",
    description: "We understand your requirements and region",
  },
  {
    number: 3,
    title: "MOQ Discussion",
    description: "Finalize minimum order quantities and terms",
  },
  {
    number: 4,
    title: "Sample",
    description: "Receive product samples for quality assessment",
  },
  {
    number: 5,
    title: "Order Placement",
    description: "Place your order and begin your partnership",
  },
];

export default function PartnershipStepper() {
  return (
    <div className="w-full">
      {/* Desktop: Horizontal stepper */}
      <div className="hidden md:flex items-start justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-6 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-green-300 via-gold-400 to-green-300" />

        {steps.map((step) => (
          <div
            key={step.number}
            className="flex flex-col items-center text-center relative z-10 flex-1 px-2"
          >
            <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center font-heading font-bold text-lg shadow-md">
              {step.number}
            </div>
            <h4 className="font-heading font-semibold text-brown-800 mt-3 text-sm">
              {step.title}
            </h4>
            <p className="text-xs text-brown-500 mt-1 max-w-[140px]">
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Mobile: Vertical stepper */}
      <div className="flex flex-col md:hidden relative pl-8">
        {/* Vertical connecting line */}
        <div className="absolute left-[19px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-green-300 via-gold-400 to-green-300" />

        {steps.map((step, index) => (
          <div
            key={step.number}
            className={`flex items-start gap-4 relative ${
              index < steps.length - 1 ? "pb-8" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-heading font-bold text-sm shadow-md shrink-0 -ml-8 z-10">
              {step.number}
            </div>
            <div>
              <h4 className="font-heading font-semibold text-brown-800 text-sm">
                {step.title}
              </h4>
              <p className="text-xs text-brown-500 mt-1">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-wrap gap-4 justify-center mt-10">
        <a
          href="tel:+919973453069"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Us
        </a>
        <a
          href="mailto:millet2024usha@gmail.com"
          className="inline-flex items-center gap-2 border-2 border-brown-300 text-brown-700 hover:bg-brown-50 font-semibold px-6 py-3 rounded-xl transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
          Email Us
        </a>
      </div>
    </div>
  );
}
