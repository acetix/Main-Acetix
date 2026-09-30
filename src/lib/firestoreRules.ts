/**
 * The exact Security Rules snippet the site needs — kept in one place so
 * the on-screen setup notice and FIREBASE_SETUP.md never drift apart.
 * No public writes to projects/siteConfig: the catalogue is managed from
 * the Firebase Console (or the future admin app). suggestions/comments
 * stay public-write with validation.
 */
export const FIRESTORE_RULES_SNIPPET = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ভবিষ্যৎ admin app-এর জন্য: Authentication চালু করে নিজের user যোগ
    // করুন, তারপর এই লাইনে আপনার ইমেইল বসান।
    function isOwner() {
      return request.auth != null
        && request.auth.token.email == 'YOUR_EMAIL@gmail.com';
    }

    match /projects/{doc} {
      allow read: if true;
      allow create, delete: if isOwner();
      // ভিজিটররা শুধু like/dislike কাউন্টার বদলাতে পারবে — আর কিছু নয়
      allow update: if isOwner()
                    || (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['like', 'dislike'])
                        && request.resource.data.like >= 0
                        && request.resource.data.dislike >= 0);
    }

    match /siteConfig/{doc} {
      allow read: if true;
      allow write: if isOwner();
    }

    // ক্যাটাগরি তালিকা — Projects পেজের ফিল্টার এখান থেকে আসে
    match /categories/{doc} {
      allow read: if true;
      allow write: if isOwner();
    }

    // পাবলিক wishlist দেখাতে read খোলা থাকতে হবে
    match /suggestions/{doc} {
      allow read: if true;
      allow create: if request.resource.data.title is string
                    && request.resource.data.title.size() <= 140
                    && request.resource.data.description is string
                    && request.resource.data.description.size() <= 1200;
      allow update, delete: if isOwner();
    }

    match /contacts/{doc} {
      allow create: if request.resource.data.name is string;
      allow read, update, delete: if isOwner();
    }

    // দৈনিক ভিজিটর কাউন্টার — প্রতিটি ডকুমেন্ট একটি দিন (visitors/2025-06-14)
    match /visitors/{doc} {
      allow read: if true;
      allow create, update: if request.resource.data.count is number;
      allow delete: if false;
    }
  }
}`;
