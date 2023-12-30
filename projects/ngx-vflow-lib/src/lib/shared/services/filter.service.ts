import { Injectable, computed, signal } from '@angular/core';
import { Shadow } from '../interfaces/filter.interface';
import { hashCode } from '../utils/hash';

@Injectable()
export class FilterService {
  public readonly shadows = signal(new Map<number, Shadow>())

  addShadow(shadow: Shadow) {
    this.shadows.update((shadows) =>
      shadows.set(shadowHash(shadow), shadow)
    )
  }

  deleteShadow(shadow: Shadow) {
    this.shadows.update((shadows) => {
      shadows.delete(shadowHash(shadow));

      return shadows
    })
  }

  getShadowId(shadow: Shadow) {
    return computed(() => {
      const hash = shadowHash(shadow)

      return this.shadows().has(hash) ? hash : null
    })
  }
}

const shadowHash = (shadow: Shadow) => hashCode(JSON.stringify(shadow))
