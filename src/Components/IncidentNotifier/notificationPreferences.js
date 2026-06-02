export const notificationConsentKey = 'resuelveua-incident-notifications'
export const notificationPreferenceEvent = 'resuelveua-notification-preference'

export function getNotificationConsent() {
  return localStorage.getItem(notificationConsentKey) || 'pending'
}

export function setNotificationConsent(value) {
  localStorage.setItem(notificationConsentKey, value)
  window.dispatchEvent(new CustomEvent(notificationPreferenceEvent, { detail: value }))
}

export function getBrowserNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function enableBrowserNotifications() {
  if (!('Notification' in window)) {
    setNotificationConsent('unsupported')
    return 'unsupported'
  }

  const permission = await Notification.requestPermission()
  setNotificationConsent(permission === 'granted' ? 'accepted' : 'declined')
  return permission
}

export function disableBrowserNotifications() {
  setNotificationConsent('declined')
}
