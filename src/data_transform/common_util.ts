export function commonDealData(resp: object): any {
  return resp && resp['data'] ? resp['data'] : [];
}