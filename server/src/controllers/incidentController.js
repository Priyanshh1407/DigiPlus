import { PrismaClient } from '@prisma/client';
import { analyzeIncident, suggestKBArticles, detectDuplicate } from '../services/aiService.js';

const ASSIGNEE_MAP = {
  "Hardware": "Alex (Hardware Specialist)",
  "Software": "Sam (Software Engineer)",
  "Network": "Taylor (Network Admin)",
  "Database": "Jordan (DBA)",
  "Security": "Casey (SecOps)",
  "UI/UX": "Jamie (Designer)",
  "Other": "Tier 1 Support"
};

const prisma = new PrismaClient();

export const getIncidents = async (req, res) => {
  try {
    const incidents = await prisma.incident.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(incidents);
  } catch (error) {
    console.error("Error fetching incidents:", error);
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
};

export const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;
    const incident = await prisma.incident.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!incident) {
      return res.status(404).json({ error: "Incident not found" });
    }
    
    res.json(incident);
  } catch (error) {
    console.error("Error fetching incident:", error);
    res.status(500).json({ error: "Failed to fetch incident" });
  }
};

export const analyzeIncidentPreview = async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }
    const analysis = await analyzeIncident(title, description);
    res.json(analysis);
  } catch (error) {
    console.error("Error generating analysis preview:", error);
    res.status(500).json({ error: "Failed to analyze incident" });
  }
};

export const createIncident = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: "Title and description are required" });
    }
    
    // Run core AI analysis
    const analysis = await analyzeIncident(title, description);
    
    // Fetch all KB articles for similarity matching
    const kbArticles = await prisma.kBArticle.findMany();
    
    // Run KB suggestion AI
    const kbSuggestions = await suggestKBArticles(title, description, kbArticles);
    
    const linkedKbArticleIds = JSON.stringify(kbSuggestions.suggestedArticles || []);
    
    // Check for duplicates
    const recentIncidents = await prisma.incident.findMany({
      where: { status: "open" },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    const duplicateCheck = await detectDuplicate(title, description, recentIncidents);
    const isDuplicate = duplicateCheck.isDuplicate || false;
    const duplicateOfId = duplicateCheck.duplicateOfId || null;
    
    // Auto-assignment
    const assignee = ASSIGNEE_MAP[analysis.category] || "Unassigned";
    
    const incident = await prisma.incident.create({
      data: {
        title,
        description,
        status: "open",
        category: analysis.category,
        priority: analysis.priority,
        aiSummary: analysis.summary,
        aiSuggestedSteps: analysis.suggestedSteps,
        linkedKbArticleIds: linkedKbArticleIds,
        assignee,
        isDuplicate,
        duplicateOfId
      }
    });
    
    res.status(201).json(incident);
  } catch (error) {
    console.error("Error creating incident:", error);
    res.status(500).json({ error: "Failed to create incident" });
  }
};

export const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution, description } = req.body;
    
    const existingIncident = await prisma.incident.findUnique({ where: { id: parseInt(id) } });
    if (!existingIncident) {
      return res.status(404).json({ error: "Incident not found" });
    }

    const dataToUpdate = {};
    if (status !== undefined) dataToUpdate.status = status;
    if (resolution !== undefined) dataToUpdate.resolution = resolution;
    
    if (description !== undefined) {
      dataToUpdate.description = description;
      
      // Re-run AI analysis with new description
      const analysis = await analyzeIncident(existingIncident.title, description);
      const kbArticles = await prisma.kBArticle.findMany();
      const kbSuggestions = await suggestKBArticles(existingIncident.title, description, kbArticles);
      
      dataToUpdate.category = analysis.category;
      dataToUpdate.priority = analysis.priority;
      dataToUpdate.aiSummary = analysis.summary;
      dataToUpdate.aiSuggestedSteps = analysis.suggestedSteps;
      dataToUpdate.linkedKbArticleIds = JSON.stringify(kbSuggestions.suggestedArticles || []);
      dataToUpdate.assignee = ASSIGNEE_MAP[analysis.category] || "Unassigned";
    }
    
    const incident = await prisma.incident.update({
      where: { id: parseInt(id) },
      data: dataToUpdate
    });
    
    res.json(incident);
  } catch (error) {
    console.error("Error updating incident:", error);
    res.status(500).json({ error: "Failed to update incident" });
  }
};

export const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.incident.delete({
      where: { id: parseInt(id) }
    });
    res.json({ success: true, message: "Incident deleted successfully" });
  } catch (error) {
    console.error("Error deleting incident:", error);
    res.status(500).json({ error: "Failed to delete incident" });
  }
};
