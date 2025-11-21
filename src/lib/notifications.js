// Simple notification utility
export const showNotification = (message, type = 'success', duration = 3000) => {
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'success' 
      ? 'bg-green-500 text-white' 
      : type === 'error' 
      ? 'bg-red-500 text-white' 
      : 'bg-blue-500 text-white'
  }`
  notification.textContent = message

  // Add to DOM
  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)'
  }, 100)

  // Remove after duration
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, duration)
}

export default showNotification;
