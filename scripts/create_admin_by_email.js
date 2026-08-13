/* Usage:
 *  node scripts/create_admin_by_email.js <email>
 *
 * The script will initialize firebase-admin with the bundled serviceAccount.json
 * and create a document /admins/{uid} for the user with the given email.
 */

const admin = require('firebase-admin');

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node scripts/create_admin_by_email.js <email>');
    process.exit(1);
  }

  // Initialize with the serviceAccount.json bundled at repo root
  if (!admin.apps.length) {
    try {
      const serviceAccount = require('../serviceAccount.json');
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } catch (e) {
      console.error('Failed to initialize firebase-admin:', e.message || e);
      process.exit(1);
    }
  }

  try {
    const user = await admin.auth().getUserByEmail(email);
    const uid = user.uid;
    const db = admin.firestore();
    await db.collection('admins').doc(uid).set({ role: 'owner', createdAt: Date.now() });
    console.log('Created admins/' + uid);
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
}

main();
