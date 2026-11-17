import React from 'react';
import { C, SCENES } from '../timeline';
import { Avatar, Spark, Stage } from '../components/Ui';
import { easeOut, pop, seg } from '../anim';

const q = SCENES[1].cue;

export const Scene02 = ({ t }: { t: number }) => {
  const on = easeOut(seg(t, q.toggle, q.toggle + 0.22));
  return (
    <Stage bg={C.green}>
      <div style={{ ...pop(t, q.card), position: 'absolute', left: 110, top: 150, width: 860, borderRadius: 32, background: '#17392F', border: '2px solid #24493E', boxShadow: '0 20px 50px rgba(0,0,0,.35)', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32, padding: '44px 48px' }}>
          <Avatar size={140} emoji="☕" from="#FFC38A" to="#FF7A1A" />
          <div>
            <div style={{ fontSize: 54, fontWeight: 700 }}>morningbean.cafe</div>
            <div style={{ fontSize: 32, color: '#93ADA4', marginTop: 10 }}>게시물 · 댓글 · 계획</div>
          </div>
        </div>
        <div style={{ height: 2, background: '#24493E' }} />
        <div style={{ ...pop(t, q.run), display: 'flex', alignItems: 'center', padding: '36px 48px', gap: 18 }}>
          <Spark size={44} />
          <div style={{ fontSize: 42, fontWeight: 600 }}>Run by Claude</div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 132, height: 74, borderRadius: 37, background: on > 0.5 ? C.orange : '#3B5A51', position: 'relative', transition: 'none', boxShadow: on > 0.5 ? '0 0 24px rgba(255,122,26,.5)' : undefined }}>
            <div style={{ position: 'absolute', top: 7, left: 7 + 58 * on, width: 60, height: 60, borderRadius: 30, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,.3)' }} />
          </div>
        </div>
      </div>
    </Stage>
  );
};
