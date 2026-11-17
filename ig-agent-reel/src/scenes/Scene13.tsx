import React from 'react';
import { C } from '../timeline';
import { Stage } from '../components/Ui';

// 쉬어가기: 빈 딥그린 화면 (자막 "그래서"만)
export const Scene13 = (_: { t: number }) => <Stage bg={C.green}>{null}</Stage>;
