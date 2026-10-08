import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Bell, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api('/student/notifications');
      if (response.success) {
        setNotifications(response.notifications);
      }
    } catch (err) {
      setError('Failed to load system notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api(`/student/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.readAt);
    try {
      await Promise.all(unread.map(n => api(`/student/notifications/${n.id}/read`, { method: 'PATCH' })));
      setNotifications(prev => prev.map(n => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="Loading Notifications..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  const unreadCount = notifications.filter(n => !n.readAt).length;

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Notifications</div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-navy mb-2 flex items-center gap-4">
            System Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-sm px-3 py-1 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-content-muted">Stay updated on your application status and platform announcements.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} className="border-border-light text-navy font-semibold hover:bg-base" icon={<CheckCircle2 className="w-4 h-4" />}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10" />}
          title="All caught up"
          description="Your notification center is currently empty."
        />
      ) : (
        <div className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm divide-y divide-border-light">
          {notifications.map(notif => {
            const isRead = !!notif.readAt;
            return (
              <div
                key={notif.id}
                className={`p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-6 transition-colors ${!isRead ? 'bg-primary/5' : 'hover:bg-base'}`}
              >
                <div className="flex gap-4 items-start w-full">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${
                    !isRead 
                      ? 'bg-base text-primary border-primary' 
                      : 'bg-base text-content-muted border-border-light'
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className={`text-base font-bold ${!isRead ? 'text-navy' : 'text-content-muted'}`}>
                        {notif.title}
                      </h4>
                      {!isRead && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                      )}
                    </div>
                    
                    <p className={`text-sm mt-1 mb-3 leading-relaxed ${!isRead ? 'text-navy' : 'text-content-muted'}`}>
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto">
                      <div className="text-xs font-semibold text-content-muted flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(notif.createdAt).toLocaleString()}
                      </div>
                      
                      {!isRead && (
                        <Button
                          onClick={() => markAsRead(notif.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 text-primary hover:bg-primary/10 -mr-2"
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
