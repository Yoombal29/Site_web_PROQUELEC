import { useState } from 'react';
import { Mail, Check, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api-client';

interface NewsletterSignupProps {
  variant?: 'inline' | 'card' | 'footer' | 'banner';
  className?: string;
}

export function NewsletterSignup({ variant = 'card', className = '' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: 'Email invalide',
        description: 'Veuillez entrer une adresse email valide.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      // Direct POST call to local API
      // The local backend handles duplicates with ON CONFLICT
      await apiFetch('/api/newsletter-subscribers', {
        method: 'POST',
        body: JSON.stringify({
          email,
          source: 'website'
        })
      });

      setIsSubscribed(true);
      setEmail('');

      toast({
        title: 'Inscription réussie ! ✅',
        description: 'Merci ! Vous recevrez bientôt nos actualités et conseils techniques.',
        variant: 'default'
      });

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubscribed(false);
      }, 3000);

    } catch (error: unknown) {
      console.error('Erreur inscription newsletter:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue. Veuillez réessayer.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed && variant !== 'banner') {
    return (
      <div className={`flex items-center gap-2 text-green-600 animate-in fade-in ${className}`}>
        <Check className="h-5 w-5" />
        <span>Merci pour votre inscription !</span>
      </div>);

  }

  const content =
  <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
        type="email"
        placeholder="Votre adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 h-12 rounded-lg bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-white/50"
        required
        aria-label="Adresse email pour la newsletter" />
      
        <Button
        type="submit"
        disabled={isLoading}
        className="h-12 bg-white text-proqblue hover:bg-gray-100 font-semibold rounded-lg transition-all whitespace-nowrap">
        
          {isLoading ?
        <div className="animate-spin h-4 w-4 border-2 border-proqblue border-t-transparent rounded-full" /> :

        <>
              <Send className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">S'inscrire</span>
              <span className="sm:hidden">OK</span>
            </>
        }
        </Button>
      </div>
      <p className="text-xs text-white/70">
        📬 Recevez nos actualités, conseils techniques et informations sur les formations directement dans votre boîte mail.
      </p>
    </form>;


  // Variante Banner (pour Homepage)
  if (variant === 'banner') {
    return (
      <section className="py-20 px-4 relative overflow-hidden bg-gradient-to-r from-proqblue via-proqblue-dark to-proqblue">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container max-w-3xl mx-auto relative">
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold text-white/90 uppercase tracking-wider">Newsletter</span>
              <Sparkles className="h-5 w-5 text-yellow-300" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Restez informé
            </h2>
            <p className="text-white/90 text-lg max-w-xl mx-auto">
              Recevez nos dernières actualités, conseils techniques et informations sur nos formations et certifications.
            </p>
          </div>

          {content}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">0% Spam</div>
              <p className="text-xs text-white/70">Qualité garantie</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">Gratuit</div>
              <p className="text-xs text-white/70">Toujours gratuit</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white mb-1">1 Clic</div>
              <p className="text-xs text-white/70">Désinscription facile</p>
            </div>
          </div>
        </div>
      </section>);

  }

  // Variante Inline (pour blog, etc)
  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
  }

  // Variante Footer
  if (variant === 'footer') {
    return (
      <div className={`bg-proqblue/10 backdrop-blur-sm p-6 rounded-xl border border-proqblue/20 ${className}`}>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-proqblue" />
          <h3 className="font-semibold text-proqblue text-lg">Newsletter PROQUELEC</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Recevez nos actualités et conseils techniques. Désinscription à tout moment.
        </p>
        {content}
      </div>);

  }

  // Variante Card (default)
  return (
    <Card className={`border-proqblue/20 bg-gradient-to-br from-white to-proqblue/5 ${className}`}>
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-proqblue/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-proqblue" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-proqblue">Restez informé</h3>
            <p className="text-xs text-gray-500">Newsletter PROQUELEC</p>
          </div>
        </div>
        <p className="text-gray-600 mb-6">
          Recevez nos dernières actualités, conseils techniques, informations sur les formations et certifications directement dans votre boîte mail.
        </p>
        {content}
      </CardContent>
    </Card>);

}