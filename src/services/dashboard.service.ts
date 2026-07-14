import prisma from '../database/prisma';

export async function getDashboardStats() {
  const [
    heroSlides,        publishedHero,
    portfolioProjects, publishedPortfolio,
    caseStudies,       publishedCaseStudies,
    blogPosts,         publishedBlog,
    trustedBrands,     publishedBrands,
    testimonials,      publishedTestimonials,
    newLeads,
    recentActivity,
  ] = await prisma.$transaction([
    prisma.heroSlide.count(),
    prisma.heroSlide.count({ where: { published: true } }),
    prisma.portfolioProject.count(),
    prisma.portfolioProject.count({ where: { published: true } }),
    prisma.caseStudy.count(),
    prisma.caseStudy.count({ where: { published: true } }),
    prisma.blogPost.count(),
    prisma.blogPost.count({ where: { published: true } }),
    prisma.trustedBrand.count(),
    prisma.trustedBrand.count({ where: { published: true } }),
    prisma.testimonial.count(),
    prisma.testimonial.count({ where: { published: true } }),
    prisma.contactLead.count({ where: { status: 'new' } }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: { id: true, action: true, entity: true, entityId: true, title: true, createdAt: true },
    }),
  ]);

  return {
    counts: {
      heroSlides,
      portfolioProjects,
      caseStudies,
      blogPosts,
      trustedBrands,
      testimonials,
      newLeads,
    },
    published: {
      heroSlides:        publishedHero,
      portfolioProjects: publishedPortfolio,
      caseStudies:       publishedCaseStudies,
      blogPosts:         publishedBlog,
      trustedBrands:     publishedBrands,
      testimonials:      publishedTestimonials,
    },
    recentActivity: recentActivity.map((a) => ({
      id:        a.id,
      action:    a.action,   // created | updated | published | deleted
      entity:    a.entity,   // portfolio | blog | hero | etc.
      entityId:  a.entityId,
      title:     a.title,
      createdAt: a.createdAt,
    })),
  };
}
