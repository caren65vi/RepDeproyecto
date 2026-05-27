import app from './config';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const auth = getAuth(app);

export async function signIn(email, password) {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const user = res.user;
  const idTokenResult = await user.getIdTokenResult();
  const isAdmin = !!idTokenResult.claims.admin;
  return { user, isAdmin, claims: idTokenResult.claims };
}

export async function register(email, password) {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  return res.user;
}

export async function doSignOut() {
  await signOut(auth);
}
