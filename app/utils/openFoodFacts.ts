export function filterKeyList(keyList: string[]): string[] {
  const validPrefixes = ["front", "nutrition", "ingredients"];
  const prioritySuffixes = ["_en", "_ms"];  

  return validPrefixes.map(prefix => {
    const keys = keyList.filter(k => k.startsWith(prefix));
    return prioritySuffixes.map(suffix => keys.find(k => k.endsWith(suffix)))
      .find(k => k) || keys[0];
  }).filter(k => k); 
}

export function getProductImageUrl(barcode: number, imgid: string, thumbnail = true): string {
  const paddedBarcode = barcode.toString().padStart(13, '0');
    const match = paddedBarcode.match(/^(...)(...)(...)(.*)$/);
  
  if (!match) {
      throw new Error("Invalid barcode format");
  }
  
  const [, part1, part2, part3, part4] = match;
  
  return `https://openfoodfacts-images.s3.eu-west-3.amazonaws.com/data/${part1}/${part2}/${part3}/${part4}/${imgid}${thumbnail ? '.400' : ''}.jpg`;
}
