import pptxgen from 'pptxgenjs';


/**
 * Service d'export PowerPoint professionnel
 * 
 * Principes appliqués :
 * - 1 slide = 1 idée (pas de surcharge)
 * - Hiérarchie visuelle claire
 * - Templates épurés et professionnels
 * - Numérotation des slides
 */

export interface PPTXTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  warningColor: string;
  backgroundColor: string;
  textColor: string;
  lightGray: string;
}

// Thèmes professionnels prédéfinis - Design épuré
export const PPTX_THEMES: Record<string, PPTXTheme> = {
  corporate: {
    primaryColor: '1a365d', // Bleu foncé corporate
    secondaryColor: '4a5568',
    accentColor: '2b6cb0',
    warningColor: 'c05621',
    backgroundColor: 'ffffff',
    textColor: '2d3748',
    lightGray: 'f7fafc'
  },
  modern: {
    primaryColor: '2d3748', // Gris anthracite moderne
    secondaryColor: '718096',
    accentColor: '3182ce',
    warningColor: 'dd6b20',
    backgroundColor: 'ffffff',
    textColor: '1a202c',
    lightGray: 'edf2f7'
  },
  minimal: {
    primaryColor: '000000', // Noir pur minimal
    secondaryColor: '6b7280',
    accentColor: '374151',
    warningColor: 'dc2626',
    backgroundColor: 'ffffff',
    textColor: '111827',
    lightGray: 'f9fafb'
  },
  elegant: {
    primaryColor: '1e3a5f', // Bleu marine élégant
    secondaryColor: '5a7d9a',
    accentColor: 'c9a227',
    warningColor: 'b45309',
    backgroundColor: 'fefefe',
    textColor: '1e293b',
    lightGray: 'f8fafc'
  },
  nature: {
    primaryColor: '1e4d2b', // Vert forêt
    secondaryColor: '4a7c59',
    accentColor: '2d5a27',
    warningColor: 'b45309',
    backgroundColor: 'ffffff',
    textColor: '1a202c',
    lightGray: 'f0fff4'
  },
  tech: {
    primaryColor: '0f172a', // Bleu nuit tech
    secondaryColor: '334155',
    accentColor: '0ea5e9',
    warningColor: 'f97316',
    backgroundColor: 'ffffff',
    textColor: '0f172a',
    lightGray: 'f1f5f9'
  }
};

export class PowerPointExportService {
  private static slideNumber = 0;

  static async exportCourse(course: Course, themeName: keyof typeof PPTX_THEMES = 'corporate'): Promise<void> {
    const pptx = new pptxgen();
    this.slideNumber = 0;

    // Configuration
    pptx.layout = 'LAYOUT_16x9';
    pptx.author = 'Professeur KEBE';
    pptx.title = course.title;
    pptx.subject = 'Formation professionnelle';

    const theme = PPTX_THEMES[themeName];

    // Structure : 1 slide = 1 idée

    // 1. Slide de titre
    this.createTitleSlide(pptx, course, theme);

    // 2. Objectifs pédagogiques (1 slide)
    this.createObjectivesSlide(pptx, course, theme);

    // 3. Sommaire (1 slide)
    this.createSummarySlide(pptx, course, theme);

    // 4. Introduction (si présente)
    if (course.content.introduction) {
      this.createIntroductionSlide(pptx, course.content.introduction, theme);
    }

    // 5. Modules - chaque module = 1 slide
    course.modules.forEach((module, index) => {
      this.createModuleSlide(pptx, module, index + 1, theme);
    });

    // 6. Sections du cours - 1 slide par idée principale
    course.content.sections.forEach((section) => {
      this.createContentSlides(pptx, section, theme);
    });

    // 7. QCM - 1 question par slide
    if (course.content.qcm.length > 0) {
      this.createQCMTitleSlide(pptx, theme);
      this.createQCMSlides(pptx, course.content.qcm, theme);
    }

    // 8. Conclusion
    this.createConclusionSlide(pptx, course, theme);

    // 9. Ressources
    if (course.content.resources.length > 0) {
      this.createResourcesSlide(pptx, course.content.resources, theme);
    }

    // 10. Slide de fin
    this.createEndSlide(pptx, theme);

    // Sauvegarder
    const filename = course.title.
    replace(/[^a-z0-9àâäéèêëïîôùûüÿç\s]/gi, '').
    replace(/\s+/g, '_').
    substring(0, 50);
    await pptx.writeFile({ fileName: `${filename}.pptx` });
  }

  /**
   * Ajoute un numéro de slide en bas à droite
   */
  private static addSlideNumber(slide: pptxgen.Slide, theme: PPTXTheme): void {
    this.slideNumber++;
    slide.addText(String(this.slideNumber), {
      x: 9.3,
      y: 5.2,
      w: 0.5,
      h: 0.3,
      fontSize: 10,
      color: theme.secondaryColor,
      align: 'right'
    });
  }

  /**
   * Ajoute une barre de marque en bas
   */
  private static addBrandBar(slide: pptxgen.Slide, theme: PPTXTheme): void {
    slide.addShape('rect', {
      x: 0,
      y: 5.35,
      w: 10,
      h: 0.28,
      fill: { color: theme.primaryColor }
    });
  }

  private static createTitleSlide(pptx: pptxgen, course: Course, theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.primaryColor };

    // Titre principal centré
    slide.addText(course.title, {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1.2,
      fontSize: 40,
      color: 'ffffff',
      bold: true,
      align: 'center',
      fontFace: 'Arial'
    });

    // Sous-titre
    slide.addText('Formation professionnelle', {
      x: 0.5,
      y: 3.3,
      w: 9,
      h: 0.5,
      fontSize: 20,
      color: 'ffffff',
      align: 'center',
      fontFace: 'Arial'
    });

    // Date et crédit
    slide.addText(`${new Date(course.generatedAt).toLocaleDateString('fr-FR')} • Professeur KEBE`, {
      x: 0.5,
      y: 5,
      w: 9,
      h: 0.4,
      fontSize: 12,
      color: 'ffffff',
      align: 'center'
    });
  }

  private static createObjectivesSlide(pptx: pptxgen, course: Course, theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.backgroundColor };

    slide.addText('Objectifs pédagogiques', {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.7,
      fontSize: 28,
      color: theme.primaryColor,
      bold: true
    });

    // Collecter les compétences des modules
    const skills = [...new Set(course.modules.flatMap((m) => m.skills))].slice(0, 5);
    const objectives = skills.length > 0 ?
    skills :
    ['Maîtriser les concepts clés', 'Appliquer les bonnes pratiques', 'Valider les acquis'];

    objectives.forEach((obj, i) => {
      slide.addText(`✓ ${obj}`, {
        x: 1,
        y: 1.4 + i * 0.7,
        w: 8,
        h: 0.6,
        fontSize: 18,
        color: theme.textColor
      });
    });

    this.addSlideNumber(slide, theme);
    this.addBrandBar(slide, theme);
  }

  private static createSummarySlide(pptx: pptxgen, course: Course, theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.backgroundColor };

    slide.addText('Sommaire', {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.7,
      fontSize: 28,
      color: theme.primaryColor,
      bold: true
    });

    const items = course.modules.slice(0, 8).map((m, i) => ({
      num: i + 1,
      title: m.title.substring(0, 50),
      duration: `${m.duration}h`
    }));

    items.forEach((item, i) => {
      const yPos = 1.3 + i * 0.5;

      // Numéro
      slide.addShape('ellipse', {
        x: 0.8,
        y: yPos,
        w: 0.4,
        h: 0.4,
        fill: { color: theme.primaryColor }
      });
      slide.addText(String(item.num), {
        x: 0.8,
        y: yPos,
        w: 0.4,
        h: 0.4,
        fontSize: 12,
        color: 'ffffff',
        align: 'center',
        valign: 'middle'
      });

      // Titre
      slide.addText(item.title, {
        x: 1.4,
        y: yPos,
        w: 6.5,
        h: 0.4,
        fontSize: 16,
        color: theme.textColor
      });

      // Durée
      slide.addText(item.duration, {
        x: 8.5,
        y: yPos,
        w: 1,
        h: 0.4,
        fontSize: 12,
        color: theme.secondaryColor,
        align: 'right'
      });
    });

    this.addSlideNumber(slide, theme);
    this.addBrandBar(slide, theme);
  }

  private static createIntroductionSlide(pptx: pptxgen, introduction: string, theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.lightGray };

    slide.addText('Introduction', {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.7,
      fontSize: 28,
      color: theme.primaryColor,
      bold: true
    });

    // Nettoyer le markdown et limiter le texte
    const cleanText = introduction.
    replace(/[#*`]/g, '').
    replace(/\n{2,}/g, '\n').
    substring(0, 600);

    slide.addText(cleanText, {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 3.5,
      fontSize: 16,
      color: theme.textColor,
      valign: 'top'
    });

    this.addSlideNumber(slide, theme);
    this.addBrandBar(slide, theme);
  }

  private static createModuleSlide(pptx: pptxgen, module: Module, index: number, theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.backgroundColor };

    // Header coloré
    slide.addShape('rect', {
      x: 0,
      y: 0,
      w: 10,
      h: 1.5,
      fill: { color: theme.primaryColor }
    });

    slide.addText(`MODULE ${index}`, {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.4,
      fontSize: 14,
      color: 'ffffff',
      bold: true
    });

    slide.addText(module.title, {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.6,
      fontSize: 24,
      color: 'ffffff',
      bold: true
    });

    // Contenu structuré
    const sections = [
    { icon: '⏱️', label: 'Durée', value: `${module.duration} heures` },
    { icon: '📚', label: 'Connaissances', value: module.knowledge.slice(0, 3).join(' • ') || 'À définir' },
    { icon: '🎯', label: 'Compétences', value: module.skills.slice(0, 2).join(' • ') || 'À définir' }];


    let yPos = 1.8;
    sections.forEach((section) => {
      slide.addText(`${section.icon} ${section.label}`, {
        x: 0.5,
        y: yPos,
        w: 2,
        h: 0.4,
        fontSize: 14,
        color: theme.primaryColor,
        bold: true
      });
      slide.addText(section.value, {
        x: 0.5,
        y: yPos + 0.4,
        w: 9,
        h: 0.5,
        fontSize: 16,
        color: theme.textColor
      });
      yPos += 1;
    });

    this.addSlideNumber(slide, theme);
    this.addBrandBar(slide, theme);
  }

  /**
   * Crée les slides de contenu - 1 slide par idée principale
   */
  private static createContentSlides(pptx: pptxgen, section: CourseSection, theme: PPTXTheme): void {
    // Slide principale du contenu
    const mainSlide = pptx.addSlide();
    mainSlide.background = { color: theme.backgroundColor };

    mainSlide.addText(section.title, {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.7,
      fontSize: 26,
      color: theme.primaryColor,
      bold: true
    });

    // Limiter le texte pour respecter "1 slide = 1 idée"
    const explanation = section.explanation.
    replace(/[#*`]/g, '').
    substring(0, 500);

    mainSlide.addText(explanation, {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 3.5,
      fontSize: 16,
      color: theme.textColor,
      valign: 'top'
    });

    this.addSlideNumber(mainSlide, theme);
    this.addBrandBar(mainSlide, theme);

    // Slide d'exemples séparée (si nécessaire)
    if (section.examples.length > 0) {
      const exampleSlide = pptx.addSlide();
      exampleSlide.background = { color: theme.lightGray };

      exampleSlide.addText('💡 Exemples', {
        x: 0.5,
        y: 0.4,
        w: 9,
        h: 0.7,
        fontSize: 24,
        color: theme.accentColor,
        bold: true
      });

      section.examples.slice(0, 4).forEach((example, i) => {
        exampleSlide.addText(`• ${example.substring(0, 100)}`, {
          x: 1,
          y: 1.3 + i * 0.9,
          w: 8,
          h: 0.8,
          fontSize: 16,
          color: theme.textColor
        });
      });

      this.addSlideNumber(exampleSlide, theme);
      this.addBrandBar(exampleSlide, theme);
    }

    // Slide d'avertissements séparée (si nécessaire)
    if (section.warnings.length > 0) {
      const warningSlide = pptx.addSlide();
      warningSlide.background = { color: theme.backgroundColor };

      // Bande d'alerte
      warningSlide.addShape('rect', {
        x: 0,
        y: 0,
        w: 10,
        h: 0.15,
        fill: { color: theme.warningColor }
      });

      warningSlide.addText('⚠️ Points d\'attention', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 0.7,
        fontSize: 24,
        color: theme.warningColor,
        bold: true
      });

      section.warnings.slice(0, 3).forEach((warning, i) => {
        warningSlide.addText(`• ${warning.substring(0, 120)}`, {
          x: 1,
          y: 1.4 + i * 1,
          w: 8,
          h: 0.9,
          fontSize: 16,
          color: theme.textColor
        });
      });

      this.addSlideNumber(warningSlide, theme);
      this.addBrandBar(warningSlide, theme);
    }
  }

  private static createQCMTitleSlide(pptx: pptxgen, theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.accentColor };

    slide.addText('📝', {
      x: 4.5,
      y: 1.5,
      w: 1,
      h: 1,
      fontSize: 60,
      align: 'center'
    });

    slide.addText('Évaluation des acquis', {
      x: 0.5,
      y: 2.8,
      w: 9,
      h: 0.8,
      fontSize: 36,
      color: 'ffffff',
      bold: true,
      align: 'center'
    });

    slide.addText('Testez vos connaissances', {
      x: 0.5,
      y: 3.7,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: 'ffffff',
      align: 'center'
    });
  }

  private static createQCMSlides(pptx: pptxgen, questions: QCMQuestion[], theme: PPTXTheme): void {
    questions.slice(0, 10).forEach((question, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: theme.backgroundColor };

      // Numéro de question
      slide.addShape('ellipse', {
        x: 0.5,
        y: 0.4,
        w: 0.6,
        h: 0.6,
        fill: { color: theme.primaryColor }
      });
      slide.addText(String(index + 1), {
        x: 0.5,
        y: 0.4,
        w: 0.6,
        h: 0.6,
        fontSize: 18,
        color: 'ffffff',
        align: 'center',
        valign: 'middle',
        bold: true
      });

      // Question
      slide.addText(question.question, {
        x: 1.3,
        y: 0.4,
        w: 8.2,
        h: 1,
        fontSize: 20,
        color: theme.textColor,
        bold: true,
        valign: 'middle'
      });

      // Options
      question.options.slice(0, 4).forEach((option, optIndex) => {
        const letter = String.fromCharCode(65 + optIndex);
        const yPos = 1.8 + optIndex * 0.8;

        slide.addShape('rect', {
          x: 0.8,
          y: yPos,
          w: 8.4,
          h: 0.65,
          fill: { color: theme.lightGray },
          line: { color: theme.secondaryColor, width: 0.5 }
        });

        slide.addText(`${letter}. ${option}`, {
          x: 1,
          y: yPos + 0.1,
          w: 8,
          h: 0.5,
          fontSize: 16,
          color: theme.textColor
        });
      });

      this.addSlideNumber(slide, theme);
      this.addBrandBar(slide, theme);
    });
  }

  private static createConclusionSlide(pptx: pptxgen, course: Course, theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.backgroundColor };

    slide.addText('Conclusion', {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.7,
      fontSize: 28,
      color: theme.primaryColor,
      bold: true
    });

    const conclusion = course.content.conclusion.
    replace(/[#*`]/g, '').
    substring(0, 500);

    slide.addText(conclusion, {
      x: 0.5,
      y: 1.3,
      w: 9,
      h: 3,
      fontSize: 16,
      color: theme.textColor,
      valign: 'top'
    });

    this.addSlideNumber(slide, theme);
    this.addBrandBar(slide, theme);
  }

  private static createResourcesSlide(pptx: pptxgen, resources: string[], theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.lightGray };

    slide.addText('📚 Ressources complémentaires', {
      x: 0.5,
      y: 0.4,
      w: 9,
      h: 0.7,
      fontSize: 24,
      color: theme.primaryColor,
      bold: true
    });

    resources.slice(0, 6).forEach((resource, i) => {
      slide.addText(`• ${resource}`, {
        x: 1,
        y: 1.3 + i * 0.6,
        w: 8,
        h: 0.5,
        fontSize: 16,
        color: theme.textColor
      });
    });

    this.addSlideNumber(slide, theme);
    this.addBrandBar(slide, theme);
  }

  private static createEndSlide(pptx: pptxgen, theme: PPTXTheme): void {
    const slide = pptx.addSlide();
    slide.background = { color: theme.primaryColor };

    slide.addText('Merci !', {
      x: 0.5,
      y: 2,
      w: 9,
      h: 1,
      fontSize: 48,
      color: 'ffffff',
      bold: true,
      align: 'center'
    });

    slide.addText('Questions ?', {
      x: 0.5,
      y: 3.2,
      w: 9,
      h: 0.6,
      fontSize: 24,
      color: 'ffffff',
      align: 'center'
    });

    slide.addText('Généré par Professeur KEBE', {
      x: 0.5,
      y: 5,
      w: 9,
      h: 0.4,
      fontSize: 12,
      color: 'ffffff',
      align: 'center'
    });
  }
}