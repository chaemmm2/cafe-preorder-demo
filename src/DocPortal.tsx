import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ExternalLink, Maximize2, Printer, ZoomIn, ZoomOut } from 'lucide-react'
import { FRAME_SIZE, SERVICE, excluded, features, figmaNodeUrl, ia, screens, userFlow, type Feature, type Screen, type ScreenId } from './spec'
import Wireframe from './Wireframes'
import './portal.css'

type Tab = 'flow' | 'docs' | 'demo'
const docPath = (id: string) => `/docs?screen=${id}`
const demoPath = (id: string) => `/demo?screen=${id}`
const pad = (n: number) => String(n).padStart(2, '0')

export function PortalChrome({ tab, selected = 'W1' }: { tab: Tab; selected?: string }) {
  return <>
    <header className="portal-head">
      <Link to="/flow" className="portal-brand">
        <span className="portal-logo" aria-hidden="true">☕</span>
        <span><small>화면설계서와 기능명세서 <b>{SERVICE.version}</b> · {SERVICE.project}</small><strong>{SERVICE.name}</strong></span>
      </Link>
      <button className="print-button" onClick={() => window.print()}><Printer size={17} /> 문서 인쇄</button>
    </header>
    <nav className="portal-tabs" aria-label="문서 메뉴">
      <Link className={tab === 'flow' ? 'active' : ''} to="/flow">전체 흐름 보기</Link>
      <Link className={tab === 'docs' ? 'active' : ''} to={docPath(selected)}>문서 보기</Link>
      <Link className={tab === 'demo' ? 'active' : ''} to={demoPath(selected)}>시연하기</Link>
    </nav>
  </>
}

export default function DocPortal() {
  const location = useLocation()
  const tab: Tab = location.pathname.startsWith('/docs') ? 'docs' : 'flow'
  const param = new URLSearchParams(location.search).get('screen')
  const current = screens.find(screen => screen.id === param) ?? screens[0]
  return <div className="portal">
    <PortalChrome tab={tab} selected={current.id} />
    {tab === 'flow' ? <FlowView /> : <DocView key={current.id} screen={current} />}
  </div>
}

/* ───────────── 전체 흐름 보기 ───────────── */
function FlowView() {
  return <main className="portal-card flow-page">
    <div className="portal-title">
      <div><p className="eyebrow">{SERVICE.name} · IA / USER FLOW</p><h1>전체 흐름 보기</h1><p>{SERVICE.oneLiner} 화면별 문서와 독립된 시연을 각각 열 수 있어요.</p></div>
      <div className="portal-count">화면 {screens.length}개 · 기능 {features.length}개</div>
    </div>
    <div className="overview-grid">
      {[['TARGET', SERVICE.target], ['PROBLEM', SERVICE.problem], ['INSIGHT', SERVICE.insight], ['SOLUTION', SERVICE.solution]].map(([k, v]) => <article key={k}><b>{k}</b><p>{v}</p></article>)}
    </div>

    <h2 className="block-title">화면 목록 <small>Figma 04 Wireframe · W1~W5</small></h2>
    <div className="flow-grid">{screens.map(screen => <article className="flow-item" key={screen.id}>
      <div className="flow-card-heading"><b>{screen.id} · {screen.type}</b><strong>{screen.name}</strong></div>
      <Thumbnail id={screen.id} />
      <div className="flow-card-copy">
        <p>{screen.purpose}</p>
        <small><b>다음</b> {screen.exit.join(' · ')}</small>
        <span className="flow-actions"><Link to={docPath(screen.id)}>문서 보기</Link><Link to={demoPath(screen.id)}>시연하기</Link></span>
      </div>
    </article>)}</div>

    <h2 className="block-title">핵심 User Flow <small>Figma 03 User Flow 원문 · 픽업 시간을 지정해 미리 주문하기</small></h2>
    <ol className="user-flow">{userFlow.main.map((node, index) => <li key={node.label} className={`uf-node ${node.kind}`}>
      <span className="uf-index">{pad(index + 1)}</span>
      <span><strong>{node.label}</strong><small>{node.sub}</small></span>
      {'screen' in node && node.screen && <Link className="uf-link" to={docPath(node.screen)}>{node.screen} 문서</Link>}
    </li>)}</ol>
    <div className="flow-notes">
      <article><h3>왜 이 기능을 User Flow로 골랐나</h3><p>{userFlow.why}</p></article>
      <article><h3>예외 처리 (최소한만)</h3><ul>{userFlow.exceptions.map(item => <li key={item}>{item}</li>)}</ul></article>
      <article><h3>단축 경로 & 재진입</h3><ul>{userFlow.shortcuts.map(item => <li key={item}>{item}</li>)}</ul></article>
    </div>

    <h2 className="block-title">IA <small>Figma 02 IA 원문 · {ia.summary}</small></h2>
    <div className="ia-grid">
      <ul className="ia-tree">{ia.tree.map(node => <li key={node.label} style={{ paddingLeft: node.depth * 22 }} className={node.screen ? 'is-screen' : ''}>
        <span>{node.label}</span>{node.sub && <small>{node.sub}</small>}
      </li>)}</ul>
      <article className="ia-points"><h3>IA 설계 포인트</h3><ol>{ia.points.map(item => <li key={item}>{item}</li>)}</ol></article>
    </div>
  </main>
}

function Thumbnail({ id }: { id: ScreenId }) {
  const scale = 0.36
  return <div className="flow-thumbnail" aria-label={`${id} 와이어프레임 미리보기`}>
    <div style={{ width: FRAME_SIZE.width * scale, height: FRAME_SIZE.height * scale }}>
      <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}><Wireframe id={id} /></div>
    </div>
  </div>
}

/* ───────────── 문서 보기 ───────────── */
function DocView({ screen }: { screen: Screen }) {
  const navigate = useNavigate()
  const index = screens.indexOf(screen)
  const prev = screens[index - 1]
  const next = screens[index + 1]
  const [active, setActive] = useState<number | null>(null)
  const related = useMemo(() => screen.features.map(id => features.find(feature => feature.id === id)).filter((f): f is Feature => Boolean(f)), [screen])
  const select = (no: number) => {
    setActive(no)
    document.getElementById(`component-${no}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }
  return <main className="portal-card doc-page">
    <div className="doc-page-top">
      <button disabled={!prev} onClick={() => prev && navigate(docPath(prev.id))}>← {prev ? `${prev.id} ${prev.name}` : '이전 화면'}</button>
      <div className="doc-title-line"><h1>{screen.name}</h1><code>{screen.id}</code><span className="screen-type">{screen.type}</span></div>
      <button disabled={!next} onClick={() => next && navigate(docPath(next.id))}>{next ? `${next.id} ${next.name}` : '다음 화면'} →</button>
    </div>
    <p className="doc-order-note">이전 · 다음은 문서를 읽는 순서입니다. 실제 서비스 이동 흐름은 아래 「들어오는 곳 · 나가는 곳」을 확인하세요.</p>

    <section className="doc-overview">
      <div className="section-heading"><span className="section-kicker">개요</span><h2>화면 개요</h2></div>
      <p className="screen-explanation">{screen.purpose}</p>
      <div className="doc-meta">
        <p><b>들어오는 곳</b><span>{screen.entry.map(item => <span key={item}>{item}</span>)}</span></p>
        <p><b>나가는 곳</b><span>{screen.exit.map(item => <span key={item}>{item}</span>)}</span></p>
        <p><b>서비스 Route (데모)</b><span><code>#{screen.route}</code></span></p>
        <p><b>연결 기능</b><span>{screen.features.join(' · ')}</span></p>
        <p><b>문서 원본</b><span>Figma 04 Wireframe 캡션 · 01 기능 정의 · 02 IA · 03 User Flow</span></p>
        <p><b>Figma 자료 출처</b><a href={figmaNodeUrl(screen.figmaNode)} target="_blank" rel="noreferrer">Figma 프레임 {screen.id} (node {screen.figmaNode}) <ExternalLink size={13} /></a></p>
      </div>
    </section>

    <section>
      <div className="section-heading"><span className="section-kicker">화면</span><h2>화면 설명 | 구성 요소와 동작</h2><code>{screen.id}</code></div>
      <div className="screen-spec-grid">
        <article className="screen-spec-card"><h3>주요 동작</h3><ul>{screen.actions.map(item => <li key={item}>{item}</li>)}</ul></article>
        <article className="screen-spec-card"><h3>상태 · 예외 처리</h3><ul>{screen.states.map(item => <li key={item}>{item}</li>)}</ul></article>
      </div>
      <article className="screen-spec-card unresolved"><h3>원문 미기재 · 확인 필요</h3><ul>{screen.unresolved.map(item => <li key={item}>{item}</li>)}</ul></article>
      {screen.sourceNotes?.map(note => <div className="source-conflict" key={note.title}><strong>{note.title} · 확인 필요</strong><p>{note.body}</p></div>)}
    </section>

    <section>
      <div className="section-heading"><span className="section-kicker">Figma</span><h2>Figma 화면과 번호별 구성 요소</h2><span className="feature-count">{screen.components.length}개 요소</span></div>
      <div className="figma-components-grid">
        <div className="doc-figure-column">
          <FrameViewer screen={screen} active={active} onSelect={select} />
          <p className="wireframe-caption">번호는 Figma 원본 와이어프레임의 번호(note 1~{screen.components.length})입니다. 번호를 누르면 오른쪽 설명이 강조됩니다. 문서용 프레임은 눌러도 시연이 실행되지 않습니다.</p>
        </div>
        <div className="figma-component-list">
          {screen.components.map(component => <button type="button" className={`component-row ${active === component.no ? 'selected' : ''}`} id={`component-${component.no}`} key={component.no} onClick={() => setActive(component.no)}>
            <span className="number-badge">{pad(component.no)}</span>
            <span><strong>{component.title}</strong><span>{component.detail}</span><small>Figma 원본 번호 {component.no} · 와이어프레임 캡션</small></span>
          </button>)}
        </div>
      </div>
    </section>

    <section>
      <div className="section-heading"><span className="section-kicker">기능명세</span><h2>기능명세</h2><span className="feature-count">{related.length}개 기능</span></div>
      {related.map(feature => <FeatureCard feature={feature} key={feature.id} />)}
      {screen.id === 'W1' && <>
        <p className="source-note">아래 기능은 화면이 없거나 학생 앱 범위 밖이라 특정 화면에 연결되지 않습니다. 홈 문서에 함께 표시합니다.</p>
        {features.filter(f => f.id === 'F0' || f.id === 'OP').map(feature => <FeatureCard feature={feature} key={feature.id} />)}
        <article className="feature-card excluded"><div className="feature-title"><code>✕</code><strong>제외한 기능</strong><span>제외</span></div><p className="feature-description">{excluded.items}</p><p className="feature-sub">{excluded.reason}</p></article>
      </>}
    </section>
  </main>
}

type Box = { no: number; x: number; y: number; w: number; h: number }

function FrameViewer({ screen, active, onSelect }: { screen: Screen; active: number | null; onSelect: (no: number) => void }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const [fit, setFit] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [fitMode, setFitMode] = useState(true)
  const [boxes, setBoxes] = useState<Box[]>([])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const update = () => {
      const next = Math.max(0.2, Math.min(1.25, (viewport.clientWidth - 32) / FRAME_SIZE.width))
      setFit(next)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const shownZoom = fitMode ? fit : zoom

  const measure = useCallback(() => {
    const board = boardRef.current
    if (!board) return
    const origin = board.getBoundingClientRect()
    const next: Box[] = []
    board.querySelectorAll<HTMLElement>('[data-note]').forEach(node => {
      const no = Number(node.dataset.note)
      const rect = node.getBoundingClientRect()
      next.push({ no, x: rect.left - origin.left - 3, y: rect.top - origin.top - 3, w: rect.width + 6, h: rect.height + 6 })
    })
    setBoxes(next.sort((a, b) => a.no - b.no))
  }, [])

  useEffect(() => {
    const frame = requestAnimationFrame(measure)
    document.fonts?.ready.then(measure)
    return () => cancelAnimationFrame(frame)
  }, [measure, shownZoom, screen.id])

  const setClamped = (value: number) => { setFitMode(false); setZoom(Math.min(1.6, Math.max(Math.min(0.25, fit), value))) }
  const zoomedIn = shownZoom > fit + 0.005
  return <div className="figma-viewer">
    <div className="figma-viewer-toolbar">
      <span><b>Figma 프레임 {screen.id}</b><small>{screen.name} · 360 × 760</small></span>
      <div className="figma-zoom-controls" aria-label="프레임 확대·축소">
        <button type="button" aria-label="축소" title="축소" onClick={() => setClamped(shownZoom - 0.1)} disabled={shownZoom <= 0.25}><ZoomOut size={15} /></button>
        <input aria-label="확대 배율" type="range" min="25" max="160" step="1" value={Math.round(shownZoom * 100)} onChange={event => setClamped(Number(event.target.value) / 100)} />
        <output>{Math.round(shownZoom * 100)}%</output>
        <button type="button" aria-label="확대" title="확대" onClick={() => setClamped(shownZoom + 0.1)} disabled={shownZoom >= 1.6}><ZoomIn size={15} /></button>
        <button type="button" className="fit-button" aria-label="화면 맞춤" title="화면 맞춤" onClick={() => setFitMode(true)}><Maximize2 size={14} /> 화면 맞춤</button>
      </div>
    </div>
    <div className={`figma-viewport ${zoomedIn ? 'zoomed' : ''}`} ref={viewportRef}>
      <div className="figma-artboard-shell" style={{ width: FRAME_SIZE.width * shownZoom, height: FRAME_SIZE.height * shownZoom }}>
        <div className="figma-artboard" ref={boardRef} style={{ width: FRAME_SIZE.width, height: FRAME_SIZE.height, transform: `scale(${shownZoom})` }}><Wireframe id={screen.id} /></div>
        {boxes.map(box => {
          const component = screen.components.find(c => c.no === box.no)
          return <button type="button" key={box.no} className={`figma-hotspot ${active === box.no ? 'selected' : ''}`} style={{ left: box.x, top: box.y, width: box.w, height: box.h }} aria-label={`${pad(box.no)} ${component?.title ?? ''}`} onClick={() => onSelect(box.no)}><span>{pad(box.no)}</span></button>
        })}
      </div>
    </div>
  </div>
}

function FeatureCard({ feature }: { feature: Feature }) {
  const missing = '원문 미기재'
  return <article className="feature-card">
    <div className="feature-title"><code>{feature.id}</code><strong>{feature.name}</strong><span>{feature.priority}</span></div>
    <p className="feature-description">{feature.description}</p>
    <p className="feature-sub"><b>해결하는 문제 / 근거</b> {feature.rationale}</p>
    <div className="feature-status">
      <p><b>기획된 동작</b><span>{feature.planned}</span></p>
      <p className={`status ${feature.demo.status === '데모 미구현' ? 'off' : ''}`}><b>현재 구현 상태 · {feature.demo.status}</b><span>{feature.demo.note}</span></p>
    </div>
    <div className="feature-source-grid">
      <p><b>연결 화면</b><span>{feature.screens}</span></p>
      <p><b>User Flow 노드</b><span>{feature.flowNode}</span></p>
      <p><b>Actor · Trigger</b><span>{missing}</span></p>
      <p><b>선행 조건</b><span>{missing}</span></p>
      <p><b>권한 · 중복 실행</b><span>{missing}</span></p>
      <p><b>QA 기준</b><span>{missing}</span></p>
      <p><b>기능 원본</b><a href={figmaNodeUrl('2:22')} target="_blank" rel="noreferrer">Figma 01 기능 정의 <ExternalLink size={12} /></a></p>
    </div>
    <details><summary>처리 로직과 예외 조건 보기</summary>
      <div className="feature-details-grid">
        <div><h4>데이터 · 로직</h4><ul>{feature.logic.map(item => <li key={item}>{item}</li>)}</ul></div>
        <div><h4>예외 · 제한사항</h4><ul>{feature.exceptions.map(item => <li key={item}>{item}</li>)}</ul></div>
      </div>
      <p className="notion-field-note">입력 유효성, 저장·동기화, 경계값 등 원문에 별도 항목이 없는 내용은 위 원문(기능 정의 · User Flow · 06 CHECK)에서 확인 가능한 범위만 표시했습니다.</p>
    </details>
  </article>
}
