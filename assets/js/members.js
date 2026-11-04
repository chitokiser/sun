/**
 * 가맹점 웹 경유 회원가입 — 개발가이드 §21.1
 *  - 이 사이트로 처음 로그인한 회원은 가맹점주를 멘토로 자동 지정
 *    (users/{uid}.registeredMerchantId / mentorUid / mentorEmail)
 *  - 최초 멘토 불변: 이미 값이 있으면 절대 덮어쓰지 않음
 */
import { db, fb } from './firebase.js';
import { MERCHANT, isMerchantConfigured } from './config.js';

export async function ensureMemberRegistration(user) {
  if (!user) return { status: 'no_user' };
  const userRef = fb.doc(db, 'users', user.uid);

  let existing = {};
  try {
    const snap = await fb.getDoc(userRef);
    existing = snap.exists() ? snap.data() : {};
  } catch (e) {
    console.warn('[members] users 문서 조회 실패', e);
    return { status: 'read_failed' };
  }

  const base = {
    uid: user.uid,
    email: user.email || '',
    name: existing.name || user.displayName || (user.email || '').split('@')[0],
    lastLoginAt: fb.serverTimestamp(),
  };
  if (!existing.createdAt) base.createdAt = fb.serverTimestamp();

  const alreadyAssigned = Boolean(existing.mentorUid || existing.mentorEmail || existing.registeredMerchantId);
  const mentorFields = {};

  if (isMerchantConfigured() && !alreadyAssigned) {
    const merchantId = String(MERCHANT.merchantId);
    let ownerUid = '';
    let ownerEmail = MERCHANT.ownerEmail || '';
    try {
      const m = await fb.getDoc(fb.doc(db, 'merchants', merchantId));
      if (m.exists()) {
        ownerUid = m.data().ownerUid || '';
        ownerEmail = m.data().ownerEmail || ownerEmail;
      }
    } catch (e) {
      console.warn('[members] merchants 문서 조회 실패 — config.ownerEmail 로 대체', e);
    }
    // 가맹점주 본인은 자기 멘티가 되지 않음
    const isOwner = (ownerUid && ownerUid === user.uid) ||
      (ownerEmail && ownerEmail.toLowerCase() === (user.email || '').toLowerCase());
    if (!isOwner) {
      mentorFields.registeredMerchantId = merchantId;
      if (ownerUid) mentorFields.mentorUid = ownerUid;
      if (ownerEmail) mentorFields.mentorEmail = ownerEmail.toLowerCase();
    }
  }

  try {
    await fb.setDoc(userRef, { ...base, ...mentorFields }, { merge: true });
    return { status: Object.keys(mentorFields).length ? 'mentor_assigned' : 'synced' };
  } catch (e) {
    console.warn('[members] users 문서 저장 실패 (보안 규칙 확인 필요)', e);
    return { status: 'write_failed' };
  }
}
