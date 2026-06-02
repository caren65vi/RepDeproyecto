export const notificationHistoryKey = 'resuelveua-notification-history'
export const notificationHistoryEvent = 'resuelveua-notification-history-change'

const maxNotifications = 50

export function getNotificationHistory() {
  try {
    return JSON.parse(localStorage.getItem(notificationHistoryKey)) || []
  } catch {
    return []
  }
}

export function addNotificationToHistory(notification) {
  const history = [
    {
      ...notification,
      id: `${notification.type}-${notification.incidentId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
    },
    ...getNotificationHistory(),
  ].slice(0, maxNotifications)

  localStorage.setItem(notificationHistoryKey, JSON.stringify(history))
  window.dispatchEvent(new CustomEvent(notificationHistoryEvent, { detail: history }))
  return history[0]
}

export function clearNotificationHistory() {
  localStorage.removeItem(notificationHistoryKey)
  window.dispatchEvent(new CustomEvent(notificationHistoryEvent, { detail: [] }))
}
