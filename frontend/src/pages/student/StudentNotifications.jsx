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
    <div className="space-y-12 max-w-5xl">
      <div className="border-b border-border-dark pb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter mb-4 flex items-center gap-4">
            SYSTEM ALERTS
            {unreadCount > 0 && (
              <span className="bg-accent text-inverted text-[10px] px-3 py-1 font-bold tracking-widest border border-inverted">
                {unreadCount} UNREAD
              </span>
            )}
          </h1>
          <p className="text-sm font-semibold uppercase tracking-widest text-content-muted">Updates regarding your applications and profile.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline-inverted" onClick={markAllAsRead} icon={<CheckSquare className="w-4 h-4" />}>
            ACKNOWLEDGE ALL
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-10 h-10" />}
          title="NO ALERTS DETECTED"
          description="Your notification center is currently empty."
        />
      ) : (
        <div className="border border-border-light bg-surface divide-y divide-border-light">
          {notifications.map(notif => (
            <div
              key={notif.id}
              className={`p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors ${!notif.isRead ? 'bg-inverted text-content-inverted' : 'hover:bg-base'}`}
            >
              <div className="flex gap-6 items-start">
                <div className="shrink-0 mt-1">
                  {notif.isRead ? (
                    <div className="w-3 h-3 rounded-none border-2 border-content-muted" />
                  ) : (
                    <div className="w-3 h-3 rounded-none bg-accent" />
                  )}
                </div>
                <div>
                  <h4 className={`text-lg font-bold tracking-tight uppercase ${!notif.isRead ? 'text-content-inverted' : 'text-content'}`}>
                    {notif.title}
                  </h4>
                  <p className={`text-sm mt-3 leading-relaxed max-w-2xl ${!notif.isRead ? 'text-content-inverted-muted' : 'text-content-muted'}`}>
                    {notif.message}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mt-4 ${!notif.isRead ? 'text-accent' : 'text-content-muted'}`}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {!notif.isRead && (
                <div className="shrink-0">
                  <Button
                    onClick={() => markAsRead(notif.id)}
                    variant="accent"
                    size="sm"
                  >
                    ACKNOWLEDGE
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
