import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import DocPortal, { PortalChrome } from './DocPortal'
import { isScreenId } from './spec'
import Demo from './Demo'

export default function App() {
  const location = useLocation()
  // 인쇄할 때 접힌 기능 상세를 모두 펼침
  useEffect(() => {
    const open = () => document.querySelectorAll('details').forEach(d => { d.open = true })
    window.addEventListener('beforeprint', open)
    return () => window.removeEventListener('beforeprint', open)
  }, [])
  if (location.pathname === '/') return <Navigate to="/flow" replace />
  if (!location.pathname.startsWith('/demo')) return <DocPortal />
  const screen = new URLSearchParams(location.search).get('screen') ?? 'W1'
  return <div className="portal">
    <PortalChrome tab="demo" selected={isScreenId(screen) ? screen : 'W1'} />
    <Demo initialScreen={screen} />
  </div>
}
