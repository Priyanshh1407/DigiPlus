import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getKBArticles = async (req, res) => {
  try {
    const articles = await prisma.kBArticle.findMany();
    res.json(articles);
  } catch (error) {
    console.error("Error fetching KB articles:", error);
    res.status(500).json({ error: "Failed to fetch KB articles" });
  }
};
