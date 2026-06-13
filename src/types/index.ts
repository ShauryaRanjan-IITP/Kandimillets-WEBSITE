/* ===================================================
   KANDIMILLETS — TypeScript Type Definitions
   =================================================== */

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: "makhana" | "millet" | "sattu";
  description: string;
  longDescription: string;
  highlights: string[];
  image: string;
  availabilityText: string;
}

export interface SourcingStory {
  id: string;
  region: string;
  state: string;
  product: string;
  story: string;
  image: string;
}

export interface Leader {
  id: string;
  name: string;
  designation: string;
  image: string;
  bio: string;
}

export interface TrustItem {
  id: string;
  title: string;
  description: string;
  icon: "shield" | "building" | "check" | "handshake";
}

export interface Service {
  id: string;
  title: string;
  description: string;
  features: string[];
  image: string;
  icon: "brain" | "sprout" | "database" | "monitor";
}

export interface NavLink {
  label: string;
  href: string;
  isExternal?: boolean;
}

export interface OperationLocation {
  id: string;
  city: string;
  state: string;
  status: "active" | "expanding";
  description: string;
}

export interface SiteConfig {
  brand: {
    name: string;
    tagline: string;
    founded: string;
    description: string;
  };
  contact: {
    phone: string;
    phoneAction: string;
    email: string;
    address: string[];
    googleMapsUrl: string;
    googleMapsEmbed: string;
  };
  seo: {
    domain: string;
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
  };
  forms: {
    googleSheetsUrl: string;
  };
}

export interface InquiryFormData {
  name: string;
  businessName: string;
  email: string;
  location: string;
  phone: string;
  productInterest: string;
  message: string;
}
