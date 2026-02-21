/**
 * Mongo helpers (Pabbly: utils folder)
 */
export function toResponseDoc(doc: any): any {
  if (!doc) return doc;
  const d = doc.toObject ? doc.toObject() : { ...doc };
  if (d._id) d.id = d._id.toString();
  return d;
}

export function toResponseList(list: any[]): any[] {
  return list.map((doc) => {
    const d = doc.toObject ? doc.toObject() : { ...doc };
    if (d._id) d.id = d._id.toString();
    return d;
  });
}
