import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api-client';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action' | 'condition';
  config: Record<string, unknown>;
  nextSteps?: string[];
  required?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  triggers: unknown[];
  is_active: boolean;
}

export function useWorkflows() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const data = await apiFetch<unknown[]>('/api/workflows');

      // Convertir les données Json en types appropriés
      const workflowsData = (data || []).map((workflow) => ({
        ...workflow,
        steps: (workflow.steps as unknown[])?.map((step) => ({
          id: step.id,
          name: step.name,
          type: step.type as 'approval' | 'notification' | 'action' | 'condition',
          config: step.config || {},
          nextSteps: step.nextSteps || [],
          required: step.required || false
        })) || [],
        triggers: Array.isArray(workflow.triggers) ? workflow.triggers : []
      }));
      setWorkflows(workflowsData);
    } catch (error) {
      console.warn('Error fetching workflows:', error);
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  return { workflows, loading, refetch: fetchWorkflows };
}

export class WorkflowEngine {
  private workflow: Workflow;
  private currentStep: string;
  private context: Record<string, unknown>;

  constructor(workflow: Workflow, initialContext: Record<string, unknown> = {}) {
    this.workflow = workflow;
    this.currentStep = workflow.steps[0]?.id || '';
    this.context = initialContext;
  }

  async execute(triggerData?: unknown): Promise<boolean> {
    try {
      // Démarrer avec les données du trigger
      if (triggerData) {
        this.context = { ...this.context, ...triggerData };
      }

      let currentStepId = this.currentStep;

      while (currentStepId) {
        const step = this.workflow.steps.find((s) => s.id === currentStepId);
        if (!step) break;

        const result = await this.executeStep(step);

        if (!result.success) {
          console.error(`Échec étape ${step.name}:`, result.error);
          return false;
        }

        // Mettre à jour le contexte avec les résultats
        this.context = { ...this.context, ...result.data };

        // Déterminer l'étape suivante
        currentStepId = this.getNextStep(step, result);
      }

      return true;
    } catch (error) {
      console.error('Erreur exécution workflow:', error);
      return false;
    }
  }

  private async executeStep(step: WorkflowStep): Promise<{success: boolean;data?: unknown;error?: unknown;}> {
    try {
      switch (step.type) {
        case 'approval':
          return await this.executeApprovalStep(step);
        case 'notification':
          return await this.executeNotificationStep(step);
        case 'action':
          return await this.executeActionStep(step);
        case 'condition':
          return await this.executeConditionStep(step);
        default:
          return { success: false, error: `Type d'étape non supporté: ${step.type}` };
      }
    } catch (error) {
      return { success: false, error };
    }
  }

  private async executeApprovalStep(step: WorkflowStep) {
    const { approverRole, required } = step.config;

    // Get user from local storage token
    const token = localStorage.getItem('token');
    if (!token) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    // Decode JWT to get user info (basic parsing)
    try {
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      return { success: true, data: { approved: true, approvedBy: payload.userId } };
    } catch {
      return { success: true, data: { approved: true, approvedBy: 'unknown' } };
    }
  }

  private async executeNotificationStep(step: WorkflowStep) {
    const { type, recipients, template, data } = step.config;

    switch (type) {
      case 'email':
        await apiFetch('/api/send-email', {
          method: 'POST',
          body: JSON.stringify({
            to: recipients,
            template: template,
            data: { ...this.context, ...data }
          })
        });
        break;
      case 'database':
        // Sauvegarder la notification en base
        try {
          await apiFetch('/api/notifications', {
            method: 'POST',
            body: JSON.stringify({
              type: 'workflow',
              title: data.title || 'Notification workflow',
              message: data.message || 'Une action workflow a été exécutée',
              recipient_id: recipients[0],
              data: this.context
            })
          });
        } catch (error) {
          console.warn('Notifications API not available:', error);
        }
        break;
    }

    return { success: true };
  }

  private async executeActionStep(step: WorkflowStep) {
    const { action, table, data } = step.config;

    switch (action) {
      case 'insert':
        try {
          const inserted = await apiFetch(`/api/${table}`, {
            method: 'POST',
            body: JSON.stringify({ ...data, ...this.context })
          });
          return { success: true, data: inserted };
        } catch (error) {
          return { success: false, error };
        }

      case 'update':
        try {
          const updated = await apiFetch(`/api/${table}/${this.context.id}`, {
            method: 'PUT',
            body: JSON.stringify({ ...data, ...this.context })
          });
          return { success: true, data: updated };
        } catch (error) {
          return { success: false, error };
        }

      default:
        return { success: false, error: `Action non supportée: ${action}` };
    }
  }

  private async executeConditionStep(step: WorkflowStep) {
    const { condition, value, operator = '===' } = step.config;

    const contextValue = this.getNestedValue(this.context, condition);
    let result = false;

    switch (operator) {
      case '===':
        result = contextValue === value;
        break;
      case '!==':
        result = contextValue !== value;
        break;
      case '>':
        result = contextValue > value;
        break;
      case '<':
        result = contextValue < value;
        break;
      case 'contains':
        result = Array.isArray(contextValue) ? contextValue.includes(value) : false;
        break;
    }

    return { success: true, data: { conditionResult: result } };
  }

  private getNextStep(step: WorkflowStep, result: unknown): string | undefined {
    if (!step.nextSteps?.length) return undefined;

    // Si c'est une étape condition, choisir selon le résultat
    if (step.type === 'condition') {
      return result.data.conditionResult ? step.nextSteps[0] : step.nextSteps[1];
    }

    // Sinon, prendre la première étape suivante
    return step.nextSteps[0];
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Hook pour exécuter un workflow
export function useWorkflowExecution(workflowName: string) {
  const { workflows } = useWorkflows();
  const [executing, setExecuting] = useState(false);

  const executeWorkflow = async (context: Record<string, unknown> = {}) => {
    const workflow = workflows.find((w) => w.name === workflowName);
    if (!workflow) {
      throw new Error(`Workflow "${workflowName}" introuvable`);
    }

    setExecuting(true);
    try {
      const engine = new WorkflowEngine(workflow, context);
      const success = await engine.execute();
      return success;
    } finally {
      setExecuting(false);
    }
  };

  return { executeWorkflow, executing };
}