
import { useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function NotificationCenter() {
  const { notifications, markAsRead, removeNotification, clearAll, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (id: string) => {
    markAsRead(id);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold">Notifications</h4>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
              Tout effacer
            </Button>
          )}
        </div>
        <ScrollArea className="h-64">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucune notification
            </p>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className={`cursor-pointer transition-colors ${!notification.read ? 'bg-accent' : ''}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <CardHeader className="p-3 pb-1">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm">{notification.title}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.timestamp, { 
                        addSuffix: true, 
                        locale: fr 
                      })}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
