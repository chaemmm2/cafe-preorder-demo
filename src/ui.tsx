// Figma 「05 재사용 컴포넌트」 6종(Top Bar · Button · Chip · Menu Row · Cafe Card · Tab Bar)을 React로 옮긴 공용 UI
// onClick이 없으면 정적인 div로 렌더링되어 문서용 와이어프레임에서 눌리지 않습니다.
import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight, ClipboardList, Home, User } from 'lucide-react'

type Clickable = { onClick?: () => void; disabled?: boolean; className?: string; children?: ReactNode; label?: string; note?: number; selected?: boolean }

function Tap({ onClick, disabled, className = '', children, label, note, selected }: Clickable) {
  const props = note ? { 'data-note': note } : {}
  if (!onClick) return <div className={className} {...props}>{children}</div>
  return <button type="button" className={className} onClick={onClick} disabled={disabled} aria-label={label} aria-pressed={selected} {...props}>{children}</button>
}

export function TopBar({ title, onBack, back = false }: { title: string; onBack?: () => void; back?: boolean }) {
  return <div className="wf-topbar">
    {(back || onBack) && <Tap className="wf-back" onClick={onBack} label="뒤로가기"><ChevronLeft size={18} /></Tap>}
    <strong>{title}</strong>
  </div>
}

export function Chip({ children, selected, disabled, onClick, className = '', note }: Clickable) {
  return <Tap className={`wf-chip ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''} ${className}`} onClick={onClick} disabled={disabled} selected={selected} note={note}>{children}</Tap>
}

export function Button({ children, onClick, disabled, variant = 'primary', note }: Clickable & { variant?: 'primary' | 'secondary' }) {
  return <Tap className={`wf-button ${variant}`} onClick={onClick} disabled={disabled} note={note}>{children}</Tap>
}

export function ImagePlaceholder({ size = 44 }: { size?: number }) {
  return <span className="wf-image" style={{ width: size, height: size }} aria-hidden="true"><svg viewBox="0 0 10 10" preserveAspectRatio="none"><line x1="0" y1="0" x2="10" y2="10" /><line x1="10" y1="0" x2="0" y2="10" /></svg></span>
}

export function MenuRow({ name, price, soldOut, onClick, note }: { name: string; price: string; soldOut?: boolean } & Clickable) {
  return <Tap className={`wf-menu-row ${soldOut ? 'sold-out' : ''}`} onClick={soldOut ? undefined : onClick} note={note} label={soldOut ? `${name} 품절` : undefined}>
    <ImagePlaceholder />
    <span className="wf-menu-text"><span>{name}</span><b>{price}</b></span>
    {soldOut && <span className="wf-tag">품절</span>}
  </Tap>
}

export function CafeCard({ name, meta, open, onClick, note }: { name: string; meta: string; open: boolean } & Clickable) {
  return <Tap className={`wf-cafe-card ${open ? '' : 'closed'}`} onClick={open ? onClick : undefined} note={note}>
    <span className="wf-cafe-head"><strong>{name}</strong><span className="wf-badge">{open ? '운영 중' : '운영 종료'}</span></span>
    <small>{meta}</small>
  </Tap>
}

export type TabKey = 'home' | 'orders' | 'my'
export function TabBar({ active, onChange }: { active: TabKey; onChange?: (tab: TabKey) => void }) {
  const tabs: [TabKey, string, ReactNode][] = [['home', '홈', <Home size={18} />], ['orders', '주문 내역', <ClipboardList size={18} />], ['my', '마이', <User size={18} />]]
  return <div className="wf-tabbar">{tabs.map(([key, label, icon]) => <Tap key={key} className={`wf-tab ${active === key ? 'active' : ''}`} onClick={onChange ? () => onChange(key) : undefined}>{icon}<span>{label}</span></Tap>)}</div>
}

export function OngoingCard({ title, sub, onClick, note }: { title: string; sub: string } & Clickable) {
  return <Tap className="wf-ongoing" onClick={onClick} note={note}>
    <span><small>진행 중인 주문</small><strong>{title}</strong><span>{sub}</span></span>
    <ChevronRight size={16} />
  </Tap>
}

export function Stepper({ value, onMinus, onPlus, minusDisabled, plusDisabled, label }: { value: number; onMinus?: () => void; onPlus?: () => void; minusDisabled?: boolean; plusDisabled?: boolean; label: string }) {
  return <span className="wf-stepper">
    <Tap onClick={onMinus} disabled={minusDisabled} label={`${label} 줄이기`}>−</Tap>
    <b aria-live="polite">{value}</b>
    <Tap onClick={onPlus} disabled={plusDisabled} label={`${label} 늘리기`}>+</Tap>
  </span>
}

const STEPS = ['접수', '제조 중', '픽업 대기']
export function Progress({ step, note }: { step: number; note?: number }) {
  return <div className="wf-progress" data-note={note} aria-label={`진행 단계: ${STEPS[step]}`}>
    {STEPS.map((label, index) => <span key={label} className={`wf-progress-step ${index < step ? 'done' : ''} ${index === step ? 'current' : ''}`}>
      <i>{index < step ? '✓' : ''}</i><small>{label}</small>
    </span>)}
  </div>
}

export function RadioCard({ title, sub, selected, onClick, note }: { title: string; sub: string } & Clickable) {
  return <Tap className={`wf-radio-card ${selected ? 'selected' : ''}`} onClick={onClick} selected={selected} note={note}>
    <i aria-hidden="true" /><span><strong>{title}</strong><small>{sub}</small></span>
  </Tap>
}
