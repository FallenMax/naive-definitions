export async function jsAsyncFunction() {}

type JsTypeAlias = string

interface JsInterface {}

enum JsEnum {
  Member,
}

namespace JsNamespace {}

class JsDecoratedClass {
  static jsStaticMethod() {}
  async jsAsyncMethod() {}
  get jsGetter() {
    return 1
  }
}

import { sourceName as jsImportAlias } from './source'
