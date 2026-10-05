import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Bell, CheckSquare } from 'lucide-react';

export default function RecruiterNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/recruiter/notifications');
      setNotifications(response.data.notifications.map(n => ({
        ...n,
        isRead: !!n.readAt
      })));
    } catch (err) {
      setError('Failed to fetch notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/recruiter/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/recruiter/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="LOADING NOTIFICATIONS..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="pb-6 border-b border-border-light flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-content mb-2">Notifications</h1>
          <p className="text-sm font-medium text-content-muted">System alerts regarding your company and job postings.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10" />}
          title="No Notifications"
          description="You are all caught up! No recent alerts from the administration."
        />
      ) : (
        <Card className="divide-y divide-border-light overflow-hidden">
          {notifications.map(notif => (
            <div 
              key={notif.id} 
              className={`p-6 flex items-start gap-4 transition-colors ${!notif.isRead ? 'bg-primary/5' : 'hover:bg-base/50'}`}
            >
              <div className="shrink-0 mt-1">
                {notif.isRead ? (
                  <div className="w-2 h-2 rounded-full border border-content-muted" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h4 className={`text-base font-bold ${!notif.isRead ? 'text-content' : 'text-content-muted'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs font-semibold text-content-muted uppercase tracking-wider shrink-0">
                    {new Date(notif.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className={`text-sm ${!notif.isRead ? 'text-content font-medium' : 'text-content-muted'}`}>
                  {notif.message}
                </p>
              </div>
              {!notif.isRead && (
                <button 
                  onClick={() => markAsRead(notif.id)}
                  className="shrink-0 p-2 text-content-muted hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                  title="Mark as read"
                >
                  <CheckSquare className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
