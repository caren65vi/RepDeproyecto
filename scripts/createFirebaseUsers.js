/*
Script to create two Firebase Authentication users and assign an `admin` custom claim to one.
Usage:
  1. Enable Firebase Admin SDK: in Firebase Console > Project Settings > Service accounts > Generate new private key
  2. Save the downloaded JSON as `serviceAccountKey.json` in the project root (same folder as this script)
  3. Install dependency: `npm install firebase-admin`
  4. Run: `node scripts/createFirebaseUsers.js`

This script will create or update:
 - Admin:  Jhonalexis02019@gmail.com  (password: jhona1234)   -> custom claim { admin: true }
 - User:   vivianaramon10@gmail.com   (password: jhona1234)   -> no admin claim
*/

const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} catch (err) {
  console.error('Unable to load service account key file:', serviceAccountPath);
  console.error('Follow the instructions in scripts/createFirebaseUsers.js to create/download the file.');
  process.exit(1);
}

const users = [
  { email: 'Jhonalexis02019@gmail.com', password: 'jhona1234', displayName: 'Administrador', isAdmin: true },
  { email: 'vivianaramon10@gmail.com', password: 'jhona1234', displayName: 'Usuario', isAdmin: false },
];



const db = admin.firestore();

async function createOrUpdateUser(u) {
  try {
    const userRecord = await admin.auth().getUserByEmail(u.email);
    console.log(`User already exists: ${u.email} (uid: ${userRecord.uid}) — updating password/displayName if needed`);
    await admin.auth().updateUser(userRecord.uid, {
      password: u.password,
      displayName: u.displayName,
    });
    return userRecord.uid;
  } catch (err) {
    if (err.code === 'auth/user-not-found' || err.code === 'auth/user-not-found') {
      const newUser = await admin.auth().createUser({
        email: u.email,
        emailVerified: false,
        password: u.password,
        displayName: u.displayName,
      });
      console.log(`Created user ${u.email} (uid: ${newUser.uid})`);
      return newUser.uid;
    }
    throw err;
  }
}

async function main() {
  for (const u of users) {
    try {
      const uid = await createOrUpdateUser(u);
      if (u.isAdmin) {
        await admin.auth().setCustomUserClaims(uid, { admin: true });
        console.log(`Set custom claim { admin: true } for ${u.email}`);
      } else {
        // Ensure no admin claim
        await admin.auth().setCustomUserClaims(uid, { admin: false });
        console.log(`Ensured admin: false for ${u.email}`);
      }
      console.log(`Credentials for login (email / password): ${u.email} / ${u.password}\n`);

      // Create or update Firestore documents
      try {
        const docData = {
          uid,
          email: u.email,
          displayName: u.displayName,
          role: u.isAdmin ? 'admin' : 'user',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        if (u.isAdmin) {
          await db.collection('administradores').doc(uid).set(docData, { merge: true });
          // Also keep a copy in 'usuarios' if you want all users in one collection
          await db.collection('usuarios').doc(uid).set(docData, { merge: true });
          console.log(`Wrote admin document for ${u.email} in 'administradores' and 'usuarios' collections`);
        } else {
          await db.collection('usuarios').doc(uid).set(docData, { merge: true });
          console.log(`Wrote user document for ${u.email} in 'usuarios' collection`);
        }
      } catch (fireErr) {
        console.error(`Error writing Firestore doc for ${u.email}:`, fireErr.message || fireErr);
      }
    } catch (err) {
      console.error(`Error processing ${u.email}:`, err.message || err);
    }
  }
  console.log('Done. Verify users in Firebase Console > Authentication.');
  process.exit(0);
}

main();
