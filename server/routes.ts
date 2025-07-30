import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import { generateRandomPoints } from "./services/RandomPointGenerator";
import { generatePDF } from "./services/PDFGenerator";
import { generateExcel } from "./services/ExcelProcessor";

export function registerRoutes(app: Express): Server {
  // Routes API
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await db.getAllRoutes();
      res.json({ routes });
    } catch (error) {
      console.error("Error fetching routes:", error);
      res.status(500).json({ message: "Failed to fetch routes" });
    }
  });

  // Sample Points API
  app.get("/api/sample-points", async (req, res) => {
    try {
      const samplePoints = await db.getAllSamplePoints();
      res.json(samplePoints);
    } catch (error) {
      console.error("Error fetching sample points:", error);
      res.status(500).json({ message: "Failed to fetch sample points" });
    }
  });

  app.patch("/api/sample-points/:route", async (req, res) => {
    try {
      const route = parseInt(req.params.route);
      const { dir, noOfPoints } = req.body;
      await db.updateSamplePoints(route, dir, noOfPoints);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating sample points:", error);
      res.status(500).json({ message: "Failed to update sample points" });
    }
  });

  // Generation Config API
  app.get("/api/generation-config", async (req, res) => {
    try {
      const config = await db.getGenerationConfig();
      res.json(config);
    } catch (error) {
      console.error("Error fetching generation config:", error);
      res.status(500).json({ message: "Failed to fetch generation config" });
    }
  });

  app.patch("/api/generation-config", async (req, res) => {
    try {
      const config = await db.updateGenerationConfig(req.body);
      res.json(config);
    } catch (error) {
      console.error("Error updating generation config:", error);
      res.status(500).json({ message: "Failed to update generation config" });
    }
  });

  // Random Point Generation API
  app.post("/api/generate", async (req, res) => {
    try {
      const results = await generateRandomPoints(req.body);
      
      // Save to historical reports
      const timestamp = new Date().toLocaleString();
      const title = `Random Point Report - ${timestamp}`;
      await db.saveHistoricalReport(title, results);
      
      res.json({ success: true, results });
    } catch (error) {
      console.error("Error generating random points:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Results API
  app.get("/api/results", async (req, res) => {
    try {
      const results = await db.getRandomSelections();
      res.json(results);
    } catch (error) {
      console.error("Error fetching results:", error);
      res.status(500).json({ message: "Failed to fetch results" });
    }
  });

  app.delete("/api/results", async (req, res) => {
    try {
      await db.clearRandomSelections();
      res.json({ success: true });
    } catch (error) {
      console.error("Error clearing results:", error);
      res.status(500).json({ message: "Failed to clear results" });
    }
  });

  // Historical Reports API
  app.get("/api/historical-reports", async (req, res) => {
    try {
      const reports = await db.getHistoricalReports();
      res.json(reports);
    } catch (error) {
      console.error("Error fetching historical reports:", error);
      res.status(500).json({ message: "Failed to fetch historical reports" });
    }
  });

  app.get("/api/historical-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const report = await db.getHistoricalReport(id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching historical report:", error);
      res.status(500).json({ message: "Failed to fetch historical report" });
    }
  });

  app.delete("/api/historical-reports/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.deleteHistoricalReport(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting historical report:", error);
      res.status(500).json({ message: "Failed to delete historical report" });
    }
  });

  // Export APIs
  app.post("/api/export/pdf", async (req, res) => {
    try {
      const { selections } = req.body;
      if (!selections || !Array.isArray(selections)) {
        return res.status(400).json({ message: "Invalid selections data" });
      }

      const pdfBuffer = await generatePDF(selections);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="random-point-report.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error generating PDF:", error);
      res.status(500).json({ message: "Failed to generate PDF" });
    }
  });

  app.post("/api/export/excel", async (req, res) => {
    try {
      const { selections } = req.body;
      if (!selections || !Array.isArray(selections)) {
        return res.status(400).json({ message: "Invalid selections data" });
      }

      const csvContent = await generateExcel(selections);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="random-point-report.csv"');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating Excel:", error);
      res.status(500).json({ message: "Failed to generate Excel" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}