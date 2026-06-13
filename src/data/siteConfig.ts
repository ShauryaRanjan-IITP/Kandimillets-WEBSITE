import type { SiteConfig } from "@/types";

const siteConfig: SiteConfig = {
  brand: {
    name: "Kandimillets",
    tagline: "Authentically Sourced Healthy Foods from India's Trusted Regions",
    founded: "January 2024",
    description:
      "Kandimillets brings you premium healthy foods — from Madhubani's finest Makhana to Patna's traditional Sattu and Hyderabad's nutritious millet products. We source through trusted regional partnerships to deliver authentic quality to retailers and distributors across India.",
  },

  contact: {
    phone: "9973453069",
    phoneAction: "tel:+919973453069",
    email: "millet2024usha@gmail.com",
    address: [
      "Kandimillets",
      "Hyderabad, Telangana",
      "India",
    ],
    googleMapsUrl: "https://maps.google.com/?q=Hyderabad+Telangana+India",
    googleMapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.3167028!2d78.2432!3d17.3850!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xae93b78392bafbc2!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  },

  seo: {
    domain: "https://kandimillets.com",
    defaultTitle: "Kandimillets — Authentically Sourced Healthy Foods from India",
    titleTemplate: "%s | Kandimillets",
    defaultDescription:
      "Premium Makhana from Madhubani, traditional Sattu from Patna, Bihar, and nutritious millet products. Kandimillets — your trusted partner for healthy food distribution across India.",
  },

  forms: {
    googleSheetsUrl: process.env.GOOGLE_SHEETS_WEBHOOK_URL || "",
  },
};

export default siteConfig;
