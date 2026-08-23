import React from 'react';
import {
  SiCodechef,
  SiGeeksforgeeks,
  SiGithub,
  SiHackerrank,
  SiLeetcode,
} from 'react-icons/si';
import { FaLinkedin } from 'react-icons/fa';
import { FiGlobe } from 'react-icons/fi';

const MARKS = {
  leetcode: { Icon: SiLeetcode, color: '#FFA116', label: 'LeetCode' },
  github: { Icon: SiGithub, color: 'var(--ink)', label: 'GitHub' },
  geeksforgeeks: { Icon: SiGeeksforgeeks, color: '#2F8D46', label: 'GeeksforGeeks' },
  gfg: { Icon: SiGeeksforgeeks, color: '#2F8D46', label: 'GeeksforGeeks' },
  linkedin: { Icon: FaLinkedin, color: '#0A66C2', label: 'LinkedIn' },
  hackerrank: { Icon: SiHackerrank, color: '#00EA64', label: 'HackerRank' },
  codechef: { Icon: SiCodechef, color: 'var(--ink)', label: 'CodeChef' },
  portfolio: { Icon: FiGlobe, color: 'var(--gold)', label: 'Portfolio' },
};

export function brandKeyFromName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');
}

export default function BrandMark({ name, size = 18 }) {
  const key = brandKeyFromName(name);
  const mark = MARKS[key];
  if (!mark) {
    return <FiGlobe size={size} color="var(--gold)" aria-hidden />;
  }
  const { Icon, color } = mark;
  return <Icon size={size} color={color} title={mark.label} aria-hidden />;
}
