
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimationWrapper } from "@/components/AnimationWrapper";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-proqgray via-white to-proqblue/5">
      <AnimationWrapper type="fade" delay={200}>
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-8">
            <h1 className="text-8xl font-bold text-proqblue mb-4 animate-pulse">
              404
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-proqblue to-proqblue-dark mx-auto mb-6 rounded-full"></div>
          </div>
          
          <AnimationWrapper type="slide" delay={400}>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Page introuvable
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Désolé, la page que vous recherchez n'existe pas ou a été déplacée. 
              Vérifiez l'URL ou retournez à l'accueil.
            </p>
          </AnimationWrapper>

          <AnimationWrapper type="scale" delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-proqblue hover:bg-proqblue-dark">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </Link>
              </Button>
              
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Page précédente
              </Button>
            </div>
          </AnimationWrapper>

          <AnimationWrapper type="fade" delay={800}>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-4">
                Vous pouvez aussi chercher :
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/about" className="text-proqblue hover:underline text-sm">
                  À propos
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/contact" className="text-proqblue hover:underline text-sm">
                  Contact
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/blog" className="text-proqblue hover:underline text-sm">
                  Blog
                </Link>
                <span className="text-gray-300">•</span>
                <Link to="/activities" className="text-proqblue hover:underline text-sm">
                  Activités
                </Link>
              </div>
            </div>
          </AnimationWrapper>
        </div>
      </AnimationWrapper>
    </div>
  );
};

export default NotFound;
