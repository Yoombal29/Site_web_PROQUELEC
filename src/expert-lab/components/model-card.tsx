import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, Play, Pause, Trash2, Download } from "lucide-react"
import { cn } from "@/expert-lab/lib/utils"

interface ModelCardProps {
  name: string
  provider: string
  status: "active" | "inactive" | "downloading" | "error"
  size: string
  lastUsed?: string
  requestCount: number
  onToggle: (enabled: boolean) => void
  onDelete: () => void
  onDownload?: () => void
  className?: string
}

export function ModelCard({
  name,
  provider,
  status,
  size,
  lastUsed,
  requestCount,
  onToggle,
  onDelete,
  onDownload,
  className
}: ModelCardProps) {
  const [enabled, setEnabled] = useState(status === "active")

  const statusConfig = {
    active: { color: "ai-emerald", label: "Actif", icon: Play },
    inactive: { color: "muted-foreground", label: "Inactif", icon: Pause },
    downloading: { color: "ai-blue", label: "Téléchargement", icon: Download },
    error: { color: "ai-red", label: "Erreur", icon: Pause }
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  const handleToggle = (checked: boolean) => {
    setEnabled(checked)
    onToggle(checked)
  }

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-card hover:border-primary/30",
      status === "active" && "border-ai-emerald/30",
      status === "error" && "border-ai-red/30",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {provider}
            </Badge>
            <Switch
              checked={enabled}
              onCheckedChange={handleToggle}
              disabled={status === "downloading"}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("w-4 h-4", `text-${config.color}`)} />
            <span className={`text-${config.color}`}>{config.label}</span>
          </div>
          <span className="text-muted-foreground">{size}</span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Dernière utilisation</p>
            <p className="font-medium">{lastUsed || "Jamais"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Requêtes</p>
            <p className="font-medium">{requestCount.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Config
          </Button>
          {onDownload && status !== "active" && (
            <Button variant="outline" size="sm" onClick={onDownload}>
              <Download className="w-4 h-4" />
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onDelete} className="text-ai-red hover:text-ai-red">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
