


// these are similar methods as in seisplotjs-fdsnstation
// duplicate here to avoid dependency and diff NS, yes that is dumb...


export function _isDef(v: number) :boolean {
  return typeof v !== 'undefined' && v !== null;
}

/** converts to ISO8601 but removes the trailing Z as FDSN web services
  do not allow that. */
export function  _toIsoWoZ(date:moment) :string {
  let out = date.toISOString();
  return out.substring(0, out.length-1);
}

export function  _grabFirstEl(xml: Element | null | void, tagName: string) :Element | void {
  if ( ! xml) { return undefined;}
  let out = xml.getElementsByTagName(tagName);
  if (out && out.length > 0) {
    return out.item(0);
  } else {
    return undefined;
  }
}

export function  _grabFirstElText(xml: Element | null | void, tagName: string) :string | void {
  let out = _grabFirstEl(xml, tagName);
  if (out) {
    return out.textContent;
  }
  return undefined;
}

export function  _grabFirstElFloat(xml: Element | null | void, tagName: string) :number | void {
  let out = _grabFirstElText(xml, tagName);
  if (out) {
    return parseFloat(out);
  }
  return undefined;
}

export function  _grabAttribute(xml: Element | null | void, tagName: string) :string | void {
  if ( ! xml) { return undefined;}
  let a = xml.getAttribute(tagName);
  if (a === null || typeof a === "undefined") {
    return undefined;
  }
  return a;
}

export function  _grabAttributeNS(xml: Element | null | void, namespace: string, tagName: string) :string | void {
  if ( ! xml) { return undefined;}
  let a = xml.getAttributeNS(namespace, tagName);
  if (a === null || typeof a === "undefined") {
    return undefined;
  }
  return a;
}
