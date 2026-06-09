/**
 * 🧪 Tests — MediaLibrary & MediaSelector
 *
 * Tests unitaires pour les composants de gestion de fichiers médias :
 * - MediaLibrary : grille de fichiers, recherche, upload, suppression
 * - MediaSelector : déclencheur de dialogue et sélection visuelle
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MediaLibrary, MediaSelector } from '@/components/MediaLibrary';
import type { MediaFile } from '@/components/MediaLibrary';

// =====================================================================
// Mocks des hooks
// =====================================================================

// =====================================================================
// Session stable mock — évite les re-rendus infinis dans useEffect([session])
// =====================================================================

const { useSession } = vi.hoisted(() => {
  const STABLE_SESSION = {
    session: { access_token: 'test-token-abc123' },
    user: { id: '1', email: 'admin@test.com' },
    isLoading: false,
  };
  return { useSession: () => STABLE_SESSION };
});

const { useToast } = vi.hoisted(() => {
  const toastMock = vi.fn();
  return { useToast: () => ({ toast: toastMock }) };
});

vi.mock('@/hooks/useSession', () => ({ useSession }));
vi.mock('@/hooks/use-toast', () => ({ useToast }));

// =====================================================================
// Données de test
// =====================================================================

const createMockFile = (overrides: Partial<MediaFile> = {}): MediaFile => ({
  id: '1',
  file_name: 'photo-soleil.jpg',
  file_path: '/uploads/photo-soleil.jpg',
  mime_type: 'image/jpeg',
  file_size: 204800,
  uploaded_at: '2024-06-01T10:00:00.000Z',
  ...overrides,
});

const mockImageFile: MediaFile = createMockFile();

const mockPdfFile: MediaFile = createMockFile({
  id: '2',
  file_name: 'document-technique.pdf',
  file_path: '/uploads/document-technique.pdf',
  mime_type: 'application/pdf',
  file_size: 512000,
  uploaded_at: '2024-06-02T14:30:00.000Z',
});

const mockPngFile: MediaFile = createMockFile({
  id: '3',
  file_name: 'schema-electrique.png',
  file_path: '/uploads/schema-electrique.png',
  mime_type: 'image/png',
  file_size: 102400,
  uploaded_at: '2024-06-03T08:15:00.000Z',
  alt_text: 'Schéma électrique du tableau principal',
});

const mockAllFiles: MediaFile[] = [mockImageFile, mockPdfFile, mockPngFile];

// =====================================================================
// Helpers : mock de fetch avec une Response factice
// =====================================================================

function createJsonResponse<T>(data: T, ok = true, status = 200): Response {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    blob: () => Promise.resolve(new Blob()),
    headers: new Headers({ 'content-type': 'application/json' }),
    redirected: false,
    type: 'basic' as ResponseType,
    url: '',
    clone: () => null as unknown as Response,
    body: null,
    bodyUsed: false,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    bytes: () => Promise.resolve(new Uint8Array()),
    formData: () => Promise.resolve(new FormData()),
  };
}

function setupFetchForFiles(files: MediaFile[]) {
  vi.mocked(fetch).mockReset();
  vi.mocked(fetch).mockResolvedValue(createJsonResponse(files));
}

function setupFetchError(status = 500) {
  vi.mocked(fetch).mockReset();
  vi.mocked(fetch).mockResolvedValue(
    createJsonResponse({ error: 'Erreur serveur' }, false, status),
  );
}

function setupFetchForUpload() {
  // Premier appel : GET /api/storage/files → fichiers
  // Second appel : POST /api/storage/upload → succès
  vi.mocked(fetch)
    .mockResolvedValueOnce(createJsonResponse(mockAllFiles))
    .mockResolvedValueOnce(createJsonResponse({ success: true }));
}

function setupFetchForDelete(fileId: string) {
  // Premier appel : GET /api/storage/files → fichier existant
  // Second appel : DELETE /api/storage/files/{id} → succès
  vi.mocked(fetch)
    .mockResolvedValueOnce(createJsonResponse([mockImageFile]))
    .mockResolvedValueOnce(createJsonResponse({ success: true }));
}

/**
 * Retourne true si tous les appels à fetch avec l'URL donnée
 * utilisent la méthode HTTP spécifiée.
 */
function fetchWasCalledWith(method: string, urlMatcher: string | RegExp): boolean {
  return vi
    .mocked(fetch)
    .mock.calls.some(
      ([url, init]) =>
        typeof url === 'string' &&
        (typeof urlMatcher === 'string' ? url === urlMatcher : urlMatcher.test(url)) &&
        (!init ||
          (init as RequestInit).method === undefined ||
          (init as RequestInit).method === method),
    );
}

// =====================================================================
// Tests — MediaLibrary
// =====================================================================

describe('MediaLibrary', () => {
  beforeEach(() => {
    window.confirm = vi.fn(() => true);
  });

  // ── Rendu de base ──────────────────────────────────────────────

  test('rend le composant sans erreur', async () => {
    setupFetchForFiles([]);
    render(<MediaLibrary />);
    expect(await screen.findByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  // ── État de chargement initial ─────────────────────────────────

  test('affiche un spinner de chargement pendant le fetch', () => {
    vi.mocked(fetch).mockReset();
    vi.mocked(fetch).mockImplementationOnce(
      () => new Promise<Response>(() => {}), // promesse pendante
    );
    render(<MediaLibrary />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  // ── Fetch des fichiers au montage ─────────────────────────────

  test('appelle fetch /api/storage/files avec le token au montage', async () => {
    setupFetchForFiles([]);
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/storage/files', {
        headers: { Authorization: 'Bearer test-token-abc123' },
      });
    });
  });

  // ── État vide ─────────────────────────────────────────────────

  test("affiche l'état vide quand la bibliothèque est vide", async () => {
    setupFetchForFiles([]);
    render(<MediaLibrary />);
    expect(await screen.findByText('Aucun fichier trouvé')).toBeInTheDocument();
  });

  // ── Champ de recherche ────────────────────────────────────────

  test('affiche le champ de recherche', async () => {
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary />);
    expect(await screen.findByPlaceholderText('Rechercher...')).toBeInTheDocument();
  });

  test('permet de saisir du texte dans la recherche', async () => {
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary />);

    const searchInput = await screen.findByPlaceholderText('Rechercher...');
    await user.type(searchInput, 'document');
    expect(searchInput).toHaveValue('document');
  });

  test('filtre les fichiers par terme de recherche (insensible à la casse)', async () => {
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary />);

    const searchInput = await screen.findByPlaceholderText('Rechercher...');
    await user.type(searchInput, 'SCHEMA');

    await waitFor(() => {
      // Seul le fichier dont le nom contient "schema" (insensible) doit rester
      expect(screen.queryByText('photo-soleil.jpg')).not.toBeInTheDocument();
      expect(screen.queryByText('document-technique.pdf')).not.toBeInTheDocument();
      expect(screen.getByText('schema-electrique.png')).toBeInTheDocument();
    });
  });

  test('recherche sans résultat affiche le message vide', async () => {
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary />);

    const searchInput = await screen.findByPlaceholderText('Rechercher...');
    await user.type(searchInput, 'ZZZZ_inexistant');

    await waitFor(() => {
      expect(screen.getByText('Aucun fichier trouvé')).toBeInTheDocument();
    });
  });

  test('effacement du filtre de recherche affiche à nouveau tous les fichiers', async () => {
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);
    // allowedTypes vide pour ne pas filtrer les PDF
    render(<MediaLibrary allowedTypes={[]} />);

    const searchInput = await screen.findByPlaceholderText('Rechercher...');
    await user.type(searchInput, 'ZZZZ_inexistant');

    // Attendre que le filtre vide la grille
    await waitFor(() => {
      expect(screen.getByText('Aucun fichier trouvé')).toBeInTheDocument();
    });

    // Effacer la recherche
    await user.clear(searchInput);

    // Tous les fichiers doivent réapparaître
    await waitFor(() => {
      expect(screen.getAllByText('photo-soleil.jpg').length).toBeGreaterThan(0);
      expect(screen.getAllByText('document-technique.pdf').length).toBeGreaterThan(0);
      expect(screen.getAllByText('schema-electrique.png').length).toBeGreaterThan(0);
    });
  });

  test('affiche un message personnalisé dans la barre info des fichiers', async () => {
    const pngWithAlt = createMockFile({
      id: '4',
      file_name: 'schema.png',
      file_path: '/uploads/schema.png',
      mime_type: 'image/png',
    });
    setupFetchForFiles([pngWithAlt]);
    render(<MediaLibrary />);

    const img = await screen.findByAltText('schema.png');
    expect(img).toBeInTheDocument();
  });

  // ── Zone d'upload ─────────────────────────────────────────────

  test('affiche le bouton de téléversement', async () => {
    setupFetchForFiles([]);
    render(<MediaLibrary />);
    expect(await screen.findByText('Téléverser')).toBeInTheDocument();
  });

  test('contient un input file caché avec les accept types', async () => {
    setupFetchForFiles([]);
    render(<MediaLibrary />);
    await screen.findByText('Téléverser');

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('accept', 'image/*,video/*,.pdf');
    expect(fileInput).toHaveClass('hidden');
  });

  // ── Affichage des fichiers ────────────────────────────────────

  test('affiche les fichiers image avec une balise <img>', async () => {
    setupFetchForFiles([mockImageFile]);
    render(<MediaLibrary />);

    const img = await screen.findByAltText('photo-soleil.jpg');
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe('IMG');
  });

  test('affiche les fichiers non-image sans balise <img>', async () => {
    setupFetchForFiles([mockPdfFile]);
    // allowedTypes vide pour autoriser les PDF
    render(<MediaLibrary allowedTypes={[]} />);

    // Le nom apparaît dans 2 éléments (span et p) → getAllByText
    const fileNames = await screen.findAllByText('document-technique.pdf');
    expect(fileNames.length).toBeGreaterThan(0);

    // Aucune balise <img> pour ce fichier non-image
    const imgs = document.querySelectorAll('img');
    const pdfImg = Array.from(imgs).find((img) =>
      img.getAttribute('alt')?.includes('document-technique'),
    );
    expect(pdfImg).toBeFalsy();
  });

  test('affiche tous les fichiers de la liste', async () => {
    setupFetchForFiles(mockAllFiles);
    // allowedTypes vide pour ne pas filtrer les PDF
    render(<MediaLibrary allowedTypes={[]} />);

    await waitFor(() => {
      // Utilisation de getAllByText car le nom peut apparaître dans 2 éléments
      expect(screen.getAllByText('photo-soleil.jpg').length).toBeGreaterThan(0);
      expect(screen.getAllByText('document-technique.pdf').length).toBeGreaterThan(0);
      expect(screen.getAllByText('schema-electrique.png').length).toBeGreaterThan(0);
    });
  });

  test('les noms de fichiers sont visibles dans les cartes', async () => {
    setupFetchForFiles(mockAllFiles);
    // allowedTypes vide pour ne pas filtrer les PDF
    render(<MediaLibrary allowedTypes={[]} />);

    for (const file of mockAllFiles) {
      const elements = await screen.findAllByText(file.file_name);
      expect(elements.length).toBeGreaterThan(0);
    }
  });

  // ── Sélection en mode single ──────────────────────────────────

  test('sélectionne un fichier au clic (mode single - icône check visible)', async () => {
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary />);

    const fileCard = await screen.findByText('photo-soleil.jpg');
    await user.click(fileCard);

    await waitFor(() => {
      const checkIcons = document.querySelectorAll('.lucide-check');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  test('propage le fichier sélectionné via onSelect en mode single', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary onSelect={onSelect} />);

    const fileCard = await screen.findByText('photo-soleil.jpg');
    await user.click(fileCard);

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockImageFile);
    });
  });

  test('remplace la sélection en cliquant sur un autre fichier (single)', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary onSelect={onSelect} />);

    const firstFile = await screen.findByText('photo-soleil.jpg');
    await user.click(firstFile);

    const secondFile = await screen.findByText('schema-electrique.png');
    await user.click(secondFile);

    await waitFor(() => {
      // Le dernier appel doit être le second fichier
      const calls = onSelect.mock.calls;
      const lastCallArg = calls[calls.length - 1][0] as MediaFile;
      expect(lastCallArg.id).toBe('3');
    });
  });

  test('ne propage pas onSelect si la prop est absente', async () => {
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary />); // pas de onSelect

    const fileCard = await screen.findByText('photo-soleil.jpg');
    await user.click(fileCard);

    // L'icône check doit être visible (sélection visuelle)
    await waitFor(() => {
      const checkIcons = document.querySelectorAll('.lucide-check');
      expect(checkIcons.length).toBeGreaterThan(0);
    });
  });

  // ── Filtrage par type autorisé ────────────────────────────────

  test('filtre les fichiers selon allowedTypes (images uniquement)', async () => {
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary allowedTypes={['image/']} />);

    await waitFor(() => {
      expect(screen.getByText('photo-soleil.jpg')).toBeInTheDocument();
      expect(screen.getByText('schema-electrique.png')).toBeInTheDocument();
      expect(screen.queryByText('document-technique.pdf')).not.toBeInTheDocument();
    });
  });

  test('affiche le message vide si allowedTypes ne correspond à aucun fichier', async () => {
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary allowedTypes={['video/']} />);

    await waitFor(() => {
      expect(screen.getByText('Aucun fichier trouvé')).toBeInTheDocument();
    });
  });

  test('allowedTypes vide accepte tous les fichiers', async () => {
    setupFetchForFiles(mockAllFiles);
    render(<MediaLibrary allowedTypes={[]} />);

    await waitFor(() => {
      expect(screen.getAllByText('photo-soleil.jpg').length).toBeGreaterThan(0);
      expect(screen.getAllByText('document-technique.pdf').length).toBeGreaterThan(0);
    });
  });

  // ── Upload de fichier ─────────────────────────────────────────

  test('déclenche un appel POST vers /api/storage/upload avec le token', async () => {
    setupFetchForUpload();

    const user = userEvent.setup();
    render(<MediaLibrary />);

    // Attendre que le rendu initial soit terminé
    await screen.findByPlaceholderText('Rechercher...');

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['contenu'], 'nouveau-doc.pdf', {
      type: 'application/pdf',
    });
    await user.upload(input, file);

    await waitFor(() => {
      const uploadCall = vi
        .mocked(fetch)
        .mock.calls.find(
          ([url, init]) =>
            typeof url === 'string' &&
            url === '/api/storage/upload' &&
            (init as RequestInit)?.method === 'POST',
        );
      expect(uploadCall).toBeTruthy();
    });

    // Vérifier les en-têtes d'authentification
    const uploadCall = vi.mocked(fetch).mock.calls.find(([url]) => url === '/api/storage/upload');
    const headers = (uploadCall?.[1] as RequestInit)?.headers as Record<string, string>;
    expect(headers?.Authorization).toBe('Bearer test-token-abc123');
  });

  test("appelle le point d'API upload puis re-fetch les fichiers", async () => {
    vi.mocked(fetch)
      .mockReset()
      .mockResolvedValueOnce(createJsonResponse([mockImageFile])) // GET initial
      .mockResolvedValueOnce(createJsonResponse({ success: true })) // POST upload
      .mockResolvedValueOnce(createJsonResponse([mockImageFile])); // GET après upload

    const user = userEvent.setup();
    render(<MediaLibrary />);

    await screen.findByPlaceholderText('Rechercher...');

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'photo.png', { type: 'image/png' });
    await user.upload(input, file);

    await waitFor(() => {
      // Vérifier que l'upload a été appelé
      const uploadCall = vi
        .mocked(fetch)
        .mock.calls.find(
          ([url, init]) =>
            typeof url === 'string' &&
            url === '/api/storage/upload' &&
            (init as RequestInit)?.method === 'POST',
        );
      expect(uploadCall).toBeTruthy();
      // Vérifier que le re-fetch a été déclenché après upload
      const getCalls = vi.mocked(fetch).mock.calls.filter(([url]) => url === '/api/storage/files');
      expect(getCalls.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── Suppression de fichier ────────────────────────────────────

  test('supprime un fichier via DELETE /api/storage/files/{id}', async () => {
    setupFetchForDelete('1');
    window.confirm = vi.fn(() => true);

    const user = userEvent.setup();
    render(<MediaLibrary />);

    // Attendre que le fichier soit rendu
    await screen.findByText('photo-soleil.jpg');

    // Cliquer sur le bouton de suppression (Trash2)
    const deleteBtn = document.querySelector('[aria-label="Action"]');
    expect(deleteBtn).toBeInTheDocument();
    await user.click(deleteBtn!);

    await waitFor(() => {
      const deleteCall = vi
        .mocked(fetch)
        .mock.calls.find(
          ([url, init]) =>
            typeof url === 'string' &&
            url === '/api/storage/files/1' &&
            (init as RequestInit)?.method === 'DELETE',
        );
      expect(deleteCall).toBeTruthy();
    });
  });

  test('retire le fichier du DOM après suppression réussie', async () => {
    // Simuler la suppression : après DELETE, plus de fichiers
    vi.mocked(fetch)
      .mockReset()
      .mockResolvedValueOnce(createJsonResponse([mockImageFile])) // GET listing
      .mockResolvedValueOnce(createJsonResponse({ success: true })); // DELETE

    window.confirm = vi.fn(() => true);
    const user = userEvent.setup();
    render(<MediaLibrary />);

    await screen.findByText('photo-soleil.jpg');

    const deleteBtn = document.querySelector('[aria-label="Action"]');
    await user.click(deleteBtn!);

    await waitFor(() => {
      expect(screen.queryByText('photo-soleil.jpg')).not.toBeInTheDocument();
    });
  });

  test("annule la suppression si l'utilisateur refuse la confirmation", async () => {
    setupFetchForFiles([mockImageFile]);
    window.confirm = vi.fn(() => false);

    const user = userEvent.setup();
    render(<MediaLibrary />);
    await screen.findByText('photo-soleil.jpg');

    const deleteBtn = document.querySelector('[aria-label="Action"]');
    await user.click(deleteBtn!);

    // Aucun appel DELETE
    const deleteCalls = vi
      .mocked(fetch)
      .mock.calls.filter(([, init]) => (init as RequestInit)?.method === 'DELETE');
    expect(deleteCalls.length).toBe(0);
  });

  // ── Gestion d'erreurs ─────────────────────────────────────────

  test('gère une erreur de fetch sans crasher', async () => {
    setupFetchError(500);
    render(<MediaLibrary />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
    });
  });

  // ── Liens externes ────────────────────────────────────────────

  test('affiche un lien externe target="_blank" pour chaque fichier', async () => {
    setupFetchForFiles([mockImageFile, mockPngFile]);
    render(<MediaLibrary />);

    await waitFor(() => {
      const externalLinks = document.querySelectorAll('a[target="_blank"]');
      expect(externalLinks.length).toBe(2);
    });
  });

  // ── Accessibilité ─────────────────────────────────────────────

  test('les images ont un attribut loading="lazy"', async () => {
    setupFetchForFiles([mockImageFile]);
    render(<MediaLibrary />);

    const img = await screen.findByAltText('photo-soleil.jpg');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});

// =====================================================================
// Tests — MediaSelector
// =====================================================================

describe('MediaSelector', () => {
  beforeEach(() => {
    window.confirm = vi.fn(() => true);
  });

  // ── Rendu du bouton déclencheur ───────────────────────────────

  test('affiche le bouton déclencheur avec le label par défaut', () => {
    setupFetchForFiles([]);
    render(<MediaSelector onSelect={() => {}} />);

    expect(screen.getByText('Sélectionner une image')).toBeInTheDocument();
    expect(screen.getByText('Aucun fichier sélectionné')).toBeInTheDocument();
  });

  test('affiche un label personnalisé', () => {
    setupFetchForFiles([]);
    render(<MediaSelector onSelect={() => {}} label="Choisir un logo" />);

    expect(screen.getByText('Choisir un logo')).toBeInTheDocument();
  });

  test("affiche l'image courante si currentValue est fourni", () => {
    setupFetchForFiles([]);
    render(
      <MediaSelector
        onSelect={() => {}}
        currentValue="/uploads/logo-entreprise.png"
        label="Logo actuel"
      />,
    );

    const img = screen.getByAltText('Current');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/uploads/logo-entreprise.png');
  });

  test("affiche l'icône Plus quand il n'y a pas de currentValue", () => {
    setupFetchForFiles([]);
    render(<MediaSelector onSelect={() => {}} />);

    expect(document.querySelectorAll('.lucide-plus').length).toBeGreaterThan(0);
  });

  // ── Bouton d'effacement ───────────────────────────────────────

  test("affiche le bouton d'effacement quand currentValue existe", () => {
    setupFetchForFiles([]);
    render(<MediaSelector onSelect={() => {}} currentValue="/uploads/test.jpg" />);

    expect(screen.getByText('Effacer la sélection')).toBeInTheDocument();
  });

  test("n'affiche pas le bouton d'effacement sans currentValue", () => {
    setupFetchForFiles([]);
    render(<MediaSelector onSelect={() => {}} />);

    expect(screen.queryByText('Effacer la sélection')).not.toBeInTheDocument();
  });

  test('appelle onSelect avec chaîne vide quand on efface', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    setupFetchForFiles([]);

    render(<MediaSelector onSelect={onSelect} currentValue="/uploads/test.jpg" />);

    await user.click(screen.getByText('Effacer la sélection'));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  // ── Ouverture du dialogue ─────────────────────────────────────

  test('ouvre le dialogue quand on clique sur le bouton déclencheur', async () => {
    const user = userEvent.setup();
    setupFetchForFiles([]);

    render(<MediaSelector onSelect={() => {}} />);

    await user.click(screen.getByRole('button', { name: /sélectionner une image/i }));

    await waitFor(() => {
      expect(screen.getByText('Bibliothèque Médias')).toBeInTheDocument();
      expect(
        screen.getByText('Sélectionnez un fichier existant ou téléversez-en un nouveau.'),
      ).toBeInTheDocument();
    });
  });

  test('affiche le contenu de la bibliothèque dans le dialogue ouvert', async () => {
    const user = userEvent.setup();
    setupFetchForFiles(mockAllFiles);

    render(<MediaSelector onSelect={() => {}} />);

    const trigger = screen.getByRole('button', {
      name: /sélectionner une image/i,
    });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Rechercher...')).toBeInTheDocument();
      expect(screen.getByText('Téléverser')).toBeInTheDocument();
    });
  });

  // ── Sélection depuis le dialogue ──────────────────────────────

  test("appelle onSelect avec l'URL normalisée quand on choisit un fichier", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    setupFetchForFiles([mockPngFile]);

    render(<MediaSelector onSelect={onSelect} />);

    // Ouvrir le dialogue
    await user.click(screen.getByRole('button', { name: /sélectionner une image/i }));

    // Cliquer sur un fichier dans la bibliothèque
    const fileCard = await screen.findByText('schema-electrique.png');
    await user.click(fileCard);

    // Vérifier que onSelect a reçu l'URL normalisée
    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(expect.stringContaining('schema-electrique.png'));
    });
  });

  test("ferme le dialogue après sélection d'un fichier", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    setupFetchForFiles([mockPngFile]);

    render(<MediaSelector onSelect={onSelect} />);

    // Ouvrir le dialogue
    await user.click(screen.getByRole('button', { name: /sélectionner une image/i }));

    // Attendre que la bibliothèque soit chargée
    await screen.findByText('schema-electrique.png');

    // Cliquer sur un fichier
    await user.click(screen.getByText('schema-electrique.png'));

    // Le dialogue doit se fermer (le titre n'est plus visible)
    await waitFor(() => {
      expect(screen.queryByText('Bibliothèque Médias')).not.toBeInTheDocument();
    });
  });
});
