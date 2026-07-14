/**
 * Seed script — populates the database with the hardcoded data
 * from the Connect Digitals frontend (Home.jsx)
 *
 * Run: npm run db:seed
 */

import prisma from './prisma';
import { config } from '../config/env';

config; // ensure env is loaded

async function seed() {
  console.log('🌱 Seeding database...');

  // ── Settings ──────────────────────────────────────────────────────
  await prisma.setting.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      websiteName: 'Connect Digitals',
      seoTitle: 'Connect Digitals | Professional Graphic Design & Branding Agency',
      seoDescription:
        'Connect Digitals — We connect your vision, create powerful brands, and captivate your audience with thoughtful design and strategy.',
      contactEmail: 'digitalsconnect@gmail.com',
      contactPhone: '+251923988838',
      socialWhatsapp: 'https://wa.me/251923988838',
    },
  });

  // ── Trusted Brands ────────────────────────────────────────────────
  const brands = [
    { name: 'Andegna', logo: '/Trusted By/Andegna-Logo-Outline-7565946d.webp', altText: 'Andegna', displayOrder: 0 },
    { name: 'Gedylaw', logo: '/Trusted By/Gedylaw-53a5feb2.webp', altText: 'Gedylaw', displayOrder: 1 },
    { name: 'Medavail Pharmaceuticals', logo: '/Trusted By/Medavail-logo-e49b9b88.webp', altText: 'Medavail Pharmaceuticals', displayOrder: 2 },
    { name: 'Niqat', logo: '/Trusted By/Niqat-be4b5d56.webp', altText: 'Niqat', displayOrder: 3 },
    { name: 'PDC', logo: '/Trusted By/PDC-Logo-2483595d.webp', altText: 'PDC', displayOrder: 4 },
    { name: 'Prime All', logo: '/Trusted By/Prime-All-3a38c568.webp', altText: 'Prime All', displayOrder: 5 },
    { name: 'Toco Speciality Coffee', logo: '/Trusted By/toco-speciality-coffee.webp', altText: 'Toco Speciality Coffee', website: 'https://ssaragroup.com/', displayOrder: 6 },
    { name: 'Digital Deresegn', logo: '/Trusted By/digital-deresegn.webp', altText: 'Digital Deresegn', website: 'https://deresegn.et/', displayOrder: 7 },
    { name: 'Awra Designs', logo: '/Trusted By/Awra-Designs.webp', altText: 'Awra Designs', displayOrder: 8 },
  ];

  for (const brand of brands) {
    await prisma.trustedBrand.upsert({
      where: { id: brand.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: brand.name.toLowerCase().replace(/\s+/g, '-'), ...brand },
    });
  }

  // ── Testimonials ──────────────────────────────────────────────────
  const testimonials = [
    { clientName: 'Andegna', position: 'Furniture', clientPhoto: '/Trusted By/Andegna-Logo-Outline-7565946d.webp', review: 'Office signage and catalogs that showcase our furniture with clarity and polish.', rating: 5, displayOrder: 0 },
    { clientName: 'Gedylaw', position: 'Law Firm', clientPhoto: '/Trusted By/Gedylaw-53a5feb2.webp', review: 'Professional branding that reflects the trust and expertise our clients expect.', rating: 5, displayOrder: 1 },
    { clientName: 'Medavail Pharmaceuticals', position: 'Pharmaceutical Import & Wholesale', clientPhoto: '/Trusted By/Medavail-logo-e49b9b88.webp', review: 'A brand identity and company profile that elevated our corporate presence.', rating: 5, displayOrder: 2 },
    { clientName: 'Niqat', position: 'Coffee', clientPhoto: '/Trusted By/Niqat-be4b5d56.webp', review: 'Packaging and social content that brought our coffee brand to life.', rating: 5, displayOrder: 3 },
    { clientName: 'PDC', position: 'Business', clientPhoto: '/Trusted By/PDC-Logo-2483595d.webp', review: 'Clear, confident design that strengthened our market presence.', rating: 5, displayOrder: 4 },
    { clientName: 'Prime All', position: 'Corporate Services', clientPhoto: '/Trusted By/Prime-All-3a38c568.webp', review: 'A business profile cover that makes a lasting first impression.', rating: 5, displayOrder: 5 },
    { clientName: 'Toco Speciality Coffee', position: 'Speciality Coffee', clientPhoto: '/Trusted By/toco-speciality-coffee.webp', review: 'Packaging and print that elevated our café and made our brand unforgettable.', rating: 5, href: 'https://ssaragroup.com/', displayOrder: 6 },
    { clientName: 'Digital Deresegn', position: 'Digital Design Studio', clientPhoto: '/Trusted By/digital-deresegn.webp', review: 'A sharp brand identity that set us apart in the creative and tech space.', rating: 5, href: 'https://deresegn.et/', displayOrder: 7 },
    { clientName: 'Awra Designs', position: 'Design Studio', clientPhoto: '/Trusted By/Awra-Designs.webp', review: 'Creative design that captures our vision and brings our brand to life.', rating: 5, displayOrder: 8 },
  ];

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t }).catch(() => {});
  }

  // ── Hero Slides ───────────────────────────────────────────────────
  const heroSlides = [
    { backgroundImage: '/Hero Images/Branding Raya Hotel & Convention Center.webp', altText: 'Branding for Raya Hotel & Convention Center', displayOrder: 0 },
    { backgroundImage: '/Hero Images/Company Logo Rebranding - Alta Counseling Ethiopia.webp', altText: 'Company logo rebranding for Alta Counseling Ethiopia', displayOrder: 1 },
    { backgroundImage: '/Hero Images/Criterion In Home Care - USA.webp', altText: 'Criterion In Home Care USA brand identity', displayOrder: 2 },
    { backgroundImage: '/Hero Images/Digital Deresegn.webp', altText: 'Digital Deresegn brand identity', displayOrder: 3 },
    { backgroundImage: '/Hero Images/Maleda-Coffee-7b6d183c.webp', altText: 'Maleda Coffee brand identity', displayOrder: 4 },
    { backgroundImage: '/Hero Images/Medavail Pharmaceutical Import & Wholesale.webp', altText: 'Medavail Pharmaceutical brand identity', displayOrder: 5 },
    { backgroundImage: '/Hero Images/Office Signage For Andegna Furniture.webp', altText: 'Andegna Furniture office signage', displayOrder: 6 },
    { backgroundImage: '/Hero Images/Swan Clothing - copy.webp', altText: 'Swan Clothing brand identity', displayOrder: 7 },
  ];

  for (const slide of heroSlides) {
    await prisma.heroSlide.create({ data: slide }).catch(() => {});
  }

  // ── Case Studies ──────────────────────────────────────────────────
  const caseStudies = [
    {
      heroImage: '/Case Studies/Andegna Cataloge.webp',
      title: 'Product Catalog Design',
      slug: 'andegna-furniture-product-catalog',
      client: 'Andegna Furniture',
      overview: 'Andegna Furniture required a clean, professional product catalog to present its furniture collections clearly and attractively to clients.',
      challenge: ['Existing product presentation lacked structure and visual consistency', 'Needed a catalog that was easy to navigate and client-friendly', 'Required balance between aesthetics and clarity'],
      solution: 'I designed a simplified, well-structured product catalog with clear hierarchy, consistent layouts, and refined typography.',
      role: ['Catalog layout and design', 'Visual hierarchy and typography', 'Product presentation consistency'],
      results: 'A professional, easy-to-use product catalog that improved product presentation and supported client decision-making.',
      displayOrder: 0,
    },
    {
      heroImage: '/Case Studies/Alta Counseling.webp',
      title: 'Rebranding & Visual Identity',
      slug: 'alta-counseling-rebranding',
      client: 'Alta Counseling',
      overview: 'Alta Counseling needed a refreshed brand identity that communicated trust, calmness, and professionalism.',
      challenge: ['Outdated visual identity', 'Need for a more approachable and consistent look', 'Required alignment across digital and print materials'],
      solution: 'I redesigned the brand identity using a restrained color palette, clean typography, and a cohesive visual system.',
      role: ['Brand identity redesign', 'Logo refinement', 'Visual system development'],
      results: 'A modern, cohesive visual identity that strengthened trust and improved brand consistency across platforms.',
      displayOrder: 1,
    },
    {
      heroImage: '/Case Studies/Social Media Design for niqat coffee.webp',
      title: 'Social Media Campaign & Digital Design',
      slug: 'niqat-coffee-social-media',
      client: 'Niqat Coffee',
      overview: 'Niqat Coffee needed to build its social media presence from scratch and establish a consistent visual voice.',
      challenge: ['No existing social media accounts', 'Lack of visual direction', 'Need to increase engagement and visibility'],
      solution: "I created the social media accounts, defined a visual direction, and designed consistent content aligned with the brand's personality.",
      role: ['Social media visual design', 'Content creation', 'Campaign consistency'],
      results: 'Improved engagement, stronger brand recognition, and a consistent digital presence.',
      displayOrder: 2,
    },
    {
      heroImage: '/Case Studies/Company Profile - Medavail Pharmaceuticals.webp',
      title: 'Company Profile & Corporate Design',
      slug: 'medavail-company-profile',
      client: 'MedAvail Pharmaceuticals',
      overview: 'MedAvail Pharmaceuticals required a professional company profile to communicate its mission, services, and credibility.',
      challenge: ['Information-heavy content needed clear structure', 'Required a serious, trustworthy visual tone', 'Needed a document suitable for corporate and medical contexts'],
      solution: 'I designed a clean, structured company profile that emphasized readability, hierarchy, and professionalism.',
      role: ['Company profile layout and design', 'Information hierarchy', 'Visual consistency'],
      results: 'A clear, professional company profile that supported corporate communication and reinforced brand credibility.',
      displayOrder: 3,
    },
  ];

  for (const cs of caseStudies) {
    await prisma.caseStudy.create({ data: cs }).catch(() => {});
  }

  // ── Blog Posts ────────────────────────────────────────────────────
  const blogPosts = [
    {
      title: 'Branding',
      slug: 'branding',
      featuredImage: '/Blog/Branding.webp',
      excerpt: 'Building strong brand identities that resonate',
      content: `A strong brand identity is the foundation of every successful business. It goes far beyond just a logo—it encompasses your visual language, messaging, color palette, typography, and the emotional connection you create with your audience.\n\nEffective branding builds recognition, trust, and loyalty over time. When customers see your brand consistently across touchpoints, they develop a sense of familiarity that makes choosing your business feel natural. We help businesses develop cohesive brand systems that communicate their values, differentiate them from competitors, and set them apart in the market.\n\nFrom startups to established enterprises, investing in thoughtful branding pays dividends. A well-crafted brand identity can increase perceived value, command premium pricing, and create lasting customer relationships. The key is consistency: every piece of communication—from your website to your business cards to your social media—should feel unmistakably like you.`,
      status: 'published',
      published: true,
      publishedAt: new Date(),
      displayOrder: 0,
    },
    {
      title: 'Consistency',
      slug: 'consistency',
      featuredImage: '/Blog/Consistency.webp',
      excerpt: 'Why consistency matters in design',
      content: `Consistency in design creates familiarity and builds trust with your audience. When your visuals, tone, and messaging align across all touchpoints—from social media to print materials to packaging—you reinforce your brand's identity and make it easier for customers to recognize and remember you.\n\nThink of your favorite brands: chances are, you can identify them instantly by their colors, typography, or visual style. That recognition doesn't happen by accident. It's the result of meticulous attention to consistency across every customer interaction.\n\nInconsistency, on the other hand, can confuse customers and dilute your brand's impact. Mixed fonts, clashing colors, and varying tones make your brand feel unprofessional and forgettable. Whether you're a small business or a growing enterprise, maintaining design consistency should be a priority in every project you undertake.`,
      status: 'published',
      published: true,
      publishedAt: new Date(),
      displayOrder: 1,
    },
    {
      title: 'Design Principles',
      slug: 'design-principles',
      featuredImage: '/Blog/Design principles.webp',
      excerpt: 'Core principles that guide great design',
      content: `Great design is guided by fundamental principles that have stood the test of time. Balance, hierarchy, contrast, alignment, repetition, and whitespace—these aren't arbitrary rules but proven frameworks that help create visuals that are both beautiful and effective.\n\nBalance distributes visual weight so that no single element dominates awkwardly. Hierarchy guides the eye to what matters most, ensuring your message gets across. Contrast creates emphasis and makes content readable. Alignment creates order and professionalism. Repetition builds recognition and reinforces your brand. And whitespace—often overlooked—gives your design room to breathe.\n\nUnderstanding these principles isn't about following rigid rules; it's about having a toolkit to make intentional decisions. At Connect Digitals, we apply these principles to every project, ensuring your designs communicate clearly and resonate with your target audience.`,
      status: 'published',
      published: true,
      publishedAt: new Date(),
      displayOrder: 2,
    },
    {
      title: 'Graphic Design Trends 2026',
      slug: 'graphic-design-trends-2026',
      featuredImage: '/Blog/Graphic Design Trends 2026.webp',
      excerpt: 'Trends shaping the design industry',
      content: `The design landscape continues to evolve with new trends each year, and 2026 is no exception. We're seeing bold typography make a comeback, with oversized headlines and expressive typefaces that demand attention. Sustainable design choices are increasingly important as brands align their visuals with environmental values.\n\nAI-assisted creativity is transforming how designers work—not replacing human creativity, but augmenting it. Tools that streamline repetitive tasks free up time for strategic thinking and unique ideas. There's also a renewed focus on authenticity: consumers are drawn to brands that feel genuine rather than overly polished or generic.\n\nEmerging 2026 trends include dynamic 3D elements, immersive spatial design, and hyper-personalized visuals. Nostalgic aesthetics continue to resonate, with retro-futurism and Y2K-inspired graphics gaining traction. Staying informed about these trends helps brands remain relevant while maintaining their unique voice.`,
      status: 'published',
      published: true,
      publishedAt: new Date(),
      displayOrder: 3,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.create({ data: post }).catch(() => {});
  }

  console.log('✅ Seed complete.');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('Seed error:', e);
  process.exit(1);
});
