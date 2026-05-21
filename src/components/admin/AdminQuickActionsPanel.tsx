
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, Eye, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import BlogPostForm from "./BlogPostForm";
import { useState } from "react";

export default function AdminQuickActionsPanel() {
  const navigate = useNavigate();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);

  const quickActions = [
  {
    title: "Nouvel article",
    description: "Créer un nouvel article de blog",
    icon: FileText,
    action: () => setIsCreatePostOpen(true),
    variant: "default" as const
  },
  {
    title: "BI Metabase",
    description: "Analyses & Reporting",
    icon: Eye,
    action: () => window.open("http://localhost:3101", "_blank"),
    variant: "outline" as const
  },
  {
    title: "API Docs",
    description: "Swagger (Port 3103)",
    icon: Settings,
    action: () => window.open("http://localhost:3103/api-docs", "_blank"),
    variant: "outline" as const
  }];


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="h-5 w-5 text-proqblue" />
        <h3 className="text-lg font-semibold text-proqblue-dark">Actions rapides</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action, index) =>
        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <action.icon className="h-4 w-4" />
                {action.title}
              </CardTitle>
              <CardDescription className="text-xs">{action.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
              variant={action.variant}
              size="sm"
              onClick={action.action}
              className="w-full">
              
                <PlusCircle className="h-4 w-4 mr-1" />
                Accéder
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isCreatePostOpen} onOpenChange={setIsCreatePostOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Créer un nouvel article</DialogTitle>
            <DialogDescription>
              Remplissez les informations ci-dessous pour créer un nouvel article de blog.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <BlogPostForm onSuccess={() => setIsCreatePostOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>
    </div>);

}