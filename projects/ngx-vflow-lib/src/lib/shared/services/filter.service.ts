import { Injectable, computed, signal } from '@angular/core';
import { Shadow } from '../interfaces/filter.interface';
import { hashCode } from '../utils/hash';

@Injectable()
export class FilterService {
  public readonly shadows = signal(new Map<number, Shadow>())

  /**
   * map of shadows to number of its usages in format [hashOfShadow, countOfShadowUsages]
   */
  private refs = new Map<number, number>()

  addShadow(shadow: Shadow) {
    this.shadows.update((shadows) => {
      const hash = shadowHash(shadow)

      // increase ref count for this shadow
      this.refs.set(hash, (this.refs.get(hash) ?? 0) + 1)

      return shadows.set(hash, shadow)
    })
  }

  deleteShadow(shadow: Shadow) {
    this.shadows.update((shadows) => {
      const hash = shadowHash(shadow)

      // decrease ref count for this shadow
      this.refs.set(hash, (this.refs.get(hash) ?? 0) - 1)

      // if there are no refs, delete this shadow
      if (this.refs.get(hash)! <= 0) {
        shadows.delete(hash)
      }

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
