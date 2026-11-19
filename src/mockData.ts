// 데모용 Mock 데이터 — 실제 서버 · PG · 푸시 연동 없음
// 커피 메뉴 · 카페 · 슬롯 · 주문 값은 Figma 와이어프레임 표시값을 그대로 사용했습니다.
// 논커피 · 티 메뉴는 원문에 없는 데모용 Mock 값입니다.

export type Cafe = { id: string; name: string; floor: string; pickupPlace: string; waiting: number; eta: number; open: boolean; closedNote?: string }
export type Category = '커피' | '논커피' | '티' | '베이커리'
export type Menu = { id: string; name: string; price: number; category: Category; soldOut?: boolean }
export type Temp = 'HOT' | 'ICE'
export type Size = 'R' | 'L'
export type CartItem = { key: string; menuId: string; name: string; temp: Temp; size: Size; shots: number; qty: number; unitPrice: number }
export type OrderStep = 0 | 1 | 2 // 접수 · 제조 중 · 픽업 대기
export type PayMethod = '카카오페이' | '신용·체크카드'
export type Order = { no: string; cafeId: string; items: CartItem[]; total: number; pickup: string; pay: PayMethod; step: OrderStep; createdAt: number }

export const NOW = '10:37' // 데모 기준 시각 (와이어프레임 「약 5분 후 · 10:42 예상」 기준)

export const cafes: Cafe[] = [
  { id: 'student', name: '학생회관 카페', floor: '1층', pickupPlace: '1층 정문 옆 픽업대', waiting: 3, eta: 5, open: true },
  { id: 'library', name: '중앙도서관 카페', floor: '1층', pickupPlace: '1층 픽업대 (Mock)', waiting: 14, eta: 20, open: true },
  { id: 'business', name: '경영관 카페', floor: '', pickupPlace: '', waiting: 0, eta: 0, open: false, closedNote: '오늘 운영 종료 · 내일 08:30 오픈' },
]

export const categories: Category[] = ['커피', '논커피', '티', '베이커리']

export const menus: Menu[] = [
  { id: 'americano', name: '아메리카노', price: 2500, category: '커피' },
  { id: 'latte', name: '카페라떼', price: 3200, category: '커피' },
  { id: 'vanilla', name: '바닐라라떼', price: 3700, category: '커피' },
  { id: 'coldbrew', name: '콜드브루', price: 3500, category: '커피' },
  { id: 'mocha', name: '카페모카', price: 3800, category: '커피', soldOut: true },
  { id: 'einspanner', name: '아인슈페너', price: 4000, category: '커피' },
  { id: 'choco', name: '초코라떼', price: 3500, category: '논커피' },
  { id: 'strawberry', name: '딸기라떼', price: 3900, category: '논커피' },
  { id: 'earlgrey', name: '얼그레이', price: 3000, category: '티' },
  { id: 'chamomile', name: '캐모마일', price: 3000, category: '티', soldOut: true },
]

export const slots = [
  { time: '10:45', full: true },
  { time: '10:50', full: false },
  { time: '10:55', full: false },
  { time: '11:00', full: true },
  { time: '11:05', full: false },
  { time: '11:10', full: false },
]

export const SIZE_L_EXTRA = 500
export const SHOT_EXTRA = 500
export const MAX_SHOTS = 3 // 데모 임시 한도 · 원문 미기재
export const MAX_QTY = 10 // 데모 임시 한도 · 원문 미기재

export const addMinutes = (hhmm: string, minutes: number) => {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + minutes
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}
export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`
export const unitPrice = (base: number, size: Size, shots: number) => base + (size === 'L' ? SIZE_L_EXTRA : 0) + shots * SHOT_EXTRA
export const itemLabel = (item: CartItem) => `${item.temp === 'ICE' ? '아이스' : '따뜻한'} ${item.name} ${item.size}${item.shots ? ` · 샷 +${item.shots}` : ''}`

export const recentItem: CartItem = { key: 'recent', menuId: 'americano', name: '아메리카노', temp: 'ICE', size: 'L', shots: 0, qty: 1, unitPrice: 3000 }

export const initialOrder: Order = { no: 'A-24', cafeId: 'student', items: [recentItem], total: 3000, pickup: '10:50', pay: '카카오페이', step: 1, createdAt: 0 }
