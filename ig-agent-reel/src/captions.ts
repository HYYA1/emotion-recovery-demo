// 한글 자막. 이 파일만 고치면 자막이 바뀝니다.
// start/end는 영상 전체 기준 초. 문장을 1~2어절씩 끊어 장면 시간 안에 균등하게 나눴습니다.
export interface Caption { start: number; end: number; text: string }

export const CAPTIONS: Caption[] = [
  // [1] 0–4초
  { start: 0.0, end: 1.333, text: 'Claude가' },
  { start: 1.333, end: 2.667, text: '인스타그램을' },
  { start: 2.667, end: 4.0, text: '끝내버렸어요' },
  // [2] 4–6초
  { start: 4.0, end: 5.0, text: '인스타 계정을' },
  { start: 5.0, end: 6.0, text: '대신 운영해줘요' },
  // [3] 6–8초
  { start: 6.0, end: 7.0, text: '이름은' },
  { start: 7.0, end: 8.0, text: '인스타그램 에이전트' },
  // [4] 8–14초
  { start: 8.0, end: 9.5, text: '완전 무료고,' },
  { start: 9.5, end: 11.0, text: '스킬마다' },
  { start: 11.0, end: 12.5, text: '일 하나씩' },
  { start: 12.5, end: 14.0, text: '맡아요' },
  // [5] 14–16초
  { start: 14.0, end: 14.667, text: '검증된 후킹' },
  { start: 14.667, end: 15.333, text: '공식으로' },
  { start: 15.333, end: 16.0, text: '글을 쓰고' },
  // [6] 16–18초
  { start: 16.0, end: 17.0, text: '다른 계정에' },
  { start: 17.0, end: 18.0, text: '댓글도 달고' },
  // [7] 18–20초
  { start: 18.0, end: 19.0, text: '프로필도' },
  { start: 19.0, end: 20.0, text: '다듬어줘요' },
  // [8] 20–24초
  { start: 20.0, end: 21.333, text: '한 주' },
  { start: 21.333, end: 22.667, text: '계획까지' },
  { start: 22.667, end: 24.0, text: '세워줘요' },
  // [9] 24–28초
  { start: 24.0, end: 25.0, text: '무엇을,' },
  { start: 25.0, end: 26.0, text: '언제,' },
  { start: 26.0, end: 27.0, text: '누구에게' },
  { start: 27.0, end: 28.0, text: '올릴지' },
  // [10] 28–30초
  { start: 28.0, end: 28.667, text: '가장' },
  { start: 28.667, end: 29.333, text: '미친 건' },
  { start: 29.333, end: 30.0, text: '바이럴 기능이에요' },
  // [11] 30–32초
  { start: 30.0, end: 31.0, text: '잘 된' },
  { start: 31.0, end: 32.0, text: '영상들을 찾아서' },
  // [12] 32–36초
  { start: 32.0, end: 33.333, text: '후킹과' },
  { start: 33.333, end: 34.667, text: '성공 이유를' },
  { start: 34.667, end: 36.0, text: '분석해줘요' },
  // [13] 36–38초
  { start: 36.0, end: 38.0, text: '그래서' },
  // [14] 38–40초
  { start: 38.0, end: 38.667, text: '이번 주' },
  { start: 38.667, end: 39.333, text: '아이디어도' },
  { start: 39.333, end: 40.0, text: '받을 수 있어요' },
  // [15] 40–44초
  { start: 40.0, end: 41.333, text: '내 말투와' },
  { start: 41.333, end: 42.667, text: '타깃만' },
  { start: 42.667, end: 44.0, text: '넣어두면' },
  // [16] 44–46초
  { start: 44.0, end: 45.0, text: 'Claude가 알아서' },
  { start: 45.0, end: 46.0, text: '다 해요' },
  // [17] 46–50초
  { start: 46.0, end: 47.0, text: '팔로우하고' },
  { start: 47.0, end: 48.0, text: "'노트' 댓글" },
  { start: 48.0, end: 49.0, text: '남기면' },
  { start: 49.0, end: 50.0, text: '세팅법 보내드려요' },
];
