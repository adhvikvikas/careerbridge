import React, { useEffect, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import api from '../../services/api';
import { Bell, Check } from 'lucide-react';

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/student/notifications');
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/student/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n));
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  return (
    <StudentLayout title="Notifications">
      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center bg-white p-12 rounded-lg border border-gray-200 shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li key={notification.id} className={`p-6 ${!notification.readAt ? 'bg-blue-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="text-base font-medium text-gray-900">{notification.title}</h4>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.readAt && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-4 flex-shrink-0 text-primary-600 hover:text-primary-700 bg-white border border-primary-200 rounded-md p-1.5 shadow-sm"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </StudentLayout>
  );
};

export default StudentNotifications;
