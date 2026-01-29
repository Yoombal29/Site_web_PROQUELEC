import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'approval' | 'notification' | 'action' | 'condition';
  config: Record<string, any>;
  nextSteps?: string[];
  required?: boolean;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  triggers: any[];
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
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('is_active', true);

      if (error) {
        console.warn('Workflows table not available:', error.message);
        setWorkflows([]);
      } else {
        // Convertir les données Json en types appropriés
        const workflowsData = (data || []).map(workflow => ({
          ...workflow,
          steps: (workflow.steps as any[])?.map(step => ({
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
      }
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
  private context: Record<string, any>;

  constructor(workflow: Workflow, initialContext: Record<string, any> = {}) {
    this.workflow = workflow;
    this.currentStep = workflow.steps[0]?.id || '';
    this.context = initialContext;
  }

  async execute(triggerData?: any): Promise<boolean> {
    try {
      // Démarrer avec les données du trigger
      if (triggerData) {
        this.context = { ...this.context, ...triggerData };
      }

      let currentStepId = this.currentStep;

      while (currentStepId) {
        const step = this.workflow.steps.find(s => s.id === currentStepId);
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

  private async executeStep(step: WorkflowStep): Promise<{ success: boolean; data?: any; error?: any }> {
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

    // Vérifier si l'utilisateur a le rôle requis
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    // TODO: Vérifier le rôle de l'utilisateur
    // Pour l'instant, on simule une approbation automatique
    return { success: true, data: { approved: true, approvedBy: user.user.id } };
  }

  private async executeNotificationStep(step: WorkflowStep) {
    const { type, recipients, template, data } = step.config;

    switch (type) {
      case 'email':
        await supabase.functions.invoke('send-email', {
          body: {
            to: recipients,
            template: template,
            data: { ...this.context, ...data }
          }
        });
        break;
      case 'database':
        // Sauvegarder la notification en base (si la table existe)
        try {
          await supabase.from('notifications').insert({
            type: 'workflow',
            title: data.title || 'Notification workflow',
            message: data.message || 'Une action workflow a été exécutée',
            recipient_id: recipients[0], // Pour l'instant, un seul destinataire
            data: this.context
          });
        } catch (error) {
          console.warn('Notifications table not available:', error);
        }
        break;
    }

    return { success: true };
  }

  private async executeActionStep(step: WorkflowStep) {
    const { action, table, data } = step.config;

    switch (action) {
      case 'insert':
        const { data: inserted, error } = await supabase
          .from(table)
          .insert({ ...data, ...this.context })
          .select()
          .single();

        if (error) throw error;
        return { success: true, data: inserted };

      case 'update':
        const { data: updated, error: updateError } = await supabase
          .from(table)
          .update({ ...data, ...this.context })
          .eq('id', this.context.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return { success: true, data: updated };

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

  private getNextStep(step: WorkflowStep, result: any): string | undefined {
    if (!step.nextSteps?.length) return undefined;

    // Si c'est une étape condition, choisir selon le résultat
    if (step.type === 'condition') {
      return result.data.conditionResult ? step.nextSteps[0] : step.nextSteps[1];
    }

    // Sinon, prendre la première étape suivante
    return step.nextSteps[0];
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Hook pour exécuter un workflow
export function useWorkflowExecution(workflowName: string) {
  const { workflows } = useWorkflows();
  const [executing, setExecuting] = useState(false);

  const executeWorkflow = async (context: Record<string, any> = {}) => {
    const workflow = workflows.find(w => w.name === workflowName);
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