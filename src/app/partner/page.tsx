import type { Metadata } from "next";
import PageHero from "@/components/ui/PageHero";
import SectionHeader from "@/components/ui/SectionHeader";
import PartnershipStepper from "@/components/ui/PartnershipStepper";
import InquiryForm from "@/components/ui/InquiryForm";
import CTASection from "@/components/ui/CTASection";

export const metadata: Metadata = {
  title: "Partner With Us | Retailers & Distributors",
  description: "Join our network of retailers and distributors. Partner with Kandimillets for premium, authentic millet products with reliable supply and great margins.",
};

export default function PartnerPage() {
  return (
    <main className="min-h-screen bg-warm-50">
      <PageHero
        title="Partner With Us"
        subtitle="Join our growing network of retailers, distributors, and bulk buyers. Let's bring healthy, authentic millets to more people."
        variant="brown"
      />

      {/* Why Partner Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Why Partner With Kandimillets?"
            subtitle="We build long-term relationships based on trust, quality, and mutual growth."
          />
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-warm-200 text-center">
              <div className="w-16 h-16 mx-auto bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-brown-900 mb-3">Premium Quality</h3>
              <p className="text-brown-600">Authentic, sustainably sourced millets processed to retain maximum nutrition.</p>
            </div>
            <div className="bg-warm-50 p-8 rounded-2xl shadow-sm border border-warm-200 text-center">
              <div className="w-16 h-16 mx-auto bg-gold-50 text-gold-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-brown-900 mb-3">Great Margins</h3>
              <p className="text-brown-600">Competitive pricing for bulk orders ensuring profitable margins for your business.</p>
            </div>
            <div className="bg-warm-50 p-8 rounded-2xl shadow-sm border border-warm-200 text-center">
              <div className="w-16 h-16 mx-auto bg-brown-50 text-brown-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h3 className="text-xl font-heading font-semibold text-brown-900 mb-3">Reliable Supply</h3>
              <p className="text-brown-600">Consistent availability and timely deliveries to keep your shelves stocked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Process */}
      <section className="py-20 bg-warm-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="How To Partner"
            subtitle="A simple, straightforward process to become an authorized partner."
          />
          <div className="mt-16">
            <PartnershipStepper />
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-brown-900 mb-4">
              Submit an Inquiry
            </h2>
            <p className="text-brown-600">
              Fill out the form below and our wholesale team will get back to you within 24 hours.
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>
      
      <section className="py-20 bg-warm-100">
        <div className="px-4 sm:px-6 lg:px-8">
          <CTASection 
          title="Ready to Partner?" 
          subtitle="Get in touch with us to start a profitable partnership today."
          variant="brown"
        />
        </div>
      </section>
    </main>
  );
}
