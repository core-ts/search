// tslint:disable-next-line:class-name
export class resources {
  static limit = 20;
}
export interface SearchModel {
  page?: number;
  limit?: number;
  firstLimit?: number;
  fields?: string[];
  sort?: string;
}
export interface SearchResult<T> {
  total?: number;
  results: T[];
  last?: boolean;
}
export interface Locale {
  id?: string;
  countryCode: string;
  dateFormat: string;
  firstDayOfWeek: number;
  decimalSeparator: string;
  groupSeparator: string;
  decimalDigits: number;
  currencyCode: string;
  currencySymbol: string;
  currencyPattern: number;
  currencySample?: string;
}
interface StringMap {
  [key: string]: string;
}
export interface ResourceService {
  resource(): StringMap;
  value(key: string, param?: any): string;
  format(f: string, ...args: any[]): string;
}

export interface Sortable {
  sortField: string;
  sortType: string;
  sortTarget: HTMLElement;
}

export interface Pagination {
  initPageSize: number;
  pageSize: number;
  pageIndex: number;
  itemTotal: number;
  pageTotal: number;
  showPaging: boolean;
  append: boolean;
  appendMode: boolean;
  appendable: boolean;
}

export interface Searchable extends Pagination, Sortable {
}

export function mergeSearchModel<S extends SearchModel>(obj: S, pageSizes?: number[], arrs?: string[]|any, b?: S) {
  let a: any = b;
  if (!b) {
    a = {};
  }
  const slimit: any = obj['limit'];
  if (!isNaN(slimit)) {
    const limit = parseInt(slimit, 10);
    if (pageSizes && pageSizes.length > 0) {
      if (pageSizes.indexOf(limit) >= 0) {
        a.limit = limit;
      }
    } else {
      a.limit = limit;
    }
  }
  delete obj['limit'];
  const keys = Object.keys(obj);
  for (const key of keys) {
    const p = a[key];
    const v = obj[key];
    if (v && v !== '') {
      a[key] = (isArray(key, p, arrs) ? v.split(',') : v);
    }
  }
  return a;
}
export function isArray(key: string, p: any, arrs: string[]|any): boolean {
  if (p) {
    if (Array.isArray(p)) {
      return true;
    }
  }
  if (arrs) {
    if (Array.isArray(arrs)) {
      if (arrs.indexOf(key) >= 0) {
        return true;
      }
    } else {
      const v = arrs[key];
      if (v && Array.isArray(v)) {
        return true;
      }
    }
  }
  return false;
}

// m is search model or an object which is parsed from url
export function initSearchable<S extends SearchModel>(m: S, com: Searchable): S {
  if (!isNaN(m.page)) {
    const page = parseInt(m.page as any, 10);
    m.page = page;
    if (page >= 1) {
      com.pageIndex = page;
    }
  }
  if (!isNaN(m.limit)) {
    const pageSize = parseInt(m.limit as any, 10);
    m.limit = pageSize;
    if (pageSize > 0) {
      com.pageSize = pageSize;
    }
  }
  if (!m.limit && com.pageSize) {
    m.limit = com.pageSize;
  }
  if (!isNaN(m.firstLimit)) {
    const initPageSize = parseInt(m.firstLimit as any, 10);
    if (initPageSize > 0) {
      m.firstLimit = initPageSize;
      com.initPageSize = initPageSize;
    } else {
      com.initPageSize = com.pageSize;
    }
  } else {
    com.initPageSize = com.pageSize;
  }
  const st = m.sort;
  if (st && st.length > 0) {
    const ch = st.charAt(0);
    if (ch === '+' || ch === '-') {
      com.sortField = st.substring(1);
      com.sortType = ch;
    } else {
      com.sortField = st;
      com.sortType = '';
    }
  }
  /*
  delete searchModel.page;
  delete searchModel.limit;
  delete searchModel.firstLimit;
  */
  return m;
}
export function more(com: Pagination): void {
  com.append = true;
  com.pageIndex = com.pageIndex + 1;
}

export function reset(com: Searchable): void {
  removeSortStatus(com.sortTarget);
  com.sortTarget = null;
  com.sortField = null;
  com.append = false;
  com.pageIndex = 1;
}
export function changePageSize(com: Pagination, size: number): void {
  com.initPageSize = size;
  com.pageSize = size;
  com.pageIndex = 1;
}
export function changePage(com: Pagination, pageIndex: number, pageSize: number): void {
  com.pageIndex = pageIndex;
  com.pageSize = pageSize;
  com.append = false;
}
export function optimizeSearchModel<S extends SearchModel>(obj: S, searchable: Searchable, displayFields: string[]): S {
  obj.fields = displayFields;
  if (searchable.pageIndex && searchable.pageIndex > 1) {
    obj.page = searchable.pageIndex;
  } else {
    delete obj.page;
  }
  obj.limit = searchable.pageSize;
  if (searchable.appendMode && searchable.initPageSize !== searchable.pageSize) {
    obj.firstLimit = searchable.initPageSize;
  } else {
    delete obj.firstLimit;
  }
  if (searchable.sortField && searchable.sortField.length > 0) {
    obj.sort = (searchable.sortType === '-' ? '-' + searchable.sortField : searchable.sortField);
  } else {
    delete obj.sort;
  }
  return obj;
}

export function append<T>(list: T[], results: T[]): T[] {
  if (list && results) {
    for (const obj of results) {
      list.push(obj);
    }
  }
  return list;
}
export function showResults<T>(s: SearchModel, sr: SearchResult<T>, com: Pagination): void {
  com.pageIndex = (s.page && s.page >= 1 ? s.page : 1);
  if (sr.total) {
    com.itemTotal = sr.total;
  }
  if (com.appendMode === false) {
    showPaging(s, sr, com);
  } else {
    handleAppend(s, sr, com);
  }
}
export function handleAppend<T, S extends SearchModel>(s: S, sr: SearchResult<T>, com: Pagination): void {
  if (s.limit === 0) {
    com.appendable = false;
  } else {
    let pageSize = s.limit;
    if (s.page <= 1) {
      pageSize = s.firstLimit;
    }
    if (sr.last === true || sr.results.length < pageSize) {
      com.appendable = false;
    } else {
      com.appendable = true;
    }
  }
  if (sr && sr.results.length === 0) {
    com.appendable = false;
  }
}
export function showPaging<T>(s: SearchModel, sr: SearchResult<T>, com: Pagination): void {
  com.itemTotal = sr.total;
  const pageTotal = getPageTotal(sr.total, s.limit);
  com.pageTotal = pageTotal;
  com.showPaging = (com.pageTotal <= 1 || (sr.results && sr.results.length >= sr.total) ? false : true);
}

export function getDisplayFields(form: HTMLFormElement): string[] {
  let nodes = form.nextSibling as HTMLElement;
  if (!nodes.querySelector) {
    nodes = form.nextSibling.nextSibling as HTMLElement;
  }
  if (!nodes.querySelector) {
    return [];
  }
  const table = nodes.querySelector('table');
  const fields: string[] = [];
  if (table) {
    const thead = table.querySelector('thead');
    if (thead) {
      const ths = thead.querySelectorAll('th');
      if (ths) {
        const l = ths.length;
        for (let i = 0; i < l; i++) {
          const  th = ths[i];
          const field = th.getAttribute('data-field');
          if (field) {
            fields.push(field);
          }
        }
      }
    }
  }
  return fields;
}

export function formatResults<T>(results: T[], pageIndex: number, pageSize: number, initPageSize: number, sequenceNo?: string, ft?: (oj: T, lc: Locale) => T, lc?: Locale): void {
  if (results && results.length > 0) {
    let hasSequencePro = false;
    if (ft) {
      if (sequenceNo && sequenceNo.length > 0) {
        for (const obj of results) {
          if (obj[sequenceNo]) {
            hasSequencePro = true;
          }
          ft(obj, lc);
        }
      } else {
        for (const obj of results) {
          ft(obj, lc);
        }
      }
    } else if (sequenceNo && sequenceNo.length > 0) {
      for (const obj of results) {
        if (obj[sequenceNo]) {
          hasSequencePro = true;
        }
      }
    }
    if (sequenceNo && sequenceNo.length > 0 && !hasSequencePro) {
      if (!pageIndex) {
        pageIndex = 1;
      }
      if (pageIndex <= 1) {
        for (let i = 0; i < results.length; i++) {
          results[i][sequenceNo] = i - pageSize + pageSize * pageIndex + 1;
        }
      } else {
        for (let i = 0; i < results.length; i++) {
          results[i][sequenceNo] = i - pageSize + pageSize * pageIndex + 1 - (pageSize - initPageSize);
        }
      }
    }
  }
}

export function getPageTotal(recordTotal: number, pageSize: number): number {
  if (pageSize <= 0) {
    return 1;
  } else {
    if ((recordTotal % pageSize) === 0) {
      return Math.floor((recordTotal / pageSize));
    }
    return Math.floor((recordTotal / pageSize) + 1);
  }
}

export function buildSearchMessage<T>(s: SearchModel, sr: SearchResult<T>, r: ResourceService): string {
  const results = sr.results;
  if (!results || results.length === 0) {
    return r.value('msg_no_data_found');
  } else {
    if (!s.page) {
      s.page = 1;
    }
    const fromIndex = (s.page - 1) * s.limit + 1;
    const toIndex = fromIndex + results.length - 1;
    const pageTotal = getPageTotal(sr.total, s.limit);
    if (pageTotal > 1) {
      const msg2 = r.format(r.value('msg_search_result_page_sequence'), fromIndex, toIndex, sr.total, s.page, pageTotal);
      return msg2;
    } else {
      const msg3 = r.format(r.value('msg_search_result_sequence'), fromIndex, toIndex);
      return msg3;
    }
  }
}

function removeFormatUrl(url: string): string {
  const startParams = url.indexOf('?');
  return startParams !== -1 ? url.substring(0, startParams) : url;
}


export function addParametersIntoUrl<S extends SearchModel>(searchModel: S, isFirstLoad: boolean): void {
  if (!isFirstLoad) {
    const pageIndex = searchModel.page;
    if (pageIndex && !isNaN(pageIndex) && pageIndex <= 1) {
      delete searchModel.page;
    }
    const keys = Object.keys(searchModel);
    const currentUrl = window.location.host + window.location.pathname;
    let url = removeFormatUrl(currentUrl);
    for (const key of keys) {
      const objValue = searchModel[key];
      if (objValue) {
        if (key !== 'fields') {
          if (typeof objValue === 'string' || typeof objValue === 'number') {
            if (key === 'limit') {
              // tslint:disable-next-line:triple-equals
              if (objValue != resources.limit) {
                if (url.indexOf('?') === -1) {
                  url += `?${key}=${objValue}`;
                } else {
                  url += `&${key}=${objValue}`;
                }
              }
            } else {
              if (url.indexOf('?') === -1) {
                url += `?${key}=${objValue}`;
              } else {
                url += `&${key}=${objValue}`;
              }
            }
          } else if (typeof objValue === 'object') {
            if (objValue instanceof Date) {
              if (url.indexOf('?') === -1) {
                url += `?${key}=${objValue.toISOString()}`;
              } else {
                url += `&${key}=${objValue.toISOString()}`;
              }
            } else {
              if (Array.isArray(objValue)) {
                if (objValue.length > 0) {
                  const strs = [];
                  for (const subValue of objValue) {
                    if (typeof subValue === 'string') {
                      strs.push(subValue);
                    } else if (typeof subValue === 'number') {
                      strs.push(subValue.toString());
                    }
                  }
                  if (url.indexOf('?') === -1) {
                    url += `?${key}=${strs.join(',')}`;
                  } else {
                    url += `&${key}=${strs.join(',')}`;
                  }
                }
              } else {
                const keysLvl2 = Object.keys(objValue);
                keysLvl2.forEach((key2, idx) => {
                  const objValueLvl2 = objValue[keysLvl2[idx]];
                  if (url.indexOf('?') === -1) {
                    if (objValueLvl2 instanceof Date) {
                      url += `?${key}.${key2}=${objValueLvl2.toISOString()}`;
                    } else {
                      url += `?${key}.${key2}=${objValueLvl2}`;
                    }
                  } else {
                    if (objValueLvl2 instanceof Date) {
                      url += `&${key}.${key2}=${objValueLvl2.toISOString()}`;
                    } else {
                      url += `&${key}.${key2}=${objValueLvl2}`;
                    }
                  }
                });
              }
            }
          }
        }
      }
    }
    let p = 'http://';
    const loc = window.location.href;
    if (loc.length >= 8) {
      const ss = loc.substr(0, 8);
      if (ss === 'https://') {
        p = 'https://';
      }
    }
    window.history.replaceState({path: currentUrl}, '', p + url);
  }
}

export interface Sort {
  field: string;
  type: string;
}

export function handleSortEvent(event: Event, com: Sortable): void {
  if (event && event.target) {
    const target = event.target as HTMLElement;
    const s = handleSort(target, com.sortTarget, com.sortField, com.sortType);
    com.sortField = s.field;
    com.sortType = s.type;
    com.sortTarget = target;
  }
}

export function handleSort(target: HTMLElement, previousTarget: HTMLElement, sortField: string, sortType: string): Sort {
  const type = target.getAttribute('sort-type');
  const field = toggleSortStyle(target);
  const s = sort(sortField, sortType, field, type);
  if (sortField !== field) {
    removeSortStatus(previousTarget);
  }
  return s;
}

export function sort(preField: string, preSortType: string, field: string, sortType: string): Sort {
  if (!preField || preField === '') {
    const s: Sort = {
      field,
      type: '+'
    };
    return s;
  } else if (preField !== field) {
    const s: Sort = {
      field,
      type: (!sortType ? '+' : sortType)
    };
    return s;
  } else if (preField === field) {
    const type = (preSortType === '+' ? '-' : '+');
    const s: Sort = {field, type};
    return s;
  }
}

export function removeSortStatus(target: HTMLElement): void {
  if (target && target.children.length > 0) {
    target.removeChild(target.children[0]);
  }
}

export function toggleSortStyle(target: HTMLElement): string {
  let field = target.getAttribute('data-field');
  if (!field) {
    const p = target.parentNode as HTMLElement;
    if (p) {
      field = p.getAttribute('data-field');
    }
  }
  if (!field || field.length === 0) {
    return '';
  }
  if (target.nodeName === 'I') {
    target = target.parentNode as HTMLElement;
  }
  let i = null;
  if (target.children.length === 0) {
    target.innerHTML = target.innerHTML + '<i class="sort-up"></i>';
  } else {
    i = target.children[0];
    if (i.classList.contains('sort-up')) {
      i.classList.remove('sort-up');
      i.classList.add('sort-down');
    } else if (i.classList.contains('sort-down')) {
      i.classList.remove('sort-down');
      i.classList.add('sort-up');
    }
  }
  return field;
}
