import { Document, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';


export class WordExportService {
  static async exportCourse(course: Course): Promise<void> {
    const doc = new Document({
      sections: [
      {
        properties: {},
        children: [
        // Page de titre
        new Paragraph({
          text: course.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: `Date de génération: ${new Date(course.generatedAt).toLocaleDateString('fr-FR')}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 }
        }),

        // Introduction
        new Paragraph({
          text: 'Introduction',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: course.content.introduction,
          spacing: { after: 400 }
        }),

        // Modules
        ...this.createModulesSections(course),

        // Sections du cours
        ...this.createCourseSections(course.content.sections),

        // QCM
        ...this.createQCMSection(course.content.qcm),

        // Conclusion
        new Paragraph({
          text: 'Conclusion',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: course.content.conclusion,
          spacing: { after: 400 }
        }),

        // Ressources
        ...this.createResourcesSection(course.content.resources)]

      }]

    });

    const blob = await this.generateBlob(doc);
    saveAs(blob, `${course.title.replace(/[^a-z0-9]/gi, '_')}.docx`);
  }

  private static createModulesSections(course: Course): Paragraph[] {
    const sections: Paragraph[] = [
    new Paragraph({
      text: 'Modules de formation',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    })];


    course.modules.forEach((module, index) => {
      sections.push(
        new Paragraph({
          text: `Module ${index + 1}: ${module.title}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 }
        }),
        new Paragraph({
          children: [
          new TextRun({ text: 'Durée: ', bold: true }),
          new TextRun({ text: `${module.duration} heures` })],

          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
          new TextRun({ text: 'Prérequis: ', bold: true }),
          new TextRun({ text: module.prerequisites.join(', ') || 'Aucun' })],

          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
          new TextRun({ text: 'Connaissances: ', bold: true }),
          new TextRun({ text: module.knowledge.join(', ') })],

          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
          new TextRun({ text: 'Compétences: ', bold: true }),
          new TextRun({ text: module.skills.join(', ') })],

          spacing: { after: 200 }
        })
      );
    });

    return sections;
  }

  private static createCourseSections(sections: CourseSection[]): Paragraph[] {
    const paragraphs: Paragraph[] = [];

    sections.forEach((section) => {
      paragraphs.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 }
        }),
        new Paragraph({
          text: section.explanation,
          spacing: { after: 200 }
        })
      );

      if (section.examples.length > 0) {
        paragraphs.push(
          new Paragraph({
            text: 'Exemples:',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          })
        );
        section.examples.forEach((example) => {
          paragraphs.push(
            new Paragraph({
              text: `• ${example}`,
              spacing: { after: 100 }
            })
          );
        });
      }

      if (section.warnings.length > 0) {
        paragraphs.push(
          new Paragraph({
            text: '⚠️ Points d\'attention:',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          })
        );
        section.warnings.forEach((warning) => {
          paragraphs.push(
            new Paragraph({
              text: `• ${warning}`,
              spacing: { after: 100 }
            })
          );
        });
      }
    });

    return paragraphs;
  }

  private static createQCMSection(questions: QCMQuestion[]): Paragraph[] {
    if (questions.length === 0) return [];

    const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Questionnaire d\'évaluation',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    })];


    questions.forEach((question, index) => {
      paragraphs.push(
        new Paragraph({
          text: `Question ${index + 1}: ${question.question}`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 }
        })
      );

      question.options.forEach((option, optIndex) => {
        const isCorrect = optIndex === question.correctAnswer;
        paragraphs.push(
          new Paragraph({
            children: [
            new TextRun({
              text: `${String.fromCharCode(65 + optIndex)}. ${option}`,
              bold: isCorrect,
              color: isCorrect ? '00AA00' : '000000'
            })],

            spacing: { after: 50 }
          })
        );
      });

      paragraphs.push(
        new Paragraph({
          children: [
          new TextRun({ text: 'Explication: ', bold: true }),
          new TextRun({ text: question.explanation })],

          spacing: { after: 200 }
        })
      );
    });

    return paragraphs;
  }

  private static createResourcesSection(resources: string[]): Paragraph[] {
    if (resources.length === 0) return [];

    const paragraphs: Paragraph[] = [
    new Paragraph({
      text: 'Ressources complémentaires',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    })];


    resources.forEach((resource) => {
      paragraphs.push(
        new Paragraph({
          text: `• ${resource}`,
          spacing: { after: 100 }
        })
      );
    });

    return paragraphs;
  }

  private static async generateBlob(doc: Document): Promise<Blob> {
    const { Packer } = await import('docx');
    const buffer = await Packer.toBlob(doc);
    return buffer;
  }
}