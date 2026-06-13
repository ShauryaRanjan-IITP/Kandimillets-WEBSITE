import type { Service } from "@/types";

export const services: Service[] = [
  {
    id: "ai-consulting",
    title: "AI Consulting for Agriculture",
    description:
      "Leverage artificial intelligence to optimize agricultural operations. From crop prediction models to pest detection systems, we help agribusinesses make data-driven decisions.",
    features: [
      "Crop yield prediction models",
      "AI-powered pest and disease detection",
      "Market price forecasting",
      "Supply chain optimization",
    ],
    image: "/images/agri-tech-ai.jpg",
    icon: "brain",
  },
  {
    id: "agri-tech-solutions",
    title: "Agricultural Technology Solutions",
    description:
      "End-to-end technology solutions designed for the agricultural sector. From farm management platforms to IoT-based monitoring, we build tools that modernize farming operations.",
    features: [
      "Farm management platforms",
      "IoT sensor integration",
      "Precision agriculture tools",
      "Weather monitoring systems",
    ],
    image: "/images/agri-tech-solutions.jpg",
    icon: "sprout",
  },
  {
    id: "data-automation",
    title: "Data & Automation",
    description:
      "Transform agricultural data into actionable insights. We design automation pipelines and analytics dashboards that streamline operations and reduce manual effort.",
    features: [
      "Data pipeline development",
      "Analytics dashboards",
      "Process automation",
      "Reporting systems",
    ],
    image: "/images/agri-tech-data.jpg",
    icon: "database",
  },
  {
    id: "digital-transformation",
    title: "Digital Transformation",
    description:
      "Guide agricultural businesses through their digital transformation journey. From digitizing records to building online distribution channels, we enable the transition to modern operations.",
    features: [
      "Business process digitization",
      "E-commerce enablement",
      "Digital marketing strategy",
      "Technology roadmap planning",
    ],
    image: "/images/agri-tech-digital.jpg",
    icon: "monitor",
  },
];
