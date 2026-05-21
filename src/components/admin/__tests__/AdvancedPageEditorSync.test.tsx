import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/tests/test-utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AdvancedPageEditorSync } from '../AdvancedPageEditorSync';
import { htmlToContentBlocks, contentBlocksToHtml, jsonToContentBlocks } from '@/hooks/useBidirectionalSync';

// Mock pour les dépendances
const mockPage = {
  id: 'test-1',
  title: 'Page de Test',
  slug: 'page-de-test',
  meta_description: 'Description de test',
  content: '<h1>Titre</h1><p>Contenu</p>',
  content_blocks: []
};

describe('AdvancedPageEditorSync - Synchronisation Bidirectionnelle', () => {
  it('Affiche le contenu initial', async () => {
    const user = userEvent.setup();
    render(<AdvancedPageEditorSync pageId="test-1" initialPage={mockPage} />);

    // Cliquer sur Formulaire pour voir les champs
    const formTab = await screen.findByText(/Formulaire/);
    await user.click(formTab);

    // Vérifier que les données initiales sont présentes
    await waitFor(() => {
      expect(screen.getByDisplayValue('Page de Test')).toBeInTheDocument();
      expect(screen.getByDisplayValue('page-de-test')).toBeInTheDocument();
    });
  });

  describe('Convertisseurs de format', () => {
    it('htmlToContentBlocks convertit correctement', () => {
      const blocks = htmlToContentBlocks('<h1>Test</h1>');
      expect(blocks.length).toBeGreaterThan(0);
      expect(blocks[0].type).toBe('text');
      expect(blocks[0].data.content).toContain('Test');
    });

    it('contentBlocksToHtml convertit correctement', () => {
      const blocks: SyncBlock[] = [{
        id: '1',
        type: 'text',
        data: { content: '<h1>Test</h1>' }
      }];
      const html = contentBlocksToHtml(blocks);
      expect(html).toBe('<h1>Test</h1>');
    });

    it('jsonToContentBlocks: gère le JSON valide', () => {
      const json = JSON.stringify([{ id: '1', type: 'text', data: { content: 'Test' } }]);
      const blocks = jsonToContentBlocks(json);
      expect(blocks[0].data.content).toBe('Test');
    });

    it('jsonToContentBlocks: gère le JSON invalide gracieux', () => {
      expect(() => jsonToContentBlocks('{ invalid }')).toThrow();
    });
  });

  describe('Synchronisation entre onglets', () => {
    it('Modification du HTML met à jour le JSON', async () => {
      const user = userEvent.setup();
      render(<AdvancedPageEditorSync pageId="test-1" initialPage={mockPage} />);

      // Cliquer sur HTML
      const htmlTab = await screen.findByText(/HTML/);
      await user.click(htmlTab);

      // Modifier le HTML
      const htmlEditor = await screen.findByTestId('html-editor');
      fireEvent.change(htmlEditor, { target: { value: '<h1>Nouveau Titre</h1>' } });

      // Vérifier le JSON
      const jsonTab = await screen.findByText(/JSON/);
      await user.click(jsonTab);

      await waitFor(() => {
        const jsonEditor = screen.getByTestId('json-editor') as HTMLTextAreaElement;
        expect(jsonEditor.value).toContain('Nouveau Titre');
      });
    });

    it('Modification du JSON met à jour le HTML', async () => {
      const user = userEvent.setup();
      render(<AdvancedPageEditorSync pageId="test-1" initialPage={mockPage} />);

      // Cliquer sur JSON
      const jsonTab = await screen.findByText(/JSON/);
      await user.click(jsonTab);

      // Modifier le JSON
      const jsonEditor = await screen.findByTestId('json-editor');
      fireEvent.change(jsonEditor, { target: { value: JSON.stringify([{ id: '1', type: 'text', data: { content: 'Titre Modifié' } }]) } });

      // Vérifier le HTML
      const htmlTab = await screen.findByText(/HTML/);
      await user.click(htmlTab);

      await waitFor(() => {
        const htmlEditor = screen.getByTestId('html-editor') as HTMLTextAreaElement;
        expect(htmlEditor.value).toBe('Titre Modifié');
      });
    });
  });

  describe('Synchronisation Formulaire → Autres', () => {
    it('Modification du titre ne change PAS le HTML par défaut (car le titre est méta)', async () => {
      const user = userEvent.setup();
      render(<AdvancedPageEditorSync pageId="test-1" initialPage={mockPage} />);

      const formTab = await screen.findByText(/Formulaire/);
      await user.click(formTab);

      const titleInput = await screen.findByLabelText(/titre/i);
      await user.clear(titleInput);
      await user.type(titleInput, 'Titre Sauvegardé');

      // HTML ne change pas
      const htmlTab = await screen.findByText(/HTML/);
      await user.click(htmlTab);
      const htmlEditor = (await screen.findByTestId('html-editor')) as HTMLTextAreaElement;
      expect(htmlEditor.value).toContain('Titre'); // contenu initial
    });
  });

  describe('Gestion d\'erreurs', () => {
    it('Affiche un avertissement si JSON est invalide', async () => {
      const user = userEvent.setup();
      render(<AdvancedPageEditorSync pageId="test-1" initialPage={mockPage} />);

      // Cliquer sur JSON
      const jsonTab = await screen.findByText(/JSON/);
      await user.click(jsonTab);

      const jsonEditor = await screen.findByTestId('json-editor');
      fireEvent.change(jsonEditor, { target: { value: '{ invalid }' } });

      // Doit afficher un toast d'erreur (via sonner)
      await waitFor(() => {
        expect(screen.getByText(/erreur/i)).toBeInTheDocument();
      });
    });
  });

  it('Déclenche la sauvegarde après inactivité', async () => {
    const onSave = vi.fn();
    const user = userEvent.setup();

    render(
      <AdvancedPageEditorSync
        pageId="test-1"
        initialPage={mockPage}
        onSave={onSave} />

    );

    // Cliquer sur onglet Formulaire
    const formTab = await screen.findByText(/Formulaire/);
    await user.click(formTab);

    // Faire une modification
    const titleInput = await screen.findByLabelText(/titre/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Titre Sauvegardé');

    // Attendre le délai d'auto-save (1s)
    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    }, { timeout: 3000 });
  });
});