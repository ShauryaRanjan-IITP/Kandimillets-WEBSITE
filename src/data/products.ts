import type { Product } from "@/types";

export const products: Product[] = [
  {
    id: "plain-makhana",
    name: "Plain Makhana",
    slug: "plain-makhana",
    category: "makhana",
    description:
      "Premium fox nuts sourced through trusted partners in Madhubani, Bihar. Light, crunchy, and naturally nutritious.",
    longDescription:
      "Our Plain Makhana is sourced through trusted partnerships in Madhubani, Bihar — a region widely recognized for its association with high-quality Makhana production. These premium fox nuts are carefully selected to ensure consistent size, crunch, and nutritional value. Naturally low in calories and rich in protein, Plain Makhana serves as a wholesome snack or a versatile ingredient for a wide range of culinary preparations. Ideal for health-conscious consumers and traditional Indian cooking alike.",
    highlights: [
      "Sourced from Madhubani, Bihar",
      "Naturally low in calories",
      "Rich in protein and minerals",
      "Versatile — snack or cooking ingredient",
      "No artificial additives",
    ],
    image: "/images/makhana-placeholder.jpg",
    availabilityText: "Available for Retail & Bulk Supply",
  },
  {
    id: "salted-makhana",
    name: "Salted Makhana",
    slug: "salted-makhana",
    category: "makhana",
    description:
      "Lightly salted Makhana with the perfect balance of flavor and nutrition. A ready-to-eat healthy snack.",
    longDescription:
      "Our Salted Makhana combines the natural goodness of Madhubani-sourced fox nuts with a light, balanced seasoning of salt. Roasted to achieve the perfect crunch, this ready-to-eat snack offers a healthier alternative to conventional processed snacks. The subtle saltiness enhances the natural flavor of Makhana without overpowering it, making it an ideal option for health-conscious snacking. Perfect for retail shelves and bulk distribution.",
    highlights: [
      "Sourced from Madhubani, Bihar",
      "Lightly salted for balanced flavor",
      "Ready-to-eat healthy snack",
      "Roasted for perfect crunch",
      "Healthier alternative to processed snacks",
    ],
    image: "/images/salted-makhana-placeholder.jpg",
    availabilityText: "Available for Retail & Bulk Supply",
  },
  {
    id: "jaggery-makhana",
    name: "Jaggery Makhana",
    slug: "jaggery-makhana",
    category: "makhana",
    description:
      "Makhana coated with natural jaggery. A sweet, healthy snack combining traditional ingredients.",
    longDescription:
      "Our Jaggery Makhana pairs the nutritious crunch of Madhubani-sourced fox nuts with the natural sweetness of traditional jaggery. This combination creates a wholesome snack that satisfies sweet cravings without the use of refined sugar. Each piece is carefully coated to maintain the right balance of sweetness and crunch. A product rooted in India's tradition of combining natural ingredients for healthy indulgence — perfect for families and retail distribution.",
    highlights: [
      "Sourced from Madhubani, Bihar",
      "Naturally sweetened with jaggery",
      "No refined sugar",
      "Traditional Indian flavors",
      "Perfect for sweet snack cravings",
    ],
    image: "/images/jaggery-makhana-placeholder.jpg",
    availabilityText: "Available for Retail & Bulk Supply",
  },
  {
    id: "ragi-semiya",
    name: "Ragi Semiya",
    slug: "ragi-semiya",
    category: "millet",
    description:
      "Nutritious vermicelli made from finger millet (Ragi). A healthy, versatile base for traditional dishes.",
    longDescription:
      "Our Ragi Semiya is manufactured through trusted partners in Hyderabad, a growing hub for millet-based food products. Made from finger millet (Ragi), this vermicelli is a nutritious alternative to traditional wheat semiya. Rich in calcium, iron, and dietary fiber, Ragi Semiya serves as an excellent base for upma, payasam, and a variety of South Indian preparations. It supports the growing demand for millet-based healthy foods across India.",
    highlights: [
      "Made from finger millet (Ragi)",
      "Manufactured in Hyderabad",
      "Rich in calcium, iron, and fiber",
      "Versatile for multiple dishes",
      "Supports millet-based nutrition",
    ],
    image: "/images/ragi-semiya-placeholder.jpg",
    availabilityText: "Available for Retail & Bulk Supply",
  },
  {
    id: "jowar-pasta",
    name: "Jowar Pasta",
    slug: "jowar-pasta",
    category: "millet",
    description:
      "Healthy pasta made from sorghum (Jowar). A gluten-conscious alternative with rich nutritional value.",
    longDescription:
      "Our Jowar Pasta is manufactured through trusted partners in Hyderabad, utilizing sorghum (Jowar) — one of the most nutritious millets. This pasta offers a healthier alternative to conventional wheat pasta, providing essential nutrients including iron, B vitamins, and dietary fiber. Its mild flavor and pleasant texture make it suitable for a wide range of pasta preparations. An ideal product for health-conscious consumers looking for millet-based alternatives.",
    highlights: [
      "Made from sorghum (Jowar)",
      "Manufactured in Hyderabad",
      "Rich in iron, B vitamins, and fiber",
      "Gluten-conscious alternative",
      "Ideal for health-focused consumers",
    ],
    image: "/images/jowar-pasta-placeholder.jpg",
    availabilityText: "Available for Retail & Bulk Supply",
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return products.map((p) => p.slug);
}
