
import { WordExportService } from "@/services/academy/wordExportService";
import { PowerPointExportService } from "@/services/academy/pptxExportService";
import { SCORMExportService } from "@/services/academy/scormExportService";
import { BookletExportService } from "@/services/academy/bookletExportService";
import { toast } from "sonner";

export const exportToPDF = async (course: Course) => {
  try {
    toast.info("Export PDF en cours de développement...");

  } catch (error) {
    toast.error("Erreur lors de l'export PDF");
    console.error("PDF export error:", error);
  }
};

export const exportToWord = async (course: Course) => {
  try {
    toast.loading("Génération du document Word...");
    await WordExportService.exportCourse(course);
    toast.success("Document Word généré avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'export Word");
    console.error("Word export error:", error);
  }
};

export const exportToPowerPoint = async (course: Course) => {
  try {
    toast.loading("Génération de la présentation PowerPoint...");
    await PowerPointExportService.exportCourse(course);
    toast.success("Présentation PowerPoint générée avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'export PowerPoint");
    console.error("PowerPoint export error:", error);
  }
};

export const exportToSCORM = async (course: Course) => {
  try {
    toast.loading("Génération du package SCORM...");
    await SCORMExportService.exportCourse(course);
    toast.success("Package SCORM généré avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'export SCORM");
    console.error("SCORM export error:", error);
  }
};

export const exportTrainerBooklet = async (course: Course) => {
  try {
    toast.loading("Génération du livret formateur...");
    await BookletExportService.exportTrainerBooklet(course);
    toast.success("Livret formateur généré avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'export du livret formateur");
    console.error("Trainer booklet export error:", error);
  }
};

export const exportLearnerBooklet = async (course: Course) => {
  try {
    toast.loading("Génération du livret apprenant...");
    await BookletExportService.exportLearnerBooklet(course);
    toast.success("Livret apprenant généré avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'export du livret apprenant");
    console.error("Learner booklet export error:", error);
  }
};

export const exportAuditSheet = async (course: Course) => {
  try {
    toast.loading("Génération de la fiche audit...");
    await BookletExportService.exportAuditSheet(course);
    toast.success("Fiche audit générée avec succès !");
  } catch (error) {
    toast.error("Erreur lors de l'export de la fiche audit");
    console.error("Audit sheet export error:", error);
  }
};