// 문서용 정적 와이어프레임 — Figma 「04 Wireframe」 W1~W5 프레임(360×760)을 화면에 그려진 상태 그대로 재현
// data-note 속성 = Figma 원본의 연두색 번호(note 1~4). 문서 뷰어가 이 DOM 위치를 측정해 번호 박스를 표시합니다.
import { Bell, Clock } from 'lucide-react'
import type { ScreenId } from './spec'
import { Button, CafeCard, Chip, ImagePlaceholder, MenuRow, OngoingCard, Progress, RadioCard, Stepper, TabBar, TopBar } from './ui'


const coffee: [string, string, boolean?][] = [['아메리카노', '2,500원'], ['카페라떼', '3,200원'], ['바닐라라떼', '3,700원'], ['콜드브루', '3,500원'], ['카페모카', '3,800원', true], ['아인슈페너', '4,000원']]

function MenuListBody({ notes = true }: { notes?: boolean }) {
  return <>
    <TopBar title="학생회관 카페" back />
    <div className="wf-pickup-bar" data-note={notes ? 1 : undefined}><Clock size={13} /> 지금 주문하면 약 5분 후 픽업 · 대기 3건</div>
    <div className="wf-scroll">
      <div className="wf-chips" data-note={notes ? 2 : undefined}>{['커피', '논커피', '티', '베이커리'].map((c, i) => <Chip key={c} selected={i === 0}>{c}</Chip>)}</div>
      <div className="wf-menu-list">{coffee.map(([name, price, soldOut]) => <MenuRow key={name} name={name} price={price} soldOut={soldOut} note={notes && soldOut ? 3 : undefined} />)}</div>
    </div>
    <div className="wf-bottom-bar" data-note={notes ? 4 : undefined}><Button>1잔 담김 · 3,000원 주문서 보기</Button></div>
  </>
}

function W1() {
  return <div className="wf-screen">
    <TopBar title="교내 카페" />
    <div className="wf-scroll">
      <OngoingCard title="A-24 · 제조 중" sub="10:50 학생회관 카페에서 픽업" note={1} />
      <div className="wf-section-title"><h3>어디서 받을까요?</h3><p>지금 덜 붐비는 카페부터 보여드려요</p></div>
      <div className="wf-cafe-list" data-note={2}>
        <CafeCard name="학생회관 카페" meta="대기 3건 · 지금 주문하면 약 5분 후 픽업" open />
        <CafeCard name="중앙도서관 카페" meta="대기 14건 · 지금 주문하면 약 20분 후 픽업" open />
      </div>
      <div className="wf-cafe-list"><CafeCard name="경영관 카페" meta="오늘 운영 종료 · 내일 08:30 오픈" open={false} note={3} /></div>
      <div className="wf-section-title"><h3>최근 주문</h3></div>
      <div className="wf-recent" data-note={4}><span><strong>아이스 아메리카노 L</strong><small>학생회관 카페 · 3,000원</small></span><Chip>다시 담기</Chip></div>
    </div>
    <TabBar active="home" />
  </div>
}

function W2() {
  return <div className="wf-screen"><MenuListBody /></div>
}

function W3() {
  return <div className="wf-screen">
    <div className="wf-dimmed"><MenuListBody notes={false} /></div>
    <div className="wf-sheet" data-note={1}>
      <span className="wf-sheet-handle" />
      <div className="wf-sheet-head"><ImagePlaceholder size={52} /><span><strong>아메리카노</strong><small>2,500원</small></span></div>
      <div data-note={2} className="wf-option-group">
        <div className="wf-option"><b>온도</b><div className="wf-chip-pair"><Chip>HOT</Chip><Chip selected>ICE</Chip></div></div>
        <div className="wf-option"><b>사이즈</b><div className="wf-chip-pair"><Chip>R</Chip><Chip selected>L +500원</Chip></div></div>
      </div>
      <div className="wf-option-line"><span><b>샷 추가</b><small>1샷당 +500원</small></span><Stepper value={0} label="샷" /></div>
      <div className="wf-option-line"><span><b>수량</b></span><Stepper value={1} label="수량" /></div>
      <Button note={3}>3,000원 담기</Button>
    </div>
  </div>
}

function W4() {
  return <div className="wf-screen">
    <TopBar title="주문서" back />
    <div className="wf-scroll">
      <div className="wf-order-summary"><small>학생회관 카페 · 1층</small><p><span>아이스 아메리카노 L × 1</span><b>3,000원</b></p></div>
      <div className="wf-section-title"><h3>픽업 시간 <em>필수</em></h3></div>
      <RadioCard title="가능한 가장 빠른 시간" sub="약 5분 후 · 10:42 예상" note={1} />
      <div data-note={2} className="wf-slot-group">
        <RadioCard title="시간 지정" sub="수업 끝나는 시간에 맞춰 받아요" selected />
        <div className="wf-slots">{[['10:45', true], ['10:50'], ['10:55'], ['11:00', true], ['11:05'], ['11:10']].map(([t, full]) => <Chip key={t as string} disabled={Boolean(full)} selected={t === '10:50'} className={full ? 'full' : ''}>{t}</Chip>)}</div>
      </div>
      <p className="wf-hint">취소선 시간은 주문이 가득 찼어요. 선택한 시간까지 준비해둘게요.</p>
      <div className="wf-section-title"><h3>결제수단</h3></div>
      <div className="wf-chip-pair" data-note={3}><Chip selected>카카오페이</Chip><Chip>신용·체크카드</Chip></div>
    </div>
    <div className="wf-bottom-bar"><Button note={4}>3,000원 결제하기 · 10:50 픽업</Button></div>
  </div>
}

function W5() {
  return <div className="wf-screen">
    <TopBar title="주문 상태" />
    <div className="wf-scroll">
      <div className="wf-order-no" data-note={1}><small>주문번호</small><strong>A-24</strong><span>10:50 픽업 예정</span></div>
      <Progress step={1} note={2} />
      <div className="wf-notice" data-note={3}><Bell size={15} /><span>음료가 준비되면 알림을 보내드려요.<br />카페 앞에서 기다리지 않아도 돼요.</span></div>
      <dl className="wf-info" data-note={4}>
        <div><dt>픽업 장소</dt><dd>학생회관 카페 · 1층 정문 옆 픽업대</dd></div>
        <div><dt>주문 메뉴</dt><dd>아이스 아메리카노 L × 1</dd></div>
        <div><dt>결제</dt><dd>3,000원 · 카카오페이</dd></div>
      </dl>
    </div>
    <div className="wf-bottom-bar plain"><Button variant="secondary">홈으로</Button></div>
  </div>
}

const FRAMES: Record<ScreenId, () => React.JSX.Element> = { W1, W2, W3, W4, W5 }

export default function Wireframe({ id }: { id: ScreenId }) {
  const Frame = FRAMES[id]
  return <div className="wf-frame" aria-hidden="false" inert><Frame /></div>
}
