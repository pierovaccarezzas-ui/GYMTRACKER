import { collection, doc, onSnapshot, serverTimestamp, writeBatch } from 'firebase/firestore';

export function createFirebaseTransport(db) {
  return {
    subscribe(uid,next,error) {
      return onSnapshot(collection(db,'users',uid,'records'),{includeMetadataChanges:true},snapshot => {
        const records = {};
        snapshot.forEach(item => {
          const {path,value,deleted,revision} = item.data();
          records[item.id] = {path,value,deleted,revision};
        });
        next(records,{fromCache:snapshot.metadata.fromCache,hasPendingWrites:snapshot.metadata.hasPendingWrites});
      },error);
    },
    async write(uid,records) {
      const batch = writeBatch(db);
      for (const [id,record] of Object.entries(records)) {
        batch.set(doc(db,'users',uid,'records',id),{schema:1,...record,updatedAt:serverTimestamp()});
      }
      // This resolves only after backend acknowledgment, never from local cache.
      await batch.commit();
    },
  };
}
