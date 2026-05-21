/**
 * Service d'export SCORM 1.2
 * Génère un package compatible LMS (Moodle, 360Learning, etc.)
 */


import { saveAs } from 'file-saver';

interface SCORMManifest {
  identifier: string;
  title: string;
  version: string;
  resources: SCORMResource[];
}

interface SCORMResource {
  identifier: string;
  type: 'webcontent' | 'sco';
  href: string;
  files: string[];
}

export class SCORMExportService {
  /**
   * Génère un package SCORM 1.2 complet
   */
  static async exportCourse(course: Course): Promise<void> {
    // En production, utiliser JSZip pour créer le package
    // Ici, nous générons les fichiers individuels

    const manifest = this.generateManifest(course);
    const htmlContent = this.generateCourseHTML(course);
    const scormApi = this.generateSCORMAPI();

    // Pour la démo, on télécharge le HTML principal
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    saveAs(blob, `${this.sanitizeFilename(course.title)}_scorm.html`);



  }

  private static sanitizeFilename(name: string): string {
    return name.
    replace(/[^a-z0-9àâäéèêëïîôùûüÿç\s]/gi, '').
    replace(/\s+/g, '_').
    substring(0, 50);
  }

  private static generateManifest(course: Course): string {
    const identifier = `course_${Date.now()}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${identifier}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  
  <organizations default="org1">
    <organization identifier="org1">
      <title>${this.escapeXML(course.title)}</title>
      <item identifier="item1" identifierref="resource1">
        <title>Contenu principal</title>
      </item>
      ${course.content.qcm.length > 0 ? `
      <item identifier="item2" identifierref="resource2">
        <title>Évaluation</title>
      </item>` : ''}
    </organization>
  </organizations>
  
  <resources>
    <resource identifier="resource1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="scorm_api.js"/>
      <file href="style.css"/>
    </resource>
    ${course.content.qcm.length > 0 ? `
    <resource identifier="resource2" type="webcontent" adlcp:scormtype="sco" href="quiz.html">
      <file href="quiz.html"/>
    </resource>` : ''}
  </resources>
</manifest>`;
  }

  private static escapeXML(str: string): string {
    return str.
    replace(/&/g, '&amp;').
    replace(/</g, '&lt;').
    replace(/>/g, '&gt;').
    replace(/"/g, '&quot;').
    replace(/'/g, '&apos;');
  }

  private static generateCourseHTML(course: Course): string {
    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${course.title}</title>
  <script src="scorm_api.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      background: #f9fafb;
      padding: 2rem;
    }
    .container { max-width: 900px; margin: 0 auto; }
    h1 { color: #1e40af; margin-bottom: 1.5rem; font-size: 2rem; }
    h2 { color: #374151; margin: 2rem 0 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; }
    h3 { color: #4b5563; margin: 1.5rem 0 0.75rem; }
    .card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .intro { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; }
    .section { border-left: 4px solid #3b82f6; }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 0 8px 8px 0;
    }
    .example {
      background: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 0 8px 8px 0;
    }
    ul { padding-left: 1.5rem; }
    li { margin: 0.5rem 0; }
    .progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: #3b82f6;
      transition: width 0.3s;
    }
    .nav-buttons {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-primary { background: #3b82f6; color: white; }
    .btn-primary:hover { background: #2563eb; }
    .btn-secondary { background: #e5e7eb; color: #374151; }
    .btn-secondary:hover { background: #d1d5db; }
  </style>
</head>
<body>
  <div class="progress-bar" id="progressBar"></div>
  
  <div class="container">
    <h1>${course.title}</h1>
    
    <div class="card intro">
      <h2 style="color: white; border-color: rgba(255,255,255,0.3);">Introduction</h2>
      <p>${course.content.introduction.replace(/\n/g, '<br>')}</p>
    </div>
    
    ${course.content.sections.map((section, i) => `
    <div class="card section" id="section-${i}">
      <h2>${section.title}</h2>
      <p>${section.explanation.replace(/\n/g, '<br>')}</p>
      
      ${section.examples.length > 0 ? `
      <div class="example">
        <strong>💡 Exemples :</strong>
        <ul>
          ${section.examples.map((ex) => `<li>${ex}</li>`).join('')}
        </ul>
      </div>` : ''}
      
      ${section.warnings.length > 0 ? `
      <div class="warning">
        <strong>⚠️ Points d'attention :</strong>
        <ul>
          ${section.warnings.map((w) => `<li>${w}</li>`).join('')}
        </ul>
      </div>` : ''}
    </div>`).join('')}
    
    <div class="card">
      <h2>Conclusion</h2>
      <p>${course.content.conclusion.replace(/\n/g, '<br>')}</p>
    </div>
    
    ${course.content.resources.length > 0 ? `
    <div class="card">
      <h2>📚 Ressources complémentaires</h2>
      <ul>
        ${course.content.resources.map((r) => `<li>${r}</li>`).join('')}
      </ul>
    </div>` : ''}
    
    <div class="nav-buttons">
      <button class="btn-secondary" onclick="exitCourse()">Quitter</button>
      <button class="btn-primary" onclick="completeCourse()">Terminer le cours</button>
    </div>
  </div>
  
  <script>
    // Initialisation SCORM
    let scormInitialized = false;
    
    function initSCORM() {
      if (typeof API !== 'undefined') {
        API.LMSInitialize('');
        scormInitialized = true;
        updateProgress(0);
      }
    }
    
    function updateProgress(value) {
      document.getElementById('progressBar').style.width = value + '%';
      if (scormInitialized) {
        API.LMSSetValue('cmi.core.lesson_location', value.toString());
        API.LMSCommit('');
      }
    }
    
    function completeCourse() {
      if (scormInitialized) {
        API.LMSSetValue('cmi.core.lesson_status', 'completed');
        API.LMSSetValue('cmi.core.score.raw', '100');
        API.LMSCommit('');
        API.LMSFinish('');
      }
      alert('Félicitations ! Vous avez terminé ce cours.');
    }
    
    function exitCourse() {
      if (scormInitialized) {
        API.LMSSetValue('cmi.core.exit', 'suspend');
        API.LMSCommit('');
        API.LMSFinish('');
      }
    }
    
    // Tracking du scroll
    window.addEventListener('scroll', function() {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollTop = window.pageYOffset;
      const progress = Math.round((scrollTop / scrollHeight) * 100);
      updateProgress(progress);
    });
    
    // Initialiser au chargement
    window.onload = initSCORM;
    window.onunload = exitCourse;
  </script>
</body>
</html>`;
  }

  private static generateSCORMAPI(): string {
    return `/**
 * SCORM 1.2 API Wrapper
 */
var API = {
  data: {},
  
  LMSInitialize: function(param) {
    console.log('SCORM: LMSInitialize');
    return 'true';
  },
  
  LMSFinish: function(param) {
    console.log('SCORM: LMSFinish');
    return 'true';
  },
  
  LMSGetValue: function(element) {
    return this.data[element] || '';
  },
  
  LMSSetValue: function(element, value) {
    console.log('SCORM: Set', element, '=', value);
    this.data[element] = value;
    return 'true';
  },
  
  LMSCommit: function(param) {
    console.log('SCORM: Commit');
    return 'true';
  },
  
  LMSGetLastError: function() {
    return '0';
  },
  
  LMSGetErrorString: function(errorCode) {
    return 'No error';
  },
  
  LMSGetDiagnostic: function(errorCode) {
    return 'No diagnostic';
  }
};`;
  }

  /**
   * Génère un quiz SCORM avec scoring
   */
  static generateQuizHTML(course: Course): string {
    const qcm = course.content.qcm;
    if (qcm.length === 0) return '';

    return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Évaluation - ${course.title}</title>
  <script src="scorm_api.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; max-width: 800px; margin: 0 auto; }
    .question { background: white; border-radius: 12px; padding: 1.5rem; margin: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .options label { display: block; padding: 0.75rem; margin: 0.5rem 0; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; }
    .options label:hover { border-color: #3b82f6; }
    input[type="radio"] { margin-right: 0.75rem; }
    button { padding: 1rem 2rem; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; }
    .result { padding: 2rem; text-align: center; background: #ecfdf5; border-radius: 12px; margin-top: 2rem; }
    .score { font-size: 3rem; font-weight: bold; color: #059669; }
  </style>
</head>
<body>
  <h1>Évaluation</h1>
  
  <form id="quizForm">
    ${qcm.map((q, i) => `
    <div class="question">
      <h3>Question ${i + 1}</h3>
      <p>${q.question}</p>
      <div class="options">
        ${q.options.map((opt, j) => `
        <label>
          <input type="radio" name="q${i}" value="${j}" required>
          ${opt}
        </label>`).join('')}
      </div>
    </div>`).join('')}
    
    <button type="submit">Valider mes réponses</button>
  </form>
  
  <div id="result" class="result" style="display: none;">
    <div class="score" id="scoreDisplay"></div>
    <p id="scoreText"></p>
  </div>
  
  <script>
    const correctAnswers = [${qcm.map((q) => q.correctAnswer).join(',')}];
    
    document.getElementById('quizForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      let score = 0;
      correctAnswers.forEach((correct, i) => {
        const selected = document.querySelector('input[name="q' + i + '"]:checked');
        if (selected && parseInt(selected.value) === correct) {
          score++;
        }
      });
      
      const percentage = Math.round((score / correctAnswers.length) * 100);
      
      document.getElementById('scoreDisplay').textContent = score + '/' + correctAnswers.length;
      document.getElementById('scoreText').textContent = 'Vous avez obtenu ' + percentage + '% de bonnes réponses.';
      document.getElementById('result').style.display = 'block';
      
      // SCORM scoring
      if (typeof API !== 'undefined') {
        API.LMSSetValue('cmi.core.score.raw', percentage.toString());
        API.LMSSetValue('cmi.core.lesson_status', percentage >= 70 ? 'passed' : 'failed');
        API.LMSCommit('');
      }
    });
  </script>
</body>
</html>`;
  }
}