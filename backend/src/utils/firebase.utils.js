import { db, collections } from '../config/firebase.config.js';

/**
 * Firebase utility functions for common database operations
 */
export const FirebaseUtils = {
  /**
   * Create a new document
   */
  async createDocument(collection, data, docId = null) {
    try {
      const docData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (docId) {
        await db.collection(collection).doc(docId).set(docData);
        return { id: docId, ...docData };
      } else {
        const docRef = await db.collection(collection).add(docData);
        return { id: docRef.id, ...docData };
      }
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Get a document by ID
   */
  async getDocument(collection, docId) {
    try {
      const doc = await db.collection(collection).doc(docId).get();
      if (!doc.exists) {
        return null;
      }
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Update a document
   */
  async updateDocument(collection, docId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await db.collection(collection).doc(docId).update(updateData);
      return { id: docId, ...updateData };
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(collection, docId) {
    try {
      await db.collection(collection).doc(docId).delete();
      return { id: docId, deleted: true };
    } catch (error) {
      console.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Query documents with filters
   */
  async queryDocuments(collection, filters = [], orderBy = null, limit = null) {
    try {
      let query = db.collection(collection);

      // Apply filters
      filters.forEach(filter => {
        query = query.where(filter.field, filter.operator, filter.value);
      });

      // Apply ordering
      if (orderBy) {
        query = query.orderBy(orderBy.field, orderBy.direction || 'asc');
      }

      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }

      const snapshot = await query.get();
      const documents = [];
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      return documents;
    } catch (error) {
      console.error(`Error querying documents from ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Get all documents from a collection
   */
  async getAllDocuments(collection, limit = null) {
    try {
      let query = db.collection(collection);
      if (limit) {
        query = query.limit(limit);
      }
      const snapshot = await query.get();
      const documents = [];
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      return documents;
    } catch (error) {
      console.error(`Error getting all documents from ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Batch create multiple documents
   */
  async batchCreate(collection, documents) {
    try {
      const batch = db.batch();
      const results = [];

      documents.forEach(doc => {
        const docRef = db.collection(collection).doc();
        const docData = {
          ...doc,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        batch.set(docRef, docData);
        results.push({ id: docRef.id, ...docData });
      });

      await batch.commit();
      return results;
    } catch (error) {
      console.error(`Error batch creating documents in ${collection}:`, error);
      throw error;
    }
  },

  /**
   * Create a subcollection document
   */
  async createSubDocument(parentCollection, parentId, subCollection, data) {
    try {
      const docData = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await db
        .collection(parentCollection)
        .doc(parentId)
        .collection(subCollection)
        .add(docData);

      return { id: docRef.id, ...docData };
    } catch (error) {
      console.error(`Error creating subdocument:`, error);
      throw error;
    }
  },

  /**
   * Get subcollection documents
   */
  async getSubDocuments(parentCollection, parentId, subCollection) {
    try {
      const snapshot = await db
        .collection(parentCollection)
        .doc(parentId)
        .collection(subCollection)
        .get();

      const documents = [];
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      return documents;
    } catch (error) {
      console.error(`Error getting subdocuments:`, error);
      throw error;
    }
  },

  /**
   * Listen to real-time changes
   */
  listenToDocument(collection, docId, callback) {
    return db.collection(collection).doc(docId).onSnapshot(doc => {
      if (doc.exists) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  },

  /**
   * Listen to collection changes
   */
  listenToCollection(collection, filters = [], callback) {
    let query = db.collection(collection);
    
    filters.forEach(filter => {
      query = query.where(filter.field, filter.operator, filter.value);
    });

    return query.onSnapshot(snapshot => {
      const documents = [];
      snapshot.forEach(doc => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      callback(documents);
    });
  }
};

export default FirebaseUtils;