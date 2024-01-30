type Atom = number | string | boolean | null | undefined;

function eqAtomPair([k1, v1]: [Atom, Atom], [k2, v2]: [Atom, Atom]): boolean {
  return k1 === k2 && v1 === v2;
}

export function dedupAtomPairs(pairs: [Atom, Atom][]): [Atom, Atom][] {
  const res: [Atom, Atom][] = [];
  for (const p1 of pairs) {
    if (!res.some((p2) => eqAtomPair(p1, p2))) {
      res.push(p1);
    }
  }
  return res;
}

function bucket(x: number): number {
  return parseFloat(x.toPrecision(1));
}

function flatMap<T, U>(xs: T[], f: (x: T) => U[]): U[] {
  const res: U[] = [];
  for (const x of xs) {
    res.push(...f(x));
  }
  return res;
}

function atomPairs(x: any): [Atom, Atom][] {
  function aux(x: any): [Atom, Atom][] {
    let res: [Atom, Atom][];
    if (x === null || x === undefined || typeof x === 'boolean' || typeof x === 'string') {
      res = [[x, x]];
    } else if (typeof x === 'number') {
      res = [[bucket(x), bucket(x)]];
    } else if (typeof x === 'object') {
      res = flatMap(Object.entries(x), ([k, v]) =>
        flatMap(aux(v), ([k2, v2]) =>
          [[k2, v2], [k, k2], [k, v2]] as [Atom, Atom][]
        ));
    } else if (Array.isArray(x)) {
      res = flatMap(x, aux);
    } else {
      res = [];
    }
    return dedupAtomPairs(res);
  }
  return aux(x).filter(([k, v]) => k !== v);
}

export function uniqueTokens(x: any): string[] {
  return atomPairs(x).map(([k, v]) => `${k}:${v}`);
}