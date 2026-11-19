// 시연하기 — 문서와 독립된 실제 React 데모 (Mock Data)
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, Bell, Clock, RotateCcw, X } from 'lucide-react'
import { Button, CafeCard, Chip, ImagePlaceholder, MenuRow, OngoingCard, Progress, RadioCard, Stepper, TabBar, TopBar, type TabKey } from './ui'
import { MAX_QTY, MAX_SHOTS, NOW, addMinutes, cafes, categories, initialOrder, itemLabel, menus, recentItem, slots, unitPrice, won, type CartItem, type Category, type Order, type OrderStep, type PayMethod, type Size, type Temp } from './mockData'
import './demo.css'

type View = 'W1' | 'W2' | 'W4' | 'W5' | 'orders' | 'my'
type Modal = 'pay-fail' | 'slot-full' | null
const SCREEN_NAMES: Record<string, string> = { W1: '홈', W2: '메뉴 목록', W3: '메뉴 옵션 (바텀시트)', W4: '주문서 · 픽업 시간', W5: '주문 상태', orders: '주문 내역 탭', my: '마이 탭' }
const STEP_NAMES = ['접수', '제조 중', '픽업 대기']

const initialFor = (screen: string) => {
  const view: View = screen === 'W3' ? 'W2' : (['W1', 'W2', 'W4', 'W5', 'orders', 'my'].includes(screen) ? screen as View : 'W1')
  return {
    view,
    sheet: screen === 'W3' ? 'americano' : null,
    carts: screen === 'W4' ? { student: [{ ...recentItem, key: 'init' }] } : {} as Record<string, CartItem[]>,
    history: view === 'W1' ? [] : view === 'W4' ? ['W1', 'W2'] as View[] : ['W1'] as View[],
  }
}

export default function Demo({ initialScreen }: { initialScreen: string }) {
  const navigate = useNavigate()
  const init = useMemo(() => initialFor(initialScreen), [initialScreen])
  const [view, setView] = useState<View>(init.view)
  const [history, setHistory] = useState<View[]>(init.history)
  const [cafeId, setCafeId] = useState('student')
  const [category, setCategory] = useState<Category>('커피')
  const [sheet, setSheet] = useState<string | null>(init.sheet)
  const [carts, setCarts] = useState<Record<string, CartItem[]>>(init.carts)
  const [pickupMode, setPickupMode] = useState<'fastest' | 'slot'>('fastest')
  const [slot, setSlot] = useState<string | null>(null)
  const [lastPay, setLastPay] = useState<PayMethod>('카카오페이')
  const [pay, setPay] = useState<PayMethod>('카카오페이')
  const [extraFull, setExtraFull] = useState<string[]>([])
  const [orders, setOrders] = useState<Order[]>([initialOrder])
  const [currentNo, setCurrentNo] = useState('A-24')
  const [modal, setModal] = useState<Modal>(null)
  const [paying, setPaying] = useState(false)
  const [push, setPush] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [simPayFail, setSimPayFail] = useState(false)
  const [simSlotFull, setSimSlotFull] = useState(false)
  const [autoProgress, setAutoProgress] = useState(true)
  const [pushOn, setPushOn] = useState(true)

  const cafe = cafes.find(c => c.id === cafeId)!
  const cart = carts[cafeId] ?? []
  const cartQty = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.qty * item.unitPrice, 0)
  const fastest = addMinutes(NOW, cafe.eta)
  const isFull = (time: string) => slots.some(s => s.time === time && s.full) || extraFull.includes(time)
  const currentOrder = orders.find(o => o.no === currentNo) ?? orders[0]
  const ongoing = orders.find(o => o.step < 2) ?? orders[0]
  const urlScreen = view === 'W2' && sheet ? 'W3' : view

  // 데모 화면을 바꾸면 주소도 맞춰 새로고침·직접 진입 시 같은 화면으로 열리게 함 (상태는 초기 Mock 값으로 복원)
  useEffect(() => { navigate(`/demo?screen=${urlScreen}`, { replace: true }) }, [urlScreen, navigate])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(''), 2200)
    return () => window.clearTimeout(id)
  }, [toast])

  const advance = (no: string) => {
    const order = orders.find(o => o.no === no)
    if (!order || order.step >= 2) return
    const step = (order.step + 1) as OrderStep
    setOrders(list => list.map(o => o.no === no ? { ...o, step } : o))
    if (step === 2 && pushOn) setPush(no)
  }


  // 주문 상태 자동 진행 (직원용 운영 화면 OP 대신 Mock 타이머)
  useEffect(() => {
    if (!autoProgress) return
    const target = orders.find(o => o.createdAt > 0 && o.step < 2)
    if (!target) return
    const id = window.setTimeout(() => advance(target.no), target.step === 0 ? 4000 : 6000)
    return () => window.clearTimeout(id)
  }, [autoProgress, orders]) // eslint-disable-line react-hooks/exhaustive-deps

  const go = (next: View) => { setHistory(h => [...h, view]); setView(next) }
  const back = () => { setSheet(null); setView(history.at(-1) ?? 'W1'); setHistory(history.slice(0, -1)) }
  const goTab = (tab: TabKey) => { setSheet(null); setHistory([]); setView(tab === 'home' ? 'W1' : tab) }
  const openCafe = (id: string) => { setCafeId(id); setCategory('커피'); go('W2') }
  const openCheckout = () => { setPickupMode('fastest'); setSlot(null); setPay(lastPay); go('W4') }
  const reorder = () => {
    setCafeId('student')
    setCarts(c => ({ ...c, student: [{ ...recentItem, key: `re-${Date.now()}` }] }))
    setPickupMode('fastest'); setSlot(null); setPay(lastPay)
    go('W4')
    setToast('최근 주문을 다시 담았어요')
  }
  const openOrder = (no: string) => { setCurrentNo(no); setPush(null); go('W5') }
  const addToCart = (item: CartItem) => {
    setCarts(c => ({ ...c, [cafeId]: [...(c[cafeId] ?? []), item] }))
    setSheet(null)
    setToast(`${item.name} ${item.qty}잔을 담았어요`)
  }

  const nextAvailable = (from: string) => slots.find(s => s.time > from && !isFull(s.time))?.time ?? null
  const pickupLabel = pickupMode === 'fastest' ? fastest : slot
  const canPay = cart.length > 0 && (pickupMode === 'fastest' || (slot !== null && !isFull(slot))) && !paying

  const submitPay = () => {
    if (!canPay) return
    // 결제 직전 슬롯 재확인 (F4 예외)
    if (pickupMode === 'slot' && slot && simSlotFull) {
      setExtraFull(list => [...list, slot])
      setSimSlotFull(false)
      setModal('slot-full')
      return
    }
    setPaying(true)
    window.setTimeout(() => {
      setPaying(false)
      if (simPayFail) { setSimPayFail(false); setModal('pay-fail'); return }
      const no = `A-${24 + orders.length}`
      const order: Order = { no, cafeId, items: cart, total: cartTotal, pickup: pickupLabel ?? fastest, pay, step: 0, createdAt: Date.now() }
      setOrders(list => [order, ...list])
      setCarts(c => ({ ...c, [cafeId]: [] }))
      setLastPay(pay)
      setCurrentNo(no)
      setHistory([])
      setView('W5')
      setToast('Mock 결제가 완료됐어요')
    }, 1200)
  }

  const reset = () => {
    setView('W1'); setHistory([]); setCafeId('student'); setSheet(null); setCarts({}); setOrders([initialOrder]); setCurrentNo('A-24')
    setExtraFull([]); setModal(null); setPush(null); setSimPayFail(false); setSimSlotFull(false); setLastPay('카카오페이'); setPushOn(true)
    setToast('데모를 처음 상태로 되돌렸어요')
  }

  const activeTab: TabKey = view === 'orders' ? 'orders' : view === 'my' ? 'my' : 'home'

  return <main className="demo-layout">
    <section className="phone" aria-label="교내 카페 사전 주문 앱 시연">
      <div className="phone-screen">
        {push && <button type="button" className="push-banner" onClick={() => openOrder(push)}><Bell size={16} /><span><b>음료가 준비됐어요 · {push}</b><small>{cafes.find(c => c.id === orders.find(o => o.no === push)?.cafeId)?.name} 픽업대로 오세요 (Mock 알림)</small></span></button>}

        {view === 'W1' && <div className="wf-screen">
          <TopBar title="교내 카페" />
          <div className="wf-scroll">
            {ongoing ? <OngoingCard title={`${ongoing.no} · ${STEP_NAMES[ongoing.step]}`} sub={`${ongoing.pickup} ${cafes.find(c => c.id === ongoing.cafeId)?.name}에서 픽업`} onClick={() => openOrder(ongoing.no)} /> : null}
            <div className="wf-section-title"><h3>어디서 받을까요?</h3><p>지금 덜 붐비는 카페부터 보여드려요</p></div>
            <div className="wf-cafe-list">{[...cafes].sort((a, b) => Number(b.open) - Number(a.open) || a.waiting - b.waiting).map(c => <CafeCard key={c.id} name={c.name} open={c.open} meta={c.open ? `대기 ${c.waiting}건 · 지금 주문하면 약 ${c.eta}분 후 픽업` : c.closedNote ?? ''} onClick={() => openCafe(c.id)} />)}</div>
            <div className="wf-section-title"><h3>최근 주문</h3></div>
            <div className="wf-recent"><span><strong>{itemLabel(recentItem)}</strong><small>학생회관 카페 · {won(recentItem.unitPrice)}</small></span><Chip onClick={reorder}>다시 담기</Chip></div>
          </div>
          <TabBar active={activeTab} onChange={goTab} />
        </div>}

        {view === 'W2' && <div className="wf-screen">
          <TopBar title={cafe.name} onBack={back} />
          <div className="wf-pickup-bar"><Clock size={13} /> 지금 주문하면 약 {cafe.eta}분 후 픽업 · 대기 {cafe.waiting}건</div>
          <div className="wf-scroll">
            <div className="wf-chips" role="tablist">{categories.map(c => <Chip key={c} selected={category === c} onClick={() => setCategory(c)}>{c}</Chip>)}</div>
            <div className="wf-menu-list">
              {menus.filter(m => m.category === category).map(m => <MenuRow key={m.id} name={m.name} price={won(m.price)} soldOut={m.soldOut} onClick={() => setSheet(m.id)} />)}
              {!menus.some(m => m.category === category) && <p className="demo-empty">이 카테고리의 메뉴는 원문에 없어 비워 두었어요. (빈 상태 · 원문 미기재)</p>}
            </div>
          </div>
          {cartQty > 0 && <div className="wf-bottom-bar"><Button onClick={openCheckout}>{cartQty}잔 담김 · {won(cartTotal)} 주문서 보기</Button></div>}
          {sheet && <OptionSheet menuId={sheet} onClose={() => setSheet(null)} onAdd={addToCart} />}
        </div>}

        {view === 'W4' && <div className="wf-screen">
          <TopBar title="주문서" onBack={back} />
          <div className="wf-scroll">
            <div className="wf-order-summary"><small>{cafe.name} · {cafe.floor}</small>{cart.map(item => <p key={item.key}><span>{itemLabel(item)} × {item.qty}</span><b>{won(item.unitPrice * item.qty)}</b></p>)}</div>
            <div className="wf-section-title"><h3>픽업 시간 <em>필수</em></h3></div>
            <RadioCard title="가능한 가장 빠른 시간" sub={`약 ${cafe.eta}분 후 · ${fastest} 예상`} selected={pickupMode === 'fastest'} onClick={() => setPickupMode('fastest')} />
            <RadioCard title="시간 지정" sub="수업 끝나는 시간에 맞춰 받아요" selected={pickupMode === 'slot'} onClick={() => setPickupMode('slot')} />
            {pickupMode === 'slot' && <>
              <div className="wf-slots">{slots.map(s => <Chip key={s.time} disabled={isFull(s.time)} className={isFull(s.time) ? 'full' : ''} selected={slot === s.time} onClick={() => setSlot(s.time)}>{s.time}</Chip>)}</div>
              <p className="wf-hint">취소선 시간은 주문이 가득 찼어요. 선택한 시간까지 준비해둘게요.</p>
            </>}
            <div className="wf-section-title"><h3>결제수단</h3></div>
            <div className="wf-chip-pair">{(['카카오페이', '신용·체크카드'] as PayMethod[]).map(p => <Chip key={p} selected={pay === p} onClick={() => setPay(p)}>{p}</Chip>)}</div>
          </div>
          <div className="wf-bottom-bar">
            {pickupMode === 'slot' && !slot && <p className="demo-warn">픽업 시간을 선택해 주세요</p>}
            <Button onClick={submitPay} disabled={!canPay}>{paying ? 'Mock 결제 진행 중…' : `${won(cartTotal)} 결제하기 · ${pickupLabel ?? '--:--'} 픽업`}</Button>
          </div>
          {modal === 'slot-full' && <Dialog title={`${slot} 픽업이 방금 마감됐어요`} body={nextAvailable(slot ?? NOW) ? `다음 가능한 시간은 ${nextAvailable(slot ?? NOW)}이에요.` : '선택 가능한 시간이 없어요. 가장 빠른 시간으로 받아 주세요.'}
            primary={nextAvailable(slot ?? NOW) ? `${nextAvailable(slot ?? NOW)}로 바꾸기` : '가장 빠른 시간으로'} secondary="다른 시간 고르기"
            onPrimary={() => { const n = nextAvailable(slot ?? NOW); if (n) setSlot(n); else setPickupMode('fastest'); setModal(null) }} onSecondary={() => { setSlot(null); setModal(null) }} />}
          {modal === 'pay-fail' && <Dialog title="결제에 실패했어요" body="담은 메뉴와 픽업 시간은 그대로 있어요. 다시 시도하거나 다른 결제수단을 골라 주세요." primary="다시 시도" secondary="다른 결제수단"
            onPrimary={() => { setModal(null); submitPay() }} onSecondary={() => { setPay(pay === '카카오페이' ? '신용·체크카드' : '카카오페이'); setModal(null) }} />}
        </div>}

        {view === 'W5' && currentOrder && <OrderStatus order={currentOrder} onHome={() => goTab('home')} />}

        {view === 'orders' && <div className="wf-screen">
          <TopBar title="주문 내역" />
          <div className="wf-scroll">
            <p className="demo-scope">IA 「주문 내역 · 탭」 — 주문 상세는 W5를 재사용해요. 이 목록 화면은 와이어프레임이 없어 최소 구성으로 표시합니다.</p>
            {orders.map(o => <button type="button" key={o.no} className="demo-order-row" onClick={() => openOrder(o.no)}><span><strong>{o.no} · {STEP_NAMES[o.step]}</strong><small>{cafes.find(c => c.id === o.cafeId)?.name} · {o.items.map(i => `${itemLabel(i)} × ${i.qty}`).join(', ')}</small></span><b>{won(o.total)}</b></button>)}
          </div>
          <TabBar active={activeTab} onChange={goTab} />
        </div>}

        {view === 'my' && <div className="wf-screen">
          <TopBar title="마이" />
          <div className="wf-scroll">
            <p className="demo-scope">IA 「마이 · 탭」 — MVP는 알림 설정 · 결제수단만. 와이어프레임이 없어 최소 구성으로 표시합니다.</p>
            <label className="demo-setting"><span><strong>준비 완료 알림</strong><small>음료가 준비되면 푸시로 알려드려요 (Mock)</small></span><input type="checkbox" checked={pushOn} onChange={e => setPushOn(e.target.checked)} /></label>
            <div className="demo-setting"><span><strong>결제수단 관리</strong><small>마지막 사용: {lastPay}</small></span></div>
          </div>
          <TabBar active={activeTab} onChange={goTab} />
        </div>}

        {toast && <div className="demo-toast" role="status">{toast}</div>}
      </div>
    </section>

    <aside className="demo-panel">
      <div className="demo-panel-card">
        <p className="eyebrow">LIVE DEMO · Mock Data</p>
        <h2>지금 화면: {urlScreen.startsWith('W') ? `${urlScreen} ` : ''}{SCREEN_NAMES[urlScreen]}</h2>
        <ul className="demo-notes">
          <li>실제 서버 · 간편결제(PG) · 푸시 알림과 연결하지 않은 정적 데모예요. 결제는 실제로 처리되지 않아요.</li>
          <li>로그인(F0)은 와이어프레임이 없어 로그인된 상태로 시작해요.</li>
          <li>새로고침하면 같은 화면이 처음 Mock 상태로 다시 열려요. 저장 유지 정책은 원문 미기재(확인 필요)예요.</li>
        </ul>
      </div>
      <div className="demo-panel-card">
        <h3>예외 상황 재현</h3>
        <label className="demo-switch"><input type="checkbox" checked={simSlotFull} onChange={e => setSimSlotFull(e.target.checked)} /><span><b>다음 결제 직전에 슬롯 마감</b><small>F4 · W4에서 「시간 지정」 슬롯을 고르고 결제하면 마감 안내가 떠요 (1회)</small></span></label>
        <label className="demo-switch"><input type="checkbox" checked={simPayFail} onChange={e => setSimPayFail(e.target.checked)} /><span><b>다음 결제 실패</b><small>F5 · 주문 정보가 유지된 채 실패 안내가 떠요 (1회)</small></span></label>
      </div>
      <div className="demo-panel-card">
        <h3>주문 상태 진행 <small>F6 · 직원 처리(OP)를 대신함</small></h3>
        <label className="demo-switch"><input type="checkbox" checked={autoProgress} onChange={e => setAutoProgress(e.target.checked)} /><span><b>자동으로 진행</b><small>결제한 주문이 접수 → 제조 중 → 픽업 대기로 바뀌어요</small></span></label>
        <button type="button" className="demo-panel-button" disabled={!currentOrder || currentOrder.step >= 2} onClick={() => currentOrder && advance(currentOrder.no)}>{currentOrder ? `${currentOrder.no} 다음 단계로 (${STEP_NAMES[Math.min(2, currentOrder.step + 1)]})` : '주문 없음'}</button>
      </div>
      <div className="demo-panel-card">
        <h3>시연 화면 바로 열기</h3>
        <div className="demo-jump">{['W1', 'W2', 'W3', 'W4', 'W5'].map(id => <a key={id} href={`#/demo?screen=${id}`} onClick={e => { e.preventDefault(); const next = initialFor(id); setView(next.view); setSheet(next.sheet); setHistory(next.history); setCafeId('student'); if (id === 'W4') setCarts(c => ({ ...c, student: c.student?.length ? c.student : [{ ...recentItem, key: `jump-${Date.now()}` }] })); if (id === 'W5') setCurrentNo(orders[0].no) }}>{id} {SCREEN_NAMES[id]}</a>)}</div>
        <button type="button" className="demo-panel-button ghost" onClick={reset}><RotateCcw size={14} /> 데모 처음 상태로</button>
      </div>
    </aside>
  </main>
}

function OptionSheet({ menuId, onClose, onAdd }: { menuId: string; onClose: () => void; onAdd: (item: CartItem) => void }) {
  const menu = menus.find(m => m.id === menuId)!
  const [temp, setTemp] = useState<Temp>('ICE')
  const [size, setSize] = useState<Size>('R')
  const [shots, setShots] = useState(0)
  const [qty, setQty] = useState(1)
  const price = unitPrice(menu.price, size, shots)
  return <>
    <button type="button" className="sheet-backdrop" aria-label="옵션 닫기" onClick={onClose} />
    <div className="wf-sheet" role="dialog" aria-label={`${menu.name} 옵션 선택`}>
      <span className="wf-sheet-handle" />
      <button type="button" className="sheet-close" aria-label="닫기" onClick={onClose}><X size={16} /></button>
      <div className="wf-sheet-head"><ImagePlaceholder size={52} /><span><strong>{menu.name}</strong><small>{won(menu.price)}</small></span></div>
      <div className="wf-option"><b>온도</b><div className="wf-chip-pair">{(['HOT', 'ICE'] as Temp[]).map(t => <Chip key={t} selected={temp === t} onClick={() => setTemp(t)}>{t}</Chip>)}</div></div>
      <div className="wf-option"><b>사이즈</b><div className="wf-chip-pair"><Chip selected={size === 'R'} onClick={() => setSize('R')}>R</Chip><Chip selected={size === 'L'} onClick={() => setSize('L')}>L +500원</Chip></div></div>
      <div className="wf-option-line"><span><b>샷 추가</b><small>1샷당 +500원</small></span><Stepper label="샷" value={shots} onMinus={() => setShots(shots - 1)} onPlus={() => setShots(shots + 1)} minusDisabled={shots <= 0} plusDisabled={shots >= MAX_SHOTS} /></div>
      <div className="wf-option-line"><span><b>수량</b></span><Stepper label="수량" value={qty} onMinus={() => setQty(qty - 1)} onPlus={() => setQty(qty + 1)} minusDisabled={qty <= 1} plusDisabled={qty >= MAX_QTY} /></div>
      <Button onClick={() => onAdd({ key: `${menu.id}-${Date.now()}`, menuId: menu.id, name: menu.name, temp, size, shots, qty, unitPrice: price })}>{won(price * qty)} 담기</Button>
    </div>
  </>
}

function OrderStatus({ order, onHome }: { order: Order; onHome: () => void }) {
  const cafe = cafes.find(c => c.id === order.cafeId)!
  return <div className="wf-screen">
    <TopBar title="주문 상태" />
    <div className="wf-scroll">
      <div className="wf-order-no"><small>주문번호</small><strong>{order.no}</strong><span>{order.pickup} 픽업 예정</span></div>
      <Progress step={order.step} />
      <div className={`wf-notice ${order.step === 2 ? 'ready' : ''}`}><Bell size={15} /><span>{order.step === 2 ? <>음료가 준비됐어요!<br />{cafe.pickupPlace}에서 주문번호를 보여주세요.</> : <>음료가 준비되면 알림을 보내드려요.<br />카페 앞에서 기다리지 않아도 돼요.</>}</span></div>
      <dl className="wf-info">
        <div><dt>픽업 장소</dt><dd>{cafe.name} · {cafe.pickupPlace}</dd></div>
        <div><dt>주문 메뉴</dt><dd>{order.items.map(i => `${itemLabel(i)} × ${i.qty}`).join(', ')}</dd></div>
        <div><dt>결제</dt><dd>{won(order.total)} · {order.pay}</dd></div>
      </dl>
    </div>
    <div className="wf-bottom-bar plain"><Button variant="secondary" onClick={onHome}>홈으로</Button></div>
  </div>
}

function Dialog({ title, body, primary, secondary, onPrimary, onSecondary }: { title: string; body: string; primary: string; secondary: string; onPrimary: () => void; onSecondary: () => void }) {
  return <div className="demo-dialog-backdrop">
    <div className="demo-dialog" role="alertdialog" aria-label={title}>
      <AlertCircle size={22} />
      <strong>{title}</strong>
      <p>{body}</p>
      <div className="demo-dialog-actions"><Button variant="secondary" onClick={onSecondary}>{secondary}</Button><Button onClick={onPrimary}>{primary}</Button></div>
    </div>
  </div>
}
