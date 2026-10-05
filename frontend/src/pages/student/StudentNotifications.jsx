import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/States';
import { Bell, CheckSquare } from 'lucide-react';
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
      const response = await api.get('/student/notifications');
      setNotifications(response.data.notifications);
      setError(null);
    } catch (err) {
      setError('Failed to load system notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/student/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/student/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingState message="RETRIEVING SYSTEM ALERTS..." />;
  if (error) return <ErrorState message={error} onRetry={fetchNotifications} />;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-border-light flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-content mb-2 flex items-center gap-3">
            Notifications
            {unreadCount > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="text-sm font-medium text-content-muted">Updates regarding your applications and profile.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead} icon={<CheckSquare className="w-4 h-4" />}>
            Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10" />}
          title="No Notifications Found"
          description="Your notification center is currently empty."
        />
      ) : (
        <div className="bg-surface border border-border-light rounded-2xl overflow-hidden shadow-sm divide-y divide-border-light">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors ${!notif.isRead ? 'bg-primary/5' : 'hover:bg-base/50'}`}
            >
              <div className="flex gap-4 items-start">
                <div className="shrink-0 mt-1">
                  {notif.isRead ? (
                    <div className="w-2.5 h-2.5 rounded-full border border-content-muted" />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </div>
                <div>
                  <h4 className={`text-base font-bold ${!notif.isRead ? 'text-content' : 'text-content-muted'}`}>
                    {notif.title}
                  </h4>
                  <p className={`text-sm mt-1 leading-relaxed ${!notif.isRead ? 'text-content' : 'text-content-muted'}`}>
                    {notif.message}
                  </p>
                  <p className={`text-xs font-medium mt-2 ${!notif.isRead ? 'text-primary' : 'text-content-muted'}`}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!notif.isRead && (
                <div className="shrink-0">
                  <Button
                    onClick={() => markAsRead(notif.id)}
                    variant="ghost"
                    size="sm"
                  >
                    Mark as Read
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
