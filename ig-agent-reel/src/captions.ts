// 한글 자막. 이 파일만 고치면 자막이 바뀝니다.
// start/end는 영상 전체 기준 초. voice/sync.py 가 실제 음성에 맞춰 시간을 다시 씁니다(문구만 고치고 sync.py 를 돌리세요).
export interface Caption { start: number; end: number; text: string }

export const CAPTIONS: Caption[] = [
  // [1]
  { start: 0.120, end: 0.788, text: 'Claude가' },
  { start: 0.788, end: 1.366, text: '인스타그램을' },
  { start: 1.366, end: 4.120, text: '끝내버렸어요' },
  // [2]
  { start: 4.120, end: 4.740, text: '인스타 계정을' },
  { start: 4.740, end: 6.120, text: '대신 운영해줘요' },
  // [3]
  { start: 6.120, end: 6.520, text: '이름은' },
  { start: 6.520, end: 8.120, text: '인스타그램 에이전트' },
  // [4]
  { start: 8.120, end: 8.780, text: '완전 무료고,' },
  { start: 8.780, end: 9.220, text: '스킬마다' },
  { start: 9.220, end: 9.740, text: '일 하나씩' },
  { start: 9.740, end: 14.120, text: '맡아요' },
  // [5]
  { start: 14.120, end: 14.860, text: '검증된 후킹' },
  { start: 14.860, end: 15.360, text: '공식으로' },
  { start: 15.360, end: 16.225, text: '글을 쓰고' },
  // [6]
  { start: 16.225, end: 16.785, text: '다른 계정에' },
  { start: 16.785, end: 18.120, text: '댓글도 달고' },
  // [7]
  { start: 18.120, end: 18.520, text: '프로필도' },
  { start: 18.520, end: 20.120, text: '다듬어줘요' },
  // [8]
  { start: 20.120, end: 20.520, text: '한 주' },
  { start: 20.520, end: 20.920, text: '계획까지' },
  { start: 20.920, end: 24.120, text: '세워줘요' },
  // [9]
  { start: 24.120, end: 24.560, text: '무엇을,' },
  { start: 24.560, end: 24.960, text: '언제,' },
  { start: 24.960, end: 25.360, text: '누구에게' },
  { start: 25.360, end: 28.120, text: '올릴지' },
  // [10]
  { start: 28.120, end: 28.520, text: '가장' },
  { start: 28.520, end: 28.920, text: '미친 건' },
  { start: 28.920, end: 30.120, text: '바이럴 기능이에요' },
  // [11]
  { start: 30.120, end: 30.520, text: '잘 된' },
  { start: 30.520, end: 32.120, text: '영상들을 찾아서' },
  // [12]
  { start: 32.120, end: 32.540, text: '후킹과' },
  { start: 32.540, end: 33.240, text: '성공 이유를' },
  { start: 33.240, end: 36.120, text: '분석해줘요' },
  // [13]
  { start: 36.120, end: 38.120, text: '그래서' },
  // [14]
  { start: 38.120, end: 38.520, text: '이번 주' },
  { start: 38.520, end: 38.920, text: '아이디어도' },
  { start: 38.920, end: 40.120, text: '받을 수 있어요' },
  // [15]
  { start: 40.120, end: 40.680, text: '내 말투와' },
  { start: 40.680, end: 41.080, text: '타깃만' },
  { start: 41.080, end: 44.120, text: '넣어두면' },
  // [16]
  { start: 44.120, end: 44.966, text: 'Claude가 알아서' },
  { start: 44.966, end: 46.120, text: '다 해요' },
  // [17]
  { start: 46.120, end: 46.720, text: '팔로우하고' },
  { start: 46.720, end: 47.540, text: "'노트' 댓글" },
  { start: 47.540, end: 47.940, text: '남기면' },
  { start: 47.940, end: 50.000, text: '세팅법 보내드려요' },
];
