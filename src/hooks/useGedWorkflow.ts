import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';

export interface WorkflowConfig {
  states: string[];
  transitions: Record<string, string[]>;
  entities: string[];
}

export interface WorkflowTransition {
  id: number;
  entity_id: string;
  entity_type: string;
  from_state: string;
  to_state: string;
  changed_by: string;
  comment: string | null;
  created_at: string;
}

export interface GedWorkflowState {
  currentState: string;
  availableTransitions: string[];
  history: WorkflowTransition[];
  isLoading: boolean;
  error: string | null;
}

export function useGedWorkflow(entityId: string, entityType: 'document' | 'media_file') {
  const [config, setConfig] = useState<WorkflowConfig | null>(null);
  const [state, setState] = useState<GedWorkflowState>({
    currentState: 'draft',
    availableTransitions: [],
    history: [],
    isLoading: true,
    error: null
  });

  // Fetch workflow config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/ged/workflow/config', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch workflow config');
        const data = await response.json();
        setConfig(data);
      } catch (err) {
        console.error('Error fetching workflow config:', err);
        setState(prev => ({ ...prev, error: String(err) }));
      }
    };
    fetchConfig();
  }, []);

  // Fetch entity workflow state and history
  useEffect(() => {
    if (!entityId || !config) return;

    const fetchWorkflowState = async () => {
      try {
        const entityPath = entityType === 'document' ? 'documents' : 'media-files';
        const response = await fetch(`/api/ged/${entityPath}/${entityId}/history`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        });
        if (!response.ok) throw new Error('Failed to fetch workflow history');
        
        const data = await response.json();
        const currentState = data.history?.[0]?.to_state || 'draft';
        const availableTransitions = config.transitions[currentState] || [];

        setState(prev => ({
          ...prev,
          currentState,
          availableTransitions,
          history: data.history || [],
          isLoading: false,
          error: null
        }));
      } catch (err) {
        console.error('Error fetching workflow state:', err);
        setState(prev => ({ ...prev, error: String(err), isLoading: false }));
      }
    };

    fetchWorkflowState();
  }, [entityId, entityType, config]);

  const transitionState = useCallback(async (toState: string, comment?: string) => {
    if (!config || !availableTransitions.includes(toState)) {
      toast.error('Transition non autorisée');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const entityPath = entityType === 'document' ? 'documents' : 'media-files';
      const response = await fetch(`/api/ged/${entityPath}/${entityId}/transition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          to_state: toState,
          comment: comment || null
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to transition');
      }

      const result = await response.json();
      const newState = result.to_state;
      const newAvailable = config.transitions[newState] || [];

      setState(prev => ({
        ...prev,
        currentState: newState,
        availableTransitions: newAvailable,
        history: [
          {
            id: Math.max(...prev.history.map(h => h.id), 0) + 1,
            entity_id: entityId,
            entity_type: entityType === 'document' ? 'document' : 'media_file',
            from_state: prev.currentState,
            to_state: newState,
            changed_by: 'current_user',
            comment: comment || null,
            created_at: new Date().toISOString()
          },
          ...prev.history
        ],
        isLoading: false
      }));

      toast.success(`État passé à: ${newState}`);
      return true;
    } catch (err) {
      const message = String(err);
      toast.error(message);
      setState(prev => ({ ...prev, error: message, isLoading: false }));
      return false;
    }
  }, [entityId, entityType, config, state.availableTransitions]);

  return {
    ...state,
    config,
    transitionState,
    availableTransitions: state.availableTransitions
  };
}
