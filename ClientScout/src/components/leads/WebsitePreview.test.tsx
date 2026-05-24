import { render, screen } from "@testing-library/react";
import WebsitePreview from "./WebsitePreview";

describe("WebsitePreview", () => {
  const layout = {
    templateKey: "modern-business",
    themeKey: "light",
    content: {
      hero: {
        headline: "Launch your next product",
        tagline: "A simple and focused way to convert visitors.",
        primaryCta: "Start Free Trial",
        secondaryCta: "Learn More",
      },
      about: {
        title: "About Our Service",
        description: "We help businesses scale with fast, modern websites.",
      },
      services: [
        { name: "Strategy", description: "Plan for long-term growth." },
        { name: "Design", description: "Beautiful experiences that convert." },
      ],
      contact: {
        phone: "123-456-7890",
        address: "123 Main St, Anytown",
        ctaText: "Contact Us",
      },
    },
    generatedAt: "2026-05-24",
  };

  it("renders the hero heading and CTA", () => {
    render(
      <WebsitePreview
        layout={layout}
        businessName="Test Company"
        industry="education"
        businessType="tutoring"
      />,
    );

    expect(screen.getByText(/Launch your next product/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Start Free Trial/i })).toBeInTheDocument();
    expect(screen.getByText(/About Our Service/i)).toBeInTheDocument();
  });
});
